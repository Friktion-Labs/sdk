import { REFERRAL_AUTHORITY } from "../src";
import type * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import Decimal from "decimal.js";

import type { VoltVaultWithKey } from "./types";

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

export const sendIns = async (
  provider: anchor.Provider,
  ins: TransactionInstruction
) => {
  const tx = new Transaction();

  tx.add(ins);

  await provider.send(tx);
};

const getFeeTokenAccount = async (volt: VoltVaultWithKey) => {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    volt.underlyingAssetMint,
    REFERRAL_AUTHORITY
  );
};

export const wait = (delayMS: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMS));
