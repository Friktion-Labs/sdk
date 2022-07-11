import type { AnchorTypes } from "@saberhq/anchor-contrib";

import type { CpiExamplesIDL } from "../../idls/cpi_examples";

// DO NOT DO THIS. DUE TO SOME OBSCURE EDGECASES, THIS DOESNT WORK ... SOMETIMES
// import { CpiExamplesIDLJsonRaw } from "../../idls/CpiExamples";
// export const CpiExamplesIDLJson = CpiExamplesIDLJsonRaw;

export type CpiExamplesTypes = AnchorTypes<CpiExamplesIDL, undefined>;

export type CpiExamplesDefined = CpiExamplesTypes["Defined"];
export type CpiExamplesAccounts = CpiExamplesTypes["Accounts"];
export type CpiExamplesState = CpiExamplesTypes["State"];
export type CpiExamplesError = CpiExamplesTypes["Error"];
export type CpiExamplesProgram = CpiExamplesTypes["Program"];
export type CpiExamplesInstructions = CpiExamplesTypes["Instructions"];
export type CpiExamplesMethods = CpiExamplesTypes["Methods"];
export type CpiExamplesEvents = CpiExamplesTypes["Events"];
