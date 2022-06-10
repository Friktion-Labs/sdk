import { Config as MangoConfig } from "@blockworks-foundation/mango-client";
import type NodeBank from "@friktion-labs/entropy-client";
import type {
  EntropyAccount,
  EntropyCache,
  EntropyGroup,
  GroupConfig,
  RootBank,
} from "@friktion-labs/entropy-client";
import {
  Config as EntropyConfig,
  EntropyClient,
  I80F48,
} from "@friktion-labs/entropy-client";
import type { ProgramAccount } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import type { Signer, TransactionInstruction } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";

import { sleep } from "../../../friktion-utils";
// import superagent from "superagent";
import type { FriktionSDK } from "../..";
import {
  OPTIONS_PROGRAM_IDS,
  PERFORMANCE_FEE_BPS,
  SoloptionsSDK,
  WITHDRAWAL_FEE_BPS,
} from "../..";
import type { OptionsProtocol, PerpProtocol } from "../../constants";
import {
  ENTROPY_PROGRAM_ID,
  FRIKTION_PROGRAM_ID,
  MANGO_PROGRAM_ID,
  VoltStrategy,
  VoltType,
} from "../../constants";
import { anchorProviderToSerumProvider } from "../../miscUtils";
import {
  getInertiaContractByKeyOrNull,
  getInertiaMarketByKey,
} from "../Inertia/inertiaUtils";
import { SpreadsSDK } from "../Spreads/SpreadsSDK";
import { convertSpreadsContractToOptionMarket } from "../Spreads/spreadsUtils";
import type {
  EntropyRoundWithKey,
  ExtraVoltDataWithKey,
  FriktionEpochInfoWithKey,
  OptionMarketWithKey,
  PendingDepositWithKey,
  PendingWithdrawal,
  PendingWithdrawalWithKey,
  RoundWithKey,
  VoltProgram,
  VoltVault,
} from ".";
import { OrderType, SelfTradeBehavior } from "./helperTypes";
import { getStrikeFromOptionMarket } from "./optionMarketUtils";
import {
  getAccountBalance,
  getAccountBalanceOrZero,
  getAccountBalanceOrZeroStruct,
  getMintSupply,
  getProgramIdForPerpProtocol,
} from "./utils";
import type {
  AuctionMetadata,
  EntropyMetadata,
  ExtraVoltData,
  PendingDeposit,
} from "./voltTypes";

class NoOptionMarketError extends Error {}

export class VoltSDK {
  extraVoltData: ExtraVoltData | undefined;
  constructor(
    readonly sdk: FriktionSDK,
    readonly voltVault: VoltVault,
    readonly voltKey: PublicKey,
    extraVoltData?: ExtraVoltData | undefined
  ) {
    this.extraVoltData = extraVoltData;
  }

  mintNameFromKey(key: PublicKey): string {
    const foundName = Object.entries(this.sdk.net.mints).find(
      (pair) => pair[1].toString() === key.toString()
    )?.[0];
    if (foundName === undefined)
      throw new Error("can't find name for mint. undetected");

    return foundName;
  }

  async printStrategyParams(): Promise<void> {
    if (this.extraVoltData === undefined) await this.loadInExtraVoltData();

    const ev = this.extraVoltData as ExtraVoltData;

    console.log("Strategy Params", "\n----------------------------");
    if (this.voltType() === VoltType.ShortOptions) {
      console.log(
        "\n DOV: ",
        "\n, isCall: ",
        this.isCall(),
        "\n, firstEverOptionWasSet: ",
        this.voltVault.firstEverOptionWasSet
      );
    } else if (this.voltType() === VoltType.Entropy) {
      const entropyMetadata = await this.getEntropyMetadata();
      console.log(
        "\n ENTROPY: ",
        "\n, target perp market: ",
        ev.powerPerpMarket.toString(),
        "\n hedging perp market: ",
        ev.hedgingSpotPerpMarket.toString(),
        "\n hedging spot market: ",
        ev.hedgingSpotMarket.toString(),
        "\n hedging?: ",
        ev.isHedgingOn,
        "\n hedging with spot?: ",
        entropyMetadata.hedgeWithSpot
      );
    }
  }

  async getCurrentOptionMarketOrNull(): Promise<OptionMarketWithKey | null> {
    try {
      return await this.getCurrentOptionsContract();
    } catch (err) {
      if (err instanceof NoOptionMarketError) {
        return null;
      }
      throw err;
    }
  }

  async printOptionsContract(
    key: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<void> {
    if (optionsProtocol === undefined)
      optionsProtocol = await this.getOptionsProtocolForKey(key);
    if (optionsProtocol === "Inertia") {
      const inertiaContract = await getInertiaContractByKeyOrNull(
        this.sdk.programs.Inertia,
        key
      );

      if (!inertiaContract)
        throw new Error(
          "inertia options contract = " + key.toString() + " can't be found"
        );

      const { serumMarketKey } = await this.getMarketAndAuthorityInfo(key);
      console.log("serum market = ", serumMarketKey.toString());
      console.log(
        "option market: ",
        inertiaContract.key.toString(),
        "option mint: ",
        inertiaContract.optionMint.toString(),
        "ul mint: ",
        inertiaContract.underlyingMint.toString(),
        "\noption mint: ",
        inertiaContract.optionMint.toString(),
        "\noption mint supply: ",
        (
          await getMintSupply(
            this.sdk.readonlyProvider.connection,
            inertiaContract.optionMint
          )
        ).toString(),
        "\nisCall: ",
        inertiaContract.isCall.toString(),
        "\nexpiry: ",
        inertiaContract.expiryTs.toString(),
        "\nul amount: ",
        inertiaContract.underlyingAmount.toString(),
        "\nquote amount: ",
        inertiaContract.quoteAmount.toString(),
        "\noracle: ",
        inertiaContract.oracleAi.toString(),
        "\nadminKey: ",
        inertiaContract.adminKey.toString(),
        "\nwas settled: ",
        inertiaContract.wasSettleCranked,
        "\nsettle px: ",
        // contract.
        "\nunderlying tokens key ",
        inertiaContract.underlyingPool.toString(),
        "\nunderlying tokens",
        (
          await getAccountBalance(
            this.sdk.readonlyProvider.connection,
            inertiaContract.underlyingMint,
            inertiaContract.underlyingPool
          )
        ).toString(),
        "\nclaimable pool",
        (
          await getAccountBalance(
            this.sdk.readonlyProvider.connection,
            inertiaContract.underlyingMint,
            inertiaContract.claimablePool
          )
        ).toString()
      );
    } else {
      const nonInertiaOptionsContract = await this.getOptionMarketByKey(key);
      // const protocol = await voltSdk.getOptionsProtocolForKey(optionMarketKey);
      console.log(
        "option market: ",
        nonInertiaOptionsContract.key.toString(),
        "\nexpiry: ",
        nonInertiaOptionsContract.expirationUnixTimestamp.toString(),
        "\nul amount: ",
        nonInertiaOptionsContract.underlyingAmountPerContract.toString(),
        "\nquote amount: ",
        nonInertiaOptionsContract.quoteAmountPerContract.toString()
      );
    }
  }

  async getCurrentOptionsContract(): Promise<OptionMarketWithKey> {
    if (this.voltType() !== VoltType.ShortOptions)
      throw new Error("volt must trade options");

    if (
      this.voltVault.optionMarket.toString() ===
      SystemProgram.programId.toString()
    )
      throw new NoOptionMarketError(
        "option market must not be systemprogram (not set)"
      );

    return await this.getOptionMarketByKey(this.voltVault.optionMarket);
  }

  async optionMarketToDetailsString(
    optionMarket: OptionMarketWithKey
  ): Promise<string> {
    const isCall = this.isOptionMarketACall(optionMarket);
    return (
      new Decimal(optionMarket.underlyingAmountPerContract.toString())
        .div(await this.getNormalizationFactor())
        .toString(),
      " ",
      this.mintNameFromKey(this.voltVault.underlyingAssetMint),
      " ",
      new Date(
        optionMarket.expirationUnixTimestamp.muln(1000).toNumber()
      ).toUTCString() +
        " $" +
        (
          await getStrikeFromOptionMarket(
            this.sdk.readonlyProvider,
            optionMarket,
            isCall
          )
        ).toString() +
        " " +
        (isCall ? "CALL" : "PUT")
    );
  }

  perpMarketToName(perpMarketKey: PublicKey): string {
    if (!(perpMarketKey.toString() in this.sdk.net.ENTROPY_PERP_MARKET_NAMES))
      throw new Error("couldn't find name for " + perpMarketKey.toString());
    return this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
      perpMarketKey.toString()
    ] as string;
  }

  async headlineTokenPrice(): Promise<Decimal> {
    const symbol = this.mintNameFromKey(
      this.isCall()
        ? this.voltVault.underlyingAssetMint
        : this.voltVault.quoteAssetMint
    );
    return await this.coingeckoPrice(
      this.sdk.net.COINGECKO_IDS[symbol] as string
    );
  }

  async depositTokenPrice(): Promise<Decimal> {
    const symbol = this.mintNameFromKey(this.voltVault.underlyingAssetMint);
    return await this.coingeckoPrice(
      this.sdk.net.COINGECKO_IDS[symbol] as string
    );
  }

  requiresSwapPremium(): boolean {
    return (
      this.voltType() === VoltType.ShortOptions &&
      this.voltVault.permissionedMarketPremiumMint.toString() !==
        this.voltVault.underlyingAssetMint.toString()
    );
  }

  async printState(): Promise<void> {
    if (this.extraVoltData === undefined) await this.loadInExtraVoltData();
    const symbol = this.mintNameFromKey(this.voltVault.underlyingAssetMint);
    const ev = this.extraVoltData as ExtraVoltData;
    const depositTokenPrice = await this.coingeckoPrice(
      this.sdk.net.COINGECKO_IDS[symbol] as string
    );

    console.log(
      `\n-------------------------\n ID: ${this.voltKey.toString()}\n-------------------------`
    );
    console.log(await this.voltName());
    console.log(await this.specificVoltName());

    console.log(
      "\n-------------------------\n HIGH LEVEL STATS\n-------------------------"
    );
    const valueInDeposits = await this.getVoltValueInDepositToken();
    console.log(
      `Total Value (minus pending deposits) (${symbol}): `,
      valueInDeposits,
      ", ($): ",
      valueInDeposits.mul(depositTokenPrice).toString()
    );

    console.log(
      "deposit pool: ",
      new Decimal(
        (
          await getAccountBalanceOrZero(
            this.sdk.readonlyProvider.connection,
            this.voltVault.underlyingAssetMint,
            this.voltVault.depositPool
          )
        ).toString()
      )
        .div(await this.getNormalizationFactor())
        .toString()
    );
    if (this.voltType() === VoltType.ShortOptions) {
      const premiumFactor = new Decimal(10).pow(
        (
          await getMintInfo(
            anchorProviderToSerumProvider(this.sdk.readonlyProvider),
            this.voltVault.quoteAssetMint
          )
        ).decimals
      );
      const permissionedPremiumFactor = new Decimal(10).pow(
        (
          await getMintInfo(
            anchorProviderToSerumProvider(this.sdk.readonlyProvider),
            this.voltVault.permissionedMarketPremiumMint
          )
        ).decimals
      );

      console.log(
        "premium pool: ",
        new Decimal(
          (
            await getAccountBalanceOrZero(
              this.sdk.readonlyProvider.connection,
              this.voltVault.quoteAssetMint,
              this.voltVault.premiumPool
            )
          ).toString()
        )
          .div(premiumFactor)
          .toString(),
        "permissioned premium pool: ",
        new Decimal(
          (
            await getAccountBalanceOrZero(
              this.sdk.readonlyProvider.connection,
              this.voltVault.permissionedMarketPremiumMint,
              this.voltVault.permissionedMarketPremiumPool
            )
          ).toString()
        )
          .div(permissionedPremiumFactor)
          .toString()
      );
    } else if (this.voltType() === VoltType.Entropy) {
      const entropyMetadata = await this.getEntropyMetadata();

      console.log(
        "leverage: ",
        ev.targetLeverage,
        "hedge ratio: ",
        entropyMetadata.targetHedgeRatio,
        "leverage lenience: ",
        ev.targetLeverageLenience,
        "hedge lenience: ",
        ev.targetHedgeLenience
      );
    }

    const pendingDeposits = new Decimal(
      (await this.getCurrentPendingDeposits()).toString()
    ).div(await this.getNormalizationFactor());

    console.log(
      "\n-------------------------\n EPOCH INFO\n-------------------------"
    );

    console.log("Round #: ", this.voltVault.roundNumber.toString());
    console.log(
      `pending deposits ${symbol}: `,
      pendingDeposits.toString(),
      ", ($): ",
      pendingDeposits.mul(depositTokenPrice).toString()
    );

    const pendingWithdrawals = new Decimal(
      (await this.getCurrentPendingWithdrawals()).toString()
    );

    console.log(
      `pending withdrawals (${symbol}): `,
      pendingWithdrawals.toString(),
      ", ($): ",
      pendingWithdrawals.mul(depositTokenPrice).toString()
    );

    console.log(
      "\n-------------------------\n POSITION STATS\n-------------------------"
    );
    if (this.voltType() === VoltType.ShortOptions) {
      try {
        const optionMarket = await this.getCurrentOptionsContract();
        console.log(
          "\n " + "Short" + " (",
          await this.optionMarketToDetailsString(optionMarket),
          "): "
        );
        console.log("option key: ", optionMarket.key.toString());
        const writerTokenBalance = (
          await getAccountBalance(
            this.sdk.readonlyProvider.connection,
            this.voltVault.writerTokenMint,
            this.voltVault.writerTokenPool
          )
        ).balance;
        console.log(
          "minted options: (#)",
          writerTokenBalance.toString(),
          ` (${symbol}) `,
          new Decimal(writerTokenBalance.toString())
            .mul(
              new Decimal(optionMarket.underlyingAmountPerContract.toString())
            )
            .div(await this.getNormalizationFactor())
            .toString()
        );

        await this.printOptionsContract(optionMarket.key);
      } catch (err) {
        console.log("no option currently selected");
      }
    } else if (this.voltType() === VoltType.Entropy) {
      const { entropyAccount, entropyGroup, entropyCache } =
        await this.getEntropyObjectsForEvData();
      const entropyGroupConfig =
        ev.entropyProgramId.toString() === ENTROPY_PROGRAM_ID.toString()
          ? Object.values(EntropyConfig.ids().groups).find(
              (g) => g.publicKey.toString() === ev.entropyGroup.toString()
            )
          : Object.values(MangoConfig.ids().groups).find(
              (g) => g.publicKey.toString() === ev.entropyGroup.toString()
            );

      console.log(
        entropyAccount.toPrettyString(
          entropyGroupConfig as GroupConfig,
          entropyGroup,
          entropyCache
        )
      );
    }

    const { tokens, dollars } = await this.getEntropyLendingValue();
    if (tokens.gt(0)) {
      const [entropyLendingAccountKey] =
        await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);
      console.log(
        "\n-------------------------\n MANGO LENDING \n-------------------------\n",
        "account: ",
        entropyLendingAccountKey.toString(),
        "\n",
        tokens.toString(),
        " (tokens), ",
        dollars.toString(),
        " ($) \n"
      );
    }

    console.log(
      "\n-------------------------\n AUCTION DETAILS \n-------------------------"
    );

    if (this.voltType() === VoltType.Entropy) {
      const { entropyAccount, entropyGroup, entropyCache } =
        await this.getEntropyObjectsForEvData();

      const entropyMetadata = await this.getEntropyMetadata();

      const targetPerpIndex = entropyGroup.getPerpMarketIndex(
        ev.powerPerpMarket
      );
      const spotPerpIndex = entropyGroup.getPerpMarketIndex(
        ev.hedgingSpotPerpMarket
      );

      const acctEquity = entropyAccount.computeValue(
        entropyGroup,
        entropyCache
      );

      const targetPerpSize = acctEquity
        .mul(I80F48.fromString(ev.targetLeverage as string))
        .sub(
          I80F48.fromNumber(
            entropyAccount.getBasePositionUiWithGroup(
              targetPerpIndex,
              entropyGroup
            )
          ).mul(entropyCache.priceCache[targetPerpIndex]?.price as I80F48)
        );

      const hedgingPerpSize = acctEquity
        .mul(I80F48.fromString(entropyMetadata.targetHedgeRatio as string))
        .mul(I80F48.fromString(ev.targetLeverage as string))
        .sub(
          I80F48.fromNumber(
            entropyAccount.getBasePositionUiWithGroup(
              spotPerpIndex,
              entropyGroup
            )
          ).mul(entropyCache.priceCache[spotPerpIndex]?.price as I80F48)
        );

      console.log(
        `needed ${
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            ev.powerPerpMarket.toString()
          ]?.toString() ?? "N/A"
        } quote size: `,
        targetPerpSize.toFixed(4),
        `\nneeded ${
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            ev.hedgingSpotPerpMarket.toString()
          ]?.toString() ?? "N/A"
        } quote size: `,
        hedgingPerpSize.toFixed(4)
      );
    }

    console.log(
      "\n-------------------------\n STATE MACHINE\n-------------------------"
    );

    console.log(
      "\nGeneric State: ",
      "\n, instantTransfersEnabled: ",
      this.voltVault.instantTransfersEnabled,
      "\n, deposits and withdrawals off?: ",
      ev.turnOffDepositsAndWithdrawals,
      "\n, performance fees in underlying?: ",
      ev.dovPerformanceFeesInUnderlying,
      "\n----------------------------"
    );

    if (this.voltType() === VoltType.ShortOptions) {
      console.log(
        "\nShort Options State:",
        "\n, firstEverOptionWasSet: ",
        this.voltVault.firstEverOptionWasSet,
        "\n, nextOptionSet: ",
        this.voltVault.nextOptionWasSet,
        "\n, has started?: ",
        this.voltVault.roundHasStarted,
        "\n, taken withdrawal fees: ",
        this.voltVault.haveTakenWithdrawalFees,
        "\n, isSettled: ",
        this.voltVault.currOptionWasSettled,
        "\n, mustSwapPremium: ",
        this.voltVault.mustSwapPremiumToUnderlying,
        "\n, preparedIsFinished: ",
        this.voltVault.prepareIsFinished,
        "\n, enterIsFinished: ",
        this.voltVault.enterIsFinished
      );
    } else if (this.voltType() === VoltType.Entropy) {
      console.log(
        "\n Entropy State: ",
        "\n, rebalance ready?: ",
        ev.rebalanceIsReady,
        "\n, done rebalancing?: ",
        ev.doneRebalancing,
        "\n, done rebalancing target perp?: ",
        ev.doneRebalancingPowerPerp,
        "\n, have taken perf fees?: ",
        ev.haveTakenPerformanceFees,
        "\n, have resolved deposits?: ",
        ev.haveResolvedDeposits
      );
    }
  }

  needsExtraVoltData(): boolean {
    return this.voltType() === VoltType.Entropy;
  }

  isKeyAStableCoin(key: PublicKey): boolean {
    return [
      this.sdk.net.mints.USDC,
      this.sdk.net.mints.UST,
      this.sdk.net.mints.PAI,
      this.sdk.net.mints.UXD,
      this.sdk.net.mints.TUSDCV2,
    ]
      .map((k) => k.toString())
      .includes(key.toString());
  }

  isOptionMarketACall(optionMarket: OptionMarketWithKey): boolean {
    return this.isKeyAStableCoin(optionMarket.underlyingAssetMint);
  }

  isCall(): boolean {
    if (this.voltType() !== VoltType.ShortOptions)
      throw new Error("wrong volt type, should be DOV");

    return !this.isKeyAStableCoin(this.voltVault.underlyingAssetMint);
  }

  async getHedgingInstrument(): Promise<PublicKey> {
    if (!this.extraVoltData) throw new Error("must load extra volt data");

    const entropyMetadata = await this.getEntropyMetadata();
    return entropyMetadata.hedgeWithSpot
      ? this.extraVoltData.hedgingSpotMarket
      : this.extraVoltData.hedgingSpotPerpMarket;
  }

  async specificVoltName(): Promise<string> {
    const voltNumber = await this.voltNumber();
    switch (voltNumber) {
      case 1:
      case 2: {
        const optionMarket = await this.getCurrentOptionMarketOrNull();
        return (
          "Short" +
          " (" +
          (optionMarket
            ? await this.optionMarketToDetailsString(optionMarket)
            : "No Option Market") +
          ")"
        );
      }
      case 3: {
        const ev = await this.getExtraVoltData();
        return (
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          "Short" +
          " Crab (-" +
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            ev.powerPerpMarket.toString()
          ]?.toString() +
          ", +" +
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            (await this.getHedgingInstrument()).toString()
          ]?.toString() +
          ")"
        );
      }
      case 4: {
        const ev = await this.getExtraVoltData();
        return (
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          "Long" +
          " Basis (+" +
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            ev.powerPerpMarket.toString()
          ]?.toString() +
          ", -" +
          this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
            (await this.getHedgingInstrument()).toString()
          ]?.toString() +
          ")"
        );
      }
    }

    throw new Error("Unknown volt type");
  }

  async voltName(): Promise<string> {
    const voltNumber = await this.voltNumber();
    switch (voltNumber) {
      case 1:
        return "Volt #01: Covered Call";
      case 2:
        return "Volt #02: Cash Secured Put";
      case 3:
        return "Volt #03: Crab Strategy";
      case 4:
        return "Volt #04: Basis Yield";
    }

    throw new Error("Unknown volt type");
  }

  async voltStrategy(): Promise<VoltStrategy> {
    const voltType = this.voltType();
    switch (voltType) {
      case VoltType.ShortOptions: {
        return this.isCall() ? VoltStrategy.ShortCalls : VoltStrategy.ShortPuts;
      }
      case VoltType.Entropy: {
        const entropyMetadata = await this.getEntropyMetadata();
        return entropyMetadata.hedgeWithSpot
          ? VoltStrategy.LongBasis
          : VoltStrategy.ShortCrab;
      }
    }
  }

  async voltNumber(): Promise<number> {
    const voltStrategy = await this.voltStrategy();
    switch (voltStrategy) {
      case VoltStrategy.ShortCalls:
        return 1;
      case VoltStrategy.ShortPuts:
        return 1;
      case VoltStrategy.ShortCrab:
        return 3;
      case VoltStrategy.LongBasis:
        return 4;
    }
  }

  voltType(): VoltType {
    if (
      this.voltVault.premiumPool.toString() !==
      SystemProgram.programId.toString()
    ) {
      return VoltType.ShortOptions;
    } else if (
      this.voltVault.premiumPool.toString() ===
      SystemProgram.programId.toString()
    ) {
      return VoltType.Entropy;
    } else {
      throw new Error(
        "volt type = " +
          this.voltVault.vaultType.toString() +
          " is not recognized"
      );
    }
  }

  isPremiumBased(): boolean {
    return this.voltType() === VoltType.ShortOptions;
  }

  static withdrawalFeeAmount(numTokensWithdrawn: BN): BN {
    if (numTokensWithdrawn.lten(0)) {
      return new BN(0);
    }
    return numTokensWithdrawn.muln(WITHDRAWAL_FEE_BPS).divn(10000);
  }

  static performanceFeeAmount(numTokensGained: BN): BN {
    if (numTokensGained.lten(0)) {
      return new BN(0);
    }
    return numTokensGained.muln(PERFORMANCE_FEE_BPS).divn(10000);
  }

  static async extraVoltDataForVoltKey(
    voltKey: anchor.web3.PublicKey,
    sdk: FriktionSDK
  ): Promise<ExtraVoltDataWithKey> {
    const [key] = await VoltSDK.findExtraVoltDataAddress(
      voltKey,
      sdk.programs.Volt.programId
    );
    const acct = await sdk.programs.Volt.account.extraVoltData.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  static async findUnderlyingOpenOrdersAddress(
    voltKey: PublicKey,
    spotSerumMarketKey: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        spotSerumMarketKey.toBuffer(),
        textEncoder.encode("ulOpenOrders"),
      ],
      voltProgramId
    );
  }

  static async findUnderlyingOpenOrdersMetadataAddress(
    voltKey: PublicKey,
    spotSerumMarketKey: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        spotSerumMarketKey.toBuffer(),
        textEncoder.encode("ulOpenOrdersMetadata"),
      ],
      voltProgramId
    );
  }

  static async findExtraVoltDataAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("extraVoltData")],
      voltProgramId
    );
  }

  static async findSerumMarketAddress(
    voltKey: PublicKey,
    whitelistMintKey: PublicKey,
    optionMarketKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    const [auctionMetadataKey] = await VoltSDK.findAuctionMetadataAddress(
      voltKey
    );
    return await PublicKey.findProgramAddress(
      [
        whitelistMintKey.toBuffer(),
        optionMarketKey.toBuffer(),
        auctionMetadataKey.toBuffer(),
        textEncoder.encode("serumMarket"),
      ],
      voltProgramId
    );
  }

  static async findAuctionMetadataAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("auctionMetadata")],
      voltProgramId
    );
  }

  static async findEntropyMetadataAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("entropyMetadata")],
      voltProgramId
    );
  }

  static async findEntropyOpenOrdersAddress(
    voltKey: PublicKey,
    marketAddress: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        marketAddress.toBuffer(),
        textEncoder.encode("entropySpotOpenOrders"),
      ],
      voltProgramId
    );
  }

  /**
   * For an admin to create a volt
   *
   * spotMarket and seed are dynamically generated. Change the code if you want custom.
   */
  static async initializeVoltWithoutOptionMarketSeed({
    sdk,
    user,
    underlyingAssetMint,
    quoteAssetMint,
    permissionedMarketPremiumMint,
    underlyingAmountPerContract,
    serumProgramId,
    transferTimeWindow,
    expirationInterval,
    upperBoundOtmStrikeFactor,
    capacity,
    individualCapacity,
    permissionlessAuctions,
    seed,
  }: {
    sdk: FriktionSDK;
    user: PublicKey;
    underlyingAssetMint: PublicKey;
    quoteAssetMint: PublicKey;
    permissionedMarketPremiumMint: PublicKey;
    underlyingAmountPerContract: BN;
    serumProgramId: PublicKey;
    transferTimeWindow: anchor.BN;
    expirationInterval: anchor.BN;
    upperBoundOtmStrikeFactor: anchor.BN;
    capacity: anchor.BN;
    individualCapacity: anchor.BN;
    permissionlessAuctions: boolean;

    seed?: PublicKey;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    if (!seed) seed = new Keypair().publicKey;
    // If desired, change the SDK to allow custom seed
    const {
      vault,
      vaultBump,
      vaultAuthorityBump,
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      premiumPoolKey,
      permissionedMarketPremiumPoolKey,
      whitelistTokenAccountKey,
      auctionMetadataKey,
    } = await VoltSDK.findInitializeAddresses(
      sdk,
      sdk.net.MM_TOKEN_MINT,
      VoltType.ShortOptions,
      {
        seed,
      }
    );

    const initializeAccountsStruct: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initialize"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: user,

      adminKey: user,

      seed: seed,

      voltVault: vault,
      vaultAuthority: vaultAuthority,
      vaultMint: vaultMint,
      extraVoltData: extraVoltKey,
      auctionMetadata: auctionMetadataKey,

      depositPool: depositPoolKey,
      premiumPool: premiumPoolKey,
      permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,

      underlyingAssetMint: underlyingAssetMint,
      quoteAssetMint: quoteAssetMint,

      dexProgram: serumProgramId,

      whitelistTokenAccount: whitelistTokenAccountKey,
      whitelistTokenMint: sdk.net.MM_TOKEN_MINT,

      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    const serumOrderSize = new anchor.BN(1);
    const serumOrderType = OrderType.ImmediateOrCancel;
    // const serumLimit = new anchor.BN(65535);
    const serumSelfTradeBehavior = SelfTradeBehavior.AbortTransaction;

    const instruction = sdk.programs.Volt.instruction.initialize(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      transferTimeWindow,
      vaultBump,
      vaultAuthorityBump,
      serumOrderSize,
      serumOrderType,
      serumSelfTradeBehavior,
      expirationInterval,
      // maximum multiple of underlying price strike can be (e.g strike < 2 * underlying price)
      // this is divided by 10 in rust code. so 15 -> 1.5 factor
      upperBoundOtmStrikeFactor,
      underlyingAmountPerContract,
      capacity,
      individualCapacity,
      permissionlessAuctions ? new BN(1) : new BN(0),
      {
        accounts: initializeAccountsStruct,
      }
    );

    return {
      instruction,
      voltKey: vault,
    };
  }

  static async findInitializeAddresses(
    sdk: FriktionSDK,
    whitelistTokenMintKey: PublicKey,
    vaultType: VoltType,
    pdaParams: {
      seed?: PublicKey;
      pdaStr?: string;
    }
  ): Promise<{
    vault: PublicKey;
    vaultBump: number;
    vaultAuthorityBump: number;
    extraVoltKey: PublicKey;
    vaultMint: PublicKey;
    vaultAuthority: PublicKey;
    depositPoolKey: PublicKey;
    premiumPoolKey: PublicKey;
    permissionedMarketPremiumPoolKey: PublicKey;
    whitelistTokenAccountKey: PublicKey;
    auctionMetadataKey: PublicKey;
    seed?: PublicKey;
  }> {
    const textEncoder = new TextEncoder();

    // If desired, change the SDK to allow custom seed

    let vault: PublicKey, vaultBump: number;

    if (vaultType === VoltType.ShortOptions) {
      let seed = pdaParams.seed;
      if (!seed) seed = new Keypair().publicKey;
      [vault, vaultBump] = await PublicKey.findProgramAddress(
        [
          new u64(vaultType).toBuffer(),
          seed.toBuffer(),
          textEncoder.encode("vault"),
        ],
        sdk.programs.Volt.programId
      );
    } else {
      const pdaStr = pdaParams.pdaStr;
      if (!pdaStr) {
        throw new Error("must pass in pda string if not short options vault");
      }
      [vault, vaultBump] = await PublicKey.findProgramAddress(
        [
          new u64(vaultType).toBuffer(),
          textEncoder.encode(pdaStr),
          textEncoder.encode("vault"),
        ],
        sdk.programs.Volt.programId
      );
    }

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(vault);

    const [auctionMetadataKey] = await VoltSDK.findAuctionMetadataAddress(
      vault
    );

    const [vaultMint, _vaultMintBump] = await PublicKey.findProgramAddress(
      [vault.toBuffer(), textEncoder.encode("vaultToken")],
      sdk.programs.Volt.programId
    );

    const [vaultAuthority, vaultAuthorityBump] =
      await PublicKey.findProgramAddress(
        [vault.toBuffer(), textEncoder.encode("vaultAuthority")],
        sdk.programs.Volt.programId
      );

    const [depositPoolKey] = await PublicKey.findProgramAddress(
      [vault.toBuffer(), textEncoder.encode("depositPool")],
      sdk.programs.Volt.programId
    );

    const [premiumPoolKey] = await PublicKey.findProgramAddress(
      [vault.toBuffer(), textEncoder.encode("premiumPool")],
      sdk.programs.Volt.programId
    );

    const [permissionedMarketPremiumPoolKey] =
      await PublicKey.findProgramAddress(
        [vault.toBuffer(), textEncoder.encode("permissionedMarketPremiumPool")],
        sdk.programs.Volt.programId
      );

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        vault,
        whitelistTokenMintKey,
        sdk.programs.Volt.programId
      );

    return {
      vault,
      vaultBump,
      vaultAuthorityBump,
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      premiumPoolKey,
      permissionedMarketPremiumPoolKey,
      whitelistTokenAccountKey,
      auctionMetadataKey,
    };
  }

  static async findBackupPoolAddresses(
    voltKey: PublicKey,
    voltVault: VoltVault
  ): Promise<{
    backupOptionPoolKey: PublicKey;
    backupWriterTokenPoolKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();
    const [backupOptionPoolKey] = await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        voltVault.optionMint.toBuffer(),
        textEncoder.encode("backupOptionPool"),
      ],
      FRIKTION_PROGRAM_ID
    );
    const [backupWriterTokenPoolKey] = await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        voltVault.writerTokenMint.toBuffer(),
        textEncoder.encode("backupWriterTokenPool"),
      ],
      FRIKTION_PROGRAM_ID
    );

    return {
      backupOptionPoolKey,
      backupWriterTokenPoolKey,
    };
  }

  static async findEntropyAccountAddress(
    voltKey: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("entropyAccount")],
      FRIKTION_PROGRAM_ID
    );
  }

  static async findEntropyLendingAccountAddress(
    voltKey: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("entropyLendingAccount")],
      FRIKTION_PROGRAM_ID
    );
  }

  static async initializeEntropyVolt({
    sdk,
    user,
    pdaStr,
    underlyingAssetMint,
    whitelistTokenMintKey,
    serumProgramId,
    entropyProgramId,
    entropyGroupKey,
    targetPerpMarket,
    spotPerpMarket,
    spotMarket,
    targetLeverageRatio,
    targetLeverageLenience,
    targetHedgeLenience,
    shouldHedge,
    hedgeWithSpot,
    targetHedgeRatio,
    rebalancingLenience,
    requiredBasisFromOracle,
    exitEarlyRatio,
    capacity,
    individualCapacity,
  }: {
    sdk: FriktionSDK;
    user: PublicKey;
    pdaStr: string;
    underlyingAssetMint: PublicKey;
    whitelistTokenMintKey: PublicKey;
    serumProgramId: PublicKey;
    entropyProgramId: PublicKey;
    entropyGroupKey: PublicKey;
    targetPerpMarket: PublicKey;
    spotPerpMarket: PublicKey;
    spotMarket: PublicKey;
    targetLeverageRatio: number;
    targetLeverageLenience: number;
    targetHedgeLenience: number;
    shouldHedge: boolean;
    hedgeWithSpot: boolean;
    targetHedgeRatio: number;
    rebalancingLenience: number;
    requiredBasisFromOracle: number;
    exitEarlyRatio: number;
    capacity: anchor.BN;
    individualCapacity: anchor.BN;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    const {
      vault,
      vaultAuthorityBump,
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
    } = await VoltSDK.findInitializeAddresses(
      sdk,
      whitelistTokenMintKey,
      VoltType.Entropy,
      {
        pdaStr: pdaStr,
      }
    );

    const [entropyAccountKey] = await VoltSDK.findEntropyAccountAddress(vault);
    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      vault
    );

    const client = new EntropyClient(
      sdk.readonlyProvider.connection,
      ENTROPY_PROGRAM_ID
    );
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);
    const entropyCacheKey = entropyGroup.entropyCache;

    const initializeEntropyAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initializeEntropy"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: user,

      adminKey: user,

      voltVault: vault,
      vaultAuthority: vaultAuthority,
      vaultMint: vaultMint,
      extraVoltData: extraVoltKey,
      entropyMetadata: entropyMetadataKey,

      depositPool: depositPoolKey,

      depositMint: underlyingAssetMint,

      dexProgram: serumProgramId,

      entropyProgram: entropyProgramId,

      entropyGroup: entropyGroupKey,

      entropyAccount: entropyAccountKey,

      entropyCache: entropyCacheKey,

      powerPerpMarket: targetPerpMarket,
      hedgingSpotPerpMarket: spotPerpMarket,
      hedgingSpotMarket: spotMarket,

      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    // const instruction: TransactionInstruction =
    const instruction: TransactionInstruction =
      sdk.programs.Volt.instruction.initializeEntropy(
        pdaStr,
        vaultAuthorityBump,
        targetLeverageRatio,
        targetLeverageLenience,
        targetHedgeLenience,
        exitEarlyRatio,
        capacity,
        individualCapacity,
        shouldHedge,
        hedgeWithSpot,
        targetHedgeRatio,
        rebalancingLenience,
        requiredBasisFromOracle,
        {
          accounts: initializeEntropyAccounts,
        }
      );

    return {
      instruction,
      voltKey: vault,
    };
  }

  /**
   * For an admin to create a volt
   *
   * spotMarket and seed are dynamically generated. Change the code if you want custom.
   */
  static async initializeVolt({
    sdk,
    user,
    optionMarket,
    permissionedMarketPremiumMint,
    // whitelistTokenMintKey,
    serumProgramId,
    transferTimeWindow,
    expirationInterval,
    upperBoundOtmStrikeFactor,
    capacity,
    individualCapacity,
    permissionlessAuctions,
    seed,
  }: {
    sdk: FriktionSDK;
    user: PublicKey;
    optionMarket: OptionMarketWithKey;
    permissionedMarketPremiumMint: PublicKey;
    // whitelistTokenMintKey: PublicKey;
    serumProgramId: PublicKey;
    transferTimeWindow: anchor.BN;
    expirationInterval: anchor.BN;
    upperBoundOtmStrikeFactor: anchor.BN;
    capacity: anchor.BN;
    individualCapacity: anchor.BN;
    permissionlessAuctions: boolean;
    seed?: PublicKey;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    return VoltSDK.initializeVoltWithoutOptionMarketSeed({
      sdk,
      user,
      underlyingAssetMint: optionMarket.underlyingAssetMint,
      quoteAssetMint: optionMarket.quoteAssetMint,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,
      underlyingAmountPerContract: optionMarket.underlyingAmountPerContract,
      // whitelistTokenMintKey,
      serumProgramId,
      transferTimeWindow,
      expirationInterval,
      upperBoundOtmStrikeFactor,
      capacity,
      individualCapacity,
      permissionlessAuctions,
      seed,
    });
  }

  async coingeckoPrice(id: string): Promise<Decimal> {
    // const coingeckoPath = `/api/v3/simple/price?ids=${id}&vs_currencies=usd&`;
    // const coingeckoUrl = `https://api.coingecko.com${coingeckoPath}`;
    console.log(id);
    await sleep(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    // const response = await superagent.get(coingeckoUrl);
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // if (response.status === 200) {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    //   const data = response.body;
    //   if (data && typeof data === "object") {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    //     for (const [key, value] of Object.entries(data)) {
    //       if (
    //         // eslint-disable-next-line no-prototype-builtins
    //         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, no-prototype-builtins
    //         !(value && typeof value === "object" && value.hasOwnProperty("usd"))
    //       ) {
    //         throw new Error("Missing usd in " + key);
    //       }
    //     }
    //     console.log(data);
    //     return new Decimal(
    //       (data as Record<string, { usd: number }>)[
    //         id
    //       ]?.usd.toString() as string
    //     );
    //   } else {
    //     // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    //     throw new Error("received undefined response = " + response.toString());
    //   }
    // } else {
    //   // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    //   throw new Error("status code != 200, == " + response.status.toString());
    // }
    return new Decimal(1.0);
  }

  oraclePriceForTokenIndex(
    entropyGroup: EntropyGroup,
    entropyCache: EntropyCache,
    tokenIndex: number
  ): Decimal {
    const oraclePrice = entropyGroup.getPrice(tokenIndex, entropyCache);
    if (oraclePrice === undefined)
      throw new Error("oracle price was undefined");
    return new Decimal(oraclePrice.toString());
  }

  oraclePriceForMint(
    entropyGroup: EntropyGroup,
    entropyCache: EntropyCache,
    mint: PublicKey
  ): Decimal {
    const quoteInfo = entropyGroup.getQuoteTokenInfo();
    if (quoteInfo.mint.toString() === mint.toString()) {
      return new Decimal(1.0);
    } else {
      const tokenIndex = entropyGroup.getTokenIndex(mint);
      console.log(
        "token mint = ",
        mint.toString(),
        ", index = ",
        tokenIndex.toString()
      );
      return this.oraclePriceForTokenIndex(
        entropyGroup,
        entropyCache,
        tokenIndex
      );
    }
  }

  oraclePriceForDepositToken(
    entropyGroup: EntropyGroup,
    entropyCache: EntropyCache
  ): Decimal {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }

    return this.oraclePriceForMint(
      entropyGroup,
      entropyCache,
      this.voltVault.underlyingAssetMint
    );
  }

  // entropy get methods
  async getVoltValueInDepositToken(
    normFactor?: Decimal | undefined
  ): Promise<Decimal> {
    return this.getVoltValueInDepositTokenWithNormFactor(
      normFactor ?? (await this.getNormalizationFactor())
    );
  }

  async getVoltValueInDepositTokenWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal> {
    const depositTokenMint = this.voltVault.underlyingAssetMint;
    const voltType = this.voltType();
    try {
      if (voltType === VoltType.ShortOptions) {
        const res: {
          balance: BN;
          token: Token | null;
        } = await getAccountBalanceOrZeroStruct(
          this.sdk.readonlyProvider.connection,
          depositTokenMint,
          this.voltVault.depositPool
        );
        if (res.token === null) throw new Error("Could not find Deposit token");

        const voltDepositTokenBalance = new Decimal(res.balance.toString());
        const voltWriterTokenBalance = await getAccountBalanceOrZero(
          this.sdk.readonlyProvider.connection,
          this.voltVault.writerTokenMint,
          this.voltVault.writerTokenPool
        );
        const estimatedTotalWithoutPendingDepositTokenAmount =
          voltDepositTokenBalance
            .plus(
              new Decimal(voltWriterTokenBalance.toString()).mul(
                new Decimal(
                  this.voltVault.underlyingAmountPerContract.toString()
                )
              )
            )
            .div(normFactor);

        return estimatedTotalWithoutPendingDepositTokenAmount;
      } else if (voltType === VoltType.Entropy) {
        const { entropyGroup, entropyAccount, entropyCache } =
          await this.getEntropyObjectsForEvData();
        // eslint-disable-next-line
        const acctEquity: Decimal = new Decimal(
          entropyAccount
            .getHealthUnweighted(entropyGroup, entropyCache)
            .toString()
        );

        const oraclePrice = this.oraclePriceForDepositToken(
          entropyGroup,
          entropyCache
        );
        const acctValueInDepositToken = acctEquity.div(oraclePrice);
        const depositPoolBalance = await getAccountBalance(
          this.sdk.readonlyProvider.connection,
          depositTokenMint,
          this.voltVault.depositPool
        );
        return new Decimal(acctValueInDepositToken.toString())
          .add(new Decimal(depositPoolBalance.balance.toString()))
          .div(normFactor);
      } else {
        throw new Error("volt type not recognized");
      }
    } catch (err) {
      console.error("could not load volt value: ", err);
      throw new Error("could not load volt value");
    }
  }

  async getCurrentPendingDeposits(): Promise<BN> {
    const data = await getAccountBalanceOrZeroStruct(
      this.sdk.readonlyProvider.connection,
      this.voltVault.underlyingAssetMint,
      (
        await VoltSDK.findRoundUnderlyingTokensAddress(
          this.voltKey,
          this.voltVault.roundNumber,
          this.sdk.programs.Volt.programId
        )
      )[0]
    );
    return data.balance;
  }

  async getCurrentPendingWithdrawals(
    totalValueValueExcludingPendingDeposits?: Decimal
  ): Promise<BN> {
    const roundForPendingWithdrawal = await this.getRoundByNumber(
      this.voltVault.roundNumber
    );

    const voltTokenSupply = new Decimal(
      (
        await getMintInfo(
          anchorProviderToSerumProvider(this.sdk.readonlyProvider),
          this.voltVault.vaultMint
        )
      ).supply.toString()
    ).add(
      new Decimal(
        roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
      )
    );

    if (totalValueValueExcludingPendingDeposits === undefined)
      totalValueValueExcludingPendingDeposits =
        await this.getVoltValueInDepositToken();

    const pendingWithdrawalsInDepositToken = voltTokenSupply.lte(0)
      ? new BN(0)
      : new BN(
          new Decimal(
            roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
          )
            .mul(totalValueValueExcludingPendingDeposits)
            .div(voltTokenSupply)
            .toFixed(0)
        );

    return pendingWithdrawalsInDepositToken;
  }

  async getBalancesForUser(pubkey: PublicKey): Promise<
    | {
        totalBalance: Decimal;
        normalBalance: Decimal;
        pendingDeposits: Decimal;
        pendingWithdrawals: Decimal;
        mintableShares: Decimal;
        claimableUnderlying: Decimal;
        normFactor: Decimal;
        vaultNormFactor: Decimal;
      }
    | undefined
  > {
    const voltVault = this.voltVault;
    const provider = this.sdk.readonlyProvider;
    const connection = this.sdk.readonlyProvider.connection;
    const user = null as unknown as Signer;

    const underlyingToken = new Token(
      connection,
      voltVault.underlyingAssetMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const vaultToken = new Token(
      provider.connection,
      voltVault.vaultMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const underlyingTokenMintInfo = await underlyingToken.getMintInfo();
    const vaultTokenMintInfo = await vaultToken.getMintInfo();

    const normFactor = new Decimal(10).pow(underlyingTokenMintInfo.decimals);
    const vaultNormFactor = new Decimal(10).pow(vaultTokenMintInfo.decimals);

    const totalVaultValueExcludingPendingDeposits = (
      await this.getVoltValueInDepositToken(normFactor)
    ).mul(normFactor);

    const roundInfo = await this.getRoundByNumber(voltVault.roundNumber);

    const voltTokenSupply = new Decimal(
      vaultTokenMintInfo.supply.toString()
    ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));

    const vaultTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      voltVault.vaultMint,
      pubkey,
      true
    );

    let userVoltTokens = new Decimal(0);
    try {
      userVoltTokens = new Decimal(
        (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
      );
      // eslint-disable-next-line no-empty
    } catch (err) {}

    const userValueExcludingPendingDeposits = voltTokenSupply.lte(0)
      ? new Decimal(0)
      : totalVaultValueExcludingPendingDeposits
          .mul(userVoltTokens)
          .div(voltTokenSupply);

    let pendingDepositInfo = null;

    try {
      pendingDepositInfo = await this.getPendingDepositForGivenUser(pubkey);
    } catch (err) {
      pendingDepositInfo = null;
    }

    let userValueFromPendingDeposits = new Decimal(0);
    let userMintableShares = new Decimal(0);

    if (
      pendingDepositInfo !== null &&
      pendingDepositInfo.numUnderlyingDeposited.gtn(0)
    ) {
      const roundForPendingDeposit = await this.getRoundByNumber(
        pendingDepositInfo.roundNumber
      );
      const voltTokensForPendingDepositRound = new Decimal(
        (
          await vaultToken.getAccountInfo(
            (
              await VoltSDK.findRoundVoltTokensAddress(
                this.voltKey,
                roundForPendingDeposit.number,
                this.sdk.programs.Volt.programId
              )
            )[0]
          )
        ).amount.toString()
      );

      userValueFromPendingDeposits =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0)
          ? new Decimal(0)
          : pendingDepositInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              )
              .mul(totalVaultValueExcludingPendingDeposits)
              .div(voltTokenSupply);

      userMintableShares =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0) ||
        pendingDepositInfo.roundNumber.gte(this.voltVault.roundNumber)
          ? new Decimal(0)
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              );
    }

    let pendingwithdrawalInfo = null;

    try {
      pendingwithdrawalInfo = await this.getPendingWithdrawalForGivenUser(
        pubkey
      );
    } catch (err) {
      pendingwithdrawalInfo = null;
    }

    let userValueFromPendingWithdrawals = new Decimal(0);
    let userClaimableUnderlying = new Decimal(0);

    if (
      pendingwithdrawalInfo !== null &&
      pendingwithdrawalInfo.numVoltRedeemed.gtn(0)
    ) {
      const roundForPendingWithdrawal = await this.getRoundByNumber(
        pendingwithdrawalInfo.roundNumber
      );
      const underlyingTokensForPendingWithdrawalRound = new Decimal(
        (
          await underlyingToken.getAccountInfo(
            (
              await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
                this.voltKey,
                roundForPendingWithdrawal.number,
                this.sdk.programs.Volt.programId
              )
            )[0]
          )
        ).amount.toString()
      );

      userValueFromPendingWithdrawals = voltTokenSupply.lte(0)
        ? new Decimal(0)
        : pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
        ? new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
            .mul(
              new Decimal(totalVaultValueExcludingPendingDeposits.toString())
            )
            .div(voltTokenSupply)
        : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
        ? new Decimal(0)
        : new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
            .mul(underlyingTokensForPendingWithdrawalRound)
            .div(
              new Decimal(
                roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
              )
            );

      userClaimableUnderlying =
        voltTokenSupply.lte(0) ||
        pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(0)
          : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
          ? new Decimal(0)
          : new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
              .mul(underlyingTokensForPendingWithdrawalRound)
              .div(
                new Decimal(
                  roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
                )
              );
    }

    const totalUserValue = userValueExcludingPendingDeposits
      .add(userValueFromPendingDeposits)
      .add(userValueFromPendingWithdrawals);

    return {
      totalBalance: totalUserValue.div(normFactor),
      normalBalance: userValueExcludingPendingDeposits.div(normFactor),
      pendingDeposits: userValueFromPendingDeposits.div(normFactor),
      pendingWithdrawals: userValueFromPendingWithdrawals.div(normFactor),
      mintableShares: userMintableShares.div(normFactor),
      claimableUnderlying: userClaimableUnderlying.div(normFactor),
      normFactor: normFactor,
      vaultNormFactor: vaultNormFactor,
    };
  }

  /**
   * normalization factor based on # of decimals of underlying token
   */
  async getNormalizationFactor() {
    if (typeof window !== "undefined") {
      throw new Error(
        "You are NOT allowed to use getNormalizationFactor() from the browser"
      );
    }
    try {
      const underlyingAssetMintInfo = await new Token(
        this.sdk.readonlyProvider.connection,
        this.voltVault.underlyingAssetMint,
        TOKEN_PROGRAM_ID,
        null as unknown as Signer
      ).getMintInfo();

      return new Decimal(10).toPower(
        new Decimal(underlyingAssetMintInfo.decimals.toString())
      );
    } catch (e) {
      if (e instanceof Error) {
        throw new Error("getNormalizationFactor error: " + e.message);
      }
      throw e;
    }
  }

  static async findPermissionedMarketPremiumPoolAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("permissionedMarketPremiumPool")],
      voltProgramId
    );
  }

  static async findWhitelistTokenAccountAddress(
    voltKey: PublicKey,
    whitelistMintKey: PublicKey,
    voltProgramId: PublicKey
  ) {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        whitelistMintKey.toBuffer(),
        textEncoder.encode("whitelistTokenAccount"),
      ],
      voltProgramId
    );
  }

  static async findEpochInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("epochInfo"),
      ],
      voltProgramId
    );
  }

  static async findEntropyRoundInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("entropyRoundInfo"),
      ],
      voltProgramId
    );
  }

  static async findRoundInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("roundInfo"),
      ],
      voltProgramId
    );
  }

  static async findRoundVoltTokensAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("roundVoltTokens"),
      ],
      voltProgramId
    );
  }

  static async findRoundUnderlyingTokensAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("roundUnderlyingTokens"),
      ],
      voltProgramId
    );
  }

  static async findRoundUnderlyingPendingWithdrawalsAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new u64(roundNumber.toString()).toBuffer(),
        textEncoder.encode("roundUlPending"),
      ],
      voltProgramId
    );
  }

  static async findRoundAddresses(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<{
    roundInfoKey: PublicKey;
    roundInfoKeyBump: number;
    roundUnderlyingTokensKey: PublicKey;
    roundUnderlyingTokensKeyBump: number;
    roundVoltTokensKey: PublicKey;
    roundVoltTokensKeyBump: number;
    roundUnderlyingPendingWithdrawalsKey: PublicKey;
    roundUnderlyingPendingWithdrawalsBump: number;
    entropyRoundInfoKey: PublicKey;
    entropyRoundInfoBump: number;
    epochInfoKey: PublicKey;
    epochInfoBump: number;
  }> {
    const [roundInfoKey, roundInfoKeyBump] = await VoltSDK.findRoundInfoAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    const [roundUnderlyingTokensKey, roundUnderlyingTokensKeyBump] =
      await VoltSDK.findRoundUnderlyingTokensAddress(
        voltKey,
        roundNumber,
        voltProgramId
      );

    const [roundVoltTokensKey, roundVoltTokensKeyBump] =
      await VoltSDK.findRoundVoltTokensAddress(
        voltKey,
        roundNumber,
        voltProgramId
      );

    const [
      roundUnderlyingPendingWithdrawalsKey,
      roundUnderlyingPendingWithdrawalsBump,
    ] = await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    const [epochInfoKey, epochInfoBump] = await VoltSDK.findEpochInfoAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    const [entropyRoundInfoKey, entropyRoundInfoBump] =
      await VoltSDK.findEntropyRoundInfoAddress(
        voltKey,
        roundNumber,
        voltProgramId
      );

    return {
      roundInfoKey,
      roundInfoKeyBump,
      roundUnderlyingTokensKey,
      roundUnderlyingTokensKeyBump,
      roundVoltTokensKey,
      roundVoltTokensKeyBump,
      roundUnderlyingPendingWithdrawalsKey,
      roundUnderlyingPendingWithdrawalsBump,
      entropyRoundInfoKey,
      entropyRoundInfoBump,
      epochInfoKey,
      epochInfoBump,
    };
  }

  static async findUsefulAddresses(
    voltKey: PublicKey,
    voltVault: VoltVault,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<{
    extraVoltKey: PublicKey;
    pendingDepositInfoKey: PublicKey;
    roundInfoKey: PublicKey;
    roundVoltTokensKey: PublicKey;
    roundUnderlyingTokensKey: PublicKey;
    pendingWithdrawalInfoKey: PublicKey;
    roundUnderlyingPendingWithdrawalsKey: PublicKey;
    epochInfoKey: PublicKey;
    epochInfoBump: number;
  }> {
    const { pendingDepositInfoKey } = await VoltSDK.findPendingDepositAddresses(
      voltKey,
      user,
      voltProgramId
    );

    const [pendingWithdrawalInfoKey] =
      await VoltSDK.findPendingWithdrawalInfoAddress(
        voltKey,
        user,
        voltProgramId
      );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(
      voltKey,
      voltProgramId
    );
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      epochInfoBump,
    } = await VoltSDK.findRoundAddresses(
      voltKey,
      voltVault.roundNumber,
      voltProgramId
    );

    return {
      extraVoltKey,
      pendingDepositInfoKey,
      roundInfoKey,
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      epochInfoBump,
    };
  }

  static async findMostRecentVoltTokensAddress(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        user.toBuffer(),
        textEncoder.encode("mostRecentVoltTokens"),
      ],
      voltProgramId
    );
  }

  static async findPendingDepositInfoAddress(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        user.toBuffer(),
        textEncoder.encode("pendingDeposit"),
      ],
      voltProgramId
    );
  }

  static async findPendingDepositAddresses(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<{
    pendingDepositInfoKey: PublicKey;
    pendingDepositInfoKeyBump: number;
  }> {
    const [pendingDepositInfoKey, pendingDepositInfoKeyBump] =
      await VoltSDK.findPendingDepositInfoAddress(voltKey, user, voltProgramId);

    return {
      pendingDepositInfoKey,
      pendingDepositInfoKeyBump,
    };
  }

  static async findPendingWithdrawalInfoAddress(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        user.toBuffer(),
        textEncoder.encode("pendingWithdrawal"),
      ],
      voltProgramId
    );
  }

  static async findSetNextOptionAddresses(
    voltKey: PublicKey,
    optionMint: PublicKey,
    writerTokenMint: PublicKey,
    voltProgramId: PublicKey
  ) {
    const textEncoder = new TextEncoder();
    const [optionPoolKey, optionPoolBump] = await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        optionMint.toBuffer(),
        textEncoder.encode("optionPool"),
      ],
      voltProgramId
    );

    const [writerTokenPoolKey, writerTokenPoolBump] =
      await PublicKey.findProgramAddress(
        [
          voltKey.toBuffer(),
          writerTokenMint.toBuffer(),
          textEncoder.encode("writerTokenPool"),
        ],
        voltProgramId
      );

    return {
      optionPoolKey,
      optionPoolBump,
      writerTokenPoolKey,
      writerTokenPoolBump,
    };
  }

  async findVaultAuthorityPermissionedOpenOrdersKey(serumMarketKey: PublicKey) {
    const openOrdersSeed = Buffer.from([
      111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
    ]);

    const [openOrdersKey, openOrdersBump] = await PublicKey.findProgramAddress(
      [
        openOrdersSeed,
        this.sdk.net.SERUM_DEX_PROGRAM_ID.toBuffer(),
        serumMarketKey.toBuffer(),
        this.voltVault.vaultAuthority.toBuffer(),
      ],
      this.sdk.programs.Volt.programId
    );

    return { openOrdersKey, openOrdersBump };
  }

  static async findPermissionedOpenOrdersKey(
    middlewareProgramId: PublicKey,
    user: PublicKey,
    serumMarketKey: PublicKey,
    dexProgramId: PublicKey
  ) {
    const openOrdersSeed = Buffer.from([
      111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
    ]);

    const [openOrdersKey, openOrdersBump] = await PublicKey.findProgramAddress(
      [
        openOrdersSeed,
        dexProgramId.toBuffer(),
        serumMarketKey.toBuffer(),
        user.toBuffer(),
      ],
      middlewareProgramId
    );

    return { openOrdersKey, openOrdersBump };
  }

  async getEpochInfoByKey(key: PublicKey): Promise<FriktionEpochInfoWithKey> {
    const acct = await this.sdk.programs.Volt.account.friktionEpochInfo.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEpochInfoByNumber(
    roundNumber: anchor.BN
  ): Promise<FriktionEpochInfoWithKey> {
    const key = (
      await VoltSDK.findEpochInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getEpochInfoByKey(key);
  }

  async getCurrentEpochInfo(): Promise<FriktionEpochInfoWithKey> {
    return await this.getEpochInfoByNumber(this.voltVault.roundNumber);
  }

  async getEntropyRoundByKey(key: PublicKey): Promise<EntropyRoundWithKey> {
    const acct = await this.sdk.programs.Volt.account.entropyRound.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEntropyRoundByNumber(
    roundNumber: anchor.BN
  ): Promise<EntropyRoundWithKey> {
    const key = (
      await VoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getEntropyRoundByKey(key);
  }

  async getCurrentEntropyRound(): Promise<EntropyRoundWithKey> {
    return await this.getEntropyRoundByNumber(this.voltVault.roundNumber);
  }

  async getCurrentRound(): Promise<RoundWithKey> {
    return await this.getRoundByNumber(this.voltVault.roundNumber);
  }

  async getAllRounds(): Promise<RoundWithKey[]> {
    let roundNumber = new BN(1);
    const roundList = [];
    while (roundNumber.lt(this.voltVault.roundNumber)) {
      const round = await this.getRoundByNumber(roundNumber);
      roundList.push(round);
      roundNumber = roundNumber.addn(1);
    }
    return roundList;
  }

  async getRoundByKey(key: PublicKey): Promise<RoundWithKey> {
    const acct = await this.sdk.programs.Volt.account.round.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getRoundByNumber(roundNumber: anchor.BN): Promise<RoundWithKey> {
    const key = (
      await VoltSDK.findRoundInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return this.getRoundByKey(key);
  }

  async loadInExtraVoltData() {
    const extraVoltData = await this.getExtraVoltData();
    this.extraVoltData = extraVoltData;
  }

  async getExtraVoltData(): Promise<ExtraVoltDataWithKey> {
    const [key] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey,
      this.sdk.programs.Volt.programId
    );
    const acct = await this.sdk.programs.Volt.account.extraVoltData.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEntropyMetadata(): Promise<EntropyMetadata> {
    const [key] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey,
      this.sdk.programs.Volt.programId
    );
    const acct = await this.sdk.programs.Volt.account.entropyMetadata.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getAuctionMetadata(): Promise<AuctionMetadata> {
    return await this.getAuctionMetadataByKey(
      (
        await VoltSDK.findAuctionMetadataAddress(this.voltKey)
      )[0]
    );
  }

  async getAuctionMetadataByKey(key: PublicKey): Promise<AuctionMetadata> {
    const acct = await this.sdk.programs.Volt.account.auctionMetadata.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getRoundVoltTokensByNumber(roundNumber: anchor.BN): Promise<BN> {
    const key = (
      await VoltSDK.findRoundVoltTokensAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    const voltToken = new Token(
      this.sdk.readonlyProvider.connection,
      this.voltVault.vaultMint,
      TOKEN_PROGRAM_ID,
      undefined as unknown as Signer
    );
    return (await voltToken.getAccountInfo(key)).amount;
  }

  async getRoundUnderlyingTokensByNumber(roundNumber: anchor.BN): Promise<BN> {
    const key = (
      await VoltSDK.findRoundUnderlyingTokensAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    const underlyingToken = new Token(
      this.sdk.readonlyProvider.connection,
      this.voltVault.underlyingAssetMint,
      TOKEN_PROGRAM_ID,
      undefined as unknown as Signer
    );
    return (await underlyingToken.getAccountInfo(key)).amount;
  }

  async getAllPendingDeposits(): Promise<PendingDepositWithKey[]> {
    const accts =
      (await this.sdk.programs.Volt.account.pendingDeposit.all()) as unknown as ProgramAccount<PendingDeposit>[];
    return accts.map((acct) => ({
      ...acct.account,
      key: acct.publicKey,
    }));
  }

  async getPendingDepositByKey(key: PublicKey): Promise<PendingDepositWithKey> {
    const acct = await this.sdk.programs.Volt.account.pendingDeposit.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getPendingDepositForGivenUser(
    user: PublicKey
  ): Promise<PendingDepositWithKey> {
    const key = (
      await VoltSDK.findPendingDepositInfoAddress(
        this.voltKey,
        user,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getPendingDepositByKey(key);
  }

  async getPendingWithdrawalForGivenUser(
    user: PublicKey
  ): Promise<PendingWithdrawalWithKey> {
    const key = (
      await VoltSDK.findPendingWithdrawalInfoAddress(
        this.voltKey,
        user,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getPendingWithdrawalByKey(key);
  }

  async getAllPendingWithdrawals(): Promise<PendingWithdrawalWithKey[]> {
    const accts =
      (await this.sdk.programs.Volt.account.pendingWithdrawal.all()) as unknown as ProgramAccount<PendingWithdrawal>[];
    return accts.map((acct) => ({
      ...acct.account,
      key: acct.publicKey,
    }));
  }

  async getPendingWithdrawalByKey(
    key: PublicKey
  ): Promise<PendingWithdrawalWithKey> {
    const acct = await this.sdk.programs.Volt.account.pendingWithdrawal.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEntropyAccountByKey(
    key: PublicKey,
    perpProtocol?: PerpProtocol
  ): Promise<{
    account: EntropyAccount;
    perpProtocol: PerpProtocol;
  }> {
    if (!perpProtocol) {
      perpProtocol = await this.getPerpProtocolForKey(key);
    }
    let programId: PublicKey;

    if (perpProtocol === "Entropy") {
      programId = ENTROPY_PROGRAM_ID;
    } else if (perpProtocol === "Mango") {
      programId = MANGO_PROGRAM_ID;
    } else {
      throw new Error("options protocol not supported");
    }

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, programId);

    const entropyAccount = await client.getEntropyAccount(
      key,
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    return {
      account: entropyAccount,
      perpProtocol,
    };
  }

  async getOptionMarketByKey(
    key: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<OptionMarketWithKey> {
    if (!optionsProtocol) {
      optionsProtocol = await this.getOptionsProtocolForKey(key);
    }
    let optionMarket: OptionMarketWithKey | null;
    if (optionsProtocol === "Inertia") {
      optionMarket = await getInertiaMarketByKey(
        this.sdk.programs.Inertia as unknown as Parameters<
          typeof getInertiaMarketByKey
        >[0],
        key
      );
    } else if (optionsProtocol === "Soloptions") {
      optionMarket = await SoloptionsSDK.getOptionMarketByKey(
        this.sdk.programs.Soloptions,
        key
      );
    } else if (optionsProtocol === "Spreads") {
      optionMarket = convertSpreadsContractToOptionMarket(
        await SpreadsSDK.getSpreadsContractByKey(this.sdk.programs.Spreads, key)
      );
    } else {
      throw new Error("options protocol not supported");
    }

    if (!optionMarket) {
      throw new Error("option market does not exist");
    }

    return optionMarket;
  }

  async getRootAndNodeBank(entropyGroup: EntropyGroup): Promise<{
    rootBank: RootBank;
    nodeBank: NodeBank.NodeBank;
  }> {
    const connection = this.sdk.readonlyProvider.connection;
    const banks = await entropyGroup.loadRootBanks(connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(connection))?.[0];

    if (!rootBank || !nodeBank) {
      throw new Error("root bank or node bank was undefined");
    }

    return {
      rootBank,
      nodeBank,
    };
  }

  async getOptionsProtocolForKey(key: PublicKey): Promise<OptionsProtocol> {
    const accountInfo =
      await this.sdk.readonlyProvider.connection.getAccountInfo(key);
    if (!accountInfo) {
      throw new Error(
        "account does not exist, can't determine options protocol owner"
      );
    }

    if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Inertia.toString()
    ) {
      return "Inertia";
    } else if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Soloptions.toString()
    ) {
      return "Soloptions";
    } else if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Spreads.toString()
    ) {
      return "Spreads";
    } else {
      throw new Error("owner is not a supported options protocol");
    }
  }

  async getPerpProtocolForKey(key: PublicKey): Promise<PerpProtocol> {
    const accountInfo =
      await this.sdk.readonlyProvider.connection.getAccountInfo(key);
    if (!accountInfo) {
      throw new Error(
        "account does not exist, can't determine perp protocol owner"
      );
    }

    if (accountInfo.owner.toString() === ENTROPY_PROGRAM_ID.toString()) {
      return "Entropy";
    } else if (accountInfo.owner.toString() === MANGO_PROGRAM_ID.toString()) {
      return "Mango";
    } else {
      throw new Error("owner is not a supported perp protocol");
    }
  }

  async getEntropyGroup(
    entropyProgramId: PublicKey,
    entropyGroupKey: PublicKey
  ): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
  }> {
    if (
      entropyProgramId.toString() !== ENTROPY_PROGRAM_ID.toString() &&
      entropyProgramId.toString() !== MANGO_PROGRAM_ID.toString()
    )
      throw new Error("given program id must match entropy or mango");

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, entropyProgramId);
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);

    return {
      entropyClient: client,
      entropyGroup,
    };
  }

  async getEntropyObjects(
    entropyProgramId: PublicKey,
    entropyGroupKey: PublicKey,
    entropyAccountKey: PublicKey
  ): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    if (
      entropyProgramId.toString() !== ENTROPY_PROGRAM_ID.toString() &&
      entropyProgramId.toString() !== MANGO_PROGRAM_ID.toString()
    )
      throw new Error("given program id must match entropy or mango");

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, entropyProgramId);
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);

    const entropyAccount = await client.getEntropyAccount(
      entropyAccountKey,
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const entropyCache = await entropyGroup.loadCache(connection);

    return {
      entropyClient: client,
      entropyGroup,
      entropyAccount,
      entropyCache,
    };
  }

  async getEntropyLendingValue(): Promise<{
    tokens: Decimal;
    dollars: Decimal;
  }> {
    let entropyGroup, entropyAccount, entropyCache;
    try {
      ({ entropyGroup, entropyAccount, entropyCache } =
        await this.getEntropyLendingObjects());
    } catch (err) {
      return {
        tokens: new Decimal(0),
        dollars: new Decimal(0),
      };
    }

    const acctEquity = new Decimal(
      entropyAccount.computeValue(entropyGroup, entropyCache).toString()
    );
    const oraclePrice = this.oraclePriceForDepositToken(
      entropyGroup,
      entropyCache
    );
    const acctValueInDepositToken = acctEquity.div(oraclePrice);
    console.log(
      "acct equity = ",
      acctEquity.toString(),
      oraclePrice.toString()
    );
    return {
      tokens: new Decimal(acctValueInDepositToken.toString()),
      dollars: new Decimal(acctEquity.toString()),
    };
  }

  async getEntropyLendingValueInDepositToken(): Promise<Decimal> {
    const { tokens } = await this.getEntropyLendingValue();
    return tokens;
  }

  async getEntropyLendingKeys(
    entropyGroupGivenKey?: PublicKey,
    entropyProgramGivenKey?: PublicKey
  ): Promise<{
    entropyLendingProgramKey: PublicKey;
    entropyLendingGroupKey: PublicKey;
    entropyLendingAccountKey: PublicKey;
  }> {
    let entropyLendingProgramKey = entropyProgramGivenKey;
    let entropyLendingGroupKey = entropyGroupGivenKey;

    if (
      entropyLendingGroupKey === undefined ||
      entropyLendingProgramKey === undefined
    ) {
      try {
        const {
          entropyClient: entropyLendingClient,
          entropyAccount: entropyLendingAccount,
        } = await this.getEntropyLendingObjects();
        entropyLendingProgramKey = entropyLendingClient.programId;
        entropyLendingGroupKey = entropyLendingAccount.entropyGroup;
      } catch (err) {
        entropyLendingProgramKey = MANGO_PROGRAM_ID;
        entropyLendingGroupKey = this.sdk.net.MANGO_GROUP;
      }
    }

    const [entropyLendingAccountKey] =
      await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);

    return {
      entropyLendingProgramKey,
      entropyLendingGroupKey,
      entropyLendingAccountKey,
    };
  }
  async getEntropyLendingObjects(): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    const [entropyLendingAccountKey] =
      await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);

    const perpProtocol = await this.getPerpProtocolForKey(
      entropyLendingAccountKey
    );

    const entropyProgramId = getProgramIdForPerpProtocol(perpProtocol);

    const { account: tempAccount } = await this.getEntropyAccountByKey(
      entropyLendingAccountKey,
      perpProtocol
    );

    return await this.getEntropyObjects(
      entropyProgramId,
      tempAccount.entropyGroup,
      entropyLendingAccountKey
    );
  }

  async getEntropyObjectsForEvData(): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    const extraVoltData = await this.getExtraVoltData();
    return await this.getEntropyObjects(
      extraVoltData.entropyProgramId,
      extraVoltData.entropyGroup,
      extraVoltData.entropyAccount
    );
  }

  static async getGroupAndBanks(
    client: EntropyClient,
    entropyGroupKey: PublicKey,
    mint: PublicKey
  ): Promise<{
    entropyGroup: EntropyGroup;
    rootBank: RootBank | undefined;
    nodeBank: NodeBank.NodeBank | undefined;
    quoteRootBank: RootBank | undefined;
    quoteNodeBank: NodeBank.NodeBank | undefined;
    depositIndex: number;
  }> {
    const connection = client.connection;
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);
    const banks = await entropyGroup.loadRootBanks(connection);

    const bankIndex = entropyGroup.tokens.findIndex(
      (ti) => ti.mint.toString() === mint.toString()
    );

    let rootBank = banks[bankIndex];
    let nodeBank = (await rootBank?.loadNodeBanks(connection))?.[0];

    const quoteRootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const quoteNodeBank = (await quoteRootBank?.loadNodeBanks(connection))?.[0];

    if (bankIndex === undefined) {
      if (
        mint.toString() === entropyGroup.getQuoteTokenInfo().mint.toString()
      ) {
        rootBank = quoteRootBank;
        nodeBank = quoteNodeBank;
      } else {
        throw new Error("bank index not found for mint = " + mint.toString());
      }
    }

    return {
      entropyGroup,
      rootBank,
      nodeBank,
      quoteRootBank,
      quoteNodeBank,
      depositIndex: bankIndex,
    };
  }

  async getGroupAndBanksForEvData(
    client: EntropyClient,
    mint: PublicKey
  ): Promise<{
    entropyGroup: EntropyGroup;
    rootBank: RootBank | undefined;
    nodeBank: NodeBank.NodeBank | undefined;
    quoteRootBank: RootBank | undefined;
    quoteNodeBank: NodeBank.NodeBank | undefined;
    depositIndex: number;
  }> {
    if (!this.extraVoltData) throw new Error("extra volt data must be defined");
    return await VoltSDK.getGroupAndBanks(
      client,
      this.extraVoltData.entropyGroup,
      mint
    );
  }

  async getPnlForRound(roundNumber: BN, subtractFees = true): Promise<Decimal> {
    if (this.voltType() === VoltType.ShortOptions) {
      const epochInfo = await this.getEpochInfoByNumber(roundNumber);
      let pnlForRound = epochInfo.underlyingPostSettle.sub(
        epochInfo.underlyingPreEnter
      );
      if (subtractFees && pnlForRound.gtn(0))
        pnlForRound = pnlForRound.sub(
          VoltSDK.performanceFeeAmount(pnlForRound)
        );
      return new Decimal(pnlForRound.toString()).div(
        await this.getNormalizationFactor()
      );
    } else if (this.voltType() === VoltType.Entropy) {
      const epochInfo = await this.getEpochInfoByNumber(roundNumber);
      return new Decimal(epochInfo.pnl.toString())
        .sub(new Decimal(epochInfo.performanceFees.toString()))
        .div(await this.getNormalizationFactor());
    } else {
      throw new Error("invalid volt type");
    }
  }
  // only works beginning with epoch on april 7
  async getPnlForUserAndRound(
    roundNumber: BN,
    participatingVaultTokens: BN,
    subtractFees = true
  ): Promise<Decimal> {
    const epochInfo = await this.getEpochInfoByNumber(roundNumber);
    const pnlForRound = await this.getPnlForRound(roundNumber, subtractFees);
    const voltTokenSupplyForRound = epochInfo.voltTokenSupply;
    const normFactor = await this.getNormalizationFactor();
    const participatingPnl = pnlForRound
      .mul(new Decimal(participatingVaultTokens.toString()).div(normFactor))
      .div(new Decimal(voltTokenSupplyForRound.toString()).div(normFactor));

    return new Decimal(participatingPnl.toString());
  }

  async getUserPendingDepositUnderlying(user: PublicKey): Promise<Decimal> {
    const result = await this.getBalancesForUser(user);
    if (!result) throw new Error("can't find data for user");
    const { pendingDeposits } = result;
    return pendingDeposits;
  }

  async getUserMintableShares(user: PublicKey): Promise<BN> {
    return this.getUserMintableSharesForRound(user, this.voltVault.roundNumber);
    // const result = await this.getBalancesForUser(user);
    // if (!result) throw new Error("can't find data for user");
    // const { mintableShares } = result;
    // const vaultMintInfo = await getMintInfo(
    //   this.sdk.readonlyProvider,
    //   this.voltVault.vaultMint
    // );
    // return new BN(
    //   mintableShares.mul(new Decimal(10).pow(vaultMintInfo.decimals)).toFixed(0)
    // );
  }

  async getUserMintableSharesForRound(
    user: PublicKey,
    roundNumber: BN
  ): Promise<BN> {
    let pendingDepositInfo: PendingDepositWithKey;
    try {
      pendingDepositInfo = await this.getPendingDepositForGivenUser(user);
      if (pendingDepositInfo.roundNumber >= roundNumber) {
        return new BN(0);
      }
    } catch (err) {
      return new BN(0);
    }

    try {
      const result = await this.getBalancesForUser(user);
      if (!result) return new BN(0);
      const { mintableShares } = result;

      return new BN(mintableShares.toFixed(0));
    } catch (err) {
      console.log(err);
      return new BN(0);
    }
  }
  async getCurrentMarketAndAuthorityInfo() {
    return await this.getMarketAndAuthorityInfo(this.voltVault.optionMarket);
  }

  async getMarketAndAuthorityInfo(optionMarketKey: PublicKey) {
    const textEncoder = new TextEncoder();

    const [serumMarketKey, _serumMarketBump] =
      await VoltSDK.findSerumMarketAddress(
        this.voltKey,
        this.sdk.net.MM_TOKEN_MINT,
        optionMarketKey
      );

    const [marketAuthority, marketAuthorityBump] =
      await PublicKey.findProgramAddress(
        [
          textEncoder.encode("open-orders-init"),
          this.sdk.net.SERUM_DEX_PROGRAM_ID.toBuffer(),
          serumMarketKey.toBuffer(),
        ],
        this.sdk.programs.Volt.programId
      );

    return { serumMarketKey, marketAuthority, marketAuthorityBump };
  }
}
