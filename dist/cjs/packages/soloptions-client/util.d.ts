/// <reference types="node" />
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
import { BN } from "bn.js";
export declare const numToBigEndianByteArray: (num: number, bits: 8 | 16 | 32 | 64) => Buffer;
export declare const getProgramAddress: (program: SoloptionsProgram, kind: "OptionsContract" | "WriterMint" | "OptionMint", underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmount: anchor.BN, quoteAmount: anchor.BN, expiry: number) => Promise<[anchor.web3.PublicKey, number]>;
export declare const requestAndConfirmAirdrop: (connection: anchor.web3.Connection, address: anchor.web3.PublicKey, amount?: number) => Promise<void>;
export declare const createMint: (connection: anchor.web3.Connection, mintAuthority: anchor.web3.PublicKey) => Promise<anchor.web3.PublicKey>;
//# sourceMappingURL=util.d.ts.map