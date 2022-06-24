import type { AnchorProvider } from "@project-serum/anchor";
import Decimal from "decimal.js";
import type { GenericOptionsContractWithKey } from "./voltTypes";
export declare const getStrikeFromOptionsContract: (provider: AnchorProvider, optionMarket: GenericOptionsContractWithKey, isCall: boolean) => Promise<Decimal>;
//# sourceMappingURL=optionMarketUtils.d.ts.map