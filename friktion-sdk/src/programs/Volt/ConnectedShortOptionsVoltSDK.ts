import {
  getBalance,
  isDefaultPubkey,
  printAnchorAccounts,
} from "@friktion-labs/friktion-utils";
import { use } from "@friktion-labs/typescript-mix";
import type { MarketProxy } from "@project-serum/serum";
import { Market, MARKET_STATE_LAYOUT_V3 } from "@project-serum/serum";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import type Decimal from "decimal.js";

import type { OptionsProtocol } from "../../constants";
import {
  GLOBAL_VOLT_ADMIN,
  SIMPLE_SWAP_PROGRAM_ID,
  VoltType,
} from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { SwapSDK } from "../Swap/SwapSDK";
import { ConnectedVoltSDK } from "./ConnectedVoltSDK";
import { ShortOptionsVoltSDK } from "./ShortOptionsVoltSDK";
import {
  createFirstSetOfAccounts,
  getBidAskLimitsForSpot,
  getSerumMarketAccountsWithQueues,
  getVaultOwnerAndNonce,
} from "./utils/serumHelpers";
import { VoltSDK } from "./VoltSDK";
import type { ExtraVoltData, VoltIXAccounts, VoltVault } from "./voltTypes";

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

  //// REBALANCING INSTRUCTIONS ////

  async startRound(): Promise<TransactionInstruction> {
    const startRoundStruct: VoltIXAccounts["startRoundShortOptions"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      underlyingAssetMint: this.voltVault.depositMint,
      vaultMint: this.voltVault.vaultMint,

      initializeStartRoundAccounts: await this.getInitializeStartRoundAccounts(
        this.wallet
      ),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.startRoundShortOptions({
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

    const { optionPoolKey, writerTokenPoolKey } =
      await ShortOptionsVoltSDK.findSetNextOptionAddresses(
        this.voltKey,
        optionMarket.optionMint,
        optionMarket.writerTokenMint,
        this.sdk.programs.Volt.programId
      );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const setNextOptionStruct: VoltIXAccounts["setNextOption"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      optionPool: optionPoolKey,
      writerTokenPool: writerTokenPoolKey,

      rawDerivsContract: newOptionMarketKey,
      underlyingAssetMint: this.voltVault.depositMint,
      optionMint: optionMarket.optionMint,
      writerTokenMint: optionMarket.writerTokenMint,

      roundInfoAccounts: await this.getCurrentRoundInfoAccounts(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      extraVoltData: extraVoltKey,
    };

    return this.sdk.programs.Volt.instruction.setNextOption({
      accounts: setNextOptionStruct,
    });
  }

  async resetOptionMarket(): Promise<TransactionInstruction> {
    if (!this.voltVault.prepareIsFinished || this.voltVault.enterIsFinished)
      throw new Error("invalid state for reset option market");

    const { backupOptionPoolKey, backupWriterTokenPoolKey } =
      await ShortOptionsVoltSDK.findBackupPoolAddresses(
        this.voltKey,
        this.voltVault
      );

    const resetOptionMarketAccounts: VoltIXAccounts["resetOptionMarket"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,

      optionMint: this.voltVault.optionMint,
      writerTokenMint: this.voltVault.writerTokenMint,
      optionsProtocolAccounts: await this.getOptionsContractAccounts(),

      backupOptionPool: backupOptionPoolKey,
      backupWriterTokenPool: backupWriterTokenPoolKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.resetOptionMarket({
      accounts: resetOptionMarketAccounts,
    });
  }

  async rebalancePrepare(): Promise<TransactionInstruction> {
    const remainingAccounts: AccountMeta[] = [];

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalancePrepareStruct: VoltIXAccounts["rebalancePrepare"] = {
      authority: this.wallet,

      voltVault: this.voltKey,

      depositPool: this.voltVault.depositPool,
      optionsContractAccounts: await this.getOptionsContractAccounts(),

      epochInfo: epochInfoKey,

      tokenProgram: TOKEN_PROGRAM_ID,
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
          this.voltVault.optionsContract.toBuffer(),
          auctionMetadataKey.toBuffer(),
          textEncoder.encode("requestQueue"),
        ],
        middlewareProgram.programId
      );
    const [coinVault, _coinVaultBump] = await PublicKey.findProgramAddress(
      [
        this.sdk.net.MM_TOKEN_MINT.toBuffer(),
        this.voltVault.optionsContract.toBuffer(),
        auctionMetadataKey.toBuffer(),
        textEncoder.encode("coinVault"),
      ],
      middlewareProgram.programId
    );
    const [pcVault, _pcVaultBump] = await PublicKey.findProgramAddress(
      [
        this.sdk.net.MM_TOKEN_MINT.toBuffer(),
        this.voltVault.optionsContract.toBuffer(),
        auctionMetadataKey.toBuffer(),

        textEncoder.encode("pcVault"),
      ],
      middlewareProgram.programId
    );

    const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
      serumMarketKey,
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const initSerumAccounts: VoltIXAccounts["initSerumMarket"] = {
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

  async changeAuctionParams(
    permissionlessAuctions: boolean
  ): Promise<TransactionInstruction> {
    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey);
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const changeAuctionParamsAccounts: VoltIXAccounts["changeAuctionParams"] = {
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

  async rebalanceSettle(bypassCode?: number): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionsContract
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const [temporaryUsdcFeePoolKey] =
      await ShortOptionsVoltSDK.findTemporaryUsdcFeePoolAddress(this.voltKey);
    const rebalanceSettleStruct: VoltIXAccounts["rebalanceSettle"] = {
      authority: this.wallet,

      voltVault: this.voltKey,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      temporaryUsdcFeePool: temporaryUsdcFeePoolKey,

      optionsContractAccounts: await this.getOptionsContractAccounts(),

      roundInfoAccounts: await this.getCurrentRoundInfoAccounts(),

      tokenProgram: TOKEN_PROGRAM_ID,
      extraVoltData: extraVoltKey,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSettle(
      bypassCode ? new BN(bypassCode) : new BN(0),
      {
        accounts: rebalanceSettleStruct,
      }
    );
  }

  async rebalanceSwapPremium(
    spotSerumMarketKey: PublicKey,
    clientPrice?: BN,
    useQuoteAssetPool = false,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionsContractByKey(
      this.voltVault.optionsContract
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [ulOpenOrdersKey] =
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

    let ask: BN;
    try {
      ({ ask } = await getBidAskLimitsForSpot(
        this.connection,
        spotSerumMarket,
        undefined,
        clientPrice
      ));
    } catch (err) {
      ask = new BN(0);
    }

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const serumMarketAccounts = {
      ...(await getSerumMarketAccountsWithQueues(spotSerumMarket)),
      srmReferralAcct: srmReferralAcct,
      pcReferrerWallet: referrerQuoteAcct,
    };
    const rebalanceSwapPremiumStruct: VoltIXAccounts["rebalanceSwapPremium"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      tradingPool: useQuoteAssetPool
        ? this.voltVault.premiumPool
        : this.voltVault.permissionedMarketPremiumPool,

      serumMarketAccounts,

      openOrders: ulOpenOrdersKey,
      openOrdersMetadata: ulOpenOrdersMetadataKey,

      roundInfoAccounts: await this.getCurrentRoundInfoAccounts(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSwapPremium(ask, {
      accounts: rebalanceSwapPremiumStruct,
    });
  }

  async rebalanceEnter(
    clientPrice: BN,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const { marketAuthority } = await this.getCurrentMarketAndAuthorityInfo();
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const whitelistTokenAccountKey =
      await this.findThisWhitelistTokenAccountAddress();

    const optionSerumMarketProxy: MarketProxy =
      await this.getSerumMarketProxy();
    const optionSerumMarket: Market = optionSerumMarketProxy.market;

    const [openOrdersKey] =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        optionSerumMarket.address
      );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getPermissionedMarketReferrerPremiumAcct();

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber
    );
    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(this.voltKey);

    const rebalanceEnterStruct: VoltIXAccounts["rebalanceEnter"] = {
      authority: this.wallet,
      middlewareProgram: this.sdk.programs.Volt.programId,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      extraVoltData: extraVoltKey,
      auctionMetadata: auctionMetadataKey,

      roundInfo: roundInfoKey,
      temporaryUsdcFeePool: (
        await ShortOptionsVoltSDK.findTemporaryUsdcFeePoolAddress(this.voltKey)
      )[0],
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      optionPool: this.voltVault.optionPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      rawDerivsContract: this.voltVault.optionsContract,

      serumMarketAccounts: {
        ...(await getSerumMarketAccountsWithQueues(optionSerumMarket)),
        srmReferralAcct: srmReferralAcct,
        pcReferrerWallet: referrerQuoteAcct,
      },
      market: optionSerumMarket.address,

      openOrders: openOrdersKey,
      serumMarketAuthority: marketAuthority,

      whitelistTokenAccount: whitelistTokenAccountKey,

      epochInfo: epochInfoKey,

      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEnter(clientPrice, {
      accounts: rebalanceEnterStruct,
    });
  }

  async endRound(bypassCode?: BN): Promise<TransactionInstruction> {
    if (bypassCode === undefined) bypassCode = new BN(0);

    const { epochInfoKey, extraVoltKey } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const [temporaryUsdcFeePoolKey] =
      await ShortOptionsVoltSDK.findTemporaryUsdcFeePoolAddress(this.voltKey);

    const endRoundStruct: VoltIXAccounts["endRoundShortOptions"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,

      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,
      writerTokenPool: this.voltVault.writerTokenPool,
      temporaryUsdcFeePool: temporaryUsdcFeePoolKey,

      roundAccts: await this.getCurrentAllRoundAccounts(),

      epochInfo: epochInfoKey,

      ulFeeAcct: await this.getFeeTokenAccount(),
      usdcFeeAcct: await this.getPermissionedMarketFeeTokenAccount(),

      lendingAccounts: await this.getEntropyLendingAccounts(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.endRoundShortOptions(bypassCode, {
      accounts: endRoundStruct,
    });
  }

  async rebalanceEnterCreateSwap(
    expiry: BN,
    counterparty?: PublicKey,
    whitelistToken?: PublicKey,
    shouldKeepCancelled = false
  ): Promise<TransactionInstruction> {
    const {
      roundInfoKey,
      epochInfoKey,
      temporaryUsdcFeePoolKey,
      extraVoltKey,
      auctionMetadataKey,
    } = await ShortOptionsVoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const userOrdersKey = (
      await SwapSDK.findUserOrdersAddress(this.voltVault.vaultAuthority)
    )[0];

    let id: BN = new BN(0);
    try {
      id = (await this.sdk.loadUserOrdersByKey(userOrdersKey)).currOrderId;
    } catch (e) {
      id = new BN(0);
    }

    const newSwapOrder = (
      await SwapSDK.findSwapOrderAddress(this.voltVault.vaultAuthority, id)
    )[0];
    const [givePool] = await SwapSDK.findGivePoolAddress(newSwapOrder);
    const [receivePool] = await SwapSDK.findReceivePoolAddress(newSwapOrder);

    const auctionMetadata = await this.getAuctionMetadata();
    console.log("curr swap order = ", auctionMetadata.currSwapOrder.toString());
    const createSwapOrderAccounts: VoltIXAccounts["rebalanceEnterCreateSwap"] =
      {
        authority: this.wallet,
        voltVault: this.voltKey,
        extraVoltData: extraVoltKey,
        vaultAuthority: this.voltVault.vaultAuthority,

        swapAdmin: GLOBAL_VOLT_ADMIN,
        newSwapOrder,
        userOrders: userOrdersKey,

        permissionedMarketPremiumMint:
          this.voltVault.permissionedMarketPremiumMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        optionsContract: this.voltVault.optionsContract,
        givePool,
        optionMint: this.voltVault.optionMint,
        receivePool,
        counterparty: counterparty ?? SystemProgram.programId,
        swapProgram: SIMPLE_SWAP_PROGRAM_ID,
        auctionMetadata: auctionMetadataKey,
        optionPool: this.voltVault.optionPool,
        permissionedMarketPremiumPool:
          this.voltVault.permissionedMarketPremiumPool,
        roundInfo: roundInfoKey,
        epochInfo: epochInfoKey,
        temporaryUsdcFeePool: temporaryUsdcFeePoolKey,
      };

    const isCancelling = !isDefaultPubkey(auctionMetadata.currSwapOrder);
    let remainingAccounts: AccountMeta[] = [];

    if (isCancelling) {
      const currSwapOrder = await this.sdk.loadSwapByKey(
        auctionMetadata.currSwapOrder
      );
      remainingAccounts = [
        {
          pubkey: auctionMetadata.currSwapOrder,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: currSwapOrder.swapOrder.givePool,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: currSwapOrder.swapOrder.receivePool,
          isWritable: true,
          isSigner: false,
        },
      ];
    }

    printAnchorAccounts(createSwapOrderAccounts);

    return this.sdk.programs.Volt.instruction.rebalanceEnterCreateSwap(
      {
        giveSize: await getBalance(
          this.sdk.readonlyProvider.connection,
          this.voltVault.writerTokenPool
        ),
        // set this to max value since exec_msg shouldn't be used for this.
        receiveSize: new BN("1"),
        expiry,
        isCounterpartyProvided: counterparty !== undefined,
        isWhitelisted: whitelistToken !== undefined,
        enforceMintMatch: true,
      },
      shouldKeepCancelled ? new BN(1) : new BN(0),
      {
        accounts: createSwapOrderAccounts,
        remainingAccounts,
      }
    );
  }

  async rebalanceEnterClaimSwap(): Promise<TransactionInstruction> {
    const {
      roundInfoKey,
      epochInfoKey,
      temporaryUsdcFeePoolKey,
      extraVoltKey,
      auctionMetadataKey,
    } = await ShortOptionsVoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const auctionMetadata = await this.getAuctionMetadata();
    const swapSdk = await this.sdk.loadSwapByKey(auctionMetadata.currSwapOrder);
    const [userOrders] = await SwapSDK.findUserOrdersAddress(
      this.voltVault.vaultAuthority
    );

    const claimSwapOrderAccounts: VoltIXAccounts["rebalanceEnterClaimSwap"] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      swapOrder: swapSdk.swapOrderKey,
      userOrders,

      giveMint: this.voltVault.optionMint,
      receiveMint: this.voltVault.permissionedMarketPremiumMint,
      auctionMetadata: auctionMetadataKey,
      optionPool: this.voltVault.optionPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,
      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,
      temporaryUsdcFeePool: temporaryUsdcFeePoolKey,

      swapProgram: SIMPLE_SWAP_PROGRAM_ID,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      givePool: swapSdk.swapOrder.givePool,
      receivePool: swapSdk.swapOrder.receivePool,
      writerTokenPool: this.voltVault.writerTokenPool,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEnterClaimSwap({
      accounts: claimSwapOrderAccounts,
    });
  }
}
