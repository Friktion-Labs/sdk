import * as anchor from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
import { BN } from "bn.js";
import { createMint as createSplMint } from "@solana/spl-token";
import { u64 } from "@saberhq/token-utils";

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

export const getProgramAddress = async (
  program: SoloptionsProgram,
  kind: "OptionsContract" | "WriterMint" | "OptionMint",
  underlyingMint: PublicKey,
  quoteMint: PublicKey,
  underlyingAmount: anchor.BN,
  quoteAmount: anchor.BN,
  expiry: number
) => {
  const textEncoder = new TextEncoder();
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      textEncoder.encode(kind),
      underlyingMint.toBuffer(),
      quoteMint.toBuffer(),
      new BN(underlyingAmount.toString()).toBuffer("le", 8),
      new BN(quoteAmount.toString()).toBuffer("le", 8),
      new BN(expiry.toString()).toBuffer("le", 8),
    ],
    program.programId
  );
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
  return await createSplMint(
    connection,
    payer,
    mintAuthority,
    mintAuthority,
    9
  );
};
