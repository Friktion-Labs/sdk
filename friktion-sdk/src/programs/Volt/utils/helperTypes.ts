// This file contains types that do not match anything that is code generated.

export type NetworkName = "devnet" | "mainnet-beta" | "testnet" | "localnet";

export const OptionTypeValues = {
  Call: { call: {} },
  Put: { put: {} },
};

export const DovParticipantTypeValues = {
  OptionBuyer: { optionBuyer: {} },
  OptionSeller: { optionSeller: {} },
};

// serum types
export const OrderTypeValues = {
  Limit: { limit: {} },
  ImmediateOrCancel: { immediateOrCancel: {} },
  PostOnly: { postOnly: {} },
};

export const SelfTradeBehaviorValues = {
  DecrementTake: { decrementTake: {} },
  CancelProvide: { cancelProvide: {} },
  AbortTransaction: { abortTransaction: {} },
};

export type OptionsContractDetails = {
  mintName: string | undefined;
  contractSize: number;
  strike: number;
  // in milliseconds unix timestamp
  expiry: number;
  isCall: boolean;
};

export type AuctionResult = {
  globalId: string;
  product: string;
  startEpoch: number;
  endEpoch: number;
  balanceStart: number;
  balancePnl: number;
  realizedPnl: number;
  spotPriceAtAuctionEnd: number;
  txid: string;
};

export type CrabResult = {
  delta: string;
  iv: number;
  refPrice: number;
  profitRangeLow: number;
  profitRangeHigh: number;
  funding24h: number;
};
