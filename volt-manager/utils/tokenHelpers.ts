import {
  SystemProgram,
  Transaction,
  Account,
  Connection,
  PublicKey,
  Signer,
} from "@solana/web3.js";
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import BN from "bn.js";

export const WRAPPED_SOL_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export async function initializeTokenAccountTx({
  connection,
  extraLamports = 0,
  payerKey,
  mintPublicKey,
  owner,
  rentBalance,
}: {
  connection: Connection;
  extraLamports?: number;
  payerKey: PublicKey;
  mintPublicKey: PublicKey;
  owner: PublicKey;
  rentBalance: number;
}): Promise<{ transaction: Transaction; newTokenAccount: Account }> {
  const newAccount = new Account();
  const transaction = new Transaction();

  let _rentBalance = rentBalance;
  if (!rentBalance) {
    _rentBalance = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    );
  }

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payerKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: _rentBalance + extraLamports,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  transaction.add(
    createInitializeAccountInstruction(
      newAccount.publicKey,
      mintPublicKey,
      owner
    )
  );

  return { transaction, newTokenAccount: newAccount };
}

export const getAccountBalance = async (
  connection: Connection,
  tokenAccount: PublicKey
): Promise<BN> => {
  const account = await getAccount(connection, tokenAccount);
  return new BN(account.amount.toString());
};

export const getMintSupply = async (
  connection: Connection,
  vaultMint: PublicKey
): Promise<anchor.BN> => {
  return new BN((await getMint(connection, vaultMint)).supply.toString());
};

export const createTokenAccount = async (
  mint: PublicKey,
  walletPubKey: PublicKey
): Promise<{
  tokenDest: PublicKey;
  createTokenAccountIx: anchor.web3.TransactionInstruction;
}> => {
  const tokenDest = await getAssociatedTokenAddress(mint, walletPubKey);

  const createTokenAccountIx = createAssociatedTokenAccountInstruction(
    walletPubKey,
    tokenDest,
    walletPubKey,
    mint
  );

  return { tokenDest, createTokenAccountIx };
};
