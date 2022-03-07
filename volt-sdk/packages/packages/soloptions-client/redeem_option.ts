import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "../../src/programs/Soloptions/soloptionsTypes";

interface RedeemOptionParams {
  redeemerAccount?: Keypair;
  redeemerTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  quoteTokenDestination: PublicKey;
  amount: number;
}

export const redeemOption = async (
  program: SoloptionsProgram,
  contract: SoloptionsContractWithKey,
  params: RedeemOptionParams
) => {
  const {
    redeemerAccount,
    underlyingTokenDestination,
    quoteTokenDestination,
    redeemerTokenSource,
  } = params;
  return await program.rpc.optionRedeem(new anchor.BN(1), {
    accounts: {
      contract: contract.key,
      redeemerAuthority: redeemerAccount
        ? redeemerAccount.publicKey
        : program.provider.wallet.publicKey,
      writerMint: contract.writerMint,
      contractUnderlyingTokens: contract.underlyingPool,
      contractQuoteTokens: contract.quotePool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      quoteTokenDestination,
      underlyingMint: contract.underlyingMint,
      quoteMint: contract.quoteMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    },
    signers: redeemerAccount ? [redeemerAccount] : undefined,
  });
};
