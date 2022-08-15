import type { PublicKey } from "@solana/web3.js";
import type { Decimal } from "decimal.js";

import type { VoltStrategy } from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import { VoltSDK } from "./VoltSDK";
import type { ExtraVoltData, VoltVault } from "./voltTypes";

export class SimpleVoltSDK extends VoltSDK {
  constructor(
    sdk: FriktionSDK,
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData?: ExtraVoltData | undefined
  ) {
    super(sdk, voltKey, voltVault, extraVoltData);
  }

  getHeadlineMint(): PublicKey {
    throw new Error("not implemented");
  }
  printHighLevelStats(): Promise<void> {
    throw new Error("not implemented");
  }
  printStrategyParams(): void {
    throw new Error("not implemented");
  }
  printPositionStats(): Promise<void> {
    throw new Error("not implemented");
  }
  printAuctionDetails(): Promise<void> {
    throw new Error("not implemented");
  }
  printStateMachine(): void {
    throw new Error("not implemented");
  }
  voltStrategy(): VoltStrategy {
    throw new Error("not implemented");
  }
  specificVoltName(): Promise<string> {
    throw new Error("not implemented");
  }
  getPrimaryStrategyTvlWithNormFactor(_normFactor: Decimal): Promise<Decimal> {
    throw new Error("not implemented");
  }
  estimateCurrentPerformanceAsPercentage(): Promise<Decimal> {
    throw new Error("not implemented");
  }
}
