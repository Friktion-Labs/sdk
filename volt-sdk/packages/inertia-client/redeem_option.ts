import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Keypair, PublicKey } from "@solana/web3.js";

import type {
  InertiaContractWithKey,
  InertiaProgram,
} from "../../src/programs/Inertia/inertiaTypes";

interface RedeemOptionParams {
  redeemerAccount?: Keypair;
  redeemerTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export const redeemOption = async (
  program: InertiaProgram,
  contract: InertiaContractWithKey,
  params: RedeemOptionParams
) => {
  const { redeemerAccount, underlyingTokenDestination, redeemerTokenSource } =
    params;
  return await program.rpc.optionRedeem(new anchor.BN(1), {
    accounts: {
      contract: contract.key,
      redeemerAuthority: redeemerAccount
        ? redeemerAccount.publicKey
        : (program.provider as anchor.AnchorProvider).wallet.publicKey,
      writerMint: contract.writerMint,
      contractUnderlyingTokens: contract.underlyingPool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    },
    signers: redeemerAccount ? [redeemerAccount] : undefined,
  });
};
