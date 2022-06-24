/// <reference types="bn.js" />
import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { FriktionSDK } from "../../FriktionSDK";
import type { NetworkName } from "../../helperTypes";
import type { SimpleSwapOrder, SimpleSwapProgram, SimpleSwapUserOrdersWithKey } from "./swapTypes";
export declare const DefaultSwapSDKOpts: {
    network: string;
};
export declare type SwapSDKOpts = {
    provider: ProviderLike;
    network?: NetworkName;
};
export declare class SwapSDK {
    readonly swapOrder: SimpleSwapOrder;
    readonly swapOrderKey: PublicKey;
    readonly program: SimpleSwapProgram;
    readonly readonlyProvider: AnchorProvider;
    readonly network: NetworkName;
    constructor(swapOrder: SimpleSwapOrder, swapOrderKey: PublicKey, opts: SwapSDKOpts);
    getUserOrdersByKey(key: PublicKey): Promise<SimpleSwapUserOrdersWithKey>;
    static findSwapOrderAddress(user: PublicKey, orderId: BN, swapProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findGivePoolAddress(swapOrderKey: PublicKey, swapProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findReceivePoolAddress(swapOrderKey: PublicKey, swapProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findUserOrdersAddress(user: PublicKey, swapProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static create(sdk: FriktionSDK, user: PublicKey, giveMint: PublicKey, receiveMint: PublicKey, creatorGivePool: PublicKey, giveSize: BN, receiveSize: BN, expiry: number, counterparty?: PublicKey, whitelistTokenMint?: PublicKey): Promise<{
        instruction: TransactionInstruction;
        swapOrderKey: PublicKey;
    }>;
    exec(user: PublicKey, giveTokenAccount: PublicKey, receiveTokenAccount: PublicKey, whitelistTokenAccount?: PublicKey): TransactionInstruction;
    claim(user: PublicKey, giveTokenAccount: PublicKey, receiveTokenAccount: PublicKey): TransactionInstruction;
    cancel(user: PublicKey, giveTokenAccount: PublicKey): TransactionInstruction;
}
//# sourceMappingURL=SwapSDK.d.ts.map