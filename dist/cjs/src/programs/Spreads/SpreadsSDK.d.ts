/// <reference types="bn.js" />
import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { FriktionSDK } from "../..";
import type { NetworkName } from "../../helperTypes";
import type { SpreadsContractWithKey, SpreadsProgram, SpreadsStubOracleWithKey } from "./spreadsTypes";
export interface SpreadsNewMarketParams {
    user: PublicKey;
    quoteMint: PublicKey;
    underlyingMint: PublicKey;
    underlyingAmount: BN;
    quoteAmount: BN;
    expiryTs: BN;
    isCall: boolean;
    mintFeeAccount: PublicKey;
    exerciseFeeAccount: PublicKey;
}
export interface SpreadsRevertSettleOptionParams {
    user: PublicKey;
}
export interface SpreadsSettleOptionParams {
    user: PublicKey;
    settlePrice?: BN;
}
export interface SpreadsExerciseOptionParams {
    user: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: BN;
}
export interface SpreadsWriteOptionParams {
    user: PublicKey;
    writerUnderlyingFundingTokens: PublicKey;
    writerTokenDestination: PublicKey;
    optionTokenDestination: PublicKey;
    amount: BN;
    feeDestination: PublicKey;
}
export interface SpreadsRedeemOptionParams {
    user: PublicKey;
    redeemerTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: number;
}
export interface SpreadsClosePositionParams {
    user: PublicKey;
    writerTokenSource: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: number;
}
export declare const DefaultSpreadsSDKOpts: {
    network: string;
};
export declare type SpreadsSDKOpts = {
    provider: ProviderLike;
    network?: NetworkName;
};
export declare type NewSpreadsContractParams = {
    underlyingMint: PublicKey;
    quoteMint: PublicKey;
    underlyingAmountBuy: BN;
    quoteAmountBuy: BN;
    underlyingAmountSell: BN;
    quoteAmountSell: BN;
    expiryTs: BN;
    isCall: boolean;
    oracleAi: PublicKey;
    mintFeeAccount: PublicKey;
    exerciseFeeAccount: PublicKey;
};
export declare class SpreadsSDK {
    readonly spreadsContract: SpreadsContractWithKey;
    readonly spreadsKey: PublicKey;
    readonly program: SpreadsProgram;
    readonly readonlyProvider: AnchorProvider;
    readonly network: NetworkName;
    constructor(spreadsContract: SpreadsContractWithKey, opts: SpreadsSDKOpts);
    static createSpread(sdk: FriktionSDK, params: NewSpreadsContractParams, admin: PublicKey): Promise<{
        ix: TransactionInstruction;
        spreadsKey: PublicKey;
    }>;
    canExercise(): boolean;
    static getStubOracleByKey(sdk: FriktionSDK, key: PublicKey): Promise<SpreadsStubOracleWithKey>;
    static findStubOracleAddress(user: PublicKey, pdaString: string, programId?: PublicKey): Promise<[PublicKey, number]>;
    static createStubOracle(sdk: FriktionSDK, user: PublicKey, price: number, pdaString: string): Promise<{
        oracleKey: PublicKey;
        instruction: TransactionInstruction;
    }>;
    static setStubOracle(sdk: FriktionSDK, user: PublicKey, stubOracleKey: PublicKey, price: number): TransactionInstruction;
    getSpreadsExerciseFeeAccount(): Promise<PublicKey>;
    static getGenericSpreadsExerciseFeeAccount(quoteAssetMint: PublicKey): Promise<PublicKey>;
    isCall(): boolean;
    totalPossibleToMint(ulAmount: BN): BN;
    getRequiredCollateral(numOptionTokensMinted: BN): BN;
    mintFeeAmount(numOptionTokensMinted: BN): BN;
    static getSpreadsContractByKey(program: SpreadsProgram, key: PublicKey): Promise<SpreadsContractWithKey>;
    static getProgramAddress(program: SpreadsProgram, kind: "OptionsContract" | "WriterMint" | "OptionMint" | "UnderlyingPool" | "ClaimablePool", underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmount: BN, quoteAmount: BN, expiry: BN, isCall: boolean): Promise<[PublicKey, number]>;
    getOptionMintAddress(): Promise<PublicKey>;
    getWriterMintAddress(): Promise<PublicKey>;
    getClaimablePoolAddress(): Promise<PublicKey>;
    getUnderlyingPoolAddress(): Promise<PublicKey>;
    static findOptionMintAddress(contractKey: PublicKey, spreadsProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findWriterMintAddress(contractKey: PublicKey, spreadsProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findUnderlyingPoolAddress(contractKey: PublicKey, spreadsProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findClaimablePoolAddress(contractKey: PublicKey, spreadsProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findContractAddress(underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmountBuy: BN, quoteAmountBuy: BN, underlyingAmountSell: BN, quoteAmountSell: BN, expiryTs: BN, isCall: BN, spreadsProgramId?: PublicKey): Promise<[PublicKey, number]>;
    exercise(params: SpreadsExerciseOptionParams): TransactionInstruction;
    settle(params: SpreadsSettleOptionParams, bypassCode?: BN): Promise<TransactionInstruction>;
    revertSettle(params: SpreadsRevertSettleOptionParams): Promise<TransactionInstruction>;
    write(params: SpreadsWriteOptionParams): TransactionInstruction;
    redeem(params: SpreadsRedeemOptionParams): TransactionInstruction;
    close(params: SpreadsClosePositionParams): TransactionInstruction;
}
//# sourceMappingURL=SpreadsSDK.d.ts.map