import type { PublicKey } from "@solana/web3.js";
import type { GenericOptionsContractWithKey } from "../Volt/voltTypes";
import type { SoloptionsContract, SoloptionsContractWithKey, SoloptionsProgram } from "./soloptionsTypes";
export declare const getSoloptionsContractByKey: (program: SoloptionsProgram, key: PublicKey) => Promise<SoloptionsContract>;
export declare const convertSoloptionsContractToOptionMarket: (soloptionsContract: SoloptionsContractWithKey) => GenericOptionsContractWithKey;
export declare const getSoloptionsConractByKey: (program: SoloptionsProgram, key: PublicKey) => Promise<GenericOptionsContractWithKey | null>;
export declare const createSoloptionsContractInstruction: (program: SoloptionsProgram, underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmountPerContract: number, quoteAmountPerContract: number, expiry: number) => Promise<{
    contract: SoloptionsContractWithKey;
    createContractIx: import("@solana/web3.js").TransactionInstruction;
}>;
//# sourceMappingURL=soloptionsUtils.d.ts.map