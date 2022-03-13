import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
  PublicKey,
  Signer,
  SystemProgram,
  TransactionInstruction
} from "@solana/web3.js";
import {
  SoloptionsContractWithKey,
  SoloptionsProgram
} from "../../src/programs/Soloptions/soloptionsTypes";
import { getAssociatedTokenAddress } from "../soloptions-common";
import { getProgramAddress } from "./util";

export interface NewContractParams {
  payer?: Signer;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: anchor.BN;
  quoteAmount: anchor.BN;
  expiryTs: number;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
}

export const newContractInstruction = async (
  program: SoloptionsProgram,
  params: NewContractParams
): Promise<{
  ix: TransactionInstruction;
  contract: SoloptionsContractWithKey;
}> => {
  const {
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    mintFeeAccount,
    exerciseFeeAccount,
    expiryTs,
    payer,
  } = params;
  const seeds = [
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    expiryTs,
  ] as const;
  const [contract, contractBump] = await getProgramAddress(
    program,
    "OptionsContract",
    ...seeds
  );
  const [optionMint, optionBump] = await getProgramAddress(
    program,
    "OptionMint",
    ...seeds
  );
  const [writerMint, writerBump] = await getProgramAddress(
    program,
    "WriterMint",
    ...seeds
  );
  const underlyingPool = await getAssociatedTokenAddress(
    underlyingMint,
    contract,
    true
  );
  const quotePool = await getAssociatedTokenAddress(quoteMint, contract, true);

  const extraKeys = SystemProgram.programId;
  const contractStruct = {
    ...params,
    expiryTs: new anchor.BN(expiryTs),
    underlyingAmount: new anchor.BN(params.underlyingAmount),
    quoteAmount: new anchor.BN(params.quoteAmount),
    key: contract,
    underlyingPool,
    quotePool,
    writerMint,
    optionMint,
    contractBump,
    optionBump,
    writerBump,
    extraKey1: extraKeys,
    extraKey2: extraKeys,
    extraInt1: new anchor.BN(0),
    extraInt2: new anchor.BN(0),
    extraBool: false,
  };

  // @ts-ignore
  const newContractIx = program.instruction.newContract(
    params.underlyingAmount,
    params.quoteAmount,
    new anchor.BN(expiryTs),
    contractBump,
    optionBump,
    writerBump,
    {
      accounts: {
        payer: payer ? payer.publicKey : program.provider.wallet.publicKey,
        contract,
        writerMint,
        optionMint,
        quoteMint: quoteMint,
        underlyingMint: underlyingMint,
        quotePool,
        underlyingPool,
        mintFeeAccount: mintFeeAccount,
        exerciseFeeAccount: exerciseFeeAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
    }
  );

  return {
    ix: newContractIx,
    contract: contractStruct,
  };
};

export const newContract = async (
  program: SoloptionsProgram,
  params: NewContractParams
): Promise<SoloptionsContractWithKey> => {
  const {
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    mintFeeAccount,
    exerciseFeeAccount,
    expiryTs,
    payer,
  } = params;
  const seeds = [
    underlyingMint,
    quoteMint,
    underlyingAmount,
    quoteAmount,
    expiryTs,
  ] as const;
  const [contract, contractBump] = await getProgramAddress(
    program,
    "OptionsContract",
    ...seeds
  );
  const [optionMint, optionBump] = await getProgramAddress(
    program,
    "OptionMint",
    ...seeds
  );
  const [writerMint, writerBump] = await getProgramAddress(
    program,
    "WriterMint",
    ...seeds
  );
  const underlyingPool = await getAssociatedTokenAddress(
    underlyingMint,
    contract,
    true
  );
  const quotePool = await getAssociatedTokenAddress(quoteMint, contract, true);

  // @ts-ignore
  await program.rpc.newContract(
    params.underlyingAmount,
    params.quoteAmount,
    new anchor.BN(expiryTs),
    contractBump,
    optionBump,
    writerBump,
    {
      accounts: {
        payer: payer ? payer.publicKey : program.provider.wallet.publicKey,
        contract,
        writerMint,
        optionMint,
        quoteMint: quoteMint,
        underlyingMint: underlyingMint,
        quotePool,
        underlyingPool,
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
    expiryTs: new anchor.BN(expiryTs),
    underlyingAmount: new anchor.BN(params.underlyingAmount),
    quoteAmount: new anchor.BN(params.quoteAmount),
    key: contract,
    underlyingPool,
    quotePool,
    writerMint,
    optionMint,
    contractBump,
    optionBump,
    writerBump,
    extraKey1: extraKeys,
    extraKey2: extraKeys,
    extraInt1: new anchor.BN(0),
    extraInt2: new anchor.BN(0),
    extraBool: false,
  };
};
