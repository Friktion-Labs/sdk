/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import type { GenericOptionsContractWithKey } from "../..";
import type {
  SpreadsContract,
  SpreadsContractWithKey,
  SpreadsProgram,
} from "./spreadsTypes";

export const convertSpreadsContractToOptionMarket = (
  spreadsContract: SpreadsContractWithKey
): GenericOptionsContractWithKey => {
  return {
    optionMint: spreadsContract.optionMint,
    writerTokenMint: spreadsContract.writerMint,
    underlyingAssetMint: spreadsContract.underlyingMint,
    quoteAssetMint: spreadsContract.quoteMint,
    underlyingAssetPool: spreadsContract.underlyingPool,
    quoteAssetPool: spreadsContract.underlyingPool,
    mintFeeAccount: spreadsContract.mintFeeAccount,
    exerciseFeeAccount: spreadsContract.exerciseFeeAccount,
    underlyingAmountPerContract: new BN(0),
    quoteAmountPerContract: new BN(0),
    expirationUnixTimestamp: spreadsContract.expiryTs,
    expired: false,
    key: spreadsContract.key,
    claimablePool: spreadsContract.claimablePool,
    underlyingPool: spreadsContract.underlyingPool,
    bumpSeed: spreadsContract.contractBump,
    protocol: "Spreads",
    rawContract: spreadsContract,
  };
};

export const getSpreadsContractByKey = async (
  program: SpreadsProgram,
  key: PublicKey
): Promise<SpreadsContract> => {
  const spreadsContract: SpreadsContract =
    await program.account.spreadsContract.fetch(key);
  return spreadsContract;
};

export const getSpreadsContractByKeyOrNull = async (
  program: SpreadsProgram,
  key: PublicKey
): Promise<SpreadsContractWithKey | null> => {
  let contract: SpreadsContract | null = null;
  try {
    contract = await getSpreadsContractByKey(program, key);
  } catch (err) {
    console.log(err);
    return null;
  }

  if (!contract) return null;

  return {
    ...contract,
    key: key,
  };
};
