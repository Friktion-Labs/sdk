/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";

import { newContractInstruction } from "../../../packages/soloptions-client";
import { SOLOPTIONS_FEE_OWNER } from "../..";
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

export const convertSoloptionsContractToOptionMarket = (
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

  const optionMarket: GenericOptionsContractWithKey =
    convertSoloptionsContractToOptionMarket({
      ...soloptionsContract,
      key: key,
    });

  return optionMarket;
};

export const createSoloptionsContractInstruction = async (
  program: SoloptionsProgram,
  underlyingMint: PublicKey,
  quoteMint: PublicKey,
  underlyingAmountPerContract: number,
  quoteAmountPerContract: number,
  expiry: number
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { ix: createContractIx, contract } = await newContractInstruction(
    program,
    {
      underlyingMint: underlyingMint,
      quoteMint: quoteMint,
      expiryTs: expiry,
      underlyingAmount: new BN(underlyingAmountPerContract),
      quoteAmount: new BN(quoteAmountPerContract),
      mintFeeAccount: await getAssociatedTokenAddress(
        underlyingMint,
        SOLOPTIONS_FEE_OWNER
      ),
      exerciseFeeAccount: await getAssociatedTokenAddress(
        quoteMint,
        SOLOPTIONS_FEE_OWNER
      ),
    }
  );
  return {
    contract,
    createContractIx,
  };
};
