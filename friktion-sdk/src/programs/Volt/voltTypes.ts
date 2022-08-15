import type { BN, Program } from "@friktion-labs/anchor";
import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";

import type { OptionsProtocol } from "../../constants";
import type { VoltIDL } from "../../idls/volt";
// DO NOT DO THIS. DUE TO SOME OBSCURE EDGECASES, THIS DOESNT WORK ... SOMETIMES
// import { VoltIDLJsonRaw, VoltIDL } from '../../idls/volt';
import type { InertiaContract } from "../Inertia/inertiaTypes";
import type { SoloptionsContract } from "../Soloptions/soloptionsTypes";
import type { SpreadsContract } from "../Spreads/spreadsTypes";
// export const VoltIDLJson = VoltIDLJsonRaw;

export type VoltTypes = AnchorTypes<
  VoltIDL,
  {
    voltVault: VoltVault;
    extraVoltData: ExtraVoltData;

    round: Round;
    friktionEpochInfo: FriktionEpochInfo;

    pendingDeposit: PendingDeposit;
    pendingWithdrawal: PendingWithdrawal;

    auctionMetadata: AuctionMetadata;

    entropyMetadata: EntropyMetadata;
    entropyRound: EntropyRound;

    whitelist: Whitelist;
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

// generic types
export type VoltVault = VoltAccounts["VoltVault"];
export type ExtraVoltData = VoltAccounts["ExtraVoltData"];
export type Round = VoltAccounts["Round"];
export type FriktionEpochInfo = VoltAccounts["FriktionEpochInfo"];
export type Whitelist = VoltAccounts["Whitelist"];

// client types
export type PendingDeposit = VoltAccounts["PendingDeposit"];
export type PendingWithdrawal = VoltAccounts["PendingWithdrawal"];

// DOV types
export type AuctionMetadata = VoltAccounts["AuctionMetadata"];

// entropy types
export type EntropyMetadata = VoltAccounts["EntropyMetadata"];
export type EntropyRound = VoltAccounts["EntropyRound"];

// export type PrincipalProtectionVaultV1 = VoltIDL["types"][8];
export type VoltWithNewIdlProgram = Program<VoltIDL>;
export type PrincipalProtectionVaultV1 = Awaited<
  ReturnType<
    VoltWithNewIdlProgram["account"]["PrincipalProtectionVaultV1"]["fetch"]
  >
>;
export type PrimaryVault =
  PrincipalProtectionVaultV1["keys"]["lendingKeys"]["primaryVault"];

export type OptionsContractKeys =
  PrincipalProtectionVaultV1["keys"]["optionsKeys"];

export type PrincipalProtectionContextExtendedAccounts = Parameters<
  VoltWithNewIdlProgram["instruction"]["deployLending"]["accounts"]
>[0]["ppContextAccounts"];

export type PrincipalProtectionContextAccounts = Parameters<
  VoltWithNewIdlProgram["instruction"]["startRoundPrincipalProtection"]["accounts"]
>[0]["ppContextAccounts"];

export type EntropyBaseAccounts = Parameters<
  VoltWithNewIdlProgram["instruction"]["rebalanceIntoPerpEntropy"]["accounts"]
>[0]["entropyBaseAccounts"];

export type EntropyBaseAccountsWithoutBanks = Parameters<
  VoltWithNewIdlProgram["instruction"]["dummyInstruction"]["accounts"]
>[0]["entropyBaseAccounts"];

// PP types
// export type PrincipalProtectionVaultV1 = VoltIDL["accounts"];
// VoltAccounts["PrincipalProtectionVaultV1"];

export type WithKey = {
  key: PublicKey;
};

// TODO: Please prepend all these with Volt
export type PendingDepositWithKey = PendingDeposit & WithKey;
export type PendingWithdrawalWithKey = PendingWithdrawal & WithKey;
export type RoundWithKey = Round & WithKey;
export type FriktionEpochInfoWithKey = FriktionEpochInfo & WithKey;
export type EntropyRoundWithKey = EntropyRound & WithKey;
export type VoltVaultWithKey = VoltVault & WithKey;
export type ExtraVoltDataWithKey = ExtraVoltData & WithKey;
export type WhitelistWithKey = Whitelist & WithKey;
export type AuctionMetadataWithKey = AuctionMetadata & WithKey;
// export type PrincipalProtectionVaultV1WithKey = PrincipalProtectionVaultV1 &
//   WithKey;

export type GenericOptionsContract = {
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
  claimablePool: PublicKey;
  underlyingPool: PublicKey;
  bumpSeed: number;
  protocol: OptionsProtocol;
  rawContract: InertiaContract | SoloptionsContract | SpreadsContract;
};

export type UsefulAddresses = {
  extraVoltKey: PublicKey;
  pendingDepositInfoKey: PublicKey;
  pendingWithdrawalInfoKey: PublicKey;
  roundInfoKey: PublicKey;
  roundVoltTokensKey: PublicKey;
  roundUnderlyingTokensKey: PublicKey;
  roundUnderlyingPendingWithdrawalsKey: PublicKey;
  epochInfoKey: PublicKey;
  whitelistTokenAccountKey: PublicKey;
  epochInfoBump: number;
};

export type ShortOptionsUsefulAddresses = UsefulAddresses & {
  auctionMetadataKey: PublicKey;
  temporaryUsdcFeePoolKey: PublicKey;
};

export type GenericOptionsContractWithKey = GenericOptionsContract & {
  key: PublicKey;
};

export type VoltIXAccounts = {
  initialize: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["initializeShortOptions"]["accounts"]
    >[0]]: PublicKey;
  };

  startRound: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["startRoundShortOptions"]["accounts"]
    >[0]]: PublicKey;
  };
  endRound: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["endRoundShortOptions"]["accounts"]
    >[0]]: PublicKey;
  };
  claimPendingDeposit: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["claimPendingDeposit"]["accounts"]
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

  initSerumMarket: {
    [A in keyof Parameters<
      VoltProgram["instruction"]["initSerumMarket"]["accounts"]
    >[0]]: PublicKey;
  };
};
