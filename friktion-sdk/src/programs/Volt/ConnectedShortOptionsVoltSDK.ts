import { use } from "@friktion-labs/typescript-mix";
import { Market, MARKET_STATE_LAYOUT_V3 } from "@project-serum/serum";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import BN from "bn.js";
import type Decimal from "decimal.js";

import type { OptionsProtocol } from "../../constants";
import {
  INERTIA_FEE_OWNER,
  OPTIONS_PROGRAM_IDS,
  SOLOPTIONS_FEE_OWNER,
  SPREADS_FEE_OWNER,
  VoltType,
} from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { ConnectedVoltSDK } from "./ConnectedVoltSDK";
import { ShortOptionsVoltSDK } from "./ShortOptionsVoltSDK";
import {
  createFirstSetOfAccounts,
  getBidAskLimitsForSpot,
  getVaultOwnerAndNonce,
  marketLoader,
} from "./utils/serumHelpers";
import { VoltSDK } from "./VoltSDK";
import type { ExtraVoltData, VoltProgram, VoltVault } from "./voltTypes";

// create typescript class that uses multiple inheritance via mixins
export interface ConnectedShortOptionsVoltSDK
  extends ConnectedVoltSDK,
    ShortOptionsVoltSDK {}

export class ConnectedShortOptionsVoltSDK {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @use(ConnectedVoltSDK, ShortOptionsVoltSDK) this: any;

  readonly sdk: FriktionSDK;
  readonly voltKey: PublicKey;
  readonly voltVault: VoltVault;
  extraVoltData: ExtraVoltData | undefined;
  normFactor: Decimal | undefined;

  readonly connection: Connection;
  readonly wallet: PublicKey;
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    sdk: ShortOptionsVoltSDK,
    connection: Connection,
    user: PublicKey,
    daoAuthority?: PublicKey | undefined
  ) {
    this.sdk = sdk.sdk;
    this.voltKey = sdk.voltKey;
    this.voltVault = sdk.voltVault;
    this.extraVoltData = sdk.extraVoltData;
    this.normFactor = sdk.normFactor;

    this.connection = connection;
    this.wallet = user;
    this.daoAuthority = daoAuthority;

    if (this.voltType() !== VoltType.ShortOptions) {
      throw new Error("Not a valid short options volt");
    }
  }

  async refresh(): Promise<ConnectedShortOptionsVoltSDK> {
    return new ConnectedShortOptionsVoltSDK(
      await this.sdk.loadShortOptionsVoltSDKByKey(this.voltKey),
      this.connection,
      this.wallet,
      this.daoAuthority
    );
  }

  //// ADMIN INSTRUCTIONS ////

  async initExtraAccounts({
    underlyingAssetMint,
    permissionedMarketPremiumMint,
    permissionlessAuctions,
  }: {
    underlyingAssetMint: PublicKey;
    permissionedMarketPremiumMint: PublicKey;
    permissionlessAuctions: boolean;
  }): Promise<TransactionInstruction> {
    const {
      extraVoltKey,
      vaultMint,
      depositPoolKey,
      permissionedMarketPremiumPoolKey,
      whitelistTokenAccountKey,
      auctionMetadataKey,
    } = await ShortOptionsVoltSDK.findInitializeAddresses(
      this.sdk,
      this.sdk.net.MM_TOKEN_MINT,
      this.voltVault.seed
    );
    const initExtraAccountsAccounts: Parameters<
      VoltProgram["instruction"]["initExtraAccountsShortOptions"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      depositPool: depositPoolKey,
      vaultMint: vaultMint,
      underlyingAssetMint: underlyingAssetMint,

      whitelistTokenAccount: whitelistTokenAccountKey,
      whitelistTokenMint: this.sdk.net.MM_TOKEN_MINT,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,
      permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,
      auctionMetadata: auctionMetadataKey,
      extraVoltData: extraVoltKey,
      rent: SYSVAR_RENT_PUBKEY,
    };
    return this.sdk.programs.Volt.instruction.initExtraAccountsShortOptions(
      permissionlessAuctions ? new BN(1) : new BN(0),
      {
        accounts: initExtraAccountsAccounts,
      }
    );
  }

  async changeAuctionParams(
    permissionlessAuctions: boolean
  ): Promise<TransactionInstruction> {
    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey);
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const changeAuctionParamsAccounts: Parameters<
      VoltProgram["instruction"]["changeAuctionParams"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltDataKey,

      auctionMetadata: auctionMetadataKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const param: BN = permissionlessAuctions ? new BN(1) : new BN(0);
    return this.sdk.programs.Volt.instruction.changeAuctionParams(param, {
      accounts: changeAuctionParamsAccounts,
    });
  }

  //// REBALANCING INSTRUCTIONS ////

  async startRound(): Promise<TransactionInstruction> {
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber.addn(1),
      this.sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const startRoundStruct: Parameters<
      VoltProgram["instruction"]["startRound"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      vaultMint: this.voltVault.vaultMint,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.startRound({
      accounts: startRoundStruct,
    });
  }

  async setNextOption(
    newOptionMarketKey: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      newOptionMarketKey,
      optionsProtocol
    );

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const { optionPoolKey, writerTokenPoolKey } =
      await ShortOptionsVoltSDK.findSetNextOptionAddresses(
        this.voltKey,
        optionMarket.optionMint,
        optionMarket.writerTokenMint,
        this.sdk.programs.Volt.programId
      );

    const setNextOptionStruct: Parameters<
      VoltProgram["instruction"]["setNextOption"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      optionPool: optionPoolKey,
      writerTokenPool: writerTokenPoolKey,

      rawDerivsContract: newOptionMarketKey,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      optionMint: optionMarket.optionMint,
      writerTokenMint: optionMarket.writerTokenMint,

      roundInfo: roundInfoKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.setNextOption({
      accounts: setNextOptionStruct,
    });
  }

  async resetOptionMarket(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    const { backupOptionPoolKey, backupWriterTokenPoolKey } =
      await ShortOptionsVoltSDK.findBackupPoolAddresses(
        this.voltKey,
        this.voltVault
      );

    const resetOptionMarketAccounts: Parameters<
      VoltProgram["instruction"]["resetOptionMarket"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,

      depositPool: this.voltVault.depositPool,
      optionPool: this.voltVault.optionPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      rawDerivsContract: this.voltVault.optionMarket,
      optionMint: optionMarket.optionMint,
      writerTokenMint: optionMarket.writerTokenMint,

      backupOptionPool: backupOptionPoolKey,
      backupWriterTokenPool: backupWriterTokenPoolKey,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.resetOptionMarket({
      accounts: resetOptionMarketAccounts,
    });
  }

  async rebalancePrepare(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    const optionsProtocol = await this.getOptionsProtocolForKey(
      this.voltVault.optionMarket
    );

    let feeDestinationKey: PublicKey;
    const remainingAccounts: AccountMeta[] = [];
    if (optionsProtocol === "Inertia") {
      feeDestinationKey = await getAssociatedTokenAddress(
        this.voltVault.underlyingAssetMint,
        INERTIA_FEE_OWNER
      );
    } else if (optionsProtocol === "Soloptions") {
      feeDestinationKey = await getAssociatedTokenAddress(
        this.voltVault.underlyingAssetMint,
        SOLOPTIONS_FEE_OWNER
      );
    } else if (optionsProtocol === "Spreads") {
      feeDestinationKey = await getAssociatedTokenAddress(
        this.voltVault.underlyingAssetMint,
        SPREADS_FEE_OWNER
      );
    } else {
      throw new Error("Unsupported options protocol");
    }

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalancePrepareStruct: Parameters<
      VoltProgram["instruction"]["rebalancePrepare"]["accounts"]
    >[0] = {
      authority: this.wallet,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      spreadsProgram: OPTIONS_PROGRAM_IDS.Spreads,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      optionPool: this.voltVault.optionPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      rawDerivsContract: this.voltVault.optionMarket,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      quoteAssetMint: this.voltVault.quoteAssetMint,
      optionMint: this.voltVault.optionMint,
      writerTokenMint: this.voltVault.writerTokenMint,

      underlyingAssetPool: optionMarket.underlyingAssetPool,

      optionProtocolFeeDestination: feeDestinationKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalancePrepare({
      accounts: rebalancePrepareStruct,
      remainingAccounts: remainingAccounts,
    });
  }

  getPermissionedMarketReferrerPremiumAcct(): PublicKey {
    const referrerPremiumMintAcct =
      this.sdk.net.SERUM_REFERRER_IDS[
        this.voltVault.permissionedMarketPremiumMint.toString()
      ];

    if (!referrerPremiumMintAcct) {
      throw new Error(
        "No referrer acct found for mint: " +
          this.voltVault.permissionedMarketPremiumMint.toString()
      );
    }

    return referrerPremiumMintAcct;
  }

  async initSerumMarket(pcMint: PublicKey) {
    const middlewareProgram = this.sdk.programs.Volt;
    const { serumMarketKey, marketAuthority, marketAuthorityBump } =
      await this.getCurrentMarketAndAuthorityInfo();

    const {
      instructions: createFirstAccountsInstructions,
      signers,
      bids,
      asks,
      eventQueue,
    } = await createFirstSetOfAccounts({
      connection: middlewareProgram.provider.connection,
      userKey: this.wallet,
      dexProgramId: this.sdk.net.SERUM_DEX_PROGRAM_ID,
    });
    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey);
    const textEncoder = new TextEncoder();
    const [requestQueue, _requestQueueBump] =
      await PublicKey.findProgramAddress(
        [
          this.sdk.net.MM_TOKEN_MINT.toBuffer(),
          this.voltVault.optionMarket.toBuffer(),
          auctionMetadataKey.toBuffer(),
          textEncoder.encode("requestQueue"),
        ],
        middlewareProgram.programId
      );
    const [coinVault, _coinVaultBump] = await PublicKey.findProgramAddress(
      [
        this.sdk.net.MM_TOKEN_MINT.toBuffer(),
        this.voltVault.optionMarket.toBuffer(),
        auctionMetadataKey.toBuffer(),

        textEncoder.encode("coinVault"),
      ],
      middlewareProgram.programId
    );
    const [pcVault, _pcVaultBump] = await PublicKey.findProgramAddress(
      [
        this.sdk.net.MM_TOKEN_MINT.toBuffer(),
        this.voltVault.optionMarket.toBuffer(),
        auctionMetadataKey.toBuffer(),

        textEncoder.encode("pcVault"),
      ],
      middlewareProgram.programId
    );

    const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
      serumMarketKey,
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const initSerumAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initSerumMarket"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: this.wallet,
      whitelist: this.sdk.net.MM_TOKEN_MINT,
      serumMarket: serumMarketKey,
      voltVault: this.voltKey,
      auctionMetadata: auctionMetadataKey,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
      pcMint,
      optionMint: this.voltVault.optionMint,
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
    const instructions = createFirstAccountsInstructions.concat([
      middlewareProgram.instruction.initSerumMarket(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
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
    return {
      serumMarketKey,
      vaultOwner,
      marketAuthority,
      marketAuthorityBump,
      instructions,
      signers,
    };
  }

  async rebalanceSettle(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalanceSettleStruct: Parameters<
      VoltProgram["instruction"]["rebalanceSettle"]["accounts"]
    >[0] = {
      authority: this.wallet,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      spreadsProgram: OPTIONS_PROGRAM_IDS.Spreads,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      writerTokenPool: this.voltVault.writerTokenPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      rawDerivsContract: this.voltVault.optionMarket,

      writerTokenMint: this.voltVault.writerTokenMint,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      quoteAssetMint: this.voltVault.quoteAssetMint,

      quoteAssetPool: optionMarket.quoteAssetPool,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSettle({
      accounts: rebalanceSettleStruct,
    });
  }

  async rebalanceSwapPremium(
    spotSerumMarketKey: PublicKey,
    clientPrice?: BN,
    clientSize?: BN,
    usePermissionedMarketPremium = false,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [ulOpenOrdersKey, ulOpenOrdersBump] =
      await ShortOptionsVoltSDK.findUnderlyingOpenOrdersAddress(
        this.voltKey,
        spotSerumMarketKey,
        this.sdk.programs.Volt.programId
      );

    const [ulOpenOrdersMetadataKey] =
      await ShortOptionsVoltSDK.findUnderlyingOpenOrdersMetadataAddress(
        this.voltKey,
        spotSerumMarketKey,
        this.sdk.programs.Volt.programId
      );
    const spotSerumMarket = await Market.load(
      this.connection,
      spotSerumMarketKey,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    let ask: BN, askSize: BN;
    try {
      ({ ask, askSize } = await getBidAskLimitsForSpot(
        this.connection,
        spotSerumMarket,
        undefined,
        clientPrice
      ));
    } catch (err) {
      ask = new BN(0);
      askSize = new BN(0);
    }

    const [vaultOwner] = await getVaultOwnerAndNonce(
      spotSerumMarket.address,
      spotSerumMarket.programId
    );

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const rebalanceSwapPremiumStruct: Parameters<
      VoltProgram["instruction"]["rebalanceSwapPremium"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      tradingPool: !usePermissionedMarketPremium
        ? this.voltVault.premiumPool
        : this.voltVault.permissionedMarketPremiumPool,

      srmReferralAcct: srmReferralAcct,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: spotSerumMarket.programId,
      openOrders: ulOpenOrdersKey,
      openOrdersMetadata: ulOpenOrdersMetadataKey,
      market: spotSerumMarket.address,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestQueue: spotSerumMarket._decoded.requestQueue as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      eventQueue: spotSerumMarket._decoded.eventQueue as PublicKey,
      marketBids: spotSerumMarket.bidsAddress,
      marketAsks: spotSerumMarket.asksAddress,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: spotSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: spotSerumMarket._decoded.quoteVault as PublicKey,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSwapPremium(
      ask,
      askSize,
      ulOpenOrdersBump,
      {
        accounts: rebalanceSwapPremiumStruct,
      }
    );
  }

  async rebalanceEnter(
    clientPrice: BN,
    clientSize: BN,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("options contract on volt vault does not exist");

    const [whitelistTokenAccountKey] =
      await ShortOptionsVoltSDK.findWhitelistTokenAccountAddress(
        this.voltKey,
        this.sdk.net.MM_TOKEN_MINT,
        this.sdk.programs.Volt.programId
      );

    const { marketAuthority, marketAuthorityBump } =
      await this.getCurrentMarketAndAuthorityInfo();

    const [optionSerumMarketKey] =
      await ShortOptionsVoltSDK.findSerumMarketAddress(
        this.voltKey,
        this.sdk.net.MM_TOKEN_MINT,
        optionMarket.key
      );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const optionSerumMarketProxy = await marketLoader(
      this,
      optionSerumMarketKey,
      whitelistTokenAccountKey
    );

    const optionSerumMarket = optionSerumMarketProxy.market;

    const [vaultOwner /*, nonce*/] = await getVaultOwnerAndNonce(
      optionSerumMarketProxy.market.address,
      optionSerumMarketProxy.dexProgramId
    );

    const [openOrdersKey, openOrdersBump] =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        optionSerumMarketKey
      );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getPermissionedMarketReferrerPremiumAcct();

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey);

    const rebalanceEnterStruct: Parameters<
      VoltProgram["instruction"]["rebalanceEnter"]["accounts"]
    >[0] = {
      authority: this.wallet,
      middlewareProgram: this.sdk.programs.Volt.programId,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      extraVoltData: extraVoltKey,
      auctionMetadata: auctionMetadataKey,

      optionPool: this.voltVault.optionPool,

      rawDerivsContract: this.voltVault.optionMarket,

      srmReferralAcct: srmReferralAcct,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: optionSerumMarketProxy.dexProgramId,
      openOrders: openOrdersKey,
      market: optionSerumMarketProxy.market.address,
      serumMarketAuthority: marketAuthority,

      whitelistTokenAccount: whitelistTokenAccountKey,

      epochInfo: epochInfoKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestQueue: optionSerumMarket._decoded.requestQueue as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      eventQueue: optionSerumMarket._decoded.eventQueue as PublicKey,
      marketBids: optionSerumMarket.bidsAddress,
      marketAsks: optionSerumMarket.asksAddress,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: optionSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: optionSerumMarket._decoded.quoteVault as PublicKey,

      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEnter(
      clientPrice,
      clientSize,
      openOrdersBump,
      marketAuthorityBump,
      {
        accounts: rebalanceEnterStruct,
      }
    );
  }

  async bypassSettlement(
    userWriterTokenAccount: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const bypassSettlementAccounts: Parameters<
      VoltProgram["instruction"]["bypassSettlement"]["accounts"]
    >[0] = {
      authority: this.wallet,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      writerTokenPool: this.voltVault.writerTokenPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      rawDerivsContract: this.voltVault.optionMarket,

      writerTokenMint: this.voltVault.writerTokenMint,

      userWriterTokenAccount: userWriterTokenAccount,

      quoteAssetPool: optionMarket.quoteAssetPool,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      feeOwner: INERTIA_FEE_OWNER,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.bypassSettlement({
      accounts: bypassSettlementAccounts,
    });
  }

  async endRound(bypassCode?: BN): Promise<TransactionInstruction> {
    if (bypassCode === undefined) bypassCode = new BN(0);

    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      extraVoltKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const {
      entropyLendingProgramKey,
      entropyLendingGroupKey,
      entropyLendingAccountKey,
    } = await this.getEntropyLendingKeys();

    const endRoundStruct: Parameters<
      VoltProgram["instruction"]["endRound"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      epochInfo: epochInfoKey,

      feeAcct: await this.getFeeTokenAccount(),

      entropyLendingProgram: entropyLendingProgramKey,
      entropyLendingGroup: entropyLendingGroupKey,
      entropyLendingAccount: entropyLendingAccountKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,
    };

    return this.sdk.programs.Volt.instruction.endRound(bypassCode, {
      accounts: endRoundStruct,
    });
  }

  settlePermissionedMarketPremiumFunds() {
    const settlePermissionedMarketPremiumFundsStruct: Parameters<
      VoltProgram["instruction"]["settlePermissionedMarketPremiumFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      rawDerivsContract: this.voltVault.optionMarket,

      writerTokenMint: this.voltVault.writerTokenMint,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.settlePermissionedMarketPremiumFunds(
      {
        accounts: settlePermissionedMarketPremiumFundsStruct,
      }
    );
  }

  async settleEnterFunds(referrerQuoteAcctReplacement?: PublicKey) {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [whitelistTokenAccountKey] =
      await ShortOptionsVoltSDK.findWhitelistTokenAccountAddress(
        this.voltKey,
        this.sdk.net.MM_TOKEN_MINT,
        this.sdk.programs.Volt.programId
      );

    const { marketAuthority } = await this.getCurrentMarketAndAuthorityInfo();

    const [optionSerumMarketKey] =
      await ShortOptionsVoltSDK.findSerumMarketAddress(
        this.voltKey,
        this.sdk.net.MM_TOKEN_MINT,
        optionMarket.key
      );

    const optionSerumMarketProxy = await marketLoader(
      this,
      optionSerumMarketKey,
      whitelistTokenAccountKey
    );

    const optionSerumMarket = optionSerumMarketProxy.market;

    const [openOrdersKey] =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        optionSerumMarketKey
      );

    const [vaultOwner] = await getVaultOwnerAndNonce(
      optionSerumMarketProxy.market.address,
      optionSerumMarketProxy.dexProgramId
    );

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getPermissionedMarketReferrerPremiumAcct();

    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const settleEnterFundsStruct: Parameters<
      VoltProgram["instruction"]["settleEnterFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      middlewareProgram: this.sdk.programs.Volt.programId,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      optionPool: this.voltVault.optionPool,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      roundInfo: roundInfoKey,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: optionSerumMarketProxy.dexProgramId,
      openOrders: openOrdersKey,

      market: optionSerumMarketProxy.market.address,
      serumMarketAuthority: marketAuthority,

      extraVoltData: extraVoltDataKey,
      epochInfo: epochInfoKey,
      feeAcct: await this.getFeeTokenAccount(true),

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: optionSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: optionSerumMarket._decoded.quoteVault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.settleEnterFunds({
      accounts: settleEnterFundsStruct,
    });
  }

  async settleSwapPremiumFunds(
    spotSerumMarketKey: PublicKey,
    referrerQuoteAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [ulOpenOrdersKey] =
      await ShortOptionsVoltSDK.findUnderlyingOpenOrdersAddress(
        this.voltKey,
        spotSerumMarketKey,
        this.sdk.programs.Volt.programId
      );

    const spotSerumMarket = await Market.load(
      this.connection,
      spotSerumMarketKey,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const [vaultOwner] = await getVaultOwnerAndNonce(
      spotSerumMarket.address,
      spotSerumMarket.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);

    const settleSwapPremiumFundsStruct: Parameters<
      VoltProgram["instruction"]["settleSwapPremiumFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      tradingPool:
        this.voltVault.quoteAssetMint === spotSerumMarket.quoteMintAddress
          ? this.voltVault.premiumPool
          : this.voltVault.permissionedMarketPremiumPool,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: spotSerumMarket.programId,
      openOrders: ulOpenOrdersKey,
      market: spotSerumMarket.address,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: spotSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: spotSerumMarket._decoded.quoteVault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.settleSwapPremiumFunds({
      accounts: settleSwapPremiumFundsStruct,
    });
  }
}
