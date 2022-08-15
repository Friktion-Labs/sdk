import type { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

import type {
  LendingConfig,
  LendingStrategyValues,
  SecondLegAllocationStrategyValues,
} from "./Principal/PrincipalProtectionVoltSDK";
import type {
  DovParticipantTypeValues,
  OptionTypeValues,
  OrderTypeValues,
  SelfTradeBehaviorValues,
} from "./utils/helperTypes";

export type EnumFromValues<T> = T[keyof T];
export type OptionType = EnumFromValues<typeof OptionTypeValues>;
export type DovParticipantType =
  typeof DovParticipantTypeValues[keyof typeof DovParticipantTypeValues];
export type SerumOrderType = EnumFromValues<typeof OrderTypeValues>;
export type SelfTradeBehavior = EnumFromValues<typeof SelfTradeBehaviorValues>;
export type LendingStrategy = EnumFromValues<typeof LendingStrategyValues>;
export type SecondLegAllocationStrategy = EnumFromValues<
  typeof SecondLegAllocationStrategyValues
>;

export type BaseArgs = {
  adminKey: PublicKey;
  vaultName: string;
  depositMint: PublicKey;
  capacity: BN;
  individualCapacity: BN;
};

// NOTE: DOV refers to any volt that trades options. NOT just volt 1/2
export type OptionsContractArgs = {
  expirationInterval: BN;
  underlyingAmountPerContract: BN;
  optionType: OptionType;
  participantType: DovParticipantType;
};

export type SerumArgs = {
  orderSize: BN;
  orderType: SerumOrderType;
  selfTradeBehavior: SelfTradeBehavior;
  programId: PublicKey;
};

export type DovArgs = {
  serumArgs?: SerumArgs;
  optionsArgs: OptionsContractArgs;
  underlyingAssetMint: PublicKey;
  quoteAssetMint: PublicKey;
  permissionedMarketPremiumMint: PublicKey;
  permissionlessAuctions: boolean;
};

export type ShortOptionsArgs = {
  baseArgs: BaseArgs;
  dovArgs: DovArgs;
};

export type PrincipalProtectionArgs = {
  baseArgs: BaseArgs;
  dovArgs: DovArgs;
  lendingConfig: LendingConfig;
  secondLegAllocationStrategy: SecondLegAllocationStrategy;
};
