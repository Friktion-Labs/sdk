/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { PublicKey } from "@solana/web3.js";

import type { OptionMarketWithKey } from "../Volt/voltTypes";
import type {
  InertiaContract,
  InertiaContractWithKey,
  InertiaProgram,
} from "./inertiaTypes";

export const getInertiaContractByKey = async (
  program: InertiaProgram,
  key: PublicKey
): Promise<InertiaContract> => {
  const optionsContract: InertiaContract =
    await program.account.optionsContract.fetch(key);
  return optionsContract;
};

export const convertInertiaContractToOptionMarket = (
  inertiaContract: InertiaContractWithKey
): OptionMarketWithKey => {
  return {
    optionMint: inertiaContract.optionMint,
    writerTokenMint: inertiaContract.writerMint,
    underlyingAssetMint: inertiaContract.underlyingMint,
    quoteAssetMint: inertiaContract.quoteMint,
    underlyingAssetPool: inertiaContract.underlyingPool,
    // quoteAssetPool not used
    quoteAssetPool: inertiaContract.underlyingPool,
    mintFeeAccount: inertiaContract.mintFeeAccount,
    exerciseFeeAccount: inertiaContract.exerciseFeeAccount,
    underlyingAmountPerContract: inertiaContract.underlyingAmount,
    quoteAmountPerContract: inertiaContract.quoteAmount,
    expirationUnixTimestamp: inertiaContract.expiryTs,
    expired: false,
    key: inertiaContract.key,
    claimablePool: inertiaContract.claimablePool,
    underlyingPool: inertiaContract.underlyingPool,
    bumpSeed: inertiaContract.contractBump,
    protocol: "Inertia",
    rawContract: inertiaContract,
  };
};

export const getInertiaMarketByKey = async (
  program: InertiaProgram,
  key: PublicKey
): Promise<OptionMarketWithKey | null> => {
  let inertiaContract: InertiaContract;
  try {
    inertiaContract = await getInertiaContractByKey(
      program as unknown as InertiaProgram,
      key
    );
  } catch (err) {
    console.log(err);
    return null;
  }

  const optionMarket: OptionMarketWithKey =
    convertInertiaContractToOptionMarket({
      ...inertiaContract,
      key: key,
    });

  return optionMarket;
};

export const getInertiaContractByKeyOrNull = async (
  program: InertiaProgram,
  key: PublicKey
): Promise<InertiaContractWithKey | null> => {
  let contract: InertiaContract | null = null;
  try {
    contract = await getInertiaContractByKey(
      program as unknown as InertiaProgram,
      key
    );
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
