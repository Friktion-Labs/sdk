import { BN, Config as MangoConfig } from "@blockworks-foundation/mango-client";
import type {
  EntropyAccount,
  EntropyCache,
  EntropyGroup,
  GroupConfig,
  NodeBank,
  RootBank,
} from "@friktion-labs/entropy-client";
import {
  Config as EntropyConfig,
  EntropyClient,
  I80F48,
} from "@friktion-labs/entropy-client";
import { getAccountBalance, sendInsList } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { AccountMeta, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import Decimal from "decimal.js";

import {
  ENTROPY_PROGRAM_ID,
  FRIKTION_PROGRAM_ID,
  VoltStrategy,
  VoltType,
} from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { getGroupAndBanks } from "./utils/entropyHelpers";
import type { CrabResult } from "./utils/helperTypes";
import { VoltSDK } from "./VoltSDK";
import type {
  EntropyMetadata,
  EntropyRoundWithKey,
  ExtraVoltData,
  VoltProgram,
  VoltVault,
} from "./voltTypes";

// SUPER DUPER IMPORTANT NOTE: cannot allow any imports from "./" inside this file since it will import ConnectedEntropyVoltSDK and make you cry

export class EntropyVoltSDK extends VoltSDK {
  getHeadlineMint(): PublicKey {
    throw new Error("Method not implemented.");
  }

  override extraVoltData: ExtraVoltData;
  constructor(
    sdk: FriktionSDK,
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData: ExtraVoltData,
    readonly entropyMetadata: EntropyMetadata
  ) {
    super(sdk, voltKey, voltVault, extraVoltData);
    this.extraVoltData = extraVoltData;
    if (this.voltType() !== VoltType.Entropy) {
      throw new Error("Not a valid entropy volt");
    }
  }
  //// SIMPLE GETTERS ////

  specificVoltName(): Promise<string> {
    const voltNumber = this.voltNumber();
    // can only be 3 or 4
    switch (voltNumber) {
      default:
        throw new Error("invalid volt number for entropy sdk");
      case 3: {
        return new Promise((resolve) => {
          resolve(
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            "Short" +
              " Crab (-" +
              this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
                this.extraVoltData.targetPerpMarket.toString()
              ]?.toString() +
              ", +" +
              this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
                this.getHedgingInstrumentKey().toString()
              ]?.toString() +
              ")"
          );
        });
      }
      case 4: {
        return new Promise((resolve) => {
          resolve(
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            "Long" +
              " Basis (+" +
              this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
                this.extraVoltData.targetPerpMarket.toString()
              ]?.toString() +
              ", -" +
              this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
                this.getHedgingInstrumentKey().toString()
              ]?.toString() +
              ")"
          );
        });
      }
    }
  }

  voltStrategy(): VoltStrategy {
    return this.entropyMetadata.hedgeWithSpot
      ? VoltStrategy.LongBasis
      : VoltStrategy.ShortCrab;
  }

  perpMarketToName(perpMarketKey: PublicKey): string {
    if (!(perpMarketKey.toString() in this.sdk.net.ENTROPY_PERP_MARKET_NAMES))
      throw new Error("couldn't find name for " + perpMarketKey.toString());
    return this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
      perpMarketKey.toString()
    ] as string;
  }

  getHedgingInstrumentKey(): PublicKey {
    return this.entropyMetadata.hedgeWithSpot
      ? this.extraVoltData.hedgingSpotMarket
      : this.extraVoltData.hedgingPerpMarket;
  }

  async getCurrentEntropyRound(): Promise<EntropyRoundWithKey> {
    return await this.getEntropyRoundByNumber(this.voltVault.roundNumber);
  }

  //// USEFUL CALCULATIONS ////

  // gets crab specific data from the entropy API.
  async getCrabProfitRange(): Promise<CrabResult> {
    let retries = 0;
    while (true && retries < 5) {
      const response = await fetch(`https://stats.entropy.trade/volt03`);
      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: CrabResult = (await response.json()) as CrabResult;
        return data;
      } else {
        console.error(response);
        console.error("status != 200, === ", response.status.toString());
      }
      retries += 1;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    throw new Error("retries failed");
  }

  async getPrimaryStrategyTvlWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal> {
    const { entropyGroup, entropyAccount, entropyCache } =
      await this.getEntropyObjectsForEvData();
    // eslint-disable-next-line
    const acctEquity: Decimal = new Decimal(
      entropyAccount.getHealthUnweighted(entropyGroup, entropyCache).toString()
    );

    const oraclePrice = this.getOraclePriceForDepositToken(
      entropyGroup,
      entropyCache
    );
    const acctValueInDepositToken = acctEquity.div(oraclePrice);
    const depositPoolBalance = await getAccountBalance(
      this.sdk.readonlyProvider.connection,
      this.voltVault.depositPool
    );
    return new Decimal(acctValueInDepositToken.toString())
      .add(new Decimal(depositPoolBalance.toString()))
      .div(normFactor);
  }

  //// LOGGING ////

  async printHighLevelStats(): Promise<void> {
    const ev = this.extraVoltData;

    console.log(
      "leverage: ",
      ev.targetLeverage,
      "hedge ratio: ",
      this.entropyMetadata.targetHedgeRatio,
      "\nleverage lenience: ",
      ev.targetLeverageLenience,
      "hedge lenience: ",
      ev.targetHedgeLenience,
      "\nshould hedge: ",
      ev.isHedgingOn,
      "hedge with spot?: ",
      (await this.getEntropyMetadata()).hedgeWithSpot
    );

    return Promise.resolve();
  }

  printStrategyParams(): void {
    const ev = this.extraVoltData;
    console.log(
      "\n ENTROPY: ",
      "\n, target perp market: ",
      ev.targetPerpMarket.toString(),
      "\n hedging perp market: ",
      ev.hedgingPerpMarket.toString(),
      "\n hedging spot market: ",
      ev.hedgingSpotMarket.toString(),
      "\n hedging?: ",
      ev.isHedgingOn,
      "\n hedging with spot?: ",
      this.entropyMetadata.hedgeWithSpot
    );
  }

  printStateMachine(): void {
    const ev = this.extraVoltData;
    console.log(
      "\n Entropy State: ",
      "\n, rebalance ready?: ",
      ev.rebalanceIsReady,
      "\n, done rebalancing?: ",
      ev.doneRebalancing,
      "\n, done rebalancing target perp?: ",
      ev.doneRebalancingTargetPerp,
      "\n, have taken perf fees?: ",
      ev.haveTakenPerformanceFees,
      "\n, have resolved deposits?: ",
      ev.haveResolvedDeposits
    );
  }

  async printAuctionDetails(): Promise<void> {
    const ev = this.extraVoltData;
    const entropyRound = await this.getCurrentEntropyRound();

    const { entropyAccount, entropyGroup, entropyCache } =
      await this.getEntropyObjectsForEvData();

    const entropyMetadata = await this.getEntropyMetadata();

    const targetPerpIndex = entropyGroup.getPerpMarketIndex(
      ev.targetPerpMarket
    );
    const hedgePerpIndex = entropyGroup.getPerpMarketIndex(
      ev.hedgingPerpMarket
    );

    const acctEquityPostDeposits = entropyAccount
      .computeValue(entropyGroup, entropyCache)
      .add(
        I80F48.fromString(entropyRound.netDepositsQuote as string)
          .div(
            I80F48.fromString(
              (await this.getDepositTokenNormalizationFactor()).toString()
            )
          )
          .min(new I80F48(new BN(0)))
      );

    const targetTotalPerpSize = acctEquityPostDeposits.mul(
      I80F48.fromString(ev.targetLeverage as string)
    );
    const currTotalPerpSize = I80F48.fromNumber(
      entropyAccount.getBasePositionUiWithGroup(targetPerpIndex, entropyGroup)
    ).mul(entropyCache.priceCache[targetPerpIndex]?.price as I80F48);

    console.log(
      "target perp long funding: ",
      (
        entropyCache.perpMarketCache[targetPerpIndex]?.longFunding as I80F48
      ).toString(),
      "target perp short funding: ",
      (
        entropyCache.perpMarketCache[targetPerpIndex]?.shortFunding as I80F48
      ).toString(),
      "\nhedge perp long funding: ",
      (
        entropyCache.perpMarketCache[hedgePerpIndex]?.longFunding as I80F48
      ).toString(),
      "hedge perp short funding: ",
      (
        entropyCache.perpMarketCache[hedgePerpIndex]?.shortFunding as I80F48
      ).toString(),
      "\ntarget perp oracle price: ",
      (entropyCache.priceCache[targetPerpIndex]?.price as I80F48).toString(),
      "\nfrom getPrice(): ",
      entropyGroup
        .getPrice(
          entropyGroup.getPerpMarketIndex(this.extraVoltData.targetPerpMarket),
          entropyCache
        )
        .toString()
    );
    console.log(
      "target total: ",
      targetTotalPerpSize.toString(),
      "\n curr total: ",
      currTotalPerpSize.toString()
    );
    const targetIncrementalPerpSize =
      targetTotalPerpSize.sub(currTotalPerpSize);

    const hedgingPerpSize = acctEquityPostDeposits
      .mul(I80F48.fromString(entropyMetadata.targetHedgeRatio as string))
      .mul(I80F48.fromString(ev.targetLeverage as string))
      .sub(
        I80F48.fromNumber(
          entropyAccount.getBasePositionUiWithGroup(
            hedgePerpIndex,
            entropyGroup
          )
        ).mul(entropyCache.priceCache[hedgePerpIndex]?.price as I80F48)
      );

    console.log(
      `equity post deposits = ${acctEquityPostDeposits.toString()}`,
      `\nneeded ${
        this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
          ev.targetPerpMarket.toString()
        ]?.toString() ?? "N/A"
      } quote size: `,
      targetIncrementalPerpSize.toFixed(4),
      `\nneeded ${
        this.sdk.net.ENTROPY_PERP_MARKET_NAMES[
          ev.hedgingPerpMarket.toString()
        ]?.toString() ?? "N/A"
      } quote size: `,
      hedgingPerpSize.toFixed(4)
    );
  }

  async printPositionStats(): Promise<void> {
    const ev = this.extraVoltData;
    if (ev === undefined)
      throw new Error("please load extraVoltData before calling");

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

  async estimateCurrentPerformanceAsPercentage(): Promise<Decimal> {
    const { entropyAccount, entropyGroup, entropyCache } =
      await this.getEntropyObjectsForEvData();

    const entropyRound = await this.getCurrentEntropyRound();
    const startEquity = I80F48.fromString(
      entropyRound.acctEquityStart as string
    );
    const currEquity = entropyAccount.computeValue(entropyGroup, entropyCache);

    const pnlEquity = currEquity.sub(startEquity);
    const pnlPct = pnlEquity.div(startEquity);

    return new Decimal(pnlPct.div(I80F48.fromNumber(100)).toString());
  }
  //// INITIALIZE INSTRUCTION ////

  static async getInitializeVoltInstruction({
    sdk,
    adminKey,
    vaultName,
    depositMint,
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
    adminKey: PublicKey;
    vaultName: string;
    depositMint: PublicKey;
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
    capacity: BN;
    individualCapacity: BN;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    const {
      vault,
      vaultAuthorityBump,
      extraVoltKey,
      vaultAuthority,
      vaultMint,
      depositPoolKey,
      entropyMetadataKey,
      whitelistTokenAccountKey,
    } = await EntropyVoltSDK.findInitializeAddresses(sdk, vaultName);

    const [entropyAccountKey] = await EntropyVoltSDK.findEntropyAccountAddress(
      vault
    );
    const client = new EntropyClient(
      sdk.readonlyProvider.connection,
      entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);
    const entropyCacheKey = entropyGroup.entropyCache;

    const initializeEntropyAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initializeEntropy"]["accounts"]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      >[0]]: PublicKey | any;
    } = {
      initializeBaseAccounts: {
        authority: adminKey,
        adminKey: adminKey,
        voltVault: vault,
        vaultAuthority: vaultAuthority,
        vaultMint: vaultMint,

        extraVoltData: extraVoltKey,

        depositMint: depositMint,

        depositPool: depositPoolKey,

        whitelistTokenAccount: whitelistTokenAccountKey,
        whitelistTokenMint: sdk.net.MM_TOKEN_MINT,

        dexProgram: sdk.net.SERUM_DEX_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
      voltVault: vault,

      entropyMetadata: entropyMetadataKey,

      entropyProgram: entropyProgramId,
      entropyGroup: entropyGroupKey,
      entropyAccount: entropyAccountKey,
      entropyCache: entropyCacheKey,
      targetPerpMarket: targetPerpMarket,
      hedgingPerpMarket: spotPerpMarket,
      hedgingSpotMarket: spotMarket,

      systemProgram: SystemProgram.programId,
    };

    const baseArgs = {
      vaultName,
      capacity,
      individualCapacity,
      bumps: {
        vaultAuthorityBump,
      },
    };

    const instruction: TransactionInstruction =
      sdk.programs.Volt.instruction.initializeEntropy(
        {
          baseArgs: baseArgs,
          targetLeverageRatio,
          targetLeverageLenience,
          targetHedgeLenience,
          exitEarlyRatio,
          shouldHedge,
          hedgeWithSpot,
          targetHedgeRatio,
          rebalancingLenience,
          requiredBasisFromOracle,
        } as never,
        {
          accounts: initializeEntropyAccounts,
        }
      );

    return {
      instruction,
      voltKey: vault,
    };
  }

  static async doInitializeVolt({
    sdk,
    provider,
    adminKey,
    vaultName,
    underlyingAssetMint,
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
    provider: AnchorProvider;
    adminKey: PublicKey;
    vaultName: string;
    underlyingAssetMint: PublicKey;
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
    capacity: BN;
    individualCapacity: BN;
  }): Promise<PublicKey> {
    const { instruction, voltKey } =
      await EntropyVoltSDK.getInitializeVoltInstruction({
        sdk,
        adminKey,
        vaultName,
        depositMint: underlyingAssetMint,
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
      });

    await sendInsList(provider, [instruction], {
      computeUnits: 400_000,
    });

    return voltKey;
  }

  //// ENTROPY LOADERS ////

  async getEntropyObjectsForEvData(): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    const extraVoltData = this.extraVoltData;
    return await this.getEntropyObjects(
      extraVoltData.entropyProgramId,
      extraVoltData.entropyGroup,
      extraVoltData.entropyAccount
    );
  }

  async getRootAndNodeBank(entropyGroup: EntropyGroup): Promise<{
    rootBank: RootBank;
    nodeBank: NodeBank;
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
  async getGroupAndBanksForEvData(
    client: EntropyClient,
    mint: PublicKey
  ): Promise<{
    entropyGroup: EntropyGroup;
    rootBank: RootBank | undefined;
    nodeBank: NodeBank | undefined;
    quoteRootBank: RootBank | undefined;
    quoteNodeBank: NodeBank | undefined;
    depositIndex: number;
  }> {
    if (!this.extraVoltData) throw new Error("extra volt data must be defined");
    return await getGroupAndBanks(
      client,
      this.extraVoltData.entropyGroup,
      mint
    );
  }

  //// ACCOUNT LOADERS ////

  async getEntropyMetadata(): Promise<EntropyMetadata> {
    const [key] = await EntropyVoltSDK.findEntropyMetadataAddress(
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

  async getEntropyRoundByKey(key: PublicKey): Promise<EntropyRoundWithKey> {
    const acct = await this.sdk.programs.Volt.account.entropyRound.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEntropyRoundByNumber(roundNumber: BN): Promise<EntropyRoundWithKey> {
    const key = (
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getEntropyRoundByKey(key);
  }

  //// FIND PDAs ////

  static async findInitializeAddresses(
    sdk: FriktionSDK,
    pdaStr: string
  ): Promise<{
    vault: PublicKey;
    vaultBump: number;
    vaultAuthorityBump: number;
    extraVoltKey: PublicKey;
    vaultMint: PublicKey;
    vaultAuthority: PublicKey;
    depositPoolKey: PublicKey;
    entropyAccountKey: PublicKey;
    entropyMetadataKey: PublicKey;
    whitelistTokenAccountKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();

    const [vault, vaultBump] = await PublicKey.findProgramAddress(
      [
        new BN(VoltType.Entropy).toArrayLike(Buffer, "le", 8),
        textEncoder.encode(pdaStr),
        textEncoder.encode("vault"),
      ],
      sdk.programs.Volt.programId
    );

    const {
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      vaultAuthorityBump,
      whitelistTokenAccountKey,
    } = await VoltSDK.findSharedInitializeAddresses(sdk, vault);

    const [entropyAccountKey] = await EntropyVoltSDK.findEntropyAccountAddress(
      vault
    );
    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(vault);

    return {
      vault,
      vaultBump,
      vaultAuthorityBump,
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      entropyAccountKey,
      entropyMetadataKey,
      whitelistTokenAccountKey,
    };
  }

  static async findEntropyAccountAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("entropyAccount")],
      voltProgramId
    );
  }

  static async findEntropyRoundInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("entropyRoundInfo"),
      ],
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

  getDefaultEntropyClient(): EntropyClient {
    return new EntropyClient(
      this.sdk.readonlyProvider.connection,
      this.extraVoltData.entropyProgramId
    );
  }

  getTargetPerpMarketKey(): PublicKey {
    return this.extraVoltData.targetPerpMarket;
  }

  async getEntropyBaseAccountsContext(
    rootBankKey?: PublicKey,
    nodeBankKey?: PublicKey,
    vaultKey?: PublicKey
  ): Promise<{
    voltVault: PublicKey;
    extraVoltData: PublicKey;
    program: PublicKey;
    group: PublicKey;
    account: PublicKey;
    cache: PublicKey;
    rootBank: PublicKey;
    nodeBank: PublicKey;
    vault: PublicKey;
  }> {
    if (rootBankKey === undefined || nodeBankKey === undefined) {
      const { rootBank, nodeBank } = await this.getGroupAndBanksForEvData(
        this.getDefaultEntropyClient(),
        this.extraVoltData.depositMint
      );
      if (rootBank === undefined || nodeBank === undefined) {
        throw new Error("can't find root bank or node bank");
      }
      rootBankKey = rootBank?.publicKey;
      nodeBankKey = nodeBank?.publicKey;
      vaultKey = nodeBank?.vault;
    }

    return {
      voltVault: this.voltKey,
      extraVoltData: (await VoltSDK.findExtraVoltDataAddress(this.voltKey))[0],
      program: this.extraVoltData.entropyProgramId,
      group: this.extraVoltData.entropyGroup,
      account: this.extraVoltData.entropyAccount,
      cache: this.extraVoltData.entropyCache,
      rootBank: rootBankKey,
      nodeBank: nodeBankKey,
      vault: vaultKey as PublicKey,
    };
  }

  async getTargetPerpBaseDecimals(
    entropyGroup?: EntropyGroup
  ): Promise<number> {
    if (entropyGroup === undefined)
      ({ entropyGroup } = await this.getGroupAndBanksForEvData(
        this.getDefaultEntropyClient(),
        this.extraVoltData.depositMint
      ));

    const targetPerpMarketIndex = entropyGroup.getPerpMarketIndex(
      this.extraVoltData.targetPerpMarket
    );
    const decimals = entropyGroup.tokens[targetPerpMarketIndex]?.decimals;
    if (decimals === undefined)
      throw new Error(
        "power perp base decimnals is undefined, likely market index does not exist in the entropy group"
      );
    return decimals;
  }

  async getHedgingPerpBaseDecimals(
    entropyGroup?: EntropyGroup
  ): Promise<number> {
    if (entropyGroup === undefined)
      ({ entropyGroup } = await this.getGroupAndBanksForEvData(
        this.getDefaultEntropyClient(),
        this.extraVoltData.depositMint
      ));
    const spotPerpIndex = entropyGroup.getPerpMarketIndex(
      this.extraVoltData.hedgingPerpMarket
    );

    const decimals = entropyGroup.tokens[spotPerpIndex]?.decimals;
    if (decimals === undefined)
      throw new Error(
        "spot perp base decimals is undefined, likely market index does not exist in the entropy group"
      );
    return decimals;
  }

  async getQuoteDecimals(entropyGroup?: EntropyGroup): Promise<number> {
    if (entropyGroup === undefined)
      ({ entropyGroup } = await this.getGroupAndBanksForEvData(
        this.getDefaultEntropyClient(),
        this.extraVoltData.depositMint
      ));
    const quoteDecimals = entropyGroup.getQuoteTokenInfo().decimals;
    return quoteDecimals;
  }

  async getEntropyContextAccountsAsRemaining(): Promise<AccountMeta[]> {
    const accts = await this.getEntropyContextAccountsOrDefault();
    return [
      {
        pubkey: accts.extraVoltData as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.program as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.group as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.cache as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.account as PublicKey,
        isSigner: false,
        isWritable: false,
      },
    ];
  }
}
