/// <reference types="bn.js" />
import * as anchor from "@project-serum/anchor";
import { PublicKey, Signer, TransactionInstruction } from "@solana/web3.js";
import { SoloptionsContractWithKey, SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
export interface NewContractParams {
    payer?: Signer;
    quoteMint: PublicKey;
    underlyingMint: PublicKey;
    underlyingAmount: anchor.BN;
    quoteAmount: anchor.BN;
    expiryTs: number;
    mintFeeAccount: PublicKey;
    exerciseFeeAccount: PublicKey;
}
export declare const newContractInstruction: (program: SoloptionsProgram, params: NewContractParams) => Promise<{
    ix: TransactionInstruction;
    contract: SoloptionsContractWithKey;
}>;
export declare const newContract: (program: SoloptionsProgram, params: NewContractParams) => Promise<SoloptionsContractWithKey>;
//# sourceMappingURL=create_contract.d.ts.map