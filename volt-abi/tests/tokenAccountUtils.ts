import * as anchor from "@project-serum/anchor";
import { BN, Program, ProgramAccount, Provider } from "@project-serum/anchor";

import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import type { Connection, Signer } from "@solana/web3.js";
import {
  Account,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import assert from "assert";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
export const wait = (delayMS: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMS));

export const createUnderlyingAndQuoteMints = async (
  provider: Provider,
  wallet: Keypair,
  mintAuthority: Keypair
) => {
  const underlyingToken = await Token.createMint(
    provider.connection,
    wallet,
    mintAuthority.publicKey,
    null,
    6,
    TOKEN_PROGRAM_ID
  );

  const quoteToken = await Token.createMint(
    provider.connection,
    wallet,
    mintAuthority.publicKey,
    null,
    2,
    TOKEN_PROGRAM_ID
  );
  return {
    quoteToken,
    underlyingToken,
  };
};

export const initNewAssociatedTokenAccountIfNeeded = async (
  provider: Provider,
  /** The owner for the new mint account */
  owner: PublicKey,
  /** The SPL Token Mint address */
  mint: PublicKey,
  payer: Keypair
) => {
  const tokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    owner,
    true
  );

  try {
    const token = new Token(provider.connection, mint, TOKEN_PROGRAM_ID, payer);
    await token.getAccountInfo(tokenAccount);
  } catch (err) {
    const tx = new Transaction();
    const ix = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      tokenAccount,
      owner,
      payer.publicKey
    );
    tx.add(ix);
    await provider.send(tx);
  }
  return {
    tokenAccount,
  };
};

export const initNewTokenAccount = async (
  connection: Connection,
  /** The owner for the new mint account */
  owner: PublicKey,
  /** The SPL Token Mint address */
  mint: PublicKey,
  wallet: Keypair,
  targetKeypair?: Keypair
) => {
  let tokenAccount = new Keypair();
  if (targetKeypair) tokenAccount = targetKeypair;
  const transaction = new Transaction();

  const assetPoolRentBalance =
    await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: tokenAccount.publicKey,
      lamports: assetPoolRentBalance,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      tokenAccount.publicKey,
      owner
    )
  );
  await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet, tokenAccount],
    {
      commitment: "confirmed",
    }
  );
  return {
    tokenAccount,
  };
};

/**
 *
 * TODO: This should be transformed to use associated token program accounts. That will make it easier
 *
 * @param connection
 * @param minter
 * @param mintAuthority
 * @param underlyingToken
 * @param underlyingAmount
 * @param optionMint
 * @param writerTokenMint
 * @param quoteToken
 * @param quoteAmount
 * @returns
 */
export const createMinter = async (
  connection: Connection,
  minter: Keypair,
  mintAuthority: Keypair,
  underlyingToken: Token,
  underlyingAmount: number,
  optionMint: PublicKey,
  writerTokenMint: PublicKey,
  quoteToken: Token,
  quoteAmount = 0
) => {
  const transaction = new Transaction();

  const underlyingAccount = new Keypair();
  const assetPoolRentBalance =
    await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: minter.publicKey,
      newAccountPubkey: underlyingAccount.publicKey,
      lamports: assetPoolRentBalance,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      underlyingToken.publicKey,
      underlyingAccount.publicKey,
      minter.publicKey
    )
  );

  const quoteAccount = new Keypair();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: minter.publicKey,
      newAccountPubkey: quoteAccount.publicKey,
      lamports: assetPoolRentBalance,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      quoteToken.publicKey,
      quoteAccount.publicKey,
      minter.publicKey
    )
  );

  // create an associated token account to hold the options
  const optionAccount = new Keypair();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: minter.publicKey,
      newAccountPubkey: optionAccount.publicKey,
      lamports: assetPoolRentBalance,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      optionMint,
      optionAccount.publicKey,
      minter.publicKey
    )
  );

  // create an associated token account to hold the writer tokens
  const writerTokenAccount = new Keypair();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: minter.publicKey,
      newAccountPubkey: writerTokenAccount.publicKey,
      lamports: assetPoolRentBalance,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      writerTokenMint,
      writerTokenAccount.publicKey,
      minter.publicKey
    )
  );

  await sendAndConfirmTransaction(
    connection,
    transaction,
    [
      minter,
      underlyingAccount,
      quoteAccount,
      optionAccount,
      writerTokenAccount,
    ],
    {
      commitment: "confirmed",
    }
  );

  // mint underlying tokens to the minter's account
  await underlyingToken.mintTo(
    underlyingAccount.publicKey,
    mintAuthority,
    [],
    underlyingAmount
  );

  if (quoteAmount > 0) {
    await quoteToken.mintTo(
      quoteAccount.publicKey,
      mintAuthority,
      [],
      quoteAmount
    );
  }
  return { optionAccount, quoteAccount, underlyingAccount, writerTokenAccount };
};

export const requestAndConfirmAirdrop = async (
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey,
  amount = LAMPORTS_PER_SOL
) => {
  const fromAirdropSignature = await connection.requestAirdrop(address, amount);
  await connection.confirmTransaction(fromAirdropSignature);
};

export const createMint = async (
  connection: anchor.web3.Connection,
  mintAuthority: anchor.web3.PublicKey,
  numDecimals: number
) => {
  const payer = anchor.web3.Keypair.generate();
  await requestAndConfirmAirdrop(connection, payer.publicKey, LAMPORTS_PER_SOL);
  return await Token.createMint(
    connection,
    payer,
    mintAuthority,
    null,
    numDecimals,
    TOKEN_PROGRAM_ID
  );
};


export const getTokenBalance = async (token: Token, account: PublicKey) => {
  return new anchor.BN((await token.getAccountInfo(account)).amount);
};

export const getTokenSupply = async (token: Token) => {
  return new anchor.BN((await token.getMintInfo()).supply);
};

export const createNormalOrAssociated = async (
  provider: Provider,
  user: any,
  mint: PublicKey,

  payer: Keypair,
  makeAss: boolean = true
) => {
  if (makeAss) {
    return await initNewAssociatedTokenAccountIfNeeded(
      provider,
      user,
      mint,
      payer
    );
  } else {
    const { tokenAccount } = await initNewTokenAccount(
      provider.connection,
      user,
      mint,
      payer
    );
    return {
      tokenAccount: tokenAccount.publicKey,
    };
  }
};

export const createTokenAccounts = async (
  provider: Provider,
  vaultMint: PublicKey,
  underlyingToken: Token,
  quoteToken: Token,
  marketMakerAccessToken: Token,
  userUnderlyingAccount: Keypair,
  user: any,
  payer: Keypair
) => {
  if (user.secretKey !== undefined) {
    user = user.publicKey;
  }

  const vaultToken = new Token(
    provider.connection,
    vaultMint,
    TOKEN_PROGRAM_ID,
    payer
  );

  console.log("creating vault token account");

  const { tokenAccount: vaultTokenAccount } = await createNormalOrAssociated(
    provider,
    user,
    vaultMint,
    payer
  );

  console.log("creating underlying token account");

  const { tokenAccount: underlyingTokenAccount } =
    await createNormalOrAssociated(
      provider,
      user,
      underlyingToken.publicKey,
      payer
    );

  console.log("creating quote token account");

  let { tokenAccount: quoteTokenAccount } = await createNormalOrAssociated(
    provider,
    user,
    quoteToken.publicKey,
    payer
  );

  console.log("creating market maker access token account");

  let { tokenAccount: marketMakerAccessTokenAccount } =
    await initNewAssociatedTokenAccountIfNeeded(
      provider,
      user,
      marketMakerAccessToken.publicKey,
      payer
    );

  console.log(
    "vault token balance = " +
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount
  );
  console.log(
    "underlying token balance = " +
      (await underlyingToken.getAccountInfo(underlyingTokenAccount)).amount
  );

  console.log(
    "quote token balance = " +
      (await quoteToken.getAccountInfo(quoteTokenAccount)).amount
  );

  return {
    vaultTokenObj: vaultToken,
    vaultTokenAccount,
    underlyingTokenAccount,
    quoteTokenAccount,
    marketMakerAccessTokenAccount,
  };
};

// export const expectErrorCode = async (
//   method: Function,
//   expectedErrorCode: number,
//   msg: string,
//   ...args: any[]
// ) => {
//   try {
//     await method(...args);
//     if (msg === undefined) msg = "";
//     assert.ok(false, msg);
//   } catch (err) {
//     console.log(err);
//     assert.equal(parseErrorCode(err), expectedErrorCode);
//   }
// };

export const getBalance = async (token: Token, tokenAccount: PublicKey) => {
  return (await token.getAccountInfo(tokenAccount)).amount;
};
