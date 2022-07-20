//// ORACLES ////

import type {
  EntropyCache,
  EntropyClient,
  EntropyGroup,
  PerpMarket,
  RootBank,
} from "@friktion-labs/entropy-client";
import type NodeBank from "@friktion-labs/entropy-client";
import type { Connection, PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import Decimal from "decimal.js";

import type { PerpProtocol } from "../../../constants";
import { ENTROPY_PROGRAM_ID, MANGO_PROGRAM_ID } from "../../../constants";

//// PERP PROTOCOLS ////

export const getProgramIdForPerpProtocol = (
  perpProtocol: PerpProtocol
): PublicKey => {
  return perpProtocol === "Entropy" ? ENTROPY_PROGRAM_ID : MANGO_PROGRAM_ID;
};

export const getPerpProtocolForKey = async (
  connection: Connection,
  key: PublicKey
): Promise<PerpProtocol> => {
  const accountInfo = await connection.getAccountInfo(key);
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
};

//// ORACLES ////

export const oraclePriceForTokenIndex = (
  entropyGroup: EntropyGroup,
  entropyCache: EntropyCache,
  tokenIndex: number
): Decimal => {
  const oraclePrice = entropyGroup.getPrice(tokenIndex, entropyCache);
  if (oraclePrice === undefined)
    throw new Error("oracle price retrieved as undefined");
  return new Decimal(oraclePrice.toString());
};

export const oraclePriceForMint = (
  entropyGroup: EntropyGroup,
  entropyCache: EntropyCache,
  mint: PublicKey
): Decimal => {
  const quoteInfo = entropyGroup.getQuoteTokenInfo();
  if (quoteInfo.mint.toString() === mint.toString()) {
    return new Decimal(1.0);
  } else {
    const tokenIndex = entropyGroup.getTokenIndex(mint);
    return oraclePriceForTokenIndex(entropyGroup, entropyCache, tokenIndex);
  }
};

//// GET PRICE BANDS ////

export const getBidAskLimitsForEntropy = async (
  connection: Connection,
  perpMarket: PerpMarket,
  clientBidPrice?: BN,
  clientAskPrice?: BN
): Promise<{
  bid: BN;
  ask: BN;
}> => {
  if (clientAskPrice === undefined) {
    const asks = await perpMarket.loadAsks(connection);
    const bestAsk = asks.getBest();

    if (bestAsk === undefined) {
      throw new Error("no ask exists on the orderbook");
    }

    clientAskPrice = perpMarket.uiToNativePriceQuantity(
      bestAsk.price,
      bestAsk.size
    )[0];
  }

  if (clientBidPrice === undefined) {
    const bids = await perpMarket.loadBids(connection);
    const bestBid = bids.getBest();
    if (bestBid === undefined) {
      // throw new Error("no bid exists on the orderbook");
      clientBidPrice = clientAskPrice;
    } else {
      console.log("best bid = ", bestBid.price);

      clientBidPrice = perpMarket.uiToNativePriceQuantity(
        bestBid.price,
        bestBid.size
      )[0];
    }
  }

  console.log(
    "client bid price = ",
    clientBidPrice?.toString(),
    ", client ask price = ",
    clientAskPrice?.toString()
  );

  return {
    bid: clientBidPrice,
    ask: clientAskPrice,
  };
};

export const getGroupAndBanks = async (
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
}> => {
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
    if (mint.toString() === entropyGroup.getQuoteTokenInfo().mint.toString()) {
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
};
