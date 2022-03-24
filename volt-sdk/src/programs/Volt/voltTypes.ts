import type { BN } from "@project-serum/anchor";
import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";

import type { VoltIDL } from "../../idls/volt";

// DO NOT DO THIS. DUE TO SOME OBSCURE EDGECASES, THIS DOESNT WORK ... SOMETIMES
// import { VoltIDLJsonRaw } from "../../idls/volt";
// export const VoltIDLJson = VoltIDLJsonRaw;

export type VoltTypes = AnchorTypes<
  VoltIDL,
  {
    voltVault: VoltVault;
    extraVoltData: ExtraVoltData;
    whitelist: Whitelist;
    round: Round;
    pendingDeposit: PendingDeposit;
    pendingWithdrawal: PendingWithdrawal;
  }
>;

export type VoltDefined = VoltTypes["Defined"];
export type VoltAccounts = VoltTypes["Accounts"];
export type VoltState = VoltTypes["State"];
export type VoltError = VoltTypes["Error"];
export type VoltProgram = VoltTypes["Program"];
export type VoltInstructions = VoltTypes["Instructions"];
export type VoltMethods = VoltTypes["Methods"];
export type VoltEvents = VoltTypes["Events"];

export type PendingDeposit = VoltAccounts["PendingDeposit"];
export type PendingWithdrawal = VoltAccounts["PendingWithdrawal"];
export type Round = VoltAccounts["Round"];
export type VoltVault = VoltAccounts["VoltVault"];
export type ExtraVoltData = VoltAccounts["ExtraVoltData"];
export type Whitelist = VoltAccounts["Whitelist"];
export type WithKey = {
  key: PublicKey;
};

// TODO: Please prepend all these with Volt
export type PendingDepositWithKey = PendingDeposit & WithKey;
export type PendingWithdrawalWithKey = PendingWithdrawal & WithKey;
export type RoundWithKey = Round & WithKey;
export type VoltVaultWithKey = VoltVault & WithKey;
export type ExtraVoltDataWithKey = ExtraVoltData & WithKey;
export type WhitelistWithKey = Whitelist & WithKey;

export type OptionMarket = {
  optionMint: PublicKey;
  writerTokenMint: PublicKey;
  underlyingAssetMint: PublicKey;
  quoteAssetMint: PublicKey;
  underlyingAssetPool: PublicKey;
  quoteAssetPool: PublicKey;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
  underlyingAmountPerContract: BN;
  quoteAmountPerContract: BN;
  expirationUnixTimestamp: BN;
  expired: boolean;
  bumpSeed: number;
};

export type OptionMarketWithKey = OptionMarket & {
  key: PublicKey;
};

export type OptionsProtocol = "Inertia" | "Soloptions";

export type VoltIXAccounts = {
  initialize: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["initialize"]["accounts"]
    >[0]]: PublicKey;
  };
  changeCapacity: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["changeCapacity"]["accounts"]
    >[0]]: PublicKey;
  };
  startRound: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["startRound"]["accounts"]
    >[0]]: PublicKey;
  };
  endRound: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["endRound"]["accounts"]
    >[0]]: PublicKey;
  };
  claimPending: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["claimPending"]["accounts"]
    >[0]]: PublicKey;
  };
  claimPendingWithdrawal: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["claimPendingWithdrawal"]["accounts"]
    >[0]]: PublicKey;
  };
  deposit: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["deposit"]["accounts"]
    >[0]]: PublicKey;
  };
  withdraw: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["withdraw"]["accounts"]
    >[0]]: PublicKey;
  };
  cancelPendingWithdrawal: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["cancelPendingWithdrawal"]["accounts"]
    >[0]]: PublicKey;
  };
  rebalanceSettle: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["rebalanceSettle"]["accounts"]
    >[0]]: PublicKey;
  };
  setNextOption: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["setNextOption"]["accounts"]
    >[0]]: PublicKey;
  };
  rebalancePrepare: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["rebalancePrepare"]["accounts"]
    >[0]]: PublicKey;
  };
  rebalanceSwapPremium: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["rebalanceSwapPremium"]["accounts"]
    >[0]]: PublicKey;
  };
  rebalanceEnter: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["rebalanceEnter"]["accounts"]
    >[0]]: PublicKey;
  };
  settleEnterFunds: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["settleEnterFunds"]["accounts"]
    >[0]]: PublicKey;
  };
  settlePermissionedMarketPremiumFunds: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["settlePermissionedMarketPremiumFunds"]["accounts"]
    >[0]]: PublicKey;
  };
  settleSwapPremiumFunds: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["settleSwapPremiumFunds"]["accounts"]
    >[0]]: PublicKey;
  };
  initSerumMarket: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["initSerumMarket"]["accounts"]
    >[0]]: PublicKey;
  };
};
