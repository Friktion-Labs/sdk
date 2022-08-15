import {
  EntropyClient,
  makeCachePerpMarketsInstruction,
  makeCachePricesInstruction,
  makeCacheRootBankInstruction,
} from "@friktion-labs/entropy-client";
import { sleep } from "@friktion-labs/friktion-utils";
import { use } from "@friktion-labs/typescript-mix";
import { Market } from "@project-serum/serum";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Connection, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import type Decimal from "decimal.js";

import { VoltType } from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { ConnectedVoltSDK } from "./ConnectedVoltSDK";
import { EntropyVoltSDK } from "./EntropyVoltSDK";
import { getBidAskLimitsForEntropy } from "./utils/entropyHelpers";
import { getBidAskLimitsForSpot } from "./utils/serumHelpers";
import { VoltSDK } from "./VoltSDK";
import type {
  EntropyMetadata,
  ExtraVoltData,
  VoltProgram,
  VoltVault,
} from "./voltTypes";

export interface ConnectedEntropyVoltSDK
  extends ConnectedVoltSDK,
    EntropyVoltSDK {}

export class ConnectedEntropyVoltSDK {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @use(ConnectedVoltSDK, EntropyVoltSDK) this: any;

  readonly sdk: FriktionSDK;
  readonly voltKey: PublicKey;
  readonly voltVault: VoltVault;
  readonly extraVoltData: ExtraVoltData;
  readonly entropyMetadata: EntropyMetadata;
  normFactor: Decimal | undefined;

  readonly connection: Connection;
  readonly wallet: PublicKey;
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    sdk: EntropyVoltSDK,
    connection: Connection,
    user: PublicKey,
    daoAuthority?: PublicKey | undefined
  ) {
    this.sdk = sdk.sdk;
    this.voltKey = sdk.voltKey;
    this.voltVault = sdk.voltVault;
    this.extraVoltData = sdk.extraVoltData;
    this.entropyMetadata = sdk.entropyMetadata;
    this.normFactor = sdk.normFactor;

    this.connection = connection;
    this.wallet = user;
    this.daoAuthority = daoAuthority;

    if (this.voltType() !== VoltType.Entropy) {
      throw new Error("Not a valid entropy volt");
    }
  }

  async refresh(): Promise<ConnectedEntropyVoltSDK> {
    return new ConnectedEntropyVoltSDK(
      await this.sdk.loadEntropyVoltSDKByKey(this.voltKey),
      this.connection,
      this.wallet,
      this.daoAuthority
    );
  }

  //// ADMIN INSTRUCTIONS ////

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async changeHedging(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldHedge: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hedgeWithSpot: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    targetHedgeRatio: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    targetHedgeLenience: number
  ): Promise<TransactionInstruction> {
    await sleep(1);
    throw new Error("Disabled");
    // const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
    //   this.voltKey
    // );
    // const [entropyMetadataKey] =
    //   await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    // const changeHedgingAccounts: Parameters<
    //   VoltProgram["instruction"]["changeHedging"]["accounts"]
    // >[0] = {
    //   authority: this.wallet,
    //   voltVault: this.voltKey,
    //   extraVoltData: extraVoltDataKey,
    //   entropyMetadata: entropyMetadataKey,
    // };

    // return this.sdk.programs.Volt.instruction.changeHedging(
    //   shouldHedge,
    //   hedgeWithSpot,
    //   targetHedgeRatio,
    //   targetHedgeLenience,
    //   {
    //     accounts: changeHedgingAccounts,
    //   }
    // );
  }

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async resetRebalancing(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onlyResetHedge: boolean
  ): Promise<TransactionInstruction> {
    await sleep(1);
    throw new Error("Disabled");
    // const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
    //   this.voltKey
    // );
    // const resetRebalancingAccounts: Parameters<
    //   VoltProgram["instruction"]["resetRebalancing"]["accounts"]
    // >[0] = {
    //   authority: this.wallet,
    //   voltVault: this.voltKey,
    //   extraVoltData: extraVoltDataKey,
    // };
    // return this.sdk.programs.Volt.instruction.resetRebalancing(onlyResetHedge, {
    //   accounts: resetRebalancingAccounts,
    // });
  }

  async setStrategyParams(
    targetLeverageRatio: Decimal,
    targetLeverageLenience: Decimal,
    targetHedgeRatio: Decimal,
    targetHedgeLenience: Decimal,
    shouldHedge: boolean,
    hedgeWithSpot: boolean
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    const setStrategyAccounts: Parameters<
      VoltProgram["instruction"]["setStrategyParams"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
      entropyMetadata: entropyMetadataKey,
    };
    return this.sdk.programs.Volt.instruction.setStrategyParams(
      targetLeverageRatio.toNumber(),
      targetLeverageLenience.toNumber(),
      targetHedgeRatio.toNumber(),
      targetHedgeLenience.toNumber(),
      shouldHedge,
      hedgeWithSpot,
      {
        accounts: setStrategyAccounts,
      }
    );
  }

  //// REBALANCING INSTRUCTIONS ////

  async startRound(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber.addn(1),
        this.sdk.programs.Volt.programId
      );
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const startRoundEntropyStruct: Parameters<
      VoltProgram["instruction"]["startRoundEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      depositMint: this.voltVault.depositMint,
      vaultMint: this.voltVault.vaultMint,

      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(),
      entropyRound: entropyRoundInfoKey,

      initializeStartRoundAccounts: await this.getInitializeStartRoundAccounts(
        this.wallet
      ),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.startRoundEntropy({
      accounts: startRoundEntropyStruct,
    });
  }

  async printEquity(): Promise<TransactionInstruction> {
    await sleep(1);
    throw new Error("disabled");
    // if (!this.extraVoltData) throw new Error("extra volt data must be set");

    // const {
    //   epochInfoKey,
    //   roundVoltTokensKey,
    //   roundUnderlyingPendingWithdrawalsKey,
    //   roundInfoKey,
    // } = await VoltSDK.findRoundAddresses(
    //   this.voltKey,
    //   this.voltVault.roundNumber,
    //   this.sdk.programs.Volt.programId
    // );

    // const [entropyRoundInfoKey] =
    //   await EntropyVoltSDK.findEntropyRoundInfoAddress(
    //     this.voltKey,
    //     this.voltVault.roundNumber,
    //     this.sdk.programs.Volt.programId
    //   );

    // const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    // const [entropyMetadataKey] =
    //   await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    // const printEquityAccounts: Parameters<
    //   VoltProgram["instruction"]["printEquity"]["accounts"]
    // >[0] = {
    //   authority: this.wallet,
    //   voltVault: this.voltKey,
    //   extraVoltData: extraVoltKey,

    //   entropyBaseAccounts: await this.getEntropyBaseAccountsContext(),

    //   entropyRound: entropyRoundInfoKey,

    //   roundInfo: roundInfoKey,
    //   roundVoltTokens: roundVoltTokensKey,
    //   roundUnderlyingTokensForPendingWithdrawals:
    //     roundUnderlyingPendingWithdrawalsKey,

    //   epochInfo: epochInfoKey,
    //   entropyMetadata: entropyMetadataKey,

    //   systemProgram: SystemProgram.programId,

    //   tokenProgram: TOKEN_PROGRAM_ID,
    //   depositPool: this.getDepositPool(),
    // };

    // return this.sdk.programs.Volt.instruction.printEquity({
    //   accounts: printEquityAccounts,
    // });
  }

  async takePerformanceFees(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

    const {
      epochInfoKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      roundInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const [entropySpotOpenOrders] =
      await EntropyVoltSDK.findEntropyOpenOrdersAddress(
        this.voltKey,
        this.extraVoltData.hedgingSpotMarket
      );
    const takePerformanceFeesEntropyAccounts: Parameters<
      VoltProgram["instruction"]["takePerformanceAndAumFeesEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(),

      entropyRound: entropyRoundInfoKey,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,
      entropyMetadata: entropyMetadataKey,

      systemProgram: SystemProgram.programId,

      openOrders: entropySpotOpenOrders,

      signer: entropyGroup.signerKey,

      tokenProgram: TOKEN_PROGRAM_ID,

      feeAccount: await this.getFeeTokenAccount(),
      depositPool: this.getDepositPool(),
    };

    return this.sdk.programs.Volt.instruction.takePerformanceAndAumFeesEntropy({
      accounts: takePerformanceFeesEntropyAccounts,
    });
  }

  async rebalance(
    clientBidPrice?: BN,
    clientAskPrice?: BN,
    maxQuotePosChange?: BN,
    forceHedgeFirst = false
  ): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    if (maxQuotePosChange === undefined) {
      maxQuotePosChange = new BN("18446744073709551615");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const { entropyGroup } = await this.getGroupAndBanksForEvData(
      client,
      this.extraVoltData.depositMint
    );

    const quoteDecimals = await this.getQuoteDecimals(entropyGroup);
    const powerPerpBaseDecimals = await this.getTargetPerpBaseDecimals(
      entropyGroup
    );

    const targetPerpMarket = await client.getPerpMarket(
      this.extraVoltData.targetPerpMarket,
      powerPerpBaseDecimals,
      quoteDecimals
    );

    let perpMarket = targetPerpMarket;

    if (this.extraVoltData.doneRebalancingTargetPerp) {
      const spotPerpBaseDecimals = await this.getHedgingPerpBaseDecimals(
        entropyGroup
      );
      perpMarket = await client.getPerpMarket(
        this.extraVoltData.hedgingPerpMarket,
        spotPerpBaseDecimals,
        quoteDecimals
      );
    }

    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    ({ bid: clientBidPrice, ask: clientAskPrice } =
      await getBidAskLimitsForEntropy(
        this.connection,
        perpMarket,
        clientBidPrice,
        clientAskPrice
      ));

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      );

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [ulOpenOrders] = await EntropyVoltSDK.findEntropyOpenOrdersAddress(
      this.voltKey,
      this.extraVoltData.hedgingSpotMarket
    );

    const perpMarketMint =
      entropyGroup.tokens[
        entropyGroup.getPerpMarketIndex(this.getTargetPerpMarketKey())
      ]?.mint;

    if (perpMarketMint === undefined) {
      throw new Error("perp market mint not found");
    }

    const { rootBank, nodeBank } = await this.getGroupAndBanksForEvData(
      this.getDefaultEntropyClient(),
      perpMarketMint
    );
    const rebalanceEntropyStruct: Parameters<
      VoltProgram["instruction"]["rebalanceIntoPerpEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(
        rootBank?.publicKey,
        nodeBank?.publicKey,
        nodeBank?.vault
      ),

      entropyRound: entropyRoundInfoKey,
      epochInfo: epochInfoKey,

      hedgingPerpMarket: this.extraVoltData.hedgingPerpMarket,
      targetPerpEventQueue: targetPerpMarket.eventQueue,
      targetPerpMarket: this.extraVoltData.targetPerpMarket,

      eventQueue: perpMarket.eventQueue,

      bids: perpMarket.bids,
      asks: perpMarket.asks,
      openOrders: ulOpenOrders,

      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.rebalanceIntoPerpEntropy(
      {
        clientBidPrice,
        clientAskPrice,
        maxQuotePosChange,
      },
      forceHedgeFirst,
      {
        accounts: rebalanceEntropyStruct,
      }
    );
  }

  async rebalanceSpot(
    clientBidPrice?: BN,
    clientAskPrice?: BN,
    maxQuotePosChange?: BN
  ): Promise<TransactionInstruction> {
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    if (maxQuotePosChange === undefined) {
      maxQuotePosChange = new BN("18446744073709551615");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const spotMarket = await Market.load(
      this.connection,
      this.extraVoltData.hedgingSpotMarket,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const { entropyGroup, quoteRootBank, quoteNodeBank } =
      await this.getGroupAndBanksForEvData(client, spotMarket.baseMintAddress);

    const quoteDecimals = await this.getQuoteDecimals(entropyGroup);
    const powerPerpBaseDecimals = await this.getTargetPerpBaseDecimals(
      entropyGroup
    );

    const targetPerpMarket = await client.getPerpMarket(
      this.extraVoltData.targetPerpMarket,
      powerPerpBaseDecimals,
      quoteDecimals
    );

    const [ulOpenOrders] = await EntropyVoltSDK.findEntropyOpenOrdersAddress(
      this.voltKey,
      spotMarket.address
    );

    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const { bid, ask } = await getBidAskLimitsForSpot(
      this.connection,
      spotMarket,
      clientBidPrice,
      clientAskPrice
    );

    const dexSigner = await PublicKey.createProgramAddress(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      [
        spotMarket.address.toBuffer(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
      ],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      spotMarket._programId
    );

    const spotMarketMint =
      entropyGroup.tokens[
        entropyGroup.getSpotMarketIndex(this.extraVoltData.hedgingSpotMarket)
      ]?.mint;

    if (spotMarketMint === undefined) {
      throw new Error("spot market mint not found");
    }

    const { rootBank, nodeBank } = await this.getGroupAndBanksForEvData(
      this.getDefaultEntropyClient(),
      spotMarketMint
    );

    const rebalanceSpotEntropyAccounts: Parameters<
      VoltProgram["instruction"]["rebalanceIntoSpotEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,
      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(
        rootBank?.publicKey,
        nodeBank?.publicKey,
        nodeBank?.vault
      ),

      spotMarket: this.extraVoltData.hedgingSpotMarket,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      bids: spotMarket.bidsAddress,
      asks: spotMarket.asksAddress,

      openOrders: ulOpenOrders,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexRequestQueue: spotMarket._decoded.requestQueue,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexEventQueue: spotMarket._decoded.eventQueue,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexBase: spotMarket._decoded.baseVault,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexQuote: spotMarket._decoded.quoteVault,

      quoteVault: quoteNodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,
      dexSigner: dexSigner,

      msrmOrSrmVault: entropyGroup.msrmVault,

      tokenProgram: TOKEN_PROGRAM_ID,
      targetPerpMarket: this.extraVoltData.targetPerpMarket,
      targetPerpEventQueue: targetPerpMarket.eventQueue,
    };

    return this.sdk.programs.Volt.instruction.rebalanceIntoSpotEntropy(
      {
        clientBidPrice: bid,
        clientAskPrice: ask,
        maxQuotePosChange,
      },
      {
        accounts: rebalanceSpotEntropyAccounts,
        remainingAccounts: [
          {
            isSigner: false,
            isWritable: false,
            pubkey: quoteRootBank?.publicKey as PublicKey,
          },
          {
            isSigner: false,
            isWritable: true,
            pubkey: quoteNodeBank?.publicKey as PublicKey,
          },
        ],
      }
    );
  }

  async initSpotOpenOrders(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const spotMarket = await Market.load(
      this.connection,
      this.extraVoltData.hedgingSpotMarket,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const [ulOpenOrders] = await EntropyVoltSDK.findEntropyOpenOrdersAddress(
      this.voltKey,
      spotMarket.address
    );

    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const dexSigner = await PublicKey.createProgramAddress(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      [
        spotMarket.address.toBuffer(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
      ],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      spotMarket._programId
    );

    const initSpotOpenOrdersEntropyAccounts: Parameters<
      VoltProgram["instruction"]["initSpotOpenOrdersEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      vaultAuthority: this.voltVault.vaultAuthority,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,

      spotMarket: this.extraVoltData.hedgingSpotMarket,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      openOrders: ulOpenOrders,

      signer: entropyGroup.signerKey,
      dexSigner: dexSigner,

      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    return this.sdk.programs.Volt.instruction.initSpotOpenOrdersEntropy({
      accounts: initSpotOpenOrdersEntropyAccounts,
    });
  }

  async setupRebalance(
    clientOraclePx?: Decimal
  ): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const entropyCache = await entropyGroup.loadCache(
      this.sdk.readonlyProvider.connection
    );

    if (!clientOraclePx)
      clientOraclePx = this.getOraclePriceForDepositToken(
        entropyGroup,
        entropyCache
      );

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      );
    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const setupRebalanceEntropyStruct: Parameters<
      VoltProgram["instruction"]["setupRebalanceEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      entropyMetadata: entropyMetadataKey,

      vaultMint: this.voltVault.vaultMint,
      depositPool: this.voltVault.depositPool,
      depositMint: this.extraVoltData.depositMint,

      roundAccts: await this.getCurrentAllRoundAccounts(),

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(),

      spotPerpMarket: this.extraVoltData.hedgingPerpMarket,
      targetPerpMarket: this.extraVoltData.targetPerpMarket,

      signer: entropyGroup.signerKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.setupRebalanceEntropy(
      clientOraclePx,
      {
        accounts: setupRebalanceEntropyStruct,
      }
    );
  }

  async endRound(bypassCode?: BN): Promise<TransactionInstruction> {
    if (bypassCode === undefined) bypassCode = new BN(0);
    const {
      roundInfoKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      );

    const [entropySpotOpenOrders] =
      await EntropyVoltSDK.findEntropyOpenOrdersAddress(
        this.voltKey,
        this.extraVoltData.hedgingSpotMarket
      );

    const endRoundEntropyStruct: Parameters<
      VoltProgram["instruction"]["endRoundEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      entropyMetadata: entropyMetadataKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      depositPool: this.getDepositPool(),
      vaultMint: this.voltVault.vaultMint,
      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      signer: entropyGroup.signerKey,

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      openOrders: entropySpotOpenOrders,

      entropyBaseAccounts: await this.getEntropyBaseAccountsContext(),
      lendingAccounts: await this.getEntropyLendingAccounts(),

      feeAcct: await this.getFeeTokenAccount(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.endRoundEntropy(bypassCode, {
      accounts: endRoundEntropyStruct,
    });
  }

  //// CACHING INSTRUCTIONS ////

  async cacheQuoteRootBank(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const cacheIx = makeCacheRootBankInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      [entropyGroup.getQuoteTokenInfo().rootBank]
    );

    return cacheIx;
  }

  async cacheRelevantPrices(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const oracles = [
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(this.extraVoltData.targetPerpMarket)
      ],
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(this.extraVoltData.hedgingPerpMarket)
      ],
    ];

    return makeCachePricesInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      oracles as PublicKey[]
    );
  }

  async cacheRelevantPerpMarkets(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    return makeCachePerpMarketsInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      [
        this.extraVoltData?.targetPerpMarket,
        this.extraVoltData?.hedgingPerpMarket,
      ]
    );
  }
}
