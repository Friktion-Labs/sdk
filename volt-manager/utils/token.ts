import {
  AccountLayout,
  createInitializeAccountInstruction,
  RawAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { CreateNewTokenAccountResponse, TokenAccount } from "./types";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const createAssociatedTokenAccountInstruction = async ({
  payer,
  owner,
  mintPublicKey,
}: {
  payer: PublicKey;
  owner: PublicKey;
  mintPublicKey: PublicKey;
}): Promise<[TransactionInstruction, PublicKey]> => {
  const [associatedTokenPublicKey] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPublicKey.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );
  const ix = new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenPublicKey, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mintPublicKey, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  });

  return [ix, associatedTokenPublicKey];
};

export const WRAPPED_SOL_ADDRESS =
  "So11111111111111111111111111111111111111112";

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

export const getHighestAccount = (
  accounts: TokenAccount[]
): TokenAccount | null => {
  if (!accounts || accounts.length === 0) return null;
  if (accounts.length === 1) return accounts[0];
  return accounts.sort((a, b) => b.amount - a.amount)[0];
};

const convertAccountInfoToLocalStruct = (
  _accountInfo: RawAccount,
  pubkey: PublicKey
): TokenAccount => {
  const amountBuffer = Buffer.from(_accountInfo.amount as any);
  const amount = amountBuffer.readUIntLE(0, 6);
  return {
    amount,
    mint: new PublicKey(_accountInfo.mint),
    // public key for the specific token account (NOT the wallet)
    pubKey: pubkey,
  };
};

export const getAllTokenAccounts = async (
  connection: Connection,
  wallet: Keypair
): Promise<Record<string, TokenAccount[]>> => {
  const resp = await connection.getTokenAccountsByOwner(
    wallet.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    connection.commitment
  );
  const _ownedTokenAccounts = {} as Record<string, TokenAccount[]>;
  if (resp?.value) {
    resp.value.forEach(({ account, pubkey }) => {
      // console.log('public key for account: ', pubkey.toString());
      // console.log('account.data ', account.data.toString());
      const accountInfo = AccountLayout.decode(account.data);
      // console.log('account info: ', accountInfo.toString());
      // try {
      const initialAccount = convertAccountInfoToLocalStruct(
        accountInfo,
        pubkey
      );
      const mint = initialAccount.mint.toString();
      if (_ownedTokenAccounts[mint]) {
        _ownedTokenAccounts[mint].push(initialAccount);
      } else {
        _ownedTokenAccounts[mint] = [initialAccount];
      }
      // } catch (err) {
      //   console.log('fuck it');
      // }
    });
  }
  return _ownedTokenAccounts;
};
