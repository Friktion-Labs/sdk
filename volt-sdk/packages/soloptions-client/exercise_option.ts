import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AnchorProvider } from "@project-serum/anchor";
import {
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "../../src/programs/Soloptions/soloptionsTypes";

interface ExerciseOptionParams {
  exerciserAccount?: Keypair;
  quoteTokenSource: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
  feeDestination: PublicKey;
}

export const exerciseOption = async (
  program: SoloptionsProgram,
  contract: SoloptionsContractWithKey,
  params: ExerciseOptionParams
) => {
  const {
    amount,
    exerciserAccount,
    quoteTokenSource,
    optionTokenSource,
    underlyingTokenDestination,
    feeDestination,
  } = params;

  await program.rpc.optionExercise(new anchor.BN(amount), {
    accounts: {
      contract: contract.key,
      exerciserAuthority: exerciserAccount
        ? exerciserAccount.publicKey
        : (program.provider as AnchorProvider).wallet.publicKey,
      quoteTokenSource,
      contractQuoteTokens: contract.quotePool,
      optionMint: contract.optionMint,
      optionTokenSource: optionTokenSource,
      contractUnderlyingTokens: contract.underlyingPool,
      underlyingTokenDestination,
      underlyingMint: contract.underlyingMint,
      quoteMint: contract.quoteMint,
      feeDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
    signers: exerciserAccount ? [exerciserAccount] : undefined,
  });
};
