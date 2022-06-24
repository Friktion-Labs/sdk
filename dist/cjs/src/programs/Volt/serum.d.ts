/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from "@project-serum/anchor";
import type { Middleware } from "@project-serum/serum";
import type { Connection, Signer, TransactionInstruction } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { VoltSDK } from "./VoltSDK";
/**
 * Create a MarketProxy
 *
 * @param program - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
export declare const marketLoaderFunction: (sdk: VoltSDK, whitelistTokenAccountKey: PublicKey) => (serumMarketKey: PublicKey) => Promise<import("@project-serum/serum").MarketProxy>;
/**
 * Create a MarketProxy
 *
 * @param middlewareProgram - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
export declare const marketLoader: (sdk: VoltSDK, serumMarketKey: PublicKey, whitelistTokenAccountKey: PublicKey) => Promise<import("@project-serum/serum").MarketProxy>;
export declare const getVaultOwnerAndNonce: (marketPublicKey: PublicKey, dexProgramId: PublicKey) => Promise<(PublicKey | BN)[]>;
export declare const openOrdersSeed: Buffer;
export declare class Validation implements Middleware {
    auctionMetadataKey: PublicKey;
    optionMarketKey: PublicKey;
    whitelistKey: PublicKey;
    marketAuthorityBump: number;
    constructor(auctionMetadataKey: PublicKey, optionMarketKey: PublicKey, whitelistKey: PublicKey, marketAuthorityBump: number);
    initOpenOrders(ix: TransactionInstruction): void;
    newOrderV3(ix: TransactionInstruction): void;
    cancelOrderV2(ix: TransactionInstruction): void;
    cancelOrderByClientIdV2(ix: TransactionInstruction): void;
    settleFunds(ix: TransactionInstruction): void;
    closeOpenOrders(ix: TransactionInstruction): void;
    prune(ix: TransactionInstruction): void;
    consumeEvents(_ix: TransactionInstruction): void;
    consumeEventsPermissioned(_ix: TransactionInstruction): void;
    addPdaKeys(ix: TransactionInstruction): TransactionInstruction;
}
export declare const getMarketAndAuthorityInfo: (sdk: VoltSDK, optionMarketKey: PublicKey) => Promise<{
    serumMarketKey: PublicKey;
    marketAuthority: PublicKey;
    marketAuthorityBump: number;
}>;
export declare const createFirstSetOfAccounts: ({ connection, userKey, dexProgramId, }: {
    connection: Connection;
    userKey: PublicKey;
    dexProgramId: PublicKey;
}) => Promise<{
    instructions: TransactionInstruction[];
    eventQueue: Keypair;
    bids: Keypair;
    asks: Keypair;
    signers: Signer[];
}>;
//# sourceMappingURL=serum.d.ts.map