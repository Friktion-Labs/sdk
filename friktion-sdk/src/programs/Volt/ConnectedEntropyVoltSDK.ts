import {
  EntropyClient,
  makeCachePerpMarketsInstruction,
  makeCachePricesInstruction,
  makeCacheRootBankInstruction,
} from "@friktion-labs/entropy-client";
import { use } from "@friktion-labs/typescript-mix";
import { Market } from "@project-serum/serum";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Connection, TransactionInstruction } from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
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

  async initExtraAccounts({
    entropyGroupKey,
    targetPerpMarket,
    spotPerpMarket,
    spotMarket,
  }: {
    entropyGroupKey: PublicKey;
    targetPerpMarket: PublicKey;
    spotPerpMarket: PublicKey;
    spotMarket: PublicKey;
  }): Promise<TransactionInstruction> {
    const ev = await this.getExtraVoltData();
    const { vault, extraVoltKey, vaultMint } =
      await EntropyVoltSDK.findInitializeAddresses(
        this.sdk,
        this.entropyMetadata.vaultName
      );
    const [entropyAccountKey] = await EntropyVoltSDK.findEntropyAccountAddress(
      vault
    );
    const client = new EntropyClient(
      this.sdk.readonlyProvider.connection,
      ev.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);
    const entropyCacheKey = entropyGroup.entropyCache;

    const initExtraAccountsAccounts: Parameters<
      VoltProgram["instruction"]["initExtraAccountsEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      vaultMint: vaultMint,
      depositMint: this.voltVault.underlyingAssetMint,

      extraVoltData: extraVoltKey,
      rent: SYSVAR_RENT_PUBKEY,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
      entropyProgram: ev.entropyProgramId,
      entropyGroup: entropyGroupKey,
      entropyAccount: entropyAccountKey,
      entropyCache: entropyCacheKey,
      powerPerpMarket: targetPerpMarket,
      hedgingSpotPerpMarket: spotPerpMarket,
      hedgingSpotMarket: spotMarket,
    };
    return this.sdk.programs.Volt.instruction.initExtraAccountsEntropy({
      accounts: initExtraAccountsAccounts,
    });
  }

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async changeHedging(
    shouldHedge: boolean,
    hedgeWithSpot: boolean,
    targetHedgeRatio: number,
    targetHedgeLenience: number
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );
    const [entropyMetadataKey] =
      await EntropyVoltSDK.findEntropyMetadataAddress(this.voltKey);

    const changeHedgingAccounts: Parameters<
      VoltProgram["instruction"]["changeHedging"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
      entropyMetadata: entropyMetadataKey,
    };

    return this.sdk.programs.Volt.instruction.changeHedging(
      shouldHedge,
      hedgeWithSpot,
      targetHedgeRatio,
      targetHedgeLenience,
      {
        accounts: changeHedgingAccounts,
      }
    );
  }

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async resetRebalancing(
    onlyResetHedge: boolean
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const resetRebalancingAccounts: Parameters<
      VoltProgram["instruction"]["resetRebalancing"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
    };

    return this.sdk.programs.Volt.instruction.resetRebalancing(onlyResetHedge, {
      accounts: resetRebalancingAccounts,
    });
  }

  async setStrategyParams(
    targetLeverageRatio: Decimal,
    targetLeverageLenience: Decimal,
    targetHedgeRatio: Decimal,
    targetHedgeLenience: Decimal
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
      {
        accounts: setStrategyAccounts,
      }
    );
  }

  async depositDiscretionary(
    adminUnderlyingTokens: PublicKey,
    depositAmount: BN
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
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    const textEncoder = new TextEncoder();
    const [depositDiscretionaryKey] = await PublicKey.findProgramAddress(
      [
        this.voltKey.toBuffer(),
        textEncoder.encode("depositDiscretionaryAccount"),
      ],
      this.sdk.programs.Volt.programId
    );
    const depositDiscretionaryEntropyAccounts: Parameters<
      VoltProgram["instruction"]["depositDiscretionaryEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      adminDepositTokenAccount: adminUnderlyingTokens,
      depositDiscretionaryTokens: depositDiscretionaryKey,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      clock: SYSVAR_CLOCK_PUBKEY,
      depositMint: this.extraVoltData.depositMint,
    };

    return this.sdk.programs.Volt.instruction.depositDiscretionaryEntropy(
      depositAmount,
      {
        accounts: depositDiscretionaryEntropyAccounts,
      }
    );
  }

  //// REBALANCING INSTRUCTIONS ////

  async startRound(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

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
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      vaultMint: this.voltVault.vaultMint,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

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

    return this.sdk.programs.Volt.instruction.startRoundEntropy({
      accounts: startRoundEntropyStruct,
    });
  }

  async takePerformanceFees(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

    const {
      epochInfoKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
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
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    const [entropySpotOpenOrders] =
      await EntropyVoltSDK.findEntropyOpenOrdersAddress(
        this.voltKey,
        this.extraVoltData.hedgingSpotMarket
      );
    const takePerformanceFeesEntropyAccounts: Parameters<
      VoltProgram["instruction"]["takePerformanceFeesEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

      vaultMint: this.voltVault.vaultMint,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,
      entropyMetadata: entropyMetadataKey,

      systemProgram: SystemProgram.programId,

      openOrders: entropySpotOpenOrders,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      tokenProgram: TOKEN_PROGRAM_ID,

      feeAccount: await this.getFeeTokenAccount(),
    };

    return this.sdk.programs.Volt.instruction.takePerformanceFeesEntropy({
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

    const { entropyGroup, rootBank, nodeBank, depositIndex } =
      await this.getGroupAndBanksForEvData(
        client,
        this.extraVoltData.depositMint
      );

    const powerPerpBaseDecimals = entropyGroup.tokens[depositIndex]?.decimals;
    if (powerPerpBaseDecimals === undefined)
      throw new Error(
        "power perp base decimnals is undefined, likely market index does not exist in the entropy group"
      );

    const quoteDecimals = entropyGroup.getQuoteTokenInfo().decimals;

    const powerPerpMarket = await client.getPerpMarket(
      this.extraVoltData.powerPerpMarket,
      powerPerpBaseDecimals,
      quoteDecimals
    );

    let perpMarket = powerPerpMarket;

    if (this.extraVoltData.doneRebalancingPowerPerp) {
      const spotPerpIndex = entropyGroup.getPerpMarketIndex(
        this.extraVoltData.hedgingSpotPerpMarket
      );
      const spotPerpBaseDecimals = entropyGroup.tokens[spotPerpIndex]
        ?.decimals as number;
      perpMarket = await client.getPerpMarket(
        this.extraVoltData.hedgingSpotPerpMarket,
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

    const rebalanceEntropyStruct: Parameters<
      VoltProgram["instruction"]["rebalanceEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

      spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
      powerPerpEventQueue: powerPerpMarket.eventQueue,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      eventQueue: perpMarket.eventQueue,

      vault: nodeBank?.vault as PublicKey,

      bids: perpMarket.bids,
      asks: perpMarket.asks,
      openOrders: ulOpenOrders,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      epochInfo: epochInfoKey,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEntropy(
      clientBidPrice,
      clientAskPrice,
      maxQuotePosChange,
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

    const { entropyGroup, rootBank, nodeBank, quoteRootBank, quoteNodeBank } =
      await this.getGroupAndBanksForEvData(client, spotMarket.baseMintAddress);

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

    const rebalanceSpotEntropyAccounts: Parameters<
      VoltProgram["instruction"]["rebalanceSpotEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

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

      baseRootBank: rootBank?.publicKey as PublicKey,
      baseNodeBank: nodeBank?.publicKey as PublicKey,
      baseVault: nodeBank?.vault as PublicKey,

      quoteRootBank: quoteRootBank?.publicKey as PublicKey,
      quoteNodeBank: quoteNodeBank?.publicKey as PublicKey,
      quoteVault: quoteNodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,
      dexSigner: dexSigner,

      msrmOrSrmVault: entropyGroup.msrmVault,

      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSpotEntropy(
      bid,
      ask,
      maxQuotePosChange,
      {
        accounts: rebalanceSpotEntropyAccounts,
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
    const {
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      roundInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
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

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const entropyCache = await entropyGroup.loadCache(
      this.sdk.readonlyProvider.connection
    );
    // const banks = await entropyGroup.loadRootBanks(this.connection);

    // const rootBank =
    //   banks[
    //     entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
    //   ];
    // const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    const { rootBank, nodeBank } = await this.getGroupAndBanksForEvData(
      client,
      this.extraVoltData.depositMint
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

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
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
    const { roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey } =
      await VoltSDK.findRoundAddresses(
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

    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    const [entropyRoundInfoKey] =
      await EntropyVoltSDK.findEntropyRoundInfoAddress(
        this.voltKey,
        this.voltVault.roundNumber,
        this.sdk.programs.Volt.programId
      );

    const {
      entropyLendingProgramKey,
      entropyLendingGroupKey,
      entropyLendingAccountKey,
    } = await this.getEntropyLendingKeys();

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
      vaultMint: this.voltVault.vaultMint,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      signer: entropyGroup.signerKey,

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      openOrders: entropySpotOpenOrders,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      entropyLendingProgram: entropyLendingProgramKey,
      entropyLendingGroup: entropyLendingGroupKey,
      entropyLendingAccount: entropyLendingAccountKey,
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
        entropyGroup.getPerpMarketIndex(this.extraVoltData.powerPerpMarket)
      ],
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(
          this.extraVoltData.hedgingSpotPerpMarket
        )
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
        this.extraVoltData?.powerPerpMarket,
        this.extraVoltData?.hedgingSpotPerpMarket,
      ]
    );
  }
}
