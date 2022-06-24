import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";

import type { SimpleSwapIDL } from "../../idls/simpleSwap";
import type { WithKey } from "../Volt/voltTypes";

export type SimpleSwapTypes = AnchorTypes<
  SimpleSwapIDL,
  {
    swapOrder: SimpleSwapOrder;
    userOrders: SimpleSwapUserOrders;
  }
>;

export type SimpleSwapDefined = SimpleSwapTypes["Defined"];
export type SimpleSwapAccounts = SimpleSwapTypes["Accounts"];
export type SimpleSwapState = SimpleSwapTypes["State"];
export type SimpleSwapError = SimpleSwapTypes["Error"];
export type SimpleSwapProgram = SimpleSwapTypes["Program"];
export type SimpleSwapInstructions = SimpleSwapTypes["Instructions"];
export type SimpleSwapMethods = SimpleSwapTypes["Methods"];
export type SimpleSwapEvents = SimpleSwapTypes["Events"];
export type SimpleSwapUserOrders = SimpleSwapAccounts["UserOrders"];
export type SimpleSwapUserOrdersWithKey = SimpleSwapUserOrders & WithKey;
export type SimpleSwapOrder = SimpleSwapAccounts["SwapOrder"];
export type SimpleSwapOrderWithKey = SimpleSwapOrder & WithKey;

export type SimpleSwapIXAccounts = {
  create: {
    [A in keyof Parameters<
      SimpleSwapProgram["instruction"]["create"]["accounts"]
    >[0]]: PublicKey;
  };
  claim: {
    [A in keyof Parameters<
      SimpleSwapProgram["instruction"]["claim"]["accounts"]
    >[0]]: PublicKey;
  };
  cancel: {
    [A in keyof Parameters<
      SimpleSwapProgram["instruction"]["cancel"]["accounts"]
    >[0]]: PublicKey;
  };
  exec: {
    [A in keyof Parameters<
      SimpleSwapProgram["instruction"]["exec"]["accounts"]
    >[0]]: PublicKey;
  };
};
