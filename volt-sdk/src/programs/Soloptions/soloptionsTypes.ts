import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";

import type { SoloptionsIDL } from "../../idls/soloptions";

export type SoloptionsTypes = AnchorTypes<
  SoloptionsIDL,
  {
    optionsContract: SoloptionsContract;
  }
>;

export type SoloptionsDefined = SoloptionsTypes["Defined"];
export type SoloptionsAccounts = SoloptionsTypes["Accounts"];
export type SoloptionsState = SoloptionsTypes["State"];
export type SoloptionsError = SoloptionsTypes["Error"];
export type SoloptionsProgram = SoloptionsTypes["Program"];
export type SoloptionsInstructions = SoloptionsTypes["Instructions"];
export type SoloptionsMethods = SoloptionsTypes["Methods"];
export type SoloptionsEvents = SoloptionsTypes["Events"];

export type SoloptionsContract = SoloptionsAccounts["OptionsContract"];
export type SoloptionsContractWithKey = SoloptionsContract & {
  key: PublicKey;
};

export type SoloptionsIXAccounts = {
  initialize: {
    [A in keyof Parameters<
      SoloptionsProgram["instruction"]["newContract"]["accounts"]
    >[0]]: PublicKey;
  };
  exercise: {
    [A in keyof Parameters<
      SoloptionsProgram["instruction"]["optionExercise"]["accounts"]
    >[0]]: PublicKey;
  };
  write: {
    [A in keyof Parameters<
      SoloptionsProgram["instruction"]["optionWrite"]["accounts"]
    >[0]]: PublicKey;
  };
  redeem: {
    [A in keyof Parameters<
      SoloptionsProgram["instruction"]["optionRedeem"]["accounts"]
    >[0]]: PublicKey;
  };
};
