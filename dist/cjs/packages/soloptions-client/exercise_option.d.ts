import { PublicKey, Keypair } from "@solana/web3.js";
import { SoloptionsContractWithKey, SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
interface ExerciseOptionParams {
    exerciserAccount?: Keypair;
    quoteTokenSource: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: number;
    feeDestination: PublicKey;
}
export declare const exerciseOption: (program: SoloptionsProgram, contract: SoloptionsContractWithKey, params: ExerciseOptionParams) => Promise<void>;
export {};
//# sourceMappingURL=exercise_option.d.ts.map