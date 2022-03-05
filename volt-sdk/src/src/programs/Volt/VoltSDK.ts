/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Program, ProgramAccount } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import type { MarketProxy } from "@project-serum/serum";
import { MARKET_STATE_LAYOUT_V3 } from "@project-serum/serum";
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
import { Decimal } from "decimal.js";

import type { FriktionSDK } from "../..";
import {
  OPTIONS_PROGRAM_IDS,
  PERFORMANCE_FEE_BPS,
  WITHDRAWAL_FEE_BPS,
} from "../..";
import { FRIKTION_PROGRAM_ID } from "../../constants";
import { getInertiaMarketByKey } from "../Inertia/inertiaUtils";
import { getSoloptionsMarketByKey } from "../Soloptions/soloptionsUtils";
import type {
  ExtraVoltDataWithKey,
  OptionMarketWithKey,
  OptionsProtocol,
  PendingDeposit,
  PendingDepositWithKey,
  PendingWithdrawal,
  PendingWithdrawalWithKey,
  Round,
  RoundWithKey,
  VoltProgram,
  VoltVault,
} from ".";
import { OrderType, SelfTradeBehavior } from "./helperTypes";
import {
  createFirstSetOfAccounts,
  getMarketAndAuthorityInfo,
  getVaultOwnerAndNonce,
} from "./serum";
import { getBalanceOrZero } from "./utils";

export class VoltSDK {
  constructor(
    readonly sdk: FriktionSDK,
    readonly voltVault: VoltVault,
    readonly voltKey: PublicKey
  ) {}

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
    whitelistTokenMintKey,
    serumProgramId,
    vaultType,
    transferTimeWindow,
    expirationInterval,
    upperBoundOtmStrikeFactor,
    capacity,
    individualCapacity,
    seed,
  }: {
    sdk: FriktionSDK;
    user: PublicKey;
    underlyingAssetMint: PublicKey;
    quoteAssetMint: PublicKey;
    permissionedMarketPremiumMint: PublicKey;
    underlyingAmountPerContract: BN;
    whitelistTokenMintKey: PublicKey;
    serumProgramId: PublicKey;
    vaultType: anchor.BN;
    transferTimeWindow: anchor.BN;
    expirationInterval: anchor.BN;
    upperBoundOtmStrikeFactor: anchor.BN;
    capacity: anchor.BN;
    individualCapacity: anchor.BN;
    seed?: PublicKey;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();

    // If desired, change the SDK to allow custom seed
    if (!seed) seed = new Keypair().publicKey;

    const [vault, _vaultBump] = await PublicKey.findProgramAddress(
      [
        new u64(vaultType.toNumber()).toBuffer(),
        seed.toBuffer(),
        textEncoder.encode("vault"),
      ],
      sdk.programs.Volt.programId
    );

    const [extraVoltData] = await VoltSDK.findExtraVoltDataAddress(vault);

    const [vaultMint, _vaultMintBump] = await PublicKey.findProgramAddress(
      [vault.toBuffer(), textEncoder.encode("vaultToken")],
      sdk.programs.Volt.programId
    );

    // TODO: Move these into individual VoltSDK.findVaultAddress etc
    const [vaultAuthority, _vaultAuthorityBump] =
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

    console.log(
      "permissioned market premium mint: ",
      permissionedMarketPremiumMint.toString()
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
      extraVoltData: extraVoltData,

      depositPool: depositPoolKey,
      premiumPool: premiumPoolKey,
      permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,

      underlyingAssetMint: underlyingAssetMint,
      quoteAssetMint: quoteAssetMint,

      dexProgram: serumProgramId,

      whitelistTokenAccount: whitelistTokenAccountKey,
      whitelistTokenMint: whitelistTokenMintKey,

      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    const serumOrderSize = new anchor.BN(1);
    const serumOrderType = OrderType.Limit;
    // const serumLimit = new anchor.BN(65535);
    const serumSelfTradeBehavior = SelfTradeBehavior.AbortTransaction;

    Object.entries(initializeAccountsStruct).map(function (key, value) {
      console.log(key.toString() + " = " + value.toString());
    });

    const instruction = sdk.programs.Volt.instruction.initialize(
      vaultType,
      transferTimeWindow,
      _vaultBump,
      _vaultAuthorityBump,
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
      {
        accounts: initializeAccountsStruct,
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
    whitelistTokenMintKey,
    serumProgramId,
    vaultType,
    transferTimeWindow,
    expirationInterval,
    upperBoundOtmStrikeFactor,
    capacity,
    individualCapacity,
    seed,
  }: {
    sdk: FriktionSDK;
    user: PublicKey;
    optionMarket: OptionMarketWithKey;
    permissionedMarketPremiumMint: PublicKey;
    whitelistTokenMintKey: PublicKey;
    serumProgramId: PublicKey;
    vaultType: anchor.BN;
    transferTimeWindow: anchor.BN;
    expirationInterval: anchor.BN;
    upperBoundOtmStrikeFactor: anchor.BN;
    capacity: anchor.BN;
    individualCapacity: anchor.BN;
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
      whitelistTokenMintKey,
      serumProgramId,
      vaultType,
      transferTimeWindow,
      expirationInterval,
      upperBoundOtmStrikeFactor,
      capacity,
      individualCapacity,
      seed,
    });
  }

  static async initSerumMarket(
    friktionSdk: FriktionSDK,
    userKey: PublicKey,
    optionMarket: OptionMarketWithKey,
    whitelistMintKey: PublicKey,
    pcMint: PublicKey,
    dexProgramId: PublicKey
  ) {
    const middlewareProgram = friktionSdk.programs.Volt;
    const { serumMarketKey, marketAuthority, marketAuthorityBump } =
      await getMarketAndAuthorityInfo(
        middlewareProgram.programId,
        optionMarket.key,
        whitelistMintKey,
        dexProgramId
      );

    const {
      instructions: createFirstAccountsInstructions,
      signers,
      bids,
      asks,
      eventQueue,
    } = await createFirstSetOfAccounts({
      connection: middlewareProgram.provider.connection,
      userKey: userKey,
      dexProgramId,
    });

    const textEncoder = new TextEncoder();
    const [requestQueue, _requestQueueBump] =
      await PublicKey.findProgramAddress(
        [
          whitelistMintKey.toBuffer(),
          optionMarket.key.toBuffer(),
          textEncoder.encode("requestQueue"),
        ],
        middlewareProgram.programId
      );
    const [coinVault, _coinVaultBump] = await PublicKey.findProgramAddress(
      [
        whitelistMintKey.toBuffer(),
        optionMarket.key.toBuffer(),
        textEncoder.encode("coinVault"),
      ],
      middlewareProgram.programId
    );
    const [pcVault, _pcVaultBump] = await PublicKey.findProgramAddress(
      [
        whitelistMintKey.toBuffer(),
        optionMarket.key.toBuffer(),
        textEncoder.encode("pcVault"),
      ],
      middlewareProgram.programId
    );

    const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
      serumMarketKey,
      dexProgramId
    );

    const initSerumAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initSerumMarket"]["accounts"]
      >[0]]: PublicKey;
    } = {
      userAuthority: userKey,
      whitelist: whitelistMintKey,
      optionMarket: optionMarket.key,
      serumMarket: serumMarketKey,
      dexProgram: dexProgramId,
      pcMint,
      optionMint: optionMarket.optionMint,
      requestQueue,
      eventQueue: eventQueue.publicKey,
      bids: bids.publicKey,
      asks: asks.publicKey,
      coinVault,
      pcVault,
      vaultSigner: vaultOwner as PublicKey,
      marketAuthority,
      rent: SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
    const coinLotSize = new BN(1);
    const pcLotSize = new BN(1);
    const pcDustThreshold = new BN(1);
    console.log("adding create serum market instruction");
    const instructions = createFirstAccountsInstructions.concat([
      middlewareProgram.instruction.initSerumMarket(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new BN(MARKET_STATE_LAYOUT_V3.span),
        vaultSignerNonce as BN,
        coinLotSize,
        pcLotSize,
        pcDustThreshold,
        {
          accounts: initSerumAccounts,
        }
      ),
    ]);
    console.log("finished adding create serum market instruction!");

    console.log("returning serum market key = ", serumMarketKey.toString());
    return {
      serumMarketKey,
      vaultOwner,
      marketAuthority,
      marketAuthorityBump,
      instructions,
      signers,
    };
  }

  async getBalancesForUser(pubkey: PublicKey): Promise<{
    totalBalance: Decimal;
    normalBalance: Decimal;
    pendingDeposits: Decimal;
    pendingWithdrawals: Decimal;
    mintableShares: Decimal;
    claimableUnderlying: Decimal;
    normFactor: Decimal;
    vaultNormFactor: Decimal;
  } | null> {
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

    // const quoteToken = new Token(
    //   provider.connection,
    //   voltVault.quoteAssetMint,
    //   TOKEN_PROGRAM_ID,
    //   user
    // );

    const writerToken = new Token(
      provider.connection,
      voltVault.writerTokenMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const vaultValueFromWriterTokens = (
      await getBalanceOrZero(writerToken, voltVault.writerTokenPool)
    ).mul(new Decimal(voltVault.underlyingAmountPerContract.toString()));

    const totalVaultValueExcludingPendingDeposits = new Decimal(
      (
        await underlyingToken.getAccountInfo(voltVault.depositPool)
      ).amount.toString()
    ).add(new Decimal(vaultValueFromWriterTokens.toString()));

    // const totalVaultPremium = new Decimal(
    //   (await quoteToken.getAccountInfo(voltVault.premiumPool)).amount.toString()
    // );

    const roundInfo = await this.getRoundByNumber(voltVault.roundNumber);

    const voltTokenSupply = new Decimal(
      (await vaultToken.getMintInfo()).supply.toString()
    ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));

    const vaultTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      voltVault.vaultMint,
      pubkey
    );

    let userVoltTokens = new Decimal(0);
    try {
      userVoltTokens = new Decimal(
        (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
      );
    } catch (err) {
      console.log("failed to read volt token account");
    }

    const userValueExcludingPendingDeposits = voltTokenSupply.lte(0)
      ? new Decimal(0)
      : totalVaultValueExcludingPendingDeposits
          .mul(userVoltTokens)
          .div(voltTokenSupply);

    let pendingDepositInfo = null;

    try {
      pendingDepositInfo = await this.getPendingDepositByKey(
        (
          await VoltSDK.findPendingDepositInfoAddress(
            this.voltKey,
            pubkey,
            this.sdk.programs.Volt.programId
          )
        )[0]
      );
    } catch (err) {
      console.log("no pending deposit");
    }

    let userValueFromPendingDeposits = new Decimal(0);
    let userMintableShares = new Decimal(0);

    if (
      pendingDepositInfo &&
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
        pendingDepositInfo.roundNumber.eq(this.voltVault.roundNumber)
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
      pendingwithdrawalInfo = await this.getPendingWithdrawalByKey(
        (
          await VoltSDK.findPendingWithdrawalInfoAddress(
            this.voltKey,
            pubkey,
            this.sdk.programs.Volt.programId
          )
        )[0]
      );
      console.log(
        "pendnig withdrawal info: ",
        pendingwithdrawalInfo.key.toString()
      );
    } catch (err) {
      console.log("no pending withdrawal");
    }

    let userValueFromPendingWithdrawals = new Decimal(0);
    let userClaimableUnderlying = new Decimal(0);

    if (pendingwithdrawalInfo && pendingwithdrawalInfo.numVoltRedeemed.gtn(0)) {
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

    const normFactor = new Decimal(10).pow(
      (await underlyingToken.getMintInfo()).decimals
    );

    const vaultNormFactor = new Decimal(10).pow(
      (await vaultToken.getMintInfo()).decimals
    );

    return {
      totalBalance: totalUserValue,
      normalBalance: userValueExcludingPendingDeposits,
      pendingDeposits: userValueFromPendingDeposits,
      pendingWithdrawals: userValueFromPendingWithdrawals,
      mintableShares: userMintableShares,
      claimableUnderlying: userClaimableUnderlying,
      normFactor: normFactor,
      vaultNormFactor: vaultNormFactor,
    };
  }

  /**
   * @deprecated If you are in the dapp, just fucking get the number from the
   * registry
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

    return {
      roundInfoKey,
      roundInfoKeyBump,
      roundUnderlyingTokensKey,
      roundUnderlyingTokensKeyBump,
      roundVoltTokensKey,
      roundVoltTokensKeyBump,
      roundUnderlyingPendingWithdrawalsKey,
      roundUnderlyingPendingWithdrawalsBump,
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
    mostRecentVoltTokensKey: PublicKey;
    roundInfoKey: PublicKey;
    roundVoltTokensKey: PublicKey;
    roundUnderlyingTokensKey: PublicKey;
    pendingWithdrawalInfoKey: PublicKey;
    roundUnderlyingPendingWithdrawalsKey: PublicKey;
  }> {
    const { pendingDepositInfoKey, mostRecentVoltTokensKey } =
      await VoltSDK.findPendingDepositAddresses(voltKey, user, voltProgramId);

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
    } = await VoltSDK.findRoundAddresses(
      voltKey,
      voltVault.roundNumber,
      voltProgramId
    );

    return {
      extraVoltKey,
      pendingDepositInfoKey,
      mostRecentVoltTokensKey,
      roundInfoKey,
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
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
    mostRecentVoltTokensKey: PublicKey;
    mostRecentVoltTokensKeyBump: number;
  }> {
    const [pendingDepositInfoKey, pendingDepositInfoKeyBump] =
      await VoltSDK.findPendingDepositInfoAddress(voltKey, user, voltProgramId);

    const [mostRecentVoltTokensKey, mostRecentVoltTokensKeyBump] =
      await VoltSDK.findMostRecentVoltTokensAddress(
        voltKey,
        user,
        voltProgramId
      );

    return {
      pendingDepositInfoKey,
      pendingDepositInfoKeyBump,
      mostRecentVoltTokensKey,
      mostRecentVoltTokensKeyBump,
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

  async findVaultAuthorityPermissionedOpenOrdersKey(
    middlewareProgram: Program,
    marketProxy: MarketProxy
  ) {
    const openOrdersSeed = Buffer.from([
      111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
    ]);

    const [openOrdersKey, openOrdersBump] = await PublicKey.findProgramAddress(
      [
        openOrdersSeed,
        marketProxy.dexProgramId.toBuffer(),
        marketProxy.market.address.toBuffer(),
        this.voltVault.vaultAuthority.toBuffer(),
      ],
      middlewareProgram.programId
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
  async getAllRounds(): Promise<RoundWithKey[]> {
    const accts =
      (await this.sdk.programs.Volt.account.round.all()) as unknown as ProgramAccount<Round>[];
    return accts.map((acct) => ({
      ...acct.account,
      key: acct.publicKey,
    }));
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

  async getCurrentRound(): Promise<RoundWithKey> {
    const key = (
      await VoltSDK.findRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return this.getRoundByKey(key);
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
      console.log("loading soloptions market");
      optionMarket = await getSoloptionsMarketByKey(
        this.sdk.programs.Soloptions as unknown as Parameters<
          typeof getSoloptionsMarketByKey
        >[0],
        key
      );
    } else {
      throw new Error("options protocol not supported");
    }

    if (!optionMarket) {
      throw new Error("option market does not exist");
    }

    return optionMarket;
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
    } else {
      throw new Error("owner is not a supported options protocol");
    }
  }
}
