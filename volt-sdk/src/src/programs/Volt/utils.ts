import * as anchor from "@project-serum/anchor";
import type { Market } from "@project-serum/serum";
import type { Token } from "@solana/spl-token";
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
