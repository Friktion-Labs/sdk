import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  InertiaContractWithKey,
  InertiaProgram,
} from "../../src/programs/Inertia/inertiaTypes";
import { getProgramAddress } from "./util";

interface ExerciseOptionParams {
  exerciserAccount?: Keypair;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export const exerciseOption = async (
  program: InertiaProgram,
  contract: InertiaContractWithKey,
  params: ExerciseOptionParams
) => {
  const {
    amount,
    exerciserAccount,
    optionTokenSource,
    underlyingTokenDestination,
  } = params;

  const seeds = [
    contract.underlyingMint,
    contract.quoteMint,
    contract.underlyingAmount,
    contract.quoteAmount,
    contract.expiryTs,
    contract.isCall,
  ] as const;

  const [claimablePool, claimablePoolBump] = await getProgramAddress(
    program,
    "ClaimablePool",
    ...seeds
  );

  await program.rpc.optionExercise(new anchor.BN(amount), {
    accounts: {
      contract: contract.key,
      exerciserAuthority: exerciserAccount
        ? exerciserAccount.publicKey
        : program.provider.wallet.publicKey,
      optionMint: contract.optionMint,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      claimablePool,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
    signers: exerciserAccount ? [exerciserAccount] : undefined,
  });
};
