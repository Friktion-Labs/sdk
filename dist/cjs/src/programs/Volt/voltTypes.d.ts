/// <reference types="bn.js" />
import type { BN } from "@project-serum/anchor";
import type { AnchorTypes } from "@saberhq/anchor-contrib";
import type { PublicKey } from "@solana/web3.js";
import type { OptionsProtocol } from "../../constants";
import type { VoltIDL } from "../../idls/volt";
import type { InertiaContract } from "../Inertia/inertiaTypes";
import type { SoloptionsContract } from "../Soloptions/soloptionsTypes";
import type { SpreadsContract } from "../Spreads/spreadsTypes";
export declare type VoltTypes = AnchorTypes<VoltIDL, {
    voltVault: VoltVault;
    extraVoltData: ExtraVoltData;
    entropyMetadata: EntropyMetadata;
    auctionMetadata: AuctionMetadata;
    whitelist: Whitelist;
    round: Round;
    friktionEpochInfo: FriktionEpochInfo;
    entropyRound: EntropyRound;
    pendingDeposit: PendingDeposit;
    pendingWithdrawal: PendingWithdrawal;
}>;
export declare type VoltDefined = VoltTypes["Defined"];
export declare type VoltAccounts = VoltTypes["Accounts"];
export declare type VoltState = VoltTypes["State"];
export declare type VoltError = VoltTypes["Error"];
export declare type VoltProgram = VoltTypes["Program"];
export declare type VoltInstructions = VoltTypes["Instructions"];
export declare type VoltMethods = VoltTypes["Methods"];
export declare type VoltEvents = VoltTypes["Events"];
export declare type PendingDeposit = VoltAccounts["PendingDeposit"];
export declare type PendingWithdrawal = VoltAccounts["PendingWithdrawal"];
export declare type Round = VoltAccounts["Round"];
export declare type FriktionEpochInfo = VoltAccounts["FriktionEpochInfo"];
export declare type VoltVault = VoltAccounts["VoltVault"];
export declare type ExtraVoltData = VoltAccounts["ExtraVoltData"];
export declare type EntropyMetadata = VoltAccounts["EntropyMetadata"];
export declare type Whitelist = VoltAccounts["Whitelist"];
export declare type EntropyRound = VoltAccounts["EntropyRound"];
export declare type AuctionMetadata = VoltAccounts["AuctionMetadata"];
export declare type WithKey = {
    key: PublicKey;
};
export declare type PendingDepositWithKey = PendingDeposit & WithKey;
export declare type PendingWithdrawalWithKey = PendingWithdrawal & WithKey;
export declare type RoundWithKey = Round & WithKey;
export declare type FriktionEpochInfoWithKey = FriktionEpochInfo & WithKey;
export declare type EntropyRoundWithKey = EntropyRound & WithKey;
export declare type VoltVaultWithKey = VoltVault & WithKey;
export declare type ExtraVoltDataWithKey = ExtraVoltData & WithKey;
export declare type WhitelistWithKey = Whitelist & WithKey;
export declare type AuctionMetadataWithKey = AuctionMetadata & WithKey;
export declare type GenericOptionsContract = {
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
export declare type GenericOptionsContractWithKey = GenericOptionsContract & {
    key: PublicKey;
};
export declare type VoltIXAccounts = {
    initialize: {
        [A in keyof Parameters<VoltProgram["instruction"]["initialize"]["accounts"]>[0]]: PublicKey;
    };
    changeCapacity: {
        [A in keyof Parameters<VoltProgram["instruction"]["changeCapacity"]["accounts"]>[0]]: PublicKey;
    };
    startRound: {
        [A in keyof Parameters<VoltProgram["instruction"]["startRound"]["accounts"]>[0]]: PublicKey;
    };
    endRound: {
        [A in keyof Parameters<VoltProgram["instruction"]["endRound"]["accounts"]>[0]]: PublicKey;
    };
    claimPending: {
        [A in keyof Parameters<VoltProgram["instruction"]["claimPending"]["accounts"]>[0]]: PublicKey;
    };
    claimPendingWithdrawal: {
        [A in keyof Parameters<VoltProgram["instruction"]["claimPendingWithdrawal"]["accounts"]>[0]]: PublicKey;
    };
    deposit: {
        [A in keyof Parameters<VoltProgram["instruction"]["deposit"]["accounts"]>[0]]: PublicKey;
    };
    withdraw: {
        [A in keyof Parameters<VoltProgram["instruction"]["withdraw"]["accounts"]>[0]]: PublicKey;
    };
    cancelPendingWithdrawal: {
        [A in keyof Parameters<VoltProgram["instruction"]["cancelPendingWithdrawal"]["accounts"]>[0]]: PublicKey;
    };
    rebalanceSettle: {
        [A in keyof Parameters<VoltProgram["instruction"]["rebalanceSettle"]["accounts"]>[0]]: PublicKey;
    };
    setNextOption: {
        [A in keyof Parameters<VoltProgram["instruction"]["setNextOption"]["accounts"]>[0]]: PublicKey;
    };
    rebalancePrepare: {
        [A in keyof Parameters<VoltProgram["instruction"]["rebalancePrepare"]["accounts"]>[0]]: PublicKey;
    };
    rebalanceSwapPremium: {
        [A in keyof Parameters<VoltProgram["instruction"]["rebalanceSwapPremium"]["accounts"]>[0]]: PublicKey;
    };
    rebalanceEnter: {
        [A in keyof Parameters<VoltProgram["instruction"]["rebalanceEnter"]["accounts"]>[0]]: PublicKey;
    };
    settleEnterFunds: {
        [A in keyof Parameters<VoltProgram["instruction"]["settleEnterFunds"]["accounts"]>[0]]: PublicKey;
    };
    settlePermissionedMarketPremiumFunds: {
        [A in keyof Parameters<VoltProgram["instruction"]["settlePermissionedMarketPremiumFunds"]["accounts"]>[0]]: PublicKey;
    };
    settleSwapPremiumFunds: {
        [A in keyof Parameters<VoltProgram["instruction"]["settleSwapPremiumFunds"]["accounts"]>[0]]: PublicKey;
    };
    initSerumMarket: {
        [A in keyof Parameters<VoltProgram["instruction"]["initSerumMarket"]["accounts"]>[0]]: PublicKey;
    };
};
//# sourceMappingURL=voltTypes.d.ts.map