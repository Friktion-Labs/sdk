import type { PublicKey } from "@solana/web3.js";
import type { GenericOptionsContractWithKey } from "../..";
import type { SpreadsContract, SpreadsContractWithKey, SpreadsProgram } from "./spreadsTypes";
export declare const convertSpreadsContractToOptionMarket: (spreadsContract: SpreadsContractWithKey) => GenericOptionsContractWithKey;
export declare const getSpreadsContractByKey: (program: SpreadsProgram, key: PublicKey) => Promise<SpreadsContract>;
export declare const getSpreadsContractByKeyOrNull: (program: SpreadsProgram, key: PublicKey) => Promise<SpreadsContractWithKey | null>;
//# sourceMappingURL=spreadsUtils.d.ts.map