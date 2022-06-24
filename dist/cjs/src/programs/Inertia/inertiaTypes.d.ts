import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";
import type { InertiaIDL } from "../../idls/inertia";
import type { WithKey } from "../Volt/voltTypes";
export declare type InertiaTypes = AnchorTypes<InertiaIDL, {
    optionsContract: InertiaContract;
    stubOracle: InertiaStubOracle;
}>;
export declare type InertiaDefined = InertiaTypes["Defined"];
export declare type InertiaAccounts = InertiaTypes["Accounts"];
export declare type InertiaState = InertiaTypes["State"];
export declare type InertiaError = InertiaTypes["Error"];
export declare type InertiaProgram = InertiaTypes["Program"];
export declare type InertiaInstructions = InertiaTypes["Instructions"];
export declare type InertiaMethods = InertiaTypes["Methods"];
export declare type InertiaEvents = InertiaTypes["Events"];
export declare type InertiaStubOracle = InertiaAccounts["StubOracle"];
export declare type InertiaStubOracleWithKey = InertiaStubOracle & WithKey;
export declare type InertiaContract = InertiaAccounts["OptionsContract"];
export declare type InertiaContractWithKey = InertiaContract & WithKey;
export declare type InertiaIXAccounts = {
    initialize: {
        [A in keyof Parameters<InertiaProgram["instruction"]["newContract"]["accounts"]>[0]]: PublicKey;
    };
    exercise: {
        [A in keyof Parameters<InertiaProgram["instruction"]["optionExercise"]["accounts"]>[0]]: PublicKey;
    };
    settle: {
        [A in keyof Parameters<InertiaProgram["instruction"]["optionSettle"]["accounts"]>[0]]: PublicKey;
    };
    revertSettle: {
        [A in keyof Parameters<InertiaProgram["instruction"]["revertOptionSettle"]["accounts"]>[0]]: PublicKey;
    };
    createStubOracle: {
        [A in keyof Parameters<InertiaProgram["instruction"]["createStubOracle"]["accounts"]>[0]]: PublicKey;
    };
    setStubOracle: {
        [A in keyof Parameters<InertiaProgram["instruction"]["setStubOracle"]["accounts"]>[0]]: PublicKey;
    };
    write: {
        [A in keyof Parameters<InertiaProgram["instruction"]["optionWrite"]["accounts"]>[0]]: PublicKey;
    };
    redeem: {
        [A in keyof Parameters<InertiaProgram["instruction"]["optionRedeem"]["accounts"]>[0]]: PublicKey;
    };
    close: {
        [A in keyof Parameters<InertiaProgram["instruction"]["closePosition"]["accounts"]>[0]]: PublicKey;
    };
};
//# sourceMappingURL=inertiaTypes.d.ts.map