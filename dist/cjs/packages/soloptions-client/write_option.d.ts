import { PublicKey, Keypair } from "@solana/web3.js";
import { SoloptionsContractWithKey, SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
export interface WriteOptionParams {
    writerAccount?: Keypair;
    writerUnderlyingFundingTokens: PublicKey;
    writerTokenDestination: PublicKey;
    optionTokenDestination: PublicKey;
    amount: number;
    feeDestination: PublicKey;
}
export declare const writeOption: (program: SoloptionsProgram, contract: SoloptionsContractWithKey, params: WriteOptionParams) => Promise<string>;
//# sourceMappingURL=write_option.d.ts.map