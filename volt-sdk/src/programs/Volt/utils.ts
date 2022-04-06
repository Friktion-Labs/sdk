import * as anchor from "@project-serum/anchor";
import type { Market } from "@project-serum/serum";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Connection, Signer } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

import { SERUM_PROGRAM_IDS } from "../../";

export const getVaultOwnerAndNonceForSpot = async (market: Market) => {
  const nonce = new anchor.BN(0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [market.publicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        SERUM_PROGRAM_IDS.Mainnet
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
};

export const getBalanceOrZero = async (
  token: Token,
  account: PublicKey
): Promise<Decimal> => {
  try {
    return new Decimal((await token.getAccountInfo(account)).amount.toString());
  } catch (err) {
    console.log(err);
    return new Decimal(0);
  }
};

export async function getAccountBalance(
  connection: Connection,
  mintAddress: PublicKey,
  tokenAccount: PublicKey
): Promise<{ balance: Decimal; token: Token }> {
  const token = new Token(
    connection,
    mintAddress,
    TOKEN_PROGRAM_ID,
    null as unknown as Signer
  );

  const account = await token.getAccountInfo(tokenAccount);
  const balance = new Decimal(account.amount.toString());

  return { balance, token };
}

export async function getAccountBalanceOrZero(
  connection: Connection,
  mintAddress: PublicKey,
  tokenAccount: PublicKey
): Promise<{ balance: Decimal; token: Token | null }> {
  try {
    const res = await getAccountBalance(connection, mintAddress, tokenAccount);

    return res;
  } catch (err) {
    console.error(err);
    return { balance: new Decimal(0), token: null };
  }
}

export async function getMintSupply(
  connection: Connection,
  vaultMint: PublicKey
): Promise<Decimal> {
  const token = new Token(
    connection,
    vaultMint,
    TOKEN_PROGRAM_ID,
    null as unknown as Signer
  );
  try {
    const mintInfo = await token.getMintInfo();
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
