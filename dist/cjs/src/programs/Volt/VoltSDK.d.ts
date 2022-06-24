import type NodeBank from "@friktion-labs/entropy-client";
import type { EntropyAccount, EntropyCache, EntropyGroup, RootBank } from "@friktion-labs/entropy-client";
import { EntropyClient } from "@friktion-labs/entropy-client";
import * as anchor from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";
import type { FriktionSDK } from "../..";
import type { OptionsProtocol, PerpProtocol } from "../../constants";
import { VoltStrategy, VoltType } from "../../constants";
import type { EntropyRoundWithKey, ExtraVoltDataWithKey, FriktionEpochInfoWithKey, PendingDepositWithKey, PendingWithdrawalWithKey, RoundWithKey, VoltVault } from ".";
import type { AuctionMetadata, EntropyMetadata, ExtraVoltData, GenericOptionsContractWithKey } from "./voltTypes";
export declare class VoltSDK {
    readonly sdk: FriktionSDK;
    readonly voltVault: VoltVault;
    readonly voltKey: PublicKey;
    extraVoltData: ExtraVoltData | undefined;
    normFactor: Decimal | undefined;
    constructor(sdk: FriktionSDK, voltVault: VoltVault, voltKey: PublicKey, extraVoltData?: ExtraVoltData | undefined);
    mintNameFromKey(key: PublicKey): string;
    printStrategyParams(): Promise<void>;
    getCurrentOptionsContractOrNull(): Promise<GenericOptionsContractWithKey | null>;
    printOptionsContract(key: PublicKey, optionsProtocol?: OptionsProtocol): Promise<void>;
    getStrikeFromOptionsContract(optionsContract: GenericOptionsContractWithKey): Promise<Decimal>;
    getCurrentOptionsContract(): Promise<GenericOptionsContractWithKey>;
    optionsContractToDetailsString(optionsContract: GenericOptionsContractWithKey): Promise<string>;
    perpMarketToName(perpMarketKey: PublicKey): string;
    headlineTokenPrice(): Promise<Decimal>;
    depositTokenPrice(): Promise<Decimal>;
    requiresSwapPremium(): boolean;
    definitelyDoesntRequirePermissionedSettle(): boolean;
    printState(): Promise<void>;
    needsExtraVoltData(): boolean;
    isKeyAStableCoin(key: PublicKey): boolean;
    isOptionsContractACall(optionsContract: GenericOptionsContractWithKey): boolean;
    isCall(): boolean;
    getHedgingInstrument(): Promise<PublicKey>;
    specificVoltName(): Promise<string>;
    printEntropyPositionStats(): Promise<void>;
    voltName(): Promise<string>;
    voltStrategy(): Promise<VoltStrategy>;
    voltNumber(): Promise<number>;
    voltType(): VoltType;
    roundNumber(): BN;
    isPremiumBased(): boolean;
    static withdrawalFeeAmount(numTokensWithdrawn: BN): BN;
    static performanceFeeAmount(numTokensGained: BN): BN;
    static extraVoltDataForVoltKey(voltKey: anchor.web3.PublicKey, sdk: FriktionSDK): Promise<ExtraVoltDataWithKey>;
    static findUnderlyingOpenOrdersAddress(voltKey: PublicKey, spotSerumMarketKey: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findUnderlyingOpenOrdersMetadataAddress(voltKey: PublicKey, spotSerumMarketKey: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findExtraVoltDataAddress(voltKey: PublicKey, voltProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findSerumMarketAddress(voltKey: PublicKey, whitelistMintKey: PublicKey, optionMarketKey: PublicKey, voltProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findAuctionMetadataAddress(voltKey: PublicKey, voltProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findEntropyMetadataAddress(voltKey: PublicKey, voltProgramId?: PublicKey): Promise<[PublicKey, number]>;
    static findEntropyOpenOrdersAddress(voltKey: PublicKey, marketAddress: PublicKey, voltProgramId?: PublicKey): Promise<[PublicKey, number]>;
    /**
     * For an admin to create a volt
     *
     * spotMarket and seed are dynamically generated. Change the code if you want custom.
     */
    static initializeVoltWithoutOptionMarketSeed({ sdk, adminKey, underlyingAssetMint, quoteAssetMint, permissionedMarketPremiumMint, underlyingAmountPerContract, serumProgramId, expirationInterval, capacity, individualCapacity, permissionlessAuctions, seed, }: {
        sdk: FriktionSDK;
        adminKey: PublicKey;
        underlyingAssetMint: PublicKey;
        quoteAssetMint: PublicKey;
        permissionedMarketPremiumMint: PublicKey;
        underlyingAmountPerContract: BN;
        serumProgramId: PublicKey;
        expirationInterval: anchor.BN;
        capacity: anchor.BN;
        individualCapacity: anchor.BN;
        permissionlessAuctions: boolean;
        seed?: PublicKey;
    }): Promise<{
        instruction: TransactionInstruction;
        voltKey: PublicKey;
    }>;
    static findInitializeAddresses(sdk: FriktionSDK, whitelistTokenMintKey: PublicKey, vaultType: VoltType, pdaParams: {
        seed?: PublicKey;
        pdaStr?: string;
    }): Promise<{
        vault: PublicKey;
        vaultBump: number;
        vaultAuthorityBump: number;
        extraVoltKey: PublicKey;
        vaultMint: PublicKey;
        vaultAuthority: PublicKey;
        depositPoolKey: PublicKey;
        premiumPoolKey: PublicKey;
        permissionedMarketPremiumPoolKey: PublicKey;
        whitelistTokenAccountKey: PublicKey;
        auctionMetadataKey: PublicKey;
        seed?: PublicKey;
    }>;
    static findBackupPoolAddresses(voltKey: PublicKey, voltVault: VoltVault): Promise<{
        backupOptionPoolKey: PublicKey;
        backupWriterTokenPoolKey: PublicKey;
    }>;
    static findEntropyAccountAddress(voltKey: PublicKey): Promise<[PublicKey, number]>;
    static findEntropyLendingAccountAddress(voltKey: PublicKey): Promise<[PublicKey, number]>;
    static initializeEntropyVolt({ sdk, adminKey, pdaStr, underlyingAssetMint, whitelistTokenMintKey, serumProgramId, entropyProgramId, entropyGroupKey, targetPerpMarket, spotPerpMarket, spotMarket, targetLeverageRatio, targetLeverageLenience, targetHedgeLenience, shouldHedge, hedgeWithSpot, targetHedgeRatio, rebalancingLenience, requiredBasisFromOracle, exitEarlyRatio, capacity, individualCapacity, }: {
        sdk: FriktionSDK;
        adminKey: PublicKey;
        pdaStr: string;
        underlyingAssetMint: PublicKey;
        whitelistTokenMintKey: PublicKey;
        serumProgramId: PublicKey;
        entropyProgramId: PublicKey;
        entropyGroupKey: PublicKey;
        targetPerpMarket: PublicKey;
        spotPerpMarket: PublicKey;
        spotMarket: PublicKey;
        targetLeverageRatio: number;
        targetLeverageLenience: number;
        targetHedgeLenience: number;
        shouldHedge: boolean;
        hedgeWithSpot: boolean;
        targetHedgeRatio: number;
        rebalancingLenience: number;
        requiredBasisFromOracle: number;
        exitEarlyRatio: number;
        capacity: anchor.BN;
        individualCapacity: anchor.BN;
    }): Promise<{
        instruction: TransactionInstruction;
        voltKey: PublicKey;
    }>;
    /**
     * For an admin to create a volt
     *
     * spotMarket and seed are dynamically generated. Change the code if you want custom.
     */
    static initializeVolt({ sdk, adminKey, optionMarket, permissionedMarketPremiumMint, serumProgramId, expirationInterval, capacity, individualCapacity, permissionlessAuctions, seed, }: {
        sdk: FriktionSDK;
        adminKey: PublicKey;
        optionMarket: GenericOptionsContractWithKey;
        permissionedMarketPremiumMint: PublicKey;
        serumProgramId: PublicKey;
        expirationInterval: anchor.BN;
        capacity: anchor.BN;
        individualCapacity: anchor.BN;
        permissionlessAuctions: boolean;
        seed?: PublicKey;
    }): Promise<{
        instruction: TransactionInstruction;
        voltKey: PublicKey;
    }>;
    getCoingeckoPrice(id: string): Promise<Decimal>;
    oraclePriceForTokenIndex(entropyGroup: EntropyGroup, entropyCache: EntropyCache, tokenIndex: number): Decimal;
    oraclePriceForMint(entropyGroup: EntropyGroup, entropyCache: EntropyCache, mint: PublicKey): Decimal;
    oraclePriceForDepositToken(entropyGroup: EntropyGroup, entropyCache: EntropyCache): Decimal;
    getTvlWithoutPending(): Promise<Decimal>;
    getVaultMintSupplyWithBurnedWithdrawals(): Promise<BN>;
    getTvlStats(): Promise<{
        tvl: Decimal;
        usdTvl: Decimal;
        strategyDeposits: Decimal;
        pendingDeposits: Decimal;
        pendingWithdrawals: Decimal;
    }>;
    depositMint(): PublicKey;
    getTvl(): Promise<Decimal>;
    getTvlInDepositToken(): Promise<Decimal>;
    getTvlWithoutPendingInDepositToken(normFactor?: Decimal | undefined): Promise<Decimal>;
    getTvlWithoutPendingInDepositTokenWithNormFactor(normFactor: Decimal): Promise<Decimal>;
    getCurrentlyPendingDeposits(): Promise<BN>;
    getCurrentlyPendingWithdrawals(totalValueValueExcludingPendingDeposits?: Decimal): Promise<BN>;
    getBalancesForUser(pubkey: PublicKey): Promise<{
        totalBalance: Decimal;
        normalBalance: Decimal;
        pendingDeposits: Decimal;
        pendingWithdrawals: Decimal;
        mintableShares: Decimal;
        claimableUnderlying: Decimal;
        normFactor: Decimal;
        vaultNormFactor: Decimal;
    } | undefined>;
    /**
     * normalization factor based on # of decimals of underlying token
     */
    getDepositTokenNormalizationFactor(): Promise<Decimal>;
    static findPermissionedMarketPremiumPoolAddress(voltKey: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findWhitelistTokenAccountAddress(voltKey: PublicKey, whitelistMintKey: PublicKey, voltProgramId: PublicKey): Promise<[anchor.web3.PublicKey, number]>;
    static findEpochInfoAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findEntropyRoundInfoAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findRoundInfoAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findRoundVoltTokensAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findRoundUnderlyingTokensAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findRoundUnderlyingPendingWithdrawalsAddress(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findRoundAddresses(voltKey: PublicKey, roundNumber: BN, voltProgramId: PublicKey): Promise<{
        roundInfoKey: PublicKey;
        roundInfoKeyBump: number;
        roundUnderlyingTokensKey: PublicKey;
        roundUnderlyingTokensKeyBump: number;
        roundVoltTokensKey: PublicKey;
        roundVoltTokensKeyBump: number;
        roundUnderlyingPendingWithdrawalsKey: PublicKey;
        roundUnderlyingPendingWithdrawalsBump: number;
        entropyRoundInfoKey: PublicKey;
        entropyRoundInfoBump: number;
        epochInfoKey: PublicKey;
        epochInfoBump: number;
    }>;
    static findUsefulAddresses(voltKey: PublicKey, voltVault: VoltVault, user: PublicKey, voltProgramId: PublicKey): Promise<{
        extraVoltKey: PublicKey;
        pendingDepositInfoKey: PublicKey;
        roundInfoKey: PublicKey;
        roundVoltTokensKey: PublicKey;
        roundUnderlyingTokensKey: PublicKey;
        pendingWithdrawalInfoKey: PublicKey;
        roundUnderlyingPendingWithdrawalsKey: PublicKey;
        epochInfoKey: PublicKey;
        epochInfoBump: number;
    }>;
    static findMostRecentVoltTokensAddress(voltKey: PublicKey, user: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findPendingDepositInfoAddress(voltKey: PublicKey, user: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findPendingDepositAddresses(voltKey: PublicKey, user: PublicKey, voltProgramId: PublicKey): Promise<{
        pendingDepositInfoKey: PublicKey;
        pendingDepositInfoKeyBump: number;
    }>;
    static findPendingWithdrawalInfoAddress(voltKey: PublicKey, user: PublicKey, voltProgramId: PublicKey): Promise<[PublicKey, number]>;
    static findSetNextOptionAddresses(voltKey: PublicKey, optionMint: PublicKey, writerTokenMint: PublicKey, voltProgramId: PublicKey): Promise<{
        optionPoolKey: anchor.web3.PublicKey;
        optionPoolBump: number;
        writerTokenPoolKey: anchor.web3.PublicKey;
        writerTokenPoolBump: number;
    }>;
    findVaultAuthorityPermissionedOpenOrdersKey(serumMarketKey: PublicKey): Promise<{
        openOrdersKey: anchor.web3.PublicKey;
        openOrdersBump: number;
    }>;
    static findPermissionedOpenOrdersKey(middlewareProgramId: PublicKey, user: PublicKey, serumMarketKey: PublicKey, dexProgramId: PublicKey): Promise<{
        openOrdersKey: anchor.web3.PublicKey;
        openOrdersBump: number;
    }>;
    getEpochInfoByKey(key: PublicKey): Promise<FriktionEpochInfoWithKey>;
    getEpochInfoByNumber(roundNumber: anchor.BN): Promise<FriktionEpochInfoWithKey>;
    getCurrentEpochInfo(): Promise<FriktionEpochInfoWithKey>;
    getEntropyRoundByKey(key: PublicKey): Promise<EntropyRoundWithKey>;
    getEntropyRoundByNumber(roundNumber: anchor.BN): Promise<EntropyRoundWithKey>;
    getCurrentEntropyRound(): Promise<EntropyRoundWithKey>;
    getCurrentRound(): Promise<RoundWithKey>;
    getAllRounds(): Promise<RoundWithKey[]>;
    getRoundByKey(key: PublicKey): Promise<RoundWithKey>;
    getRoundByNumber(roundNumber: anchor.BN): Promise<RoundWithKey>;
    loadInExtraVoltData(): Promise<void>;
    getExtraVoltData(): Promise<ExtraVoltDataWithKey>;
    getEntropyMetadata(): Promise<EntropyMetadata>;
    getAuctionMetadata(): Promise<AuctionMetadata>;
    getAuctionMetadataByKey(key: PublicKey): Promise<AuctionMetadata>;
    getRoundVoltTokensByNumber(roundNumber: anchor.BN): Promise<BN>;
    getRoundUnderlyingTokensByNumber(roundNumber: anchor.BN): Promise<BN>;
    getAllPendingDeposits(): Promise<PendingDepositWithKey[]>;
    getPendingDepositByKey(key: PublicKey): Promise<PendingDepositWithKey>;
    getPendingDepositForGivenUser(user: PublicKey): Promise<PendingDepositWithKey>;
    getPendingWithdrawalForGivenUser(user: PublicKey): Promise<PendingWithdrawalWithKey>;
    getAllPendingWithdrawals(): Promise<PendingWithdrawalWithKey[]>;
    getPendingWithdrawalByKey(key: PublicKey): Promise<PendingWithdrawalWithKey>;
    getEntropyAccountByKey(key: PublicKey, perpProtocol?: PerpProtocol): Promise<{
        account: EntropyAccount;
        perpProtocol: PerpProtocol;
    }>;
    getOptionsContractByKey(key: PublicKey, optionsProtocol?: OptionsProtocol): Promise<GenericOptionsContractWithKey>;
    getRootAndNodeBank(entropyGroup: EntropyGroup): Promise<{
        rootBank: RootBank;
        nodeBank: NodeBank.NodeBank;
    }>;
    getOptionsProtocolForKey(key: PublicKey): Promise<OptionsProtocol>;
    getPerpProtocolForKey(key: PublicKey): Promise<PerpProtocol>;
    getEntropyGroup(entropyProgramId: PublicKey, entropyGroupKey: PublicKey): Promise<{
        entropyClient: EntropyClient;
        entropyGroup: EntropyGroup;
    }>;
    getEntropyObjects(entropyProgramId: PublicKey, entropyGroupKey: PublicKey, entropyAccountKey: PublicKey): Promise<{
        entropyClient: EntropyClient;
        entropyGroup: EntropyGroup;
        entropyAccount: EntropyAccount;
        entropyCache: EntropyCache;
    }>;
    getEntropyLendingTvl(): Promise<{
        tvlDepositToken: Decimal;
        tvlUsd: Decimal;
    }>;
    getEntropyLendingTvlInDepositToken(): Promise<Decimal>;
    getEntropyLendingKeys(entropyGroupGivenKey?: PublicKey, entropyProgramGivenKey?: PublicKey): Promise<{
        entropyLendingProgramKey: PublicKey;
        entropyLendingGroupKey: PublicKey;
        entropyLendingAccountKey: PublicKey;
    }>;
    getEntropyLendingObjects(): Promise<{
        entropyClient: EntropyClient;
        entropyGroup: EntropyGroup;
        entropyAccount: EntropyAccount;
        entropyCache: EntropyCache;
    }>;
    getEntropyObjectsForEvData(): Promise<{
        entropyClient: EntropyClient;
        entropyGroup: EntropyGroup;
        entropyAccount: EntropyAccount;
        entropyCache: EntropyCache;
    }>;
    static getGroupAndBanks(client: EntropyClient, entropyGroupKey: PublicKey, mint: PublicKey): Promise<{
        entropyGroup: EntropyGroup;
        rootBank: RootBank | undefined;
        nodeBank: NodeBank.NodeBank | undefined;
        quoteRootBank: RootBank | undefined;
        quoteNodeBank: NodeBank.NodeBank | undefined;
        depositIndex: number;
    }>;
    getGroupAndBanksForEvData(client: EntropyClient, mint: PublicKey): Promise<{
        entropyGroup: EntropyGroup;
        rootBank: RootBank | undefined;
        nodeBank: NodeBank.NodeBank | undefined;
        quoteRootBank: RootBank | undefined;
        quoteNodeBank: NodeBank.NodeBank | undefined;
        depositIndex: number;
    }>;
    getPnlForEpoch(roundNumber: BN, subtractFees?: boolean): Promise<Decimal>;
    getApportionedPnlForEpoch(roundNumber: BN, getApportionedPnlForRound: BN, subtractFees?: boolean): Promise<Decimal>;
    getUserPendingDepositUnderlying(user: PublicKey): Promise<Decimal>;
    getUserMintableShares(user: PublicKey): Promise<BN>;
    getUserMintableSharesForRound(user: PublicKey, roundNumber: BN): Promise<BN>;
    getCurrentMarketAndAuthorityInfo(): Promise<{
        serumMarketKey: anchor.web3.PublicKey;
        marketAuthority: anchor.web3.PublicKey;
        marketAuthorityBump: number;
    }>;
    getMarketAndAuthorityInfo(optionMarketKey: PublicKey): Promise<{
        serumMarketKey: anchor.web3.PublicKey;
        marketAuthority: anchor.web3.PublicKey;
        marketAuthorityBump: number;
    }>;
}
//# sourceMappingURL=VoltSDK.d.ts.map