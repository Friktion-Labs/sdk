import type { AnchorTypes } from "@saberhq/anchor-contrib";

import type { DaoExamplesIDL } from "../../idls/daoexamples";

// DO NOT DO THIS. DUE TO SOME OBSCURE EDGECASES, THIS DOESNT WORK ... SOMETIMES
// import { DaoExamplesIDLJsonRaw } from "../../idls/DaoExamples";
// export const DaoExamplesIDLJson = DaoExamplesIDLJsonRaw;

export type DaoExamplesTypes = AnchorTypes<DaoExamplesIDL, undefined>;

export type DaoExamplesDefined = DaoExamplesTypes["Defined"];
export type DaoExamplesAccounts = DaoExamplesTypes["Accounts"];
export type DaoExamplesState = DaoExamplesTypes["State"];
export type DaoExamplesError = DaoExamplesTypes["Error"];
export type DaoExamplesProgram = DaoExamplesTypes["Program"];
export type DaoExamplesInstructions = DaoExamplesTypes["Instructions"];
export type DaoExamplesMethods = DaoExamplesTypes["Methods"];
export type DaoExamplesEvents = DaoExamplesTypes["Events"];
