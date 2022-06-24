/// <reference types="bn.js" />
import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type Decimal from "decimal.js";
import type { FriktionSDK } from "../..";
import { RuntimeEnvironment } from "../..";
import type { NetworkName } from "../../helperTypes";
import type { GenericOptionsContractWithKey } from "../Volt";
import type { InertiaContractWithKey, InertiaProgram, InertiaStubOracleWithKey } from "./inertiaTypes";
export interface InertiaNewMarketParams {
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
export interface InertiaRevertSettleOptionParams {
    user: PublicKey;
}
export interface InertiaSettleOptionParams {
    user: PublicKey;
    settlePrice?: BN;
    env?: RuntimeEnvironment;
}
export interface InertiaExerciseOptionParams {
    user: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: BN;
}
export interface InertiaWriteOptionParams {
    user: PublicKey;
    writerUnderlyingFundingTokens: PublicKey;
    writerTokenDestination: PublicKey;
    optionTokenDestination: PublicKey;
    amount: BN;
    feeDestination: PublicKey;
}
export interface InertiaRedeemOptionParams {
    user: PublicKey;
    redeemerTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: number;
}
export interface InertiaClosePositionParams {
    user: PublicKey;
    writerTokenSource: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: number;
}
export declare const DefaultInertiaSDKOpts: {
    network: string;
};
export declare type InertiaSDKOpts = {
    provider: ProviderLike;
    network?: NetworkName;
};
export declare class InertiaSDK {
    readonly optionsContract: InertiaContractWithKey;
    readonly optionKey: PublicKey;
    readonly program: InertiaProgram;
    readonly readonlyProvider?: AnchorProvider;
    readonly network: NetworkName;
    constructor(optionMarket: InertiaContractWithKey, opts: InertiaSDKOpts);
    asOptionMarket(): GenericOptionsContractWithKey;
    canExercise(): boolean;
    getStrike(): Promise<Decimal>;
    static getStubOracleByKey(sdk: FriktionSDK, key: PublicKey): Promise<InertiaStubOracleWithKey>;
    static findStubOracleAddress(user: PublicKey, pdaString: string, programId?: PublicKey): Promise<[PublicKey, number]>;
    static createStubOracle(sdk: FriktionSDK, user: PublicKey, price: number, pdaString: string): Promise<{
        oracleKey: PublicKey;
        instruction: TransactionInstruction;
    }>;
    static setStubOracle(sdk: FriktionSDK, user: PublicKey, stubOracleKey: PublicKey, price: number): TransactionInstruction;
    getInertiaExerciseFeeAccount(): Promise<PublicKey>;
    static getGenericInertiaExerciseFeeAccount(quoteAssetMint: PublicKey): Promise<PublicKey>;
    isCall(): boolean;
    mintFeeAmount(numOptionTokensMinted: BN): BN;
    static getOptionMarketByKey(program: InertiaProgram, key: PublicKey): Promise<GenericOptionsContractWithKey>;
    static getProgramAddress(program: InertiaProgram, kind: "OptionsContract" | "WriterMint" | "OptionMint" | "UnderlyingPool" | "ClaimablePool", underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmount: BN, quoteAmount: BN, expiry: BN, isCall: boolean): Promise<[PublicKey, number]>;
    exercise(params: InertiaExerciseOptionParams): TransactionInstruction;
    settle(params: InertiaSettleOptionParams, bypassCode?: BN): Promise<TransactionInstruction>;
    revertSettle(params: InertiaRevertSettleOptionParams): Promise<TransactionInstruction>;
    write(params: InertiaWriteOptionParams): TransactionInstruction;
    redeem(params: InertiaRedeemOptionParams): TransactionInstruction;
    close(params: InertiaClosePositionParams): TransactionInstruction;
}
//# sourceMappingURL=InertiaSDK.d.ts.map