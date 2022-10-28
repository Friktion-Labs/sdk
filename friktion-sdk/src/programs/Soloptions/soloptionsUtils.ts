import type { PublicKey } from "@solana/web3.js";

import type { GenericOptionsContractWithKey } from "../Volt/voltTypes";
import type {
  SoloptionsContract,
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "./soloptionsTypes";

export const getSoloptionsContractByKey = async (
  program: SoloptionsProgram,
  key: PublicKey
): Promise<SoloptionsContract> => {
  const optionsContract: SoloptionsContract =
    await program.account.optionsContract.fetch(key);
  return optionsContract;
};

export const convertSoloptionsContractToGenericOptionsContract = (
  soloptionsContract: SoloptionsContractWithKey
): GenericOptionsContractWithKey => {
  return {
    optionMint: soloptionsContract.optionMint,
    writerTokenMint: soloptionsContract.writerMint,
    underlyingAssetMint: soloptionsContract.underlyingMint,
    quoteAssetMint: soloptionsContract.quoteMint,
    underlyingAssetPool: soloptionsContract.underlyingPool,
    quoteAssetPool: soloptionsContract.quotePool,
    mintFeeAccount: soloptionsContract.mintFeeAccount,
    exerciseFeeAccount: soloptionsContract.exerciseFeeAccount,
    underlyingAmountPerContract: soloptionsContract.underlyingAmount,
    quoteAmountPerContract: soloptionsContract.quoteAmount,
    expirationUnixTimestamp: soloptionsContract.expiryTs,
    expired: false,
    claimablePool: soloptionsContract.quotePool,
    underlyingPool: soloptionsContract.underlyingPool,
    key: soloptionsContract.key,
    bumpSeed: soloptionsContract.contractBump,
    rawContract: soloptionsContract,
    protocol: "Soloptions",
  };
};

export const getSoloptionsConractByKey = async (
  program: SoloptionsProgram,
  key: PublicKey
): Promise<GenericOptionsContractWithKey | null> => {
  let soloptionsContract: SoloptionsContract;
  try {
    soloptionsContract = await getSoloptionsContractByKey(
      program as unknown as SoloptionsProgram,
      key
    );
  } catch (err) {
    console.log(err);
    return null;
  }

  const optionsContract: GenericOptionsContractWithKey =
    convertSoloptionsContractToGenericOptionsContract({
      ...soloptionsContract,
      key: key,
    });

  return optionsContract;
};
