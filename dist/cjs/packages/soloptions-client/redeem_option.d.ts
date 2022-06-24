import { PublicKey, Keypair } from "@solana/web3.js";
import { SoloptionsContractWithKey, SoloptionsProgram } from "../../src/programs/Soloptions/soloptionsTypes";
interface RedeemOptionParams {
    redeemerAccount?: Keypair;
    redeemerTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    quoteTokenDestination: PublicKey;
    amount: number;
}
export declare const redeemOption: (program: SoloptionsProgram, contract: SoloptionsContractWithKey, params: RedeemOptionParams) => Promise<string>;
export {};
//# sourceMappingURL=redeem_option.d.ts.map