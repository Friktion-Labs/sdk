import type { PerpMarket } from "@friktion-labs/entropy-client";
import { Market } from "@project-serum/serum";
import type { Connection, TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";
import type { OptionsProtocol } from "../../constants";
import { VoltSDK } from "./VoltSDK";
import type { PendingDepositWithKey, PendingWithdrawalWithKey } from "./voltTypes";
export declare class ConnectedVoltSDK extends VoltSDK {
    readonly connection: Connection;
    readonly wallet: PublicKey;
    readonly daoAuthority?: PublicKey | undefined;
    constructor(connection: Connection, user: PublicKey, voltSDK: VoltSDK, daoAuthority?: PublicKey | undefined);
    refresh(): Promise<ConnectedVoltSDK>;
    /**
     * humanDepositAmount: human readable amount of underlying token to deposit (e.g 1.1 USDC, 0.0004 BTC). this is normalized by the 10^(num decimals)
     * underlyingTokenSource: address of token account used to deposit tokens
     * vaultTokenDestination: if instant transfers are enabled, the token acccount that should receive the new vault tokens (shares of volt)
     * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
     **/
    deposit(humanDepositAmount: Decimal, underlyingTokenSource: PublicKey, vaultTokenDestination: PublicKey, daoAuthority?: PublicKey, decimals?: number): Promise<TransactionInstruction>;
    depositWithClaim(trueDepositAmount: Decimal, underlyingTokenSource: PublicKey, vaultTokenDestination: PublicKey, shouldTransferSol?: boolean, solTransferAuthority?: PublicKey, daoAuthority?: PublicKey, decimals?: number): Promise<TransactionInstruction>;
    getFeeTokenAccount(forPerformanceFees?: boolean): Promise<PublicKey>;
    getSoloptionsMintFeeAccount(): Promise<PublicKey>;
    getInertiaMintFeeAccount(): Promise<PublicKey>;
    getSoloptionsExerciseFeeAccount(): Promise<PublicKey>;
    getInertiaExerciseFeeAccount(): Promise<PublicKey>;
    /**
     * Do not provide withdrawAmount in num of vault tokens. Provide human amount.
     * you must normalize yourself
     */
    withdrawHumanAmount(withdrawAmount: Decimal, userVaultTokens: PublicKey, underlyingTokenDestination: PublicKey, daoAuthority?: PublicKey, normFactor?: Decimal | undefined, withClaim?: boolean): Promise<TransactionInstruction>;
    /**
     * withdrawAmount is in vault tokens, where 1 = smallest unit of token
     * userVaultTokens: token account for volt tokens (shares). Used to redeem underlying in volt
     * underlyingTokenDestination: token account to receive redeemed underlying tokens
     * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
     */
    withdraw(withdrawAmount: BN, userVaultTokens: PublicKey, underlyingTokenDestination: PublicKey, daoAuthority?: PublicKey): Promise<TransactionInstruction>;
    withdrawWithClaim(withdrawAmount: BN, userVaultTokens: PublicKey, underlyingTokenDestination: PublicKey, daoAuthority?: PublicKey): Promise<TransactionInstruction>;
    /**
     * cancel pending withdrawal
     */
    cancelPendingWithdrawal(userVaultTokens: PublicKey): Promise<TransactionInstruction>;
    /**
     * cancel pending deposit
     */
    cancelPendingDeposit(userUnderlyingTokens: PublicKey): Promise<TransactionInstruction>;
    claimPendingWithoutSigning(vaultTokenDestination: PublicKey, replacementAuthority?: PublicKey): Promise<TransactionInstruction>;
    claimPendingWithdrawalWithoutSigning(underlyingTokenDestinationKey: PublicKey, replacementAuthority?: PublicKey): Promise<TransactionInstruction>;
    claimPending(vaultTokenDestination: PublicKey, replacementAuthority?: PublicKey): Promise<TransactionInstruction>;
    claimPendingWithdrawal(underlyingTokenDestinationKey: PublicKey, replacementAuthority?: PublicKey): Promise<TransactionInstruction>;
    turnOffDepositsAndWithdrawals(code?: BN): Promise<TransactionInstruction>;
    changeQuoteMint(newQuoteMint: PublicKey): TransactionInstruction;
    bypassSettlement(userWriterTokenAccount: PublicKey): Promise<TransactionInstruction>;
    changeDecimalsByFactor(factor: BN): Promise<TransactionInstruction>;
    changeCapacity(capacity: BN, individualCapacity: BN): Promise<TransactionInstruction>;
    changeFees(performanceFeeBps: BN, withdrawalFeeBps: BN, dovTakeFeesInUnderlying?: boolean, useCustomFees?: boolean): Promise<TransactionInstruction>;
    changeAdmin(newAdmin: PublicKey): TransactionInstruction;
    changeAuctionParams(permissionlessAuctions: boolean): Promise<TransactionInstruction>;
    startRound(): Promise<TransactionInstruction>;
    startRoundEntropy(): Promise<TransactionInstruction>;
    takePerformanceFeesEntropy(): Promise<TransactionInstruction>;
    endRound(bypassCode?: BN): Promise<TransactionInstruction>;
    takePendingWithdrawalFees(): Promise<TransactionInstruction>;
    setNextOption(newOptionMarketKey: PublicKey, optionsProtocol?: OptionsProtocol): Promise<TransactionInstruction>;
    resetOptionMarket(): Promise<TransactionInstruction>;
    rebalancePrepare(): Promise<TransactionInstruction>;
    getPermissionedMarketReferrerPremiumAcct(): PublicKey;
    getReferrerQuoteAcct(mint: PublicKey): PublicKey;
    rebalanceEnter(clientPrice: BN, clientSize: BN, referrerQuoteAcctReplacement?: PublicKey, referralSRMAcctReplacement?: PublicKey): Promise<TransactionInstruction>;
    initSerumMarket(pcMint: PublicKey): Promise<{
        serumMarketKey: PublicKey;
        vaultOwner: PublicKey | BN | undefined;
        marketAuthority: PublicKey;
        marketAuthorityBump: number;
        instructions: TransactionInstruction[];
        signers: import("@solana/web3.js").Signer[];
    }>;
    rebalanceSettle(): Promise<TransactionInstruction>;
    rebalanceSwapPremium(spotSerumMarketKey: PublicKey, clientPrice?: BN, clientSize?: BN, usePermissionedMarketPremium?: boolean, referrerQuoteAcctReplacement?: PublicKey, referralSRMAcctReplacement?: PublicKey): Promise<TransactionInstruction>;
    attachWhitelist(whitelistKey: PublicKey): Promise<TransactionInstruction>;
    attachDao(daoProgramId: PublicKey, daoAuthority: PublicKey): Promise<TransactionInstruction>;
    detachDao(): Promise<TransactionInstruction>;
    settlePermissionedMarketPremiumFunds(): TransactionInstruction;
    settleEnterFunds(referrerQuoteAcctReplacement?: PublicKey): Promise<TransactionInstruction>;
    settleSwapPremiumFunds(spotSerumMarketKey: PublicKey, referrerQuoteAcctReplacement?: PublicKey): Promise<TransactionInstruction>;
    getPendingDepositForUser(): Promise<PendingDepositWithKey>;
    getPendingWithdrawalForUser(): Promise<PendingWithdrawalWithKey>;
    changeHedging(shouldHedge: boolean, hedgeWithSpot: boolean, targetHedgeRatio: number, targetHedgeLenience: number): Promise<TransactionInstruction>;
    resetRebalancing(onlyResetHedge: boolean): Promise<TransactionInstruction>;
    setStrategyParams(targetLeverageRatio: Decimal, targetLeverageLenience: Decimal, targetHedgeRatio: Decimal, targetHedgeLenience: Decimal): Promise<TransactionInstruction>;
    rebalanceEntropy(clientBidPrice?: BN, clientAskPrice?: BN, maxQuotePosChange?: BN, forceHedgeFirst?: boolean): Promise<TransactionInstruction>;
    getBidAskLimitsForSpot(serumMarket: Market, clientBidPrice?: BN, clientAskPrice?: BN): Promise<{
        bid: BN;
        ask: BN;
        bidSize: BN;
        askSize: BN;
    }>;
    getBidAskLimitsForEntropy(perpMarket: PerpMarket, clientBidPrice?: BN, clientAskPrice?: BN): Promise<{
        bid: BN;
        ask: BN;
    }>;
    rebalanceSpotEntropy(clientBidPrice?: BN, clientAskPrice?: BN, maxQuotePosChange?: BN): Promise<TransactionInstruction>;
    initSpotOpenOrdersEntropy(): Promise<TransactionInstruction>;
    cacheQuoteRootBank(): Promise<TransactionInstruction>;
    cacheRelevantPrices(): Promise<TransactionInstruction>;
    cacheRelevantPerpMarkets(): Promise<TransactionInstruction>;
    setupRebalanceEntropy(clientOraclePx?: Decimal): Promise<TransactionInstruction>;
    depositDiscretionaryEntropy(adminUnderlyingTokens: PublicKey, depositAmount: BN): Promise<TransactionInstruction>;
    transferDeposit(targetPool: PublicKey, underlyingDestination: PublicKey, amount: BN): TransactionInstruction;
    moveAssetsToLendingAccount(targetPool: PublicKey, amount: BN, entropyGroupGivenKey?: PublicKey, entropyProgramGivenKey?: PublicKey): Promise<TransactionInstruction>;
    withdrawAssetsFromLendingAccount(targetPool: PublicKey, amount: BN): Promise<TransactionInstruction>;
    endRoundEntropy(bypassCode?: BN): Promise<TransactionInstruction>;
    doFullDeposit(depositAmount: Decimal, solTransferAuthorityReplacement?: PublicKey): Promise<void>;
    doFullWithdraw(withdrawAmount: Decimal): Promise<void>;
    fullDepositInstructions(depositAmount: Decimal, solTransferAuthorityReplacement?: PublicKey): Promise<TransactionInstruction[]>;
    fullWithdrawInstructions(withdrawAmount: Decimal): Promise<TransactionInstruction[]>;
}
//# sourceMappingURL=ConnectedVoltSDK.d.ts.map