import * as anchor from "@project-serum/anchor";
import type { Market } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";

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
