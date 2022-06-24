import type { AnchorProvider } from "@project-serum/anchor";
import {
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAccount,
  getMint,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";

export async function getNormFactorForMint(
  provider: AnchorProvider,
  mint: PublicKey
): Promise<BN> {
  return new BN(
    new Decimal(10)
      .pow((await getMint(provider.connection, mint)).decimals)
      .toString()
  );
}
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
        MintLayout.span
      ),
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mint, decimals, authority, authority),
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
    createInitializeAccountInstruction(vault.publicKey, mint.publicKey, owner),
    createMintToInstruction(
      mint.publicKey,
      vault.publicKey,
      provider.wallet.publicKey,
      BigInt(amount.toString()),
      []
    )
  );
  await provider.sendAndConfirm(tx, [mint, vault]);
  return [mint.publicKey, vault.publicKey];
}

export const getBalance = async (
  connection: Connection,
  account: PublicKey
): Promise<BN> => {
  return await getBalanceOrZero(connection, account);
};

export const getBalanceOrZero = async (
  connection: Connection,
  account: PublicKey
): Promise<BN> => {
  try {
    return new BN((await getAccount(connection, account)).amount.toString());
  } catch (err) {
    return new BN(0);
  }
};

export async function getAccountBalance(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<BN> {
  const account = await getAccount(connection, tokenAccount);
  const balance = new BN(account.amount.toString());

  return balance;
}

export async function getAccountBalanceOrZero(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<BN> {
  const { balance } = await getAccountBalanceOrZeroStruct(
    connection,
    tokenAccount
  );
  return balance;
}
export async function getAccountBalanceOrZeroStruct(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<{ balance: BN }> {
  try {
    const res = await getAccountBalance(connection, tokenAccount);

    return { balance: res };
  } catch (err) {
    return { balance: new BN(0) };
  }
}

export async function getMintSupply(
  connection: Connection,
  vaultMint: PublicKey
): Promise<Decimal> {
  try {
    const mintInfo = await getMint(connection, vaultMint);
    return new Decimal(mintInfo.supply.toString());
  } catch (e) {
    console.error(e);
    return new Decimal(0);
  }
}

export async function getMintSupplyOrZero(
  connection: Connection,
  vaultMint: PublicKey
): Promise<Decimal> {
  try {
    return await getMintSupply(connection, vaultMint);
  } catch (err) {
    console.log(err);
    return new Decimal(0);
  }
}
