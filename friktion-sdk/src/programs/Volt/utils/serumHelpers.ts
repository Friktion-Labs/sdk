import { BN } from "@friktion-labs/anchor";
import type { Market, Middleware } from "@project-serum/serum";
import {
  Logger,
  MarketProxyBuilder,
  OpenOrdersPda,
  ReferralFees,
} from "@project-serum/serum";
import type {
  Connection,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { SERUM_PROGRAM_IDS } from "../../../constants";

import type { ConnectedShortOptionsVoltSDK } from "../ConnectedShortOptionsVoltSDK";
import { ShortOptionsVoltSDK } from "../ShortOptionsVoltSDK";

/**
 * Create a MarketProxy
 *
 * @param program - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */

export const marketLoaderFunction = (
  sdk: ShortOptionsVoltSDK | ConnectedShortOptionsVoltSDK,
  optionMarketKey: PublicKey,
  whitelistTokenAccountKey: PublicKey
) => {
  return async (serumMarketKeyGiven: PublicKey) => {
    const { serumMarketKey, marketAuthorityBump } =
      await sdk.getMarketAndAuthorityInfo(optionMarketKey);

    console.log(
      "serum markets: ",
      serumMarketKey.toString(),
      " ",
      serumMarketKeyGiven.toString()
    );
    if (serumMarketKey.toString() !== serumMarketKeyGiven.toString())
      throw new Error(
        "serum market should equal the PDA based on current option"
      );

    const [auctionMetadataKey] =
      await ShortOptionsVoltSDK.findAuctionMetadataAddress(sdk.voltKey);

    return new MarketProxyBuilder()
      .middleware(
        new OpenOrdersPda({
          proxyProgramId: sdk.sdk.programs.Volt.programId,
          dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
        })
      )
      .middleware(new ReferralFees())
      .middleware(
        new Validation(
          auctionMetadataKey,
          optionMarketKey,
          whitelistTokenAccountKey,
          marketAuthorityBump
        )
      )
      .middleware(new Logger())
      .load({
        connection: sdk.sdk.readonlyProvider.connection,
        market: serumMarketKey,
        dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
        proxyProgramId: sdk.sdk.programs.Volt.programId,
        options: { commitment: "recent" },
      });
  };
};

/**
 * Create a MarketProxy
 *
 * @param middlewareProgram - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
export const marketLoader = async (
  sdk: ShortOptionsVoltSDK | ConnectedShortOptionsVoltSDK,
  optionMarketKey: PublicKey,
  serumMarketKey: PublicKey,
  whitelistTokenAccountKey: PublicKey
) => {
  return await marketLoaderFunction(
    sdk,
    optionMarketKey,
    whitelistTokenAccountKey
  )(serumMarketKey);
};

export const getVaultOwnerAndNonce = async (
  marketPublicKey: PublicKey,
  dexProgramId: PublicKey
) => {
  const nonce = new BN(0);
  while (nonce.toNumber() < 255) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        dexProgramId
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
  throw new Error("Unable to find nonce");
};

// b"open-orders"
export const openOrdersSeed = Buffer.from([
  111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
]);

export class Validation implements Middleware {
  auctionMetadataKey: PublicKey;
  optionMarketKey: PublicKey;
  whitelistKey: PublicKey;
  marketAuthorityBump: number;

  constructor(
    auctionMetadataKey: PublicKey,
    optionMarketKey: PublicKey,
    whitelistKey: PublicKey,
    marketAuthorityBump: number
  ) {
    this.auctionMetadataKey = auctionMetadataKey;
    this.optionMarketKey = optionMarketKey;
    this.marketAuthorityBump = marketAuthorityBump;
    this.whitelistKey = whitelistKey;
  }

  initOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([0]), ix.data]);
    this.addPdaKeys(ix);
  }
  newOrderV3(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([1]), ix.data]);
    this.addPdaKeys(ix);
  }
  cancelOrderV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([2]), ix.data]);
  }
  cancelOrderByClientIdV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([3]), ix.data]);
  }
  settleFunds(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([4]), ix.data]);
  }
  closeOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([5]), ix.data]);
  }
  prune(ix: TransactionInstruction) {
    // prepend a discriminator and the marketAuthorityBump
    const bumpBuffer = new BN(this.marketAuthorityBump).toArrayLike(
      Buffer,
      "le",
      1
    );
    ix.data = Buffer.concat([Buffer.from([6]), bumpBuffer, ix.data]);
    // prepend the optionMarket key

    this.addPdaKeys(ix);
  }

  consumeEvents(_ix: TransactionInstruction) {
    throw new Error("Not implemented");
  }
  consumeEventsPermissioned(_ix: TransactionInstruction) {
    throw new Error("Not implemented");
  }

  addPdaKeys(ix: TransactionInstruction) {
    ix.keys = [
      { pubkey: this.whitelistKey, isWritable: false, isSigner: false },
      { pubkey: this.optionMarketKey, isWritable: false, isSigner: false },
      { pubkey: this.auctionMetadataKey, isWritable: false, isSigner: false },
      ...ix.keys,
    ];
    return ix;
  }
}

export const getMarketAndAuthorityInfo = async (
  sdk: ShortOptionsVoltSDK,
  optionMarketKey: PublicKey
) => {
  return await sdk.getMarketAndAuthorityInfo(optionMarketKey);
};

export const createFirstSetOfAccounts = async ({
  connection,
  userKey,
  dexProgramId,
}: {
  connection: Connection;
  userKey: PublicKey;
  dexProgramId: PublicKey;
}): Promise<{
  instructions: TransactionInstruction[];
  eventQueue: Keypair;
  bids: Keypair;
  asks: Keypair;
  signers: Signer[];
}> => {
  const eventQueue = new Keypair();
  const bids = new Keypair();
  const asks = new Keypair();

  const instructions: TransactionInstruction[] = [
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: eventQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: bids.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: asks.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
  ];

  const signers = [eventQueue, bids, asks];

  return { instructions, eventQueue, bids, asks, signers };
};

export const getBidAskLimitsForSpot = async (
  connection: Connection,
  serumMarket: Market,
  clientBidPrice?: BN,
  clientAskPrice?: BN
): Promise<{
  bid: BN;
  ask: BN;
  bidSize: BN;
  askSize: BN;
}> => {
  let bidSize: BN = new BN(0);
  let askSize: BN = new BN(0);
  if (!clientAskPrice) {
    const asks = await serumMarket.loadAsks(connection);
    console.log("asks = ", asks.getL2(10));
    const bestAsk = asks.getL2(10)[0];
    const bestAskPrice = bestAsk?.[2];
    const bestAskSize = bestAsk?.[3];

    if (bestAskPrice === undefined || bestAskSize === undefined) {
      throw new Error("no ask exists on the orderbook");
    }
    clientAskPrice = bestAskPrice;
    askSize = bestAskSize;
  }

  if (!clientBidPrice) {
    const bids = await serumMarket.loadBids(connection);
    console.log("bids = ", bids.getL2(10));
    const bestBid = bids.getL2(10)[0];
    const bestBidPrice = bestBid?.[2];
    const bestBidSize = bestBid?.[3];
    if (bestBidPrice === undefined || bestBidSize === undefined) {
      // throw new Error("no bid exists on the orderbook");
      clientBidPrice = clientAskPrice;
    } else {
      clientBidPrice = bestBidPrice;
      bidSize = bestBidSize;
    }
  }

  console.log(
    "client bid price = ",
    clientBidPrice.toString(),
    ", client ask price = ",
    clientAskPrice.toString()
  );

  return {
    bid: clientBidPrice,
    ask: clientAskPrice,
    bidSize: bidSize ?? new BN(0),
    askSize: askSize ?? new BN(0),
  };
};

export const getVaultOwnerAndNonceForSpot = async (market: Market) => {
  const nonce = new BN(0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [market.publicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        SERUM_PROGRAM_IDS.Mainnet
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
};
export const getSerumMarketAccountsWithQueues = async (market: Market) => {
  return {
    ...(await getSerumMarketAccountsForSettleFunds(market)),
    ...{
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestQueue: market._decoded.requestQueue as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      eventQueue: market._decoded.eventQueue as PublicKey,
      bids: market.bidsAddress,
      asks: market.asksAddress,
    },
  };
};

export const getSerumMarketAccountsForSettleFunds = async (market: Market) => {
  const [vaultOwner] = await getVaultOwnerAndNonce(
    market.address,
    market.programId
  );

  return {
    dexProgram: market.programId,

    market: market.address,

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    coinVault: market._decoded.baseVault as PublicKey,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pcVault: market._decoded.quoteVault as PublicKey,

    serumVaultSigner: vaultOwner as PublicKey,
  };
};
