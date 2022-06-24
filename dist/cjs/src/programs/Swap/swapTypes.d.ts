import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";
import type { SimpleSwapIDL } from "../../idls/simpleSwap";
import type { WithKey } from "../Volt/voltTypes";
export declare type SimpleSwapTypes = AnchorTypes<SimpleSwapIDL, {
    swapOrder: SimpleSwapOrder;
    userOrders: SimpleSwapUserOrders;
}>;
export declare type SimpleSwapDefined = SimpleSwapTypes["Defined"];
export declare type SimpleSwapAccounts = SimpleSwapTypes["Accounts"];
export declare type SimpleSwapState = SimpleSwapTypes["State"];
export declare type SimpleSwapError = SimpleSwapTypes["Error"];
export declare type SimpleSwapProgram = SimpleSwapTypes["Program"];
export declare type SimpleSwapInstructions = SimpleSwapTypes["Instructions"];
export declare type SimpleSwapMethods = SimpleSwapTypes["Methods"];
export declare type SimpleSwapEvents = SimpleSwapTypes["Events"];
export declare type SimpleSwapUserOrders = SimpleSwapAccounts["UserOrders"];
export declare type SimpleSwapUserOrdersWithKey = SimpleSwapUserOrders & WithKey;
export declare type SimpleSwapOrder = SimpleSwapAccounts["SwapOrder"];
export declare type SimpleSwapOrderWithKey = SimpleSwapOrder & WithKey;
export declare type SimpleSwapIXAccounts = {
    create: {
        [A in keyof Parameters<SimpleSwapProgram["instruction"]["create"]["accounts"]>[0]]: PublicKey;
    };
    claim: {
        [A in keyof Parameters<SimpleSwapProgram["instruction"]["claim"]["accounts"]>[0]]: PublicKey;
    };
    cancel: {
        [A in keyof Parameters<SimpleSwapProgram["instruction"]["cancel"]["accounts"]>[0]]: PublicKey;
    };
    exec: {
        [A in keyof Parameters<SimpleSwapProgram["instruction"]["exec"]["accounts"]>[0]]: PublicKey;
    };
};
//# sourceMappingURL=swapTypes.d.ts.map