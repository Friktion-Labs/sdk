import * as anchor from "@project-serum/anchor";
import { PublicKey, Signer, Transaction } from "@solana/web3.js";

export type TokenAccount = {
  amount: number;
  mint: PublicKey;
  // public key for the specific token account (NOT the wallet)
  pubKey: PublicKey;
};

export interface CreateNewTokenAccountResponse extends InstructionResponse {
  newTokenAccount: Signer;
}

export type InstructionResponse = {
  transaction: Transaction;
  signers: Signer[];
};
