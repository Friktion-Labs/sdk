import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  SoloptionsContract,
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "../../src/programs/Soloptions/soloptionsTypes";

export interface WriteOptionParams {
  writerAccount?: Keypair;
  writerUnderlyingFundingTokens: PublicKey;
  writerTokenDestination: PublicKey;
  optionTokenDestination: PublicKey;
  amount: number;
  feeDestination: PublicKey;
}

export const writeOption = async (
  program: SoloptionsProgram,
  contract: SoloptionsContractWithKey,
  params: WriteOptionParams
) => {
  const {
    amount,
    writerAccount,
    writerUnderlyingFundingTokens,
    writerTokenDestination,
    optionTokenDestination,
    feeDestination,
  } = params;

  console.log("fee destination = ", feeDestination.toString());
  return await program.rpc.optionWrite(new anchor.BN(amount), {
    accounts: {
      contract: contract.key,
      optionMint: contract.optionMint,
      quoteMint: contract.quoteMint,
      optionTokenDestination,
      underlyingMint: contract.underlyingMint,
      underlyingPool: contract.underlyingPool,
      writerMint: contract.writerMint,
      writerTokenDestination,
      writerAuthority: writerAccount
        ? writerAccount.publicKey
        : program.provider.wallet.publicKey,
      userUnderlyingFundingTokens: writerUnderlyingFundingTokens,

      feeDestination,
      clock: SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    signers: writerAccount ? [writerAccount] : undefined,
  });
};
