import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Market } from "@project-serum/serum";
import { getAccount, getMint } from "@solana/spl-token";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

import { SERUM_PROGRAM_IDS } from "../../";
import type { PerpProtocol } from "../../constants";
import { ENTROPY_PROGRAM_ID, MANGO_PROGRAM_ID } from "../../constants";

export const getProgramIdForPerpProtocol = (
  perpProtocol: PerpProtocol
): PublicKey => {
  return perpProtocol === "Entropy" ? ENTROPY_PROGRAM_ID : MANGO_PROGRAM_ID;
};

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
): Promise<{ balance: BN }> {
  const account = await getAccount(connection, tokenAccount);
  const balance = new BN(account.amount.toString());

  return { balance };
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

    return res;
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
