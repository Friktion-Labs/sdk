import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";
import type { SoloptionsIDL } from "../../idls/soloptions";
export declare type SoloptionsTypes = AnchorTypes<SoloptionsIDL, {
    optionsContract: SoloptionsContract;
}>;
export declare type SoloptionsDefined = SoloptionsTypes["Defined"];
export declare type SoloptionsAccounts = SoloptionsTypes["Accounts"];
export declare type SoloptionsState = SoloptionsTypes["State"];
export declare type SoloptionsError = SoloptionsTypes["Error"];
export declare type SoloptionsProgram = SoloptionsTypes["Program"];
export declare type SoloptionsInstructions = SoloptionsTypes["Instructions"];
export declare type SoloptionsMethods = SoloptionsTypes["Methods"];
export declare type SoloptionsEvents = SoloptionsTypes["Events"];
export declare type SoloptionsContract = SoloptionsAccounts["OptionsContract"];
export declare type SoloptionsContractWithKey = SoloptionsContract & {
    key: PublicKey;
};
export declare type SoloptionsIXAccounts = {
    initialize: {
        [A in keyof Parameters<SoloptionsProgram["instruction"]["newContract"]["accounts"]>[0]]: PublicKey;
    };
    exercise: {
        [A in keyof Parameters<SoloptionsProgram["instruction"]["optionExercise"]["accounts"]>[0]]: PublicKey;
    };
    write: {
        [A in keyof Parameters<SoloptionsProgram["instruction"]["optionWrite"]["accounts"]>[0]]: PublicKey;
    };
    redeem: {
        [A in keyof Parameters<SoloptionsProgram["instruction"]["optionRedeem"]["accounts"]>[0]]: PublicKey;
    };
};
//# sourceMappingURL=soloptionsTypes.d.ts.map