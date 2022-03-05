import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import {
  PublicKey,
  Signer,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { InertiaSDK } from "../../src";
import {
  InertiaContractWithKey,
  InertiaProgram,
} from "../../src/programs/Inertia/inertiaTypes";

export interface NewContractParams {
  payer: Signer;
  oracleAi: PublicKey;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: anchor.BN;
  quoteAmount: anchor.BN;
  expiryTs: anchor.BN;
  isCall: boolean;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
}

export interface NewContractIxParams {
  payer: PublicKey;
  oracleAi: PublicKey;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: anchor.BN;
  quoteAmount: anchor.BN;
  expiryTs: anchor.BN;
  isCall: boolean;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
}

export const newContractInstruction = async (
  program: InertiaProgram,
  params: NewContractIxParams
): Promise<[InertiaContractWithKey, TransactionInstruction]> => {
  const {
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    mintFeeAccount,
    exerciseFeeAccount,
    expiryTs,
    isCall,
    payer,
    oracleAi,
  } = params;
  const seeds = [
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    expiryTs,
    isCall,
  ] as const;
  const [contract, contractBump] = await InertiaSDK.getProgramAddress(
    program,
    "OptionsContract",
    ...seeds
  );
  const [optionMint, optionBump] = await InertiaSDK.getProgramAddress(
    program,
    "OptionMint",
    ...seeds
  );
  const [writerMint, writerBump] = await InertiaSDK.getProgramAddress(
    program,
    "WriterMint",
    ...seeds
  );
  const [underlyingPool, underlyingPoolBump] =
    await InertiaSDK.getProgramAddress(program, "UnderlyingPool", ...seeds);
  const [claimablePool, claimablePoolBump] = await InertiaSDK.getProgramAddress(
    program,
    "ClaimablePool",
    ...seeds
  );

  // @ts-ignore
  const newContractIx = program.instruction.newContract(
    params.underlyingAmount,
    params.quoteAmount,
    expiryTs,
    isCall ? new u64(1) : new u64(0),
    contractBump,
    optionBump,
    writerBump,
    underlyingPoolBump,
    claimablePoolBump,
    {
      accounts: {
        adminKey: payer,
        payer,
        oracleAi,
        contract,
        writerMint,
        optionMint,
        quoteMint: quoteMint,
        underlyingMint: underlyingMint,
        underlyingPool,
        claimablePool,
        mintFeeAccount: mintFeeAccount,
        exerciseFeeAccount: exerciseFeeAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
    }
  );

  const extraKeys = SystemProgram.programId;
  const inertiaContractWithKey: InertiaContractWithKey = {
    ...params,
    adminKey: payer,
    oracleAi,
    expiryTs,
    isCall: isCall ? new u64(1) : new u64(0),
    underlyingAmount: new anchor.BN(params.underlyingAmount),
    quoteAmount: new anchor.BN(params.quoteAmount),
    key: contract,
    underlyingPool,
    claimablePool,
    writerMint,
    optionMint,
    contractBump,
    optionBump,
    writerBump,
    underlyingPoolBump,
    wasSettleCranked: false,
    claimablePoolBump,
    extraKey1: extraKeys,
    extraInt1: new anchor.BN(0),
    extraInt2: new anchor.BN(0),
  };

  return [inertiaContractWithKey, newContractIx];
};

export const newContract = async (
  program: InertiaProgram,
  params: NewContractParams
): Promise<InertiaContractWithKey> => {
  const {
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    mintFeeAccount,
    exerciseFeeAccount,
    expiryTs,
    isCall,
    payer,
    oracleAi,
  } = params;
  const seeds = [
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    expiryTs,
    isCall,
  ] as const;
  const [contract, contractBump] = await InertiaSDK.getProgramAddress(
    program,
    "OptionsContract",
    ...seeds
  );
  const [optionMint, optionBump] = await InertiaSDK.getProgramAddress(
    program,
    "OptionMint",
    ...seeds
  );
  const [writerMint, writerBump] = await InertiaSDK.getProgramAddress(
    program,
    "WriterMint",
    ...seeds
  );
  const [underlyingPool, underlyingPoolBump] =
    await InertiaSDK.getProgramAddress(program, "UnderlyingPool", ...seeds);
  const [claimablePool, claimablePoolBump] = await InertiaSDK.getProgramAddress(
    program,
    "ClaimablePool",
    ...seeds
  );

  const admin = payer ? payer.publicKey : program.provider.wallet.publicKey;

  // @ts-ignore
  await program.rpc.newContract(
    params.underlyingAmount,
    params.quoteAmount,
    expiryTs,
    isCall ? new u64(1) : new u64(0),
    contractBump,
    optionBump,
    writerBump,
    underlyingPoolBump,
    claimablePoolBump,
    {
      accounts: {
        adminKey: admin,
        payer: admin,
        oracleAi,
        contract,
        writerMint,
        optionMint,
        quoteMint: quoteMint,
        underlyingMint: underlyingMint,
        underlyingPool,
        claimablePool,
        mintFeeAccount: mintFeeAccount,
        exerciseFeeAccount: exerciseFeeAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers: payer ? [payer] : undefined,
    }
  );

  const extraKeys = SystemProgram.programId;
  return {
    ...params,
    adminKey: admin,
    oracleAi,
    expiryTs,
    isCall: isCall ? new u64(1) : new u64(0),
    underlyingAmount: new anchor.BN(params.underlyingAmount),
    quoteAmount: new anchor.BN(params.quoteAmount),
    key: contract,
    underlyingPool,
    claimablePool,
    writerMint,
    optionMint,
    contractBump,
    optionBump,
    writerBump,
    underlyingPoolBump,
    wasSettleCranked: false,
    claimablePoolBump,
    extraKey1: extraKeys,
    extraInt1: new anchor.BN(0),
    extraInt2: new anchor.BN(0),
  };
};
