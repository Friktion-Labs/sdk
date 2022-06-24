import type { PublicKey } from "@solana/web3.js";
import type { GenericOptionsContractWithKey } from "../Volt/voltTypes";
import type { InertiaContract, InertiaContractWithKey, InertiaProgram } from "./inertiaTypes";
export declare const getInertiaContractByKey: (program: InertiaProgram, key: PublicKey) => Promise<InertiaContract>;
export declare const convertInertiaContractToOptionMarket: (inertiaContract: InertiaContractWithKey) => GenericOptionsContractWithKey;
export declare const getInertiaMarketByKey: (program: InertiaProgram, key: PublicKey) => Promise<GenericOptionsContractWithKey | null>;
export declare const getInertiaContractByKeyOrNull: (program: InertiaProgram, key: PublicKey) => Promise<InertiaContractWithKey | null>;
//# sourceMappingURL=inertiaUtils.d.ts.map