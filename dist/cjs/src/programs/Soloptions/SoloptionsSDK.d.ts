/// <reference types="bn.js" />
import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { SolanaProvider } from "@saberhq/solana-contrib";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { FriktionSDK, GenericOptionsContractWithKey } from "../..";
import type { NetworkName } from "../../helperTypes";
import type { SoloptionsContractWithKey, SoloptionsProgram } from "./soloptionsTypes";
export interface NewMarketParams {
    user: PublicKey;
    quoteMint: PublicKey;
    underlyingMint: PublicKey;
    underlyingAmount: BN;
    quoteAmount: BN;
    expiryTs: number;
    mintFeeAccount: PublicKey;
    exerciseFeeAccount: PublicKey;
}
export interface ExerciseOptionParams {
    user: PublicKey;
    quoteTokenSource: PublicKey;
    optionTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    amount: BN;
}
export interface WriteOptionParams {
    user: PublicKey;
    writerUnderlyingFundingTokens: PublicKey;
    writerTokenDestination: PublicKey;
    optionTokenDestination: PublicKey;
    amount: BN;
}
export interface RedeemOptionParams {
    user: PublicKey;
    redeemerTokenSource: PublicKey;
    underlyingTokenDestination: PublicKey;
    quoteTokenDestination: PublicKey;
    amount: number;
}
export declare const DefaultSoloptionsSDKOpts: {
    network: string;
};
export declare type SoloptionsSDKOpts = {
    provider: ProviderLike;
    network?: NetworkName;
};
export declare class SoloptionsSDK {
    readonly optionsContract: SoloptionsContractWithKey;
    readonly optionKey: PublicKey;
    readonly program: SoloptionsProgram;
    readonly readonlyProvider: AnchorProvider;
    readonly network: NetworkName;
    constructor(friktionSdk: FriktionSDK, optionMarket: SoloptionsContractWithKey);
    getSoloptionsExerciseFeeAccount(): Promise<PublicKey>;
    static getGenericSoloptionsExerciseFeeAccount(quoteAssetMint: PublicKey): Promise<PublicKey>;
    mintFeeAmount(numOptionTokensMinted: BN): BN;
    exerciseFeeAmount(numOptionTokensToExercise: BN): BN;
    static getOptionMarketByKey(program: SoloptionsProgram, key: PublicKey): Promise<GenericOptionsContractWithKey>;
    static getProgramAddress(program: SoloptionsProgram, kind: "OptionsContract" | "WriterMint" | "OptionMint", underlyingMint: PublicKey, quoteMint: PublicKey, underlyingAmount: BN, quoteAmount: BN, expiry: number): Promise<[PublicKey, number]>;
    static initializeOptionMarketAndGetSdk(sdk: FriktionSDK, opts: SoloptionsSDKOpts, providerMut: SolanaProvider, params: NewMarketParams, user: PublicKey): Promise<{
        ix: TransactionInstruction;
        optionMarket: GenericOptionsContractWithKey;
        optionKey: PublicKey;
    }>;
    canExercise(): boolean;
    exercise(params: ExerciseOptionParams): Promise<TransactionInstruction>;
    write(params: WriteOptionParams): Promise<TransactionInstruction>;
    redeem(params: RedeemOptionParams): TransactionInstruction;
}
//# sourceMappingURL=SoloptionsSDK.d.ts.map