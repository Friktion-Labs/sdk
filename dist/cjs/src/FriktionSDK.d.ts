import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { InertiaSDK, SoloptionsSDK, SpreadsSDK, VoltSDK } from ".";
import type { NetworkSpecificConstants, OptionsProtocol } from "./constants";
import type { NetworkName } from "./helperTypes";
import type { InertiaContractWithKey, InertiaProgram } from "./programs/Inertia/inertiaTypes";
import type { SoloptionsContractWithKey, SoloptionsProgram } from "./programs/Soloptions/soloptionsTypes";
import type { SpreadsContractWithKey, SpreadsProgram } from "./programs/Spreads/spreadsTypes";
import { SwapSDK } from "./programs/Swap/SwapSDK";
import type { SimpleSwapProgram, SimpleSwapUserOrdersWithKey } from "./programs/Swap/swapTypes";
import type { VoltProgram, VoltVault, Whitelist } from "./programs/Volt";
import type { ExtraVoltData, GenericOptionsContractWithKey } from "./programs/Volt/voltTypes";
export declare type LegacyAnchorPrograms = {
    Volt: Program;
    Soloptions: Program;
    Inertia: Program;
};
export declare type FriktionPrograms = {
    Volt: VoltProgram;
    Soloptions: SoloptionsProgram;
    Inertia: InertiaProgram;
    Spreads: SpreadsProgram;
    SimpleSwap: SimpleSwapProgram;
};
export declare type NetOpts = {
    MM_TOKEN_MINT: PublicKey;
};
export declare type TestingOpts = {
    netOpts: NetOpts;
};
export declare type FriktionSDKOpts = {
    provider: ProviderLike;
    network?: NetworkName;
    testingOpts?: TestingOpts;
};
/**
 * The API needs to be stable!!! DONT CHANGE.
 * NOTE: Adding new items is ok but under no circumstances change names of existing variables.
 */
export declare type VoltSnapshot = {
    globalId: string;
    voltVaultId: string;
    extraVaultDataId: string;
    vaultAuthority: string;
    quoteMint: string;
    underlyingMint: string;
    depositTokenMint: string;
    shareTokenMint: string;
    shareTokenSymbol: string;
    shareTokenDecimals: number;
    depositPool: string;
    premiumPool: string;
    spotSerumMarketId: string;
    depositTokenSymbol: string;
    depositTokenCoingeckoId: string;
    underlyingTokenSymbol: string;
    underlyingTokenCoingeckoId: string;
    voltType: number;
    apy: number;
    abnormalEpochLength?: number;
    isVoltage: boolean;
    isInCircuits: boolean;
    highVoltage: string;
};
export declare type FriktionSnapshot = {
    updateTime: number;
    totalTvlUSD: number;
    coinsByCoingeckoId: Record<string, number>;
    sharePricesByGlobalId: Record<string, number>;
    pricesByCoingeckoId: Record<string, number>;
    depositTokenByGlobalId: Record<string, number>;
    usdValueByGlobalId: Record<string, number>;
    globalIdToDepositTokenCoingeckoId: Record<string, string>;
    apyByGlobalId: Record<string, number>;
    allMainnetVolts: VoltSnapshot | {}[];
    allDevnetVolts: VoltSnapshot | {}[];
};
export declare const DefaultFriktionSDKOpts: {
    network: string;
};
/**
 * sdk is stateless and readonly unless a signer is loaded.
 */
export declare class FriktionSDK {
    readonly programs: FriktionPrograms;
    readonly legacyAnchorPrograms: LegacyAnchorPrograms;
    readonly readonlyProvider: AnchorProvider;
    readonly network: NetworkName;
    readonly testingOpts?: TestingOpts;
    constructor(opts: FriktionSDKOpts);
    loadVolt(voltVault: VoltVault, voltKey: PublicKey): VoltSDK;
    loadVoltAndExtraData(voltVault: VoltVault, voltKey: PublicKey, extraVoltData: ExtraVoltData): VoltSDK;
    /**
     * Returns constants for the current network
     */
    get net(): NetworkSpecificConstants;
    get devnet(): NetworkSpecificConstants;
    get mainnet(): void;
    loadUserOrdersByKey(key: PublicKey): Promise<SimpleSwapUserOrdersWithKey>;
    loadSwapByKey(swapOrderKey: PublicKey): Promise<SwapSDK>;
    /**
     * Please memo this.
     *
     * Automatically loads the volt for you by doing a RPC call. You may want to
     * load it yourself using sail, because loadVoltByKey doesn't have ANY
     * cacheing, so you could end up calling this 100 times.
     */
    loadVoltByKey(voltKey: PublicKey, extraVoltData?: ExtraVoltData | undefined): Promise<VoltSDK>;
    loadVoltAndExtraDataByKey(voltKey: PublicKey): Promise<VoltSDK>;
    getExtraVoltDataKey(voltKey: PublicKey): Promise<PublicKey>;
    getAllVoltVaults(): Promise<VoltSDK[]>;
    getAllVoltVaultsWithExtraVoltData(): Promise<VoltSDK[]>;
    getOptionsProtocolForKey(key: PublicKey): Promise<OptionsProtocol>;
    getOptionMarketByKey(key: PublicKey, optionsProtocol?: OptionsProtocol): Promise<GenericOptionsContractWithKey>;
    loadOptionsSDKByKey(key: PublicKey): Promise<SoloptionsSDK | InertiaSDK | SpreadsSDK>;
    loadSpreadsSDK(spreadsContract: SpreadsContractWithKey): SpreadsSDK;
    loadSpreadsSDKBykey(spreadsContractKey: PublicKey): Promise<SpreadsSDK>;
    loadInertiaSDK(inertiaContract: InertiaContractWithKey): InertiaSDK;
    loadInertiaSDKByKey(optionContractKey: PublicKey): Promise<InertiaSDK>;
    loadSoloptionsSDK(soloptionsContract: SoloptionsContractWithKey): SoloptionsSDK;
    loadSoloptionsSDKByKey(optionMarketKey: PublicKey): Promise<SoloptionsSDK>;
    getAllSoloptionsSDKs(): Promise<SoloptionsSDK[]>;
    getWhitelist(key: PublicKey): Promise<Whitelist>;
    initWhitelist(user: PublicKey, seed?: PublicKey): Promise<{
        instruction: TransactionInstruction;
        whitelistKey: PublicKey;
    }>;
    addWhitelist(user: PublicKey, whitelistKey: PublicKey, keyToAdd: PublicKey): TransactionInstruction;
    removeWhitelist(user: PublicKey, whitelistKey: PublicKey, keyToRemove: PublicKey): TransactionInstruction;
    /**
     * Parses Solana transaction logs and searches for error codes. Searches through
     * the IDL and also through the Anchor error codes.
     *
     * TODO: Solana program error  codes
     *
     * Example log:
     * const logs = [
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb invoke [1]",
     *   "Program log: blah blah",
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb consumed 85219 of 200000 compute units",
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb failed: custom program error: 0x137",
     * ];
     *
     * Example output: Program error in "foobar": some human readable error message from the idl (eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb 0x137 = 311)
     */
    static parseError(logs: string[]): {
        fullMessage: string;
        mainMessage: string;
        extraDetails: string;
    } | null;
}
//# sourceMappingURL=FriktionSDK.d.ts.map