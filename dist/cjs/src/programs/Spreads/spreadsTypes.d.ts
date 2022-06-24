import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";
import type { SpreadsIDL } from "../../idls/spreads";
import type { WithKey } from "../Volt/voltTypes";
export declare type SpreadsTypes = AnchorTypes<SpreadsIDL, {
    spreadsContract: SpreadsContract;
    stubOracle: SpreadsStubOracle;
}>;
export declare type SpreadsDefined = SpreadsTypes["Defined"];
export declare type SpreadsAccounts = SpreadsTypes["Accounts"];
export declare type SpreadsState = SpreadsTypes["State"];
export declare type SpreadsError = SpreadsTypes["Error"];
export declare type SpreadsProgram = SpreadsTypes["Program"];
export declare type SpreadsInstructions = SpreadsTypes["Instructions"];
export declare type SpreadsMethods = SpreadsTypes["Methods"];
export declare type SpreadsEvents = SpreadsTypes["Events"];
export declare type SpreadsStubOracle = SpreadsAccounts["StubOracle"];
export declare type SpreadsStubOracleWithKey = SpreadsStubOracle & WithKey;
export declare type SpreadsContract = SpreadsAccounts["SpreadsContract"];
export declare type SpreadsContractWithKey = SpreadsContract & WithKey;
export declare type SpreadsIXAccounts = {
    newSpread: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["newSpread"]["accounts"]>[0]]: PublicKey;
    };
    exercise: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["exercise"]["accounts"]>[0]]: PublicKey;
    };
    settle: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["settle"]["accounts"]>[0]]: PublicKey;
    };
    revertSettle: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["revertSettle"]["accounts"]>[0]]: PublicKey;
    };
    createStubOracle: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["createStubOracle"]["accounts"]>[0]]: PublicKey;
    };
    setStubOracle: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["setStubOracle"]["accounts"]>[0]]: PublicKey;
    };
    write: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["write"]["accounts"]>[0]]: PublicKey;
    };
    redeem: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["redeem"]["accounts"]>[0]]: PublicKey;
    };
    close: {
        [A in keyof Parameters<SpreadsProgram["instruction"]["closePosition"]["accounts"]>[0]]: PublicKey;
    };
};
//# sourceMappingURL=spreadsTypes.d.ts.map