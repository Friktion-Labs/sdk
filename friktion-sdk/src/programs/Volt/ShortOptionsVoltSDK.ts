import {
  getAccountBalance,
  getAccountBalanceOrZero,
  getAccountBalanceOrZeroStruct,
  getMintSupply,
  sendInsList,
} from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import {
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";

import type { OptionsProtocol } from "../../constants";
import {
  FRIKTION_PROGRAM_ID,
  INERTIA_FEE_OWNER,
  SOLOPTIONS_FEE_OWNER,
  VoltStrategy,
  VoltType,
} from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { InertiaSDK } from "../../programs/Inertia";
import { SoloptionsSDK } from "../../programs/Soloptions";
import type { InertiaContract } from "../Inertia/inertiaTypes";
import { getInertiaContractByKeyOrNull } from "../Inertia/inertiaUtils";
import type { OptionsContractDetails } from "./utils/helperTypes";
import { OrderType, SelfTradeBehavior } from "./utils/helperTypes";
import { getStrikeFromOptionsContract } from "./utils/optionMarketUtils";
import { VoltSDK } from "./VoltSDK";
import type {
  AuctionMetadata,
  ExtraVoltData,
  GenericOptionsContractWithKey,
  VoltProgram,
  VoltVault,
} from "./voltTypes";

class NoOptionMarketError extends Error {}

export type ShortOptionsVoltSDKParams = {
  extraVoltData?: ExtraVoltData | undefined;
};

// SUPER DUPER IMPORTANT NOTE: cannot allow any imports from "./" inside this file since it will import ConnectedShortOptionsVoltSDK and make you cry

export class ShortOptionsVoltSDK extends VoltSDK {
  constructor(
    sdk: FriktionSDK,
    voltKey: PublicKey,
    voltVault: VoltVault,
    params?: ShortOptionsVoltSDKParams
  ) {
    super(sdk, voltKey, voltVault, params?.extraVoltData);
    if (this.voltType() !== VoltType.ShortOptions) {
      throw new Error("Not a valid short options volt");
    }
  }

  //// SIMPLE HELPERS ////

  getLastTradedOptionKey(): PublicKey {
    return this.voltVault.optionMarket;
  }

  async getLastTradedOptionContract(): Promise<
    GenericOptionsContractWithKey | undefined
  > {
    return (await this.getCurrentOptionsContractOrUndefined()) ?? undefined;
  }

  async getLastTradedOptionDetails(): Promise<
    OptionsContractDetails | undefined
  > {
    const optionsContract = await this.getCurrentOptionsContractOrUndefined();
    return optionsContract !== undefined
      ? this.optionsContractToDetails(optionsContract)
      : undefined;
  }

  voltStrategy(): VoltStrategy {
    return this.isCall() ? VoltStrategy.ShortCalls : VoltStrategy.ShortPuts;
  }

  // quote mint used for options contracts sold
  getQuoteMint(): PublicKey {
    return this.voltVault.quoteAssetMint;
  }

  getPremiumPool(): PublicKey {
    return this.voltVault.premiumPool;
  }

  // mint displayed on the UI
  getHeadlineMint(): PublicKey {
    return this.isCall()
      ? this.voltVault.underlyingAssetMint
      : this.voltVault.quoteAssetMint;
  }

  requiresSwapPremium(): boolean {
    return (
      this.voltType() === VoltType.ShortOptions &&
      this.voltVault.permissionedMarketPremiumMint.toString() !==
        this.voltVault.underlyingAssetMint.toString()
    );
  }

  definitelyDoesntRequirePermissionedSettle(): boolean {
    return (
      this.voltType() === VoltType.ShortOptions &&
      this.voltVault.permissionedMarketPremiumMint.toString() !==
        this.voltVault.underlyingAssetMint.toString() &&
      this.voltVault.permissionedMarketPremiumMint.toString() !==
        this.voltVault.quoteAssetMint.toString()
    );
  }

  //// OPTIONS RELATED HELPERS ////

  isOptionsContractACall(
    optionsContract: GenericOptionsContractWithKey
  ): boolean {
    return !this.isKeyAStableCoin(optionsContract.underlyingAssetMint);
  }

  isCall(): boolean {
    if (this.voltType() !== VoltType.ShortOptions)
      throw new Error("wrong volt type, should be DOV");

    return !this.isKeyAStableCoin(this.voltVault.underlyingAssetMint);
  }

  async specificVoltName(): Promise<string> {
    const voltNumber = this.voltNumber();
    switch (voltNumber) {
      case 1:
      case 2: {
        const optionMarket = await this.getCurrentOptionsContractOrUndefined();
        return (
          "Short" +
          " (" +
          (optionMarket
            ? await this.optionsContractToDetailsString(optionMarket)
            : "No Option Market") +
          ")"
        );
      }
      case 3:
      case 4:
        throw new Error("invalid volt number for short options sdk");
    }
  }

  async getOptionsContractByKey(
    key: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<GenericOptionsContractWithKey> {
    return await this.sdk.getOptionMarketByKey(key, optionsProtocol);
  }

  async getOptionsProtocolForKey(key: PublicKey): Promise<OptionsProtocol> {
    return await this.sdk.getOptionsProtocolForKey(key);
  }

  async getCurrentOptionsContractOrUndefined(): Promise<
    GenericOptionsContractWithKey | undefined
  > {
    try {
      return await this.getCurrentOptionsContract();
    } catch (err) {
      if (err instanceof NoOptionMarketError) {
        return undefined;
      }
      throw err;
    }
  }

  //// USEFUL CALCULATIONS ////

  async getPrimaryStrategyTvlWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal> {
    const res: {
      balance: BN;
    } = await getAccountBalanceOrZeroStruct(
      this.sdk.readonlyProvider.connection,
      this.voltVault.depositPool
    );

    const voltDepositTokenBalance = new Decimal(res.balance.toString());
    const voltWriterTokenBalance = await getAccountBalanceOrZero(
      this.sdk.readonlyProvider.connection,
      this.voltVault.writerTokenPool
    );
    const estimatedTotalWithoutPendingDepositTokenAmount =
      voltDepositTokenBalance
        .plus(
          new Decimal(voltWriterTokenBalance.toString()).mul(
            new Decimal(this.voltVault.underlyingAmountPerContract.toString())
          )
        )
        .div(normFactor);

    return estimatedTotalWithoutPendingDepositTokenAmount;
  }

  //// FEE ACCOUNTS ////

  async getSoloptionsMintFeeAccount() {
    return await getAssociatedTokenAddress(
      this.voltVault.underlyingAssetMint,
      SOLOPTIONS_FEE_OWNER
    );
  }

  async getInertiaMintFeeAccount() {
    return await getAssociatedTokenAddress(
      this.voltVault.underlyingAssetMint,
      INERTIA_FEE_OWNER
    );
  }

  async getSoloptionsExerciseFeeAccount() {
    return await SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(
      this.voltVault.quoteAssetMint
    );
  }

  async getInertiaExerciseFeeAccount() {
    return await InertiaSDK.getGenericInertiaExerciseFeeAccount(
      this.voltVault.quoteAssetMint
    );
  }
  //// LOGGING ////

  printAuctionDetails(): Promise<void> {
    return new Promise<void>((resolve) => resolve());
  }

  printStateMachine(): void {
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
  }

  async printPositionStats(): Promise<void> {
    const symbol = this.mintNameFromKey(this.voltVault.underlyingAssetMint);

    try {
      const optionMarket = await this.getCurrentOptionsContract();
      console.log(
        "\n " + "Short" + " (",
        await this.optionsContractToDetailsString(optionMarket),
        "): "
      );
      console.log(
        "was settle cranked?: ",
        (optionMarket.rawContract as InertiaContract).wasSettleCranked
      );
      console.log("option key: ", optionMarket.key.toString());
      const writerTokenBalance = await getAccountBalance(
        this.sdk.readonlyProvider.connection,
        this.voltVault.writerTokenPool
      );
      console.log(
        "minted options: (#)",
        writerTokenBalance.toString(),
        ` (${symbol ?? "N/A"}) `,
        new Decimal(writerTokenBalance.toString())
          .mul(new Decimal(optionMarket.underlyingAmountPerContract.toString()))
          .div(await this.getDepositTokenNormalizationFactor())
          .toString()
      );

      await this.printOptionsContract(optionMarket.key);
    } catch (err) {
      console.log("no option currently selected");
    }
  }
  async printHighLevelStats(): Promise<void> {
    const premiumFactor = new Decimal(10).pow(
      (
        await getMint(
          this.sdk.readonlyProvider.connection,
          this.voltVault.quoteAssetMint
        )
      ).decimals
    );
    const permissionedPremiumFactor = new Decimal(10).pow(
      (
        await getMint(
          this.sdk.readonlyProvider.connection,
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
            this.voltVault.permissionedMarketPremiumPool
          )
        ).toString()
      )
        .div(permissionedPremiumFactor)
        .toString()
    );
  }

  printStrategyParams(): void {
    console.log(
      "\n DOV: ",
      "\n, isCall: ",
      this.isCall(),
      "\n, firstEverOptionWasSet: ",
      this.voltVault.firstEverOptionWasSet
    );
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
          await getAccountBalanceOrZero(
            this.sdk.readonlyProvider.connection,
            inertiaContract.underlyingPool
          )
        ).toString(),
        "\nclaimable pool",
        (
          await getAccountBalanceOrZero(
            this.sdk.readonlyProvider.connection,
            inertiaContract.claimablePool
          )
        ).toString()
      );
    } else {
      const nonInertiaOptionsContract = await this.getOptionsContractByKey(key);
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

  async getStrikeFromOptionsContract(
    optionsContract: GenericOptionsContractWithKey
  ): Promise<Decimal> {
    return await getStrikeFromOptionsContract(
      this.sdk.readonlyProvider,
      optionsContract,
      this.isOptionsContractACall(optionsContract)
    );
  }

  async getCurrentOptionsContract(): Promise<GenericOptionsContractWithKey> {
    if (this.voltType() !== VoltType.ShortOptions)
      throw new Error("volt must trade options");

    if (
      this.voltVault.optionMarket.toString() ===
      SystemProgram.programId.toString()
    )
      throw new NoOptionMarketError(
        "option market must not be systemprogram (not set)"
      );

    return await this.getOptionsContractByKey(this.voltVault.optionMarket);
  }

  async getCurrentOptionsContractDetails(): Promise<OptionsContractDetails> {
    return await this.optionsContractToDetails(
      await this.getCurrentOptionsContract()
    );
  }

  async optionsContractToDetails(
    optionsContract: GenericOptionsContractWithKey
  ): Promise<OptionsContractDetails> {
    const isCall = this.isOptionsContractACall(optionsContract);

    const contractSize = new Decimal(
      optionsContract.underlyingAmountPerContract.toString()
    )
      .div(await this.getDepositTokenNormalizationFactor())
      .toNumber();

    const mintName = this.mintNameFromKey(this.voltVault.underlyingAssetMint);
    const expiry = optionsContract.expirationUnixTimestamp
      .muln(1000)
      .toNumber();
    const strike = (
      await this.getStrikeFromOptionsContract(optionsContract)
    ).toNumber();
    return {
      mintName,
      contractSize,
      strike,
      expiry,
      isCall,
    };
  }

  async optionsContractToDetailsString(
    optionsContract: GenericOptionsContractWithKey
  ): Promise<string> {
    const details = await this.optionsContractToDetails(optionsContract);
    return (
      details.contractSize.toString() +
      " " +
      (details.mintName?.toString() ?? "unknown") +
      " " +
      new Date(details.expiry).toUTCString() +
      " $" +
      details.strike.toString() +
      " " +
      (details.isCall ? "CALL" : "PUT")
    );
  }

  //// SERUM MARKET HELPERS ////

  async getCurrentMarketAndAuthorityInfo() {
    return await this.getMarketAndAuthorityInfo(this.voltVault.optionMarket);
  }

  async getMarketAndAuthorityInfo(optionMarketKey: PublicKey): Promise<{
    serumMarketKey: PublicKey;
    marketAuthority: PublicKey;
    marketAuthorityBump: number;
  }> {
    const textEncoder = new TextEncoder();

    const [serumMarketKey, _serumMarketBump] =
      await ShortOptionsVoltSDK.findSerumMarketAddress(
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

  //// INITIIALIZE HELPERS ////

  static async doInitializeVolt({
    sdk,
    provider,
    adminKey,
    underlyingAssetMint,
    quoteAssetMint,
    permissionedMarketPremiumMint,
    underlyingAmountPerContract,
    serumProgramId,
    expirationInterval,
    capacity,
    individualCapacity,
    permissionlessAuctions,
    seed,
  }: {
    sdk: FriktionSDK;
    provider: AnchorProvider;
    adminKey: PublicKey;
    underlyingAssetMint: PublicKey;
    quoteAssetMint: PublicKey;
    permissionedMarketPremiumMint: PublicKey;
    underlyingAmountPerContract: BN;
    serumProgramId: PublicKey;
    expirationInterval: BN;
    capacity: BN;
    individualCapacity: BN;
    permissionlessAuctions: boolean;

    seed?: PublicKey;
  }): Promise<PublicKey> {
    const { instruction, voltKey } =
      await ShortOptionsVoltSDK.getInitializeVoltInstruction({
        sdk,
        adminKey,
        quoteAssetMint,
        underlyingAmountPerContract,
        serumProgramId,
        expirationInterval,
        capacity,
        individualCapacity,
        permissionlessAuctions,
        seed,
      });

    const {
      extraVoltKey,
      vaultAuthority,
      vaultMint,
      depositPoolKey,
      permissionedMarketPremiumPoolKey,
      whitelistTokenAccountKey,
      auctionMetadataKey,
    } = await ShortOptionsVoltSDK.findInitializeAddresses(
      sdk,
      sdk.net.MM_TOKEN_MINT,
      seed
    );
    const initExtraAccountsAccounts: Parameters<
      VoltProgram["instruction"]["initExtraAccountsShortOptions"]["accounts"]
    >[0] = {
      authority: provider.wallet.publicKey,
      voltVault: voltKey,
      vaultAuthority: vaultAuthority,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      depositPool: depositPoolKey,
      vaultMint: vaultMint,
      underlyingAssetMint: underlyingAssetMint,

      whitelistTokenAccount: whitelistTokenAccountKey,
      whitelistTokenMint: sdk.net.MM_TOKEN_MINT,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,
      permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,
      auctionMetadata: auctionMetadataKey,
      extraVoltData: extraVoltKey,
      rent: SYSVAR_RENT_PUBKEY,
    };

    const initExtraIx =
      sdk.programs.Volt.instruction.initExtraAccountsShortOptions(
        permissionlessAuctions ? new BN(1) : new BN(0),
        {
          accounts: initExtraAccountsAccounts,
        }
      );

    await sendInsList(provider, [instruction, initExtraIx]);

    return voltKey;
  }

  /**
   * For an admin to create a volt
   *
   * spotMarket and seed are dynamically generated. Change the code if you want custom.
   */
  static async getInitializeVoltInstruction({
    sdk,
    adminKey,
    quoteAssetMint,
    underlyingAmountPerContract,
    serumProgramId,
    expirationInterval,
    capacity,
    individualCapacity,
    permissionlessAuctions,
    seed,
  }: {
    sdk: FriktionSDK;
    adminKey: PublicKey;
    quoteAssetMint: PublicKey;
    underlyingAmountPerContract: BN;
    serumProgramId: PublicKey;
    expirationInterval: BN;
    capacity: BN;
    individualCapacity: BN;
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
      vaultAuthority,
      premiumPoolKey,
    } = await ShortOptionsVoltSDK.findInitializeAddresses(
      sdk,
      sdk.net.MM_TOKEN_MINT,
      seed
    );

    const initializeAccountsStruct: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initialize"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: adminKey,

      adminKey: adminKey,

      seed: seed,

      voltVault: vault,
      vaultAuthority: vaultAuthority,
      extraVoltData: extraVoltKey,

      premiumPool: premiumPoolKey,

      quoteAssetMint: quoteAssetMint,

      dexProgram: serumProgramId,

      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    const serumOrderSize = new BN(1);
    const serumOrderType = OrderType.ImmediateOrCancel;
    // const serumLimit = new BN(65535);
    const serumSelfTradeBehavior = SelfTradeBehavior.AbortTransaction;

    const instruction = sdk.programs.Volt.instruction.initialize(
      vaultBump,
      vaultAuthorityBump,
      serumOrderSize,
      serumOrderType,
      serumSelfTradeBehavior,
      expirationInterval,
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

  /**
   * For an admin to create a volt
   *
   * spotMarket and seed are dynamically generated. Change the code if you want custom.
   */
  static async getInitializeVoltWithOptionMarketSeedInstruction({
    sdk,
    adminKey,
    optionMarket,
    serumProgramId,
    expirationInterval,
    capacity,
    individualCapacity,
    permissionlessAuctions,
    seed,
  }: {
    sdk: FriktionSDK;
    adminKey: PublicKey;
    optionMarket: GenericOptionsContractWithKey;
    permissionedMarketPremiumMint: PublicKey;
    // whitelistTokenMintKey: PublicKey;
    serumProgramId: PublicKey;
    expirationInterval: BN;
    capacity: BN;
    individualCapacity: BN;
    permissionlessAuctions: boolean;
    seed?: PublicKey;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    return ShortOptionsVoltSDK.getInitializeVoltInstruction({
      sdk,
      adminKey,
      quoteAssetMint: optionMarket.quoteAssetMint,
      underlyingAmountPerContract: optionMarket.underlyingAmountPerContract,
      serumProgramId,
      expirationInterval,
      capacity,
      individualCapacity,
      permissionlessAuctions,
      seed,
    });
  }

  //// ACCOUNT LOADERS ////

  async getAuctionMetadata(): Promise<AuctionMetadata> {
    return await this.getAuctionMetadataByKey(
      (
        await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey)
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

  //// FIND PDAs ////

  static async findInitializeAddresses(
    sdk: FriktionSDK,
    whitelistTokenMintKey: PublicKey,
    seed?: PublicKey
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
    if (!seed) seed = new Keypair().publicKey;

    const [vault, vaultBump] = await PublicKey.findProgramAddress(
      [
        new BN(VoltType.ShortOptions).toArrayLike(Buffer, "le", 8),
        seed.toBuffer(),
        textEncoder.encode("vault"),
      ],
      sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await ShortOptionsVoltSDK.findExtraVoltDataAddress(
      vault
    );

    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(vault);

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
      await ShortOptionsVoltSDK.findWhitelistTokenAccountAddress(
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
    serumMarketKey: PublicKey
  ): Promise<[PublicKey, number]> {
    const [openOrdersKey, openOrdersBump] =
      await ShortOptionsVoltSDK.findPermissionedOpenOrdersKey(
        this.sdk.programs.Volt.programId,
        this.voltVault.vaultAuthority,
        serumMarketKey,
        this.sdk.net.SERUM_DEX_PROGRAM_ID
      );

    return [openOrdersKey, openOrdersBump];
  }

  static async findPermissionedOpenOrdersKey(
    middlewareProgramId: PublicKey,
    user: PublicKey,
    serumMarketKey: PublicKey,
    dexProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
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

    return [openOrdersKey, openOrdersBump];
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

  static async findSerumMarketAddress(
    voltKey: PublicKey,
    whitelistMintKey: PublicKey,
    optionMarketKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(voltKey);
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

  getReferrerQuoteAcct(mint: PublicKey): PublicKey {
    const referrerQuoteAcct = this.sdk.net.SERUM_REFERRER_IDS[mint.toString()];

    if (!referrerQuoteAcct) {
      throw new Error(
        "No referrer acct found for mint: " +
          this.voltVault.quoteAssetMint.toString()
      );
    }

    return referrerQuoteAcct;
  }
}
