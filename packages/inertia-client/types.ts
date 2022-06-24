import * as anchor from "@project-serum/anchor";
import { Address } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

// import { IDL as SoloptionsIDL, Soloptions } from "../../target/types/soloptions";

// export class SoloptionsProgram extends anchor.Program<Soloptions> {
//   public constructor(
//     idl: Soloptions,
//     programId: Address,
//     provider?: anchor.Provider
//   ) {
//     super(idl, programId, provider);
//   }
// }

// export interface OptionsContract {
//   // passed in before creation
//   payer?: PublicKey;
//   quoteMint: PublicKey;
//   underlyingMint: PublicKey;
//   underlyingAmount: anchor.BN;
//   quoteAmount: anchor.BN;
//   expiryTs: anchor.BN;

//   // after creation
//   key: PublicKey;
//   optionMint: PublicKey;
//   writerMint: PublicKey;
//   underlyingPool: PublicKey;
//   quotePool: PublicKey;

//   contractBump: number;
//   optionBump: number;
//   writerBump: number;
// }

export interface AssetPair {
  quote: PublicKey;
  underlying: PublicKey;
}
