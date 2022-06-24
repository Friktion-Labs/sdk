/// <reference types="bn.js" />
import { BN, Program, Provider, web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
interface InitializeMarketParams {
    optionContract: PublicKey;
    optionMint: PublicKey;
    quoteCurrencyDustLimit: BN;
    quoteCurrencyLotSize: BN;
    quoteCurrencyMint: PublicKey;
    serumProgram: PublicKey;
    eventQueue?: PublicKey;
    bids?: PublicKey;
    asks?: PublicKey;
}
export declare const initializeMarket: (program: Program, provider: Provider, params: InitializeMarketParams) => Promise<{
    tx: string;
    serumMarket: web3.PublicKey;
    eventQueue: web3.PublicKey;
    bids: web3.PublicKey;
    asks: web3.PublicKey;
    quoteVault: web3.PublicKey;
    optionContract: PublicKey;
    optionMint: PublicKey;
    quoteCurrencyDustLimit: BN;
    quoteCurrencyLotSize: BN;
    quoteCurrencyMint: PublicKey;
    serumProgram: PublicKey;
}>;
export {};
//# sourceMappingURL=initialize_market.d.ts.map