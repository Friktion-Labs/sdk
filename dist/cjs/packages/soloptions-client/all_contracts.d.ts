/// <reference types="bn.js" />
import { SoloptionsContractWithKey, SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
import { AssetPair } from "./types";
export declare const getAllContracts: (program: SoloptionsProgram) => Promise<SoloptionsContractWithKey[]>;
export declare const getActiveExpiryForPair: (contracts: Array<SoloptionsContractWithKey>, pair: AssetPair) => import("bn.js")[];
//# sourceMappingURL=all_contracts.d.ts.map