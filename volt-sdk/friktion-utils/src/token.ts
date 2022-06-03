import type { AnchorProvider } from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import type BN from "bn.js";

export async function createMintInstructions(
  provider: AnchorProvider,
  authority: PublicKey,
  mint: PublicKey,
  decimals = 6
): Promise<TransactionInstruction[]> {
  const instructions = [
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      space: MintLayout.span,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        MintLayout.span as number
      ),
      programId: TOKEN_PROGRAM_ID,
    }),
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      decimals,
      authority,
      null
    ),
  ];
  return instructions;
}

export async function createMintAndVault(
  provider: AnchorProvider,
  amount: BN,
  owner?: PublicKey,
  decimals?: number
): Promise<[PublicKey, PublicKey]> {
  if (owner === undefined) {
    owner = provider.wallet.publicKey;
  }
  const mint = Keypair.generate();
  const vault = Keypair.generate();
  const tx = new Transaction();
  tx.add(
    ...(await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      mint.publicKey,
      decimals
    )),
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: vault.publicKey,
      space: 165,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        165
      ),
      programId: TOKEN_PROGRAM_ID,
    }),
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      vault.publicKey,
      owner
    ),
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      vault.publicKey,
      provider.wallet.publicKey,
      [],
      amount
    )
  );
  await provider.sendAndConfirm(tx, [mint, vault]);
  return [mint.publicKey, vault.publicKey];
}
