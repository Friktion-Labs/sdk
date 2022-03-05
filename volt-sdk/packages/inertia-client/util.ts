import * as anchor from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import type { InertiaProgram } from "../../src/programs/Inertia/inertiaTypes";

export const numToBigEndianByteArray = (
  num: number,
  bits: 8 | 16 | 32 | 64
) => {
  const bn = new anchor.BN(num);
  const numBuf = bn.toArrayLike(Buffer, "be");
  const buf = Buffer.alloc(bits / 8);
  numBuf.copy(buf, buf.length - numBuf.length);
  return buf;
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
  mintAuthority: anchor.web3.PublicKey
) => {
  const payer = anchor.web3.Keypair.generate();
  await requestAndConfirmAirdrop(
    connection,
    payer.publicKey,
    LAMPORTS_PER_SOL * 10
  );
  return await Token.createMint(
    connection,
    payer,
    mintAuthority,
    null,
    9,
    TOKEN_PROGRAM_ID
  );
};
