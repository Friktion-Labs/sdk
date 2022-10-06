import type { ProgramAccount } from "@friktion-labs/anchor";
import type {
  EntropyAccount,
  EntropyCache,
  EntropyGroup,
} from "@friktion-labs/entropy-client";
import { EntropyClient } from "@friktion-labs/entropy-client";
import {
  getAccountBalanceOrZero,
  getAccountBalanceOrZeroStruct,
} from "@friktion-labs/friktion-utils";
import type { Account } from "@solana/spl-token";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";

import type { PerpProtocol, VoltNumber } from "../../constants";
import {
  DEFAULT_AUM_FEE_BPS,
  DEFAULT_PERFORMANCE_FEE_BPS,
  DEFAULT_WITHDRAWAL_FEE_BPS,
  ENTROPY_PROGRAM_ID,
  FRIKTION_PROGRAM_ID,
  GLOBAL_MM_TOKEN_MINT,
  MANGO_PROGRAM_ID,
  NUM_SECONDS_PER_YEAR,
  NUM_WEEKS_PER_YEAR,
  OPTIONS_PROGRAM_IDS,
  VOLT_FEE_OWNER,
  VoltStrategy,
  VoltType,
} from "../../constants";
import type { FriktionSDK, VoltSnapshot } from "../../FriktionSDK";
import type { EntropyVoltSDK } from "./EntropyVoltSDK";
import type { PrincipalProtectionVoltSDK } from "./Principal/PrincipalProtectionVoltSDK";
import type { ShortOptionsVoltSDK } from "./ShortOptionsVoltSDK";
import {
  getPerpProtocolForKey,
  getProgramIdForPerpProtocol,
  oraclePriceForMint,
} from "./utils/entropyHelpers";
import type { AuctionResult } from "./utils/helperTypes";
import { getCoingeckoPrice } from "./utils/networkUtils";
import type {
  EntropyBaseAccountsWithoutBanks,
  ExtraVoltData,
  ExtraVoltDataWithKey,
  FriktionEpochInfoWithKey,
  PendingDeposit,
  PendingDepositWithKey,
  PendingWithdrawal,
  PendingWithdrawalWithKey,
  PrincipalProtectionContextExtendedAccounts,
  Round,
  RoundWithKey,
  UsefulAddresses,
  VoltVault,
} from "./voltTypes";

export type PnlStats = {
  pnlInDepositToken: Decimal;
  pnlInDepositTokenAfterFees: Decimal;
  percentagePnl: Decimal;
  percentagePnlAfterFees: Decimal;
};
export abstract class VoltSDK {
  extraVoltData: ExtraVoltData | undefined;
  normFactor: Decimal | undefined;
  constructor(
    readonly sdk: FriktionSDK,
    readonly voltKey: PublicKey,
    readonly voltVault: VoltVault,
    extraVoltData?: ExtraVoltData | undefined
  ) {
    this.extraVoltData = extraVoltData;
  }

  //// ABSTRACT FUNCTIONS ////

  abstract getHeadlineMint(): PublicKey;
  abstract printHighLevelStats(): Promise<void>;
  abstract printStrategyParams(): void;
  abstract printPositionStats(): Promise<void>;
  abstract printAuctionDetails(): Promise<void>;
  abstract printStateMachine(): void;
  abstract voltStrategy(): VoltStrategy;
  abstract specificVoltName(): Promise<string>;
  abstract getPrimaryStrategyTvlWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal>;
  abstract estimateCurrentPerformanceAsPercentage(): Promise<Decimal>;

  //// VOLT LOADERS ////

  static voltTypeFromRaw(voltVault: VoltVault) {
    if (
      voltVault.premiumPool.toString() !== SystemProgram.programId.toString() &&
      voltVault.vaultType.toString() === "2"
    ) {
      return VoltType.PrincipalProtection;
    } else if (
      voltVault.premiumPool.toString() !== SystemProgram.programId.toString()
      // && voltVault.vaultType.toString() === "0"
    ) {
      return VoltType.ShortOptions;
    } else if (
      voltVault.premiumPool.toString() === SystemProgram.programId.toString()
      // && voltVault.vaultType.toString() === "1"
    ) {
      return VoltType.Entropy;
    } else {
      throw new Error(
        "volt type = " +
          voltVault.vaultType.toString() +
          " is not recognized for vault mint = " +
          voltVault.vaultMint.toString()
      );
    }
  }

  //// CURRENTLY BLOCKED UNTIL VOLT METADATA MOVED OUT OF UI ////

  async getSnapshot(): Promise<VoltSnapshot> {
    const friktionSnapshot = await this.sdk.getSnapshot();
    const allVoltSnapshots: VoltSnapshot[] = [];
    if (this.sdk.network === "mainnet-beta") {
      friktionSnapshot.allMainnetVolts.forEach(
        // eslint-disable-next-line @typescript-eslint/ban-types
        (voltSnapshot: VoltSnapshot | {}) => {
          if ((voltSnapshot as VoltSnapshot)?.globalId !== undefined)
            allVoltSnapshots.push(voltSnapshot as VoltSnapshot);
        }
      );
    } else {
      friktionSnapshot.allDevnetVolts.forEach(
        // eslint-disable-next-line @typescript-eslint/ban-types
        (voltSnapshot: VoltSnapshot | {}) => {
          if (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            voltSnapshot !== {} &&
            (voltSnapshot as VoltSnapshot)?.globalId !== undefined
          )
            allVoltSnapshots.push(voltSnapshot as VoltSnapshot);
        }
      );
    }

    const thisSnapshot = allVoltSnapshots.find(
      (vs) => vs.voltVaultId.toString() === this.voltKey.toString()
    );
    if (thisSnapshot === undefined) {
      throw new Error("no snapshot for this volt = " + this.voltKey.toString());
    }
    return thisSnapshot;
  }

  async reloadSnapshot(): Promise<void> {
    await this.sdk.reloadSnapshot();
  }

  //// SNAPSHOT DATA ////

  async getGlobalId(): Promise<string> {
    return (await this.getSnapshot()).globalId;
  }

  async getDepositTokenSymbol(): Promise<string> {
    return (await this.getSnapshot()).depositTokenSymbol;
  }

  async getDepositTokenCoingeckoId(): Promise<string> {
    return (await this.getSnapshot()).depositTokenCoingeckoId;
  }
  async getUnderlyingTokenSymbol(): Promise<string> {
    return (await this.getSnapshot()).underlyingTokenSymbol;
  }

  async getUnderlyingTokenCoingeckoId(): Promise<string> {
    return (await this.getSnapshot()).underlyingTokenCoingeckoId;
  }

  async getShareTokenSymbol(): Promise<string> {
    return (await this.getSnapshot()).shareTokenSymbol;
  }

  async wpy(): Promise<number> {
    return (await this.getSnapshot()).weeklyPy;
  }

  async mpy(): Promise<number> {
    return (await this.getSnapshot()).monthlyPy;
  }

  async apy(): Promise<number> {
    return (await this.getSnapshot()).apy;
  }

  async apr(): Promise<number> {
    return (await this.getSnapshot()).apr;
  }

  async getApyAfterFees(): Promise<number> {
    return (await this.getSnapshot()).apyAfterFees;
  }
  async getEpochLength(): Promise<number> {
    return (await this.getSnapshot())?.abnormalEpochLength ?? 7;
  }
  async hasAbnormalEpochLength(): Promise<boolean> {
    return (await this.getSnapshot()).abnormalEpochLength !== undefined;
  }
  async isHighVoltage(): Promise<boolean> {
    return (await this.getSnapshot()).isVoltage;
  }
  async getHighVoltageEquivalent(): Promise<string> {
    const highVoltageText = (await this.getSnapshot()).highVoltage;
    return highVoltageText;
  }
  async getNextAutocompoundingTime(): Promise<number> {
    return (await this.getSnapshot()).nextAutocompoundingTime;
  }

  // us dollars
  async getCapacity(): Promise<Decimal> {
    return new Decimal(this.voltVault.capacity.toString())
      .div(await this.getDepositTokenNormalizationFactor())
      .mul(await this.getShareTokenPrice());
  }

  async getSpotSerumMarketKey(): Promise<PublicKey> {
    return new PublicKey((await this.getSnapshot()).spotSerumMarketId);
  }

  async getDepositTokenPrice(): Promise<number> {
    return (await this.getSnapshot()).depositTokenPrice;
  }
  async getShareTokenPrice(): Promise<number> {
    return (await this.getSnapshot()).shareTokenPrice;
  }

  areInstantDepositsEnabled(): boolean {
    return this.voltVault.instantTransfersEnabled;
  }

  areInstantWithdrawalsEnabled(): boolean {
    return this.voltVault.instantTransfersEnabled;
  }

  getCapacityDepositToken(): BN {
    return this.voltVault.capacity;
  }

  arePerformanceFeesInUnderlying(): boolean {
    if (this.extraVoltData === undefined) {
      throw new Error("please load extra volt data");
    }
    return this.extraVoltData.dovPerformanceFeesInUnderlying;
  }

  //// SIMPLE HElPERS ////

  getDepositMint(): PublicKey {
    return this.voltVault.depositMint;
  }

  getVaultAuthority(): PublicKey {
    return this.voltVault.vaultAuthority;
  }

  getVoltKey(): PublicKey {
    return this.voltKey;
  }

  getUnderlyingMint(): PublicKey {
    return this.getDepositMint();
  }

  getShareTokenMint(): PublicKey {
    return this.voltVault.vaultMint;
  }

  async getShareTokenDecimals(): Promise<number> {
    return (
      await getMint(
        this.sdk.readonlyProvider.connection,
        this.getShareTokenMint()
      )
    ).decimals;
  }

  getDepositPool(): PublicKey {
    return this.voltVault.depositPool;
  }

  needsExtraVoltData(): boolean {
    return this.voltType() === VoltType.Entropy;
  }

  roundNumber(): BN {
    return this.voltVault.roundNumber;
  }

  isPremiumBased(): boolean {
    return this.voltType() === VoltType.ShortOptions;
  }

  getWhitelistTokenMint(): PublicKey {
    return this.voltVault.whitelistTokenMint;
  }

  tryAsEntropySdk(): EntropyVoltSDK {
    // NOTE: this or instanceof check?
    if (this.voltType() !== VoltType.Entropy) {
      throw new Error("not an entropy volt");
    }
    return this as unknown as EntropyVoltSDK;
  }

  tryAsShortOptionsSdk(): ShortOptionsVoltSDK {
    if (this.voltType() !== VoltType.ShortOptions) {
      throw new Error("not a short options volt");
    }
    return this as unknown as ShortOptionsVoltSDK;
  }

  async getHeadlineTokenPrice(): Promise<Decimal> {
    const symbol = this.mintNameFromKey(this.getHeadlineMint());
    if (symbol === undefined) {
      throw new Error("no mint name for headline mint");
    }
    return await getCoingeckoPrice(
      this.sdk.net.COINGECKO_IDS[symbol] as string
    );
  }

  getDepositTokenName(): string {
    const symbol = this.mintNameFromKey(this.voltVault.depositMint);
    if (symbol === undefined) throw new Error("no mint name for deposit mint");
    return symbol;
  }

  async getDepositTokenPriceNotSnapshot(): Promise<Decimal> {
    return await getCoingeckoPrice(
      this.sdk.net.COINGECKO_IDS[this.getDepositTokenName()] as string
    );
  }

  async getCurrentEpochInfo(): Promise<FriktionEpochInfoWithKey> {
    return await this.getEpochInfoByNumber(this.voltVault.roundNumber);
  }

  async getCurrentRound(): Promise<RoundWithKey> {
    return await this.getRoundByNumber(this.voltVault.roundNumber);
  }

  mintNameFromKey(key: PublicKey): string | undefined {
    const foundName = Object.entries(this.sdk.net.mints).find(
      (pair) => pair[1].toString() === key.toString()
    )?.[0];

    return foundName;
  }

  //// TYPICAL ASKS ////

  // returns value in basis points (units of 0.01%)
  async getWithdrawalFeeRateFromSnapshot(): Promise<number> {
    return (await this.getSnapshot()).withdrawalFeeRate;
  }

  async getPerformanceFeeRateFromSnapshot(): Promise<number> {
    return (await this.getSnapshot()).performanceFeeRate;
  }

  async getAumFeeRateAnnualizedFromSnapshot(): Promise<number> {
    return (await this.getSnapshot()).aumFeeRateAnnualized;
  }

  //// FEE ACCOUNTS ////

  async getFeeTokenAccount(forPerformanceFees = false) {
    return await getAssociatedTokenAddress(
      !(
        this.voltType() === VoltType.ShortOptions &&
        forPerformanceFees &&
        !this.extraVoltData?.dovPerformanceFeesInUnderlying
      )
        ? this.voltVault.depositMint
        : this.voltVault.permissionedMarketPremiumMint,
      VOLT_FEE_OWNER
    );
  }

  async getPermissionedMarketFeeTokenAccount() {
    return await getAssociatedTokenAddress(
      this.voltVault.permissionedMarketPremiumMint,
      VOLT_FEE_OWNER
    );
  }

  /**
   * normalization factor based on # of decimals of underlying token
   */
  async getDepositTokenNormalizationFactor() {
    if (this.normFactor !== undefined) return this.normFactor;

    try {
      const underlyingAssetMintInfo = await getMint(
        this.sdk.readonlyProvider.connection,
        this.voltVault.depositMint
      );

      const normFactor = new Decimal(10).toPower(
        new Decimal(underlyingAssetMintInfo.decimals.toString())
      );

      this.normFactor = normFactor;

      return normFactor;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error("getNormalizationFactor error: " + e.message);
      }
      throw e;
    }
  }

  getOraclePriceForDepositToken(
    entropyGroup: EntropyGroup,
    entropyCache: EntropyCache
  ): Decimal {
    return oraclePriceForMint(
      entropyGroup,
      entropyCache,
      this.voltVault.depositMint
    );
  }

  async printState(): Promise<void> {
    if (this.extraVoltData === undefined) await this.loadInExtraVoltData();
    const symbol = this.getDepositTokenName();
    const ev = this.extraVoltData as ExtraVoltData;
    const depositTokenPrice = await this.getDepositTokenPriceNotSnapshot();

    console.log(
      `\n-------------------------\n ID: ${this.voltKey.toString()}\n-------------------------`
    );

    console.log(this.voltName());
    console.log(await this.specificVoltName());

    console.log(
      "\n-------------------------\n HIGH LEVEL STATS\n-------------------------"
    );
    const valueInDeposits = await this.getTvlWithoutPendingInDepositToken();
    console.log(
      `Total Value (minus pending deposits) (${symbol}): `,
      valueInDeposits,
      ", ($): ",
      valueInDeposits.mul(depositTokenPrice).toString()
    );

    console.log(
      "deposit pool: ",
      new Decimal(
        (
          await getAccountBalanceOrZero(
            this.sdk.readonlyProvider.connection,
            this.voltVault.depositPool
          )
        ).toString()
      )
        .div(await this.getDepositTokenNormalizationFactor())
        .toString()
    );

    await this.printHighLevelStats();

    const pendingDeposits = new Decimal(
      (await this.getCurrentlyPendingDeposits()).toString()
    ).div(await this.getDepositTokenNormalizationFactor());

    console.log(
      "\n-------------------------\n EPOCH INFO\n-------------------------"
    );

    console.log("Round #: ", this.voltVault.roundNumber.toString());
    console.log(
      `pending deposits ${symbol}: `,
      pendingDeposits.toString(),
      ", ($): ",
      pendingDeposits.mul(depositTokenPrice).toString()
    );

    const pendingWithdrawals = new Decimal(
      (await this.getCurrentlyPendingWithdrawals()).toString()
    );

    console.log(
      `pending withdrawals (${symbol}): `,
      pendingWithdrawals.toString(),
      ", ($): ",
      pendingWithdrawals.mul(depositTokenPrice).toString()
    );

    console.log(
      "\n-------------------------\n STRATEGY PARAMS \n-------------------------"
    );

    this.printStrategyParams();

    console.log(
      "\n-------------------------\n POSITION STATS\n-------------------------"
    );

    await this.printPositionStats();

    const { tvlDepositToken: tokens, tvlUsd: dollars } =
      await this.getEntropyLendingTvl();

    if (tokens.gt(0)) {
      const [entropyLendingAccountKey] =
        await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);
      console.log(
        "\n-------------------------\n MANGO LENDING \n-------------------------\n",
        "account: ",
        entropyLendingAccountKey.toString(),
        "\n",
        tokens.toString(),
        " (tokens), ",
        dollars.toString(),
        " ($) \n"
      );
    }

    console.log(
      "\n-------------------------\n AUCTION DETAILS \n-------------------------"
    );

    await this.printAuctionDetails();

    console.log(
      "\n-------------------------\n STATE MACHINE\n-------------------------"
    );

    console.log(
      "\nGeneric State: ",
      "\n, instantTransfersEnabled: ",
      this.voltVault.instantTransfersEnabled,
      "\n, deposits and withdrawals off?: ",
      ev.turnOffDepositsAndWithdrawals,
      "\n, performance fees in underlying?: ",
      ev.dovPerformanceFeesInUnderlying,
      "\n----------------------------"
    );

    this.printStateMachine();

    await this.printFees();
  }

  printFees(): Promise<void> {
    console.log(
      "\n-------------------------\n FEES (bps) \n-------------------------"
    );

    console.log(
      "use custom fees? : ",
      this.extraVoltData?.useCustomFees.toString(),
      "\nperformance: ",
      this.getPerformanceFeeBps().toString()
    );
    // console ", est. if taken now: ",
    //   (await this.estimatedPerformanceFeeBpsTakenIfEpochEndsNow()).toString(),
    console.log(
      "\naum (annualized) : ",
      this.getAumFeeBpsAnnualized().toString(),
      ", est. if taken now: ",
      this.estimatedAumFeeBpsTakenIfEpochEndsNow().toString(),
      "\nwithdrawal",
      this.getWithdrawalFeeBps().toString(),
      "\n----------------------------"
    );

    return Promise.resolve();
  }

  voltName(): string {
    const voltNumber = this.voltNumber();
    switch (voltNumber) {
      case 1:
        return "Volt #01: Covered Call";
      case 2:
        return "Volt #02: Cash Secured Put";
      case 3:
        return "Volt #03: Crab Strategy";
      case 4:
        return "Volt #04: Basis Yield";
      case 5:
        return "Volt #05: Principal Protection";
    }
  }

  voltNumber(): VoltNumber {
    const voltStrategy = this.voltStrategy();
    switch (voltStrategy) {
      case VoltStrategy.ShortCalls:
        return 1;
      case VoltStrategy.ShortPuts:
        return 2;
      case VoltStrategy.ShortCrab:
        return 3;
      case VoltStrategy.LongBasis:
        return 4;
      case VoltStrategy.ProtectionAndPuts:
        return 5;
    }
  }

  voltType(): VoltType {
    return VoltSDK.voltTypeFromRaw(this.voltVault);
  }

  static defaultWithdrawalFeeAmount(numTokensWithdrawn: BN): BN {
    if (numTokensWithdrawn.lten(0)) {
      return new BN(0);
    }
    return numTokensWithdrawn.muln(DEFAULT_WITHDRAWAL_FEE_BPS).divn(10000);
  }

  static defaultPerformanceFeeAmount(numTokensGained: BN): BN {
    if (numTokensGained.lten(0)) {
      return new BN(0);
    }
    return numTokensGained.muln(DEFAULT_PERFORMANCE_FEE_BPS).divn(10000);
  }

  static defaultWithdrawalFeeAmountFromDecimal(
    numTokensWithdrawn: Decimal
  ): Decimal {
    if (numTokensWithdrawn.lte(0)) {
      return new Decimal(0);
    }
    return numTokensWithdrawn
      .mul(new Decimal(DEFAULT_WITHDRAWAL_FEE_BPS.toString()))
      .div(10000);
  }

  static defaultPerformanceFeeAmountFromDecimal(
    numTokensGained: Decimal
  ): Decimal {
    if (numTokensGained.lte(0)) {
      return new Decimal(0);
    }
    return numTokensGained
      .mul(new Decimal(DEFAULT_PERFORMANCE_FEE_BPS.toString()))
      .div(10000);
  }

  static defaultAumFeeAmount(numTokensManaged: BN): BN {
    if (numTokensManaged.lten(0)) {
      return new BN(0);
    }
    return numTokensManaged.muln(DEFAULT_AUM_FEE_BPS).divn(10000);
  }

  getLastTimeAumFeesWereTaken(): number {
    if (this.extraVoltData === undefined) {
      throw new Error("load extraVoltData");
    }
    return this.extraVoltData.timeLastTookAumFees.toNumber();
  }

  checkExtraVoltDataExists(): void {
    if (this.extraVoltData === undefined) {
      throw new Error("load extraVoltData");
    }
  }

  estimatedAumFeeBpsTakenIfEpochEndsNow(): Decimal {
    const lastTakenTime = this.getLastTimeAumFeesWereTaken();
    const currTime = new Date().getTime() / 1000;

    const timeSinceLastTaken = currTime - lastTakenTime;

    return new Decimal(this.getAumFeeBpsAnnualized().toString())
      .mul(timeSinceLastTaken)
      .div(NUM_SECONDS_PER_YEAR);
  }

  getAumFeeBpsAnnualized(): BN {
    if (this.extraVoltData === undefined) {
      throw new Error("load extraVoltData");
    }
    const useCustomFees = this.extraVoltData?.useCustomFees;
    const bps = this.extraVoltData?.aumFeeBps;

    return useCustomFees ? bps : new BN(DEFAULT_AUM_FEE_BPS);
  }

  getAumFeeBpsPerWeek(): Decimal {
    return new Decimal(this.getAumFeeBpsAnnualized().toString()).div(
      NUM_WEEKS_PER_YEAR
    );
  }

  async estimatedPerformanceFeeBpsTakenIfEpochEndsNow(): Promise<Decimal> {
    const feeBps = new Decimal(this.getPerformanceFeeBps().toString());
    return feeBps.mul(await this.estimateCurrentPerformanceAsPercentage());
  }

  getPerformanceFeeBps(): BN {
    if (this.extraVoltData === undefined) {
      throw new Error("load extraVoltData");
    }
    const useCustomFees = this.extraVoltData?.useCustomFees;
    const bps = this.extraVoltData?.performanceFeeBps;

    return useCustomFees ? bps : new BN(DEFAULT_PERFORMANCE_FEE_BPS);
  }

  getPerformanceFeeAmount(numTokensEarned: BN): BN {
    return this.getPerformanceFeeBps().mul(numTokensEarned).divn(10_000);
  }

  getWithdrawalFeeBps(): BN {
    if (this.extraVoltData === undefined) {
      throw new Error("load extraVoltData");
    }
    const useCustomFees = this.extraVoltData?.useCustomFees;
    const bps = this.extraVoltData?.withdrawalFeeBps;

    return useCustomFees ? bps : new BN(DEFAULT_WITHDRAWAL_FEE_BPS);
  }

  getWithdrawalFeeAmount(numTokensWithdrawn: BN): BN {
    return this.getWithdrawalFeeBps().mul(numTokensWithdrawn).divn(10_000);
  }

  //// USEFUL CALCULATIONS ////
  // 1. TVL
  // 2. currently pending deposits/withdrawals
  // 3. Vault Token
  // 4. Epoch pnl
  // 5. user balances

  //  TVL //

  // defaults to USD calculation

  async getAum(): Promise<Decimal> {
    return this.getTvl();
  }

  async getTvl(): Promise<Decimal> {
    const { usdTvl } = await this.getTvlStats();
    return usdTvl;
  }

  async getTvlWithoutPending(): Promise<Decimal> {
    return (await this.getTvlWithoutPendingInDepositToken()).mul(
      await this.getDepositTokenPriceNotSnapshot()
    );
  }

  async getTvlInDepositToken(): Promise<Decimal> {
    const { tvl } = await this.getTvlStats();
    return tvl;
  }

  async getPrimaryStrategyTvl(): Promise<Decimal> {
    return await this.getPrimaryStrategyTvlWithNormFactor(
      await this.getDepositTokenNormalizationFactor()
    );
  }

  async getTvlStats(): Promise<{
    tvl: Decimal;
    usdTvl: Decimal;
    strategyDeposits: Decimal;
    pendingDeposits: Decimal;
    pendingWithdrawals: Decimal;
  }> {
    const normFactor = await this.getDepositTokenNormalizationFactor();
    const totalVaultValueExcludingPendingDeposits =
      await this.getTvlWithoutPendingInDepositToken();

    const pendingDeposits = new Decimal(
      (await this.getCurrentlyPendingDeposits()).toString()
    ).div(normFactor);
    const pendingWithdrawals = new Decimal(
      (await this.getCurrentlyPendingWithdrawals()).toString()
    ).div(normFactor);

    const tvl = totalVaultValueExcludingPendingDeposits.add(pendingDeposits);

    const usdTvl = tvl.mul(await this.getDepositTokenPriceNotSnapshot());
    return {
      tvl,
      usdTvl,
      strategyDeposits: totalVaultValueExcludingPendingDeposits,
      pendingDeposits,
      pendingWithdrawals,
    };
  }

  // entropy get methods

  async getTvlWithoutPendingInDepositToken(
    normFactor?: Decimal | undefined
  ): Promise<Decimal> {
    return this.getTvlWithoutPendingInDepositTokenWithNormFactor(
      normFactor ?? (await this.getDepositTokenNormalizationFactor())
    );
  }

  async getTvlWithoutPendingInDepositTokenWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal> {
    try {
      let [primaryStrategyTvl, entropyLendingTvl] = await Promise.all([
        this.getPrimaryStrategyTvlWithNormFactor(normFactor),
        this.getEntropyLendingTvlInDepositToken(),
      ]);

      entropyLendingTvl = entropyLendingTvl.div(normFactor);
      primaryStrategyTvl = primaryStrategyTvl.add(entropyLendingTvl);

      return primaryStrategyTvl;
    } catch (err) {
      console.log(err);
      throw new Error("could not load volt value");
    }
  }

  // Pending Deposits / Withdrawals

  async getCurrentlyPendingDeposits(): Promise<BN> {
    const data = await getAccountBalanceOrZeroStruct(
      this.sdk.readonlyProvider.connection,
      (
        await VoltSDK.findRoundUnderlyingTokensAddress(
          this.voltKey,
          this.voltVault.roundNumber,
          this.sdk.programs.Volt.programId
        )
      )[0]
    );
    return data.balance;
  }

  async getCurrentlyPendingWithdrawals(
    totalValueValueExcludingPendingDeposits?: Decimal
  ): Promise<BN> {
    const roundForPendingWithdrawal = await this.getRoundByNumber(
      this.voltVault.roundNumber
    );

    const voltTokenSupply =
      await this.getVaultMintSupplyWithBurnedWithdrawals();

    if (totalValueValueExcludingPendingDeposits === undefined)
      totalValueValueExcludingPendingDeposits =
        await this.getTvlWithoutPendingInDepositToken();

    const pendingWithdrawalsInDepositToken = voltTokenSupply.eqn(0)
      ? new BN(0)
      : new BN(
          new Decimal(
            roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
          )
            .mul(totalValueValueExcludingPendingDeposits)
            .div(new Decimal(voltTokenSupply.toString()))
            .toFixed(0)
        );

    return pendingWithdrawalsInDepositToken;
  }

  // Vault Token

  async getVaultMintSupplyWithBurnedWithdrawals(): Promise<BN> {
    const roundInfo = await this.getRoundByNumber(this.voltVault.roundNumber);
    return new BN(
      (
        await getMint(
          this.sdk.readonlyProvider.connection,
          this.voltVault.vaultMint
        )
      ).supply.toString()
    ).add(roundInfo.voltTokensFromPendingWithdrawals);
  }

  //// ENTROPY LENDING ////

  async getEntropyLendingTvlInDepositToken(): Promise<Decimal> {
    const { tvlDepositToken: tokens } = await this.getEntropyLendingTvl();
    return tokens;
  }

  async getEntropyLendingKeys(
    entropyGroupGivenKey?: PublicKey,
    entropyProgramGivenKey?: PublicKey
  ): Promise<{
    entropyLendingProgramKey: PublicKey;
    entropyLendingGroupKey: PublicKey;
    entropyLendingAccountKey: PublicKey;
  }> {
    let entropyLendingProgramKey = entropyProgramGivenKey;
    let entropyLendingGroupKey = entropyGroupGivenKey;

    if (
      entropyLendingGroupKey === undefined ||
      entropyLendingProgramKey === undefined
    ) {
      try {
        const {
          entropyClient: entropyLendingClient,
          entropyAccount: entropyLendingAccount,
        } = await this.getEntropyLendingObjects();
        entropyLendingProgramKey = entropyLendingClient.programId;
        entropyLendingGroupKey = entropyLendingAccount.entropyGroup;
      } catch (err) {
        entropyLendingProgramKey = MANGO_PROGRAM_ID;
        entropyLendingGroupKey = this.sdk.net.MANGO_GROUP;
      }
    }

    const [entropyLendingAccountKey] =
      await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);

    return {
      entropyLendingProgramKey,
      entropyLendingGroupKey,
      entropyLendingAccountKey,
    };
  }

  async getEntropyLendingObjects(): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    const [entropyLendingAccountKey] =
      await VoltSDK.findEntropyLendingAccountAddress(this.voltKey);

    const perpProtocol = await getPerpProtocolForKey(
      this.sdk.readonlyProvider.connection,
      entropyLendingAccountKey
    );

    const entropyProgramId = getProgramIdForPerpProtocol(perpProtocol);

    const { account: tempAccount } = await this.getEntropyAccountByKey(
      entropyLendingAccountKey,
      perpProtocol
    );

    return await this.getEntropyObjects(
      entropyProgramId,
      tempAccount.entropyGroup,
      entropyLendingAccountKey
    );
  }

  async getEntropyAccountByKey(
    key: PublicKey,
    perpProtocol?: PerpProtocol
  ): Promise<{
    account: EntropyAccount;
    perpProtocol: PerpProtocol;
  }> {
    if (!perpProtocol) {
      perpProtocol = await getPerpProtocolForKey(
        this.sdk.readonlyProvider.connection,
        key
      );
    }
    let programId: PublicKey;

    if (perpProtocol === "Entropy") {
      programId = ENTROPY_PROGRAM_ID;
    } else if (perpProtocol === "Mango") {
      programId = MANGO_PROGRAM_ID;
    } else {
      throw new Error("options protocol not supported");
    }

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, programId);

    const entropyAccount = await client.getEntropyAccount(
      key,
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    return {
      account: entropyAccount,
      perpProtocol,
    };
  }

  async getEntropyGroup(
    entropyProgramId: PublicKey,
    entropyGroupKey: PublicKey
  ): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
  }> {
    // if (
    //   entropyProgramId.toString() !== ENTROPY_PROGRAM_ID.toString() &&
    //   entropyProgramId.toString() !== MANGO_PROGRAM_ID.toString()
    // )
    //   throw new Error("given program id must match entropy or mango");

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, entropyProgramId);
    const entropyGroup = await client.getEntropyGroup(entropyGroupKey);

    return {
      entropyClient: client,
      entropyGroup,
    };
  }

  async getEntropyObjects(
    entropyProgramId: PublicKey,
    entropyGroupKey: PublicKey,
    entropyAccountKey: PublicKey
  ): Promise<{
    entropyClient: EntropyClient;
    entropyGroup: EntropyGroup;
    entropyAccount: EntropyAccount;
    entropyCache: EntropyCache;
  }> {
    // if (
    //   entropyProgramId.toString() !== ENTROPY_PROGRAM_ID.toString() &&
    //   entropyProgramId.toString() !== MANGO_PROGRAM_ID.toString()
    // )
    //   throw new Error("given program id must match entropy or mango");

    const connection = this.sdk.readonlyProvider.connection;

    const client = new EntropyClient(connection, entropyProgramId);
    const [entropyGroup, entropyAccount] = await Promise.all([
      client.getEntropyGroup(entropyGroupKey),
      client.getEntropyAccount(
        entropyAccountKey,
        this.sdk.net.SERUM_DEX_PROGRAM_ID
      ),
    ]);

    const entropyCache = await entropyGroup.loadCache(connection);

    return {
      entropyClient: client,
      entropyGroup,
      entropyAccount,
      entropyCache,
    };
  }

  async getEntropyLendingTvl(): Promise<{
    tvlDepositToken: Decimal;
    tvlUsd: Decimal;
  }> {
    let entropyGroup, entropyAccount, entropyCache;
    try {
      ({ entropyGroup, entropyAccount, entropyCache } =
        await this.getEntropyLendingObjects());
    } catch (err) {
      return {
        tvlDepositToken: new Decimal(0),
        tvlUsd: new Decimal(0),
      };
    }

    const acctEquity = new Decimal(
      entropyAccount.computeValue(entropyGroup, entropyCache).toString()
    );
    const oraclePrice = this.getOraclePriceForDepositToken(
      entropyGroup,
      entropyCache
    );
    const acctValueInDepositToken = acctEquity.div(oraclePrice);

    return {
      tvlDepositToken: new Decimal(acctValueInDepositToken.toString()),
      tvlUsd: new Decimal(acctEquity.toString()),
    };
  }

  // Epoch Calculations

  async getPnlStatsForAllEpochs(): Promise<
    {
      epochNumber: number;
      pnlInDepositToken: Decimal;
      pnlInDepositTokenAfterFees: Decimal;
      percentagePnl: Decimal;
      percentagePnlAfterFees: Decimal;
    }[]
  > {
    const auctionResults = await this.fetchAuctionResults();

    return auctionResults.map((ar, idx) => {
      return {
        epochNumber: idx + 1,
        ...this.getPnlStatsFromAuctionResult(ar),
      };
    });
  }

  async getPnlStatsForEpochREST(roundNumber: BN): Promise<PnlStats> {
    const auctionResult = await this.fetchAuctionResultForEpochNumber(
      roundNumber
    );
    return this.getPnlStatsFromAuctionResult(auctionResult);
  }

  getPnlStatsFromAuctionResult(auctionResult: AuctionResult): PnlStats {
    const startingAum = auctionResult.balanceStart;

    const pnlInDepositToken = new Decimal(auctionResult.realizedPnl);
    const pnlInDepositTokenAfterFees = pnlInDepositToken.sub(
      VoltSDK.defaultPerformanceFeeAmountFromDecimal(pnlInDepositToken)
    );

    const percentagePnl = pnlInDepositToken.div(startingAum);
    const percentagePnlAfterFees = pnlInDepositTokenAfterFees.div(startingAum);

    return {
      pnlInDepositToken,
      pnlInDepositTokenAfterFees,
      percentagePnl,
      percentagePnlAfterFees,
    };
  }

  async getPnlForEpochREST(
    roundNumber: BN,
    subtractFees = true
  ): Promise<Decimal> {
    const { pnlInDepositToken, pnlInDepositTokenAfterFees } =
      await this.getPnlStatsForEpochREST(roundNumber);

    return subtractFees ? pnlInDepositTokenAfterFees : pnlInDepositToken;
  }
  // only works beginning with epoch on april 7
  async getApportionedPnlForEpochREST(
    epochNumber: BN,
    userVoltTokensDuringEpoch: BN,
    subtractFees = true
  ): Promise<Decimal> {
    if (epochNumber.eqn(0)) {
      throw new Error("round number must be greater than 0");
    }
    const [epochInfo, pnlForRoundResult, normFactorResult] =
      await Promise.allSettled([
        this.getEpochInfoByNumber(epochNumber),
        this.getPnlForEpochREST(epochNumber, subtractFees),
        this.getDepositTokenNormalizationFactor(),
      ]);

    if (epochInfo.status === "rejected")
      throw new Error(
        "epoch info deprecated for this epoch. Try a newer epoch number"
      );

    if (pnlForRoundResult.status === "rejected")
      throw new Error("couldn't load pnl for round");
    if (normFactorResult.status === "rejected")
      throw new Error("couldn't load norm factor");

    const normFactor = normFactorResult.value;
    const pnlForRound = pnlForRoundResult.value;

    const voltTokenSupplyForRound = epochInfo.value.voltTokenSupply;

    const participatingPnl = pnlForRound
      .mul(new Decimal(userVoltTokensDuringEpoch.toString()).div(normFactor))
      .div(new Decimal(voltTokenSupplyForRound.toString()).div(normFactor));

    return new Decimal(participatingPnl.toString());
  }

  async getPnlStatsForEpoch(roundNumber: BN): Promise<{
    pnlInDepositToken: Decimal;
    pnlInDepositTokenAfterFees: Decimal;
    percentagePnl: Decimal;
    percentagePnlAfterFees: Decimal;
  }> {
    const epochInfo = await this.getEpochInfoByNumber(roundNumber);
    if (epochInfo.number.eqn(0)) {
      throw new Error(
        "epoch info deprecated for this epoch. Try a newer epoch number"
      );
    }
    const startEpochAum = epochInfo.aumInDepositTokenAtEpochEnd;

    let pnlForRound: Decimal;
    let pnlForRoundAfterFees: Decimal;
    if (this.voltType() === VoltType.ShortOptions) {
      pnlForRound = new Decimal(
        epochInfo.aumInDepositTokenAtEpochEnd
          .sub(epochInfo.aumInDepositTokenAtEpochStart)
          .toString()
      );
      pnlForRoundAfterFees = pnlForRound.sub(
        new Decimal(epochInfo.performanceFees.toString())
      );
    } else if (this.voltType() === VoltType.Entropy) {
      pnlForRound = new Decimal(epochInfo.pnl.toString());
      pnlForRoundAfterFees = pnlForRound.sub(
        new Decimal(epochInfo.performanceFees.toString())
      );
    } else {
      throw new Error("unsupported volt type");
    }

    const percentagePnl = new Decimal(pnlForRound.toString()).div(
      new Decimal(startEpochAum.toString())
    );
    const percentagePnlAfterFees = new Decimal(
      pnlForRoundAfterFees.toString()
    ).div(new Decimal(startEpochAum.toString()));

    return {
      pnlInDepositToken: new Decimal(pnlForRound.toString()).div(
        await this.getDepositTokenNormalizationFactor()
      ),
      pnlInDepositTokenAfterFees: new Decimal(
        pnlForRoundAfterFees.toString()
      ).div(await this.getDepositTokenNormalizationFactor()),
      percentagePnl,
      percentagePnlAfterFees,
    };
  }

  async getPnlForEpoch(roundNumber: BN, subtractFees = true): Promise<Decimal> {
    const epochInfo = await this.getEpochInfoByNumber(roundNumber);
    if (epochInfo.number.eqn(0)) {
      throw new Error(
        "epoch info deprecated for this epoch. Try a newer epoch number"
      );
    }
    const { pnlInDepositToken, pnlInDepositTokenAfterFees } =
      await this.getPnlStatsForEpoch(roundNumber);
    return subtractFees ? pnlInDepositTokenAfterFees : pnlInDepositToken;
  }

  // only works beginning with epoch on april 7
  async getApportionedPnlForEpoch(
    epochNumber: BN,
    userVoltTokensDuringEpoch: BN,
    subtractFees = true
  ): Promise<Decimal> {
    if (epochNumber.eqn(0)) {
      throw new Error("round number must be greater than 0");
    }
    const [epochInfo, pnlForRoundResult, normFactorResult] =
      await Promise.allSettled([
        this.getEpochInfoByNumber(epochNumber),
        this.getPnlForEpoch(epochNumber, subtractFees),
        this.getDepositTokenNormalizationFactor(),
      ]);

    if (epochInfo.status === "rejected")
      throw new Error(
        "epoch info deprecated for this epoch. Try a newer epoch number"
      );

    if (pnlForRoundResult.status === "rejected")
      throw new Error("couldn't load pnl for epoch");
    if (normFactorResult.status === "rejected")
      throw new Error("couldn't load norm factor");

    const normFactor = normFactorResult.value;
    const pnlForRound = pnlForRoundResult.value;

    const voltTokenSupplyForRound = epochInfo.value.voltTokenSupply;

    const participatingPnl = pnlForRound
      .mul(new Decimal(userVoltTokensDuringEpoch.toString()).div(normFactor))
      .div(new Decimal(voltTokenSupplyForRound.toString()).div(normFactor));

    return new Decimal(participatingPnl.toString());
  }

  // User Balances and other calculations

  async getUserPendingDepositUnderlying(user: PublicKey): Promise<Decimal> {
    const result = await this.getBalancesForUser(user);
    if (!result) throw new Error("can't find data for user");
    const { pendingDeposits } = result;
    return pendingDeposits;
  }

  async getUserMintableShares(user: PublicKey): Promise<BN> {
    return this.getUserMintableSharesForRound(user, this.voltVault.roundNumber);
  }

  async getUserMintableSharesForRound(
    user: PublicKey,
    roundNumber: BN
  ): Promise<BN> {
    let pendingDepositInfo: PendingDepositWithKey;
    try {
      pendingDepositInfo = await this.getPendingDepositForGivenUser(user);
      if (pendingDepositInfo.roundNumber >= roundNumber) {
        return new BN(0);
      }
    } catch (err) {
      return new BN(0);
    }

    try {
      const result = await this.getBalancesForUser(user);
      if (!result) return new BN(0);
      const { mintableShares } = result;

      return new BN(mintableShares.toFixed(0));
    } catch (err) {
      console.log(err);
      return new BN(0);
    }
  }

  async getBalancesForUser(pubkey: PublicKey): Promise<
    | {
        totalBalance: Decimal;
        normalBalance: Decimal;
        pendingDeposits: Decimal;
        pendingWithdrawals: Decimal;
        mintableShares: Decimal;
        claimableUnderlying: Decimal;
        normFactor: Decimal;
        vaultNormFactor: Decimal;
      }
    | undefined
  > {
    const voltVault = this.voltVault;
    const connection = this.sdk.readonlyProvider.connection;

    const vaultTokenAccountKey = await getAssociatedTokenAddress(
      voltVault.vaultMint,
      pubkey,
      true
    );

    const [
      vaultMintInfoResult,
      depositTokenNormFactorResult,
      roundInfoResult,
      pendingDepositInfoResult,
      pendingWithdrawalInfoResult,
      vaultTokenAccount,
    ] = await Promise.allSettled([
      getMint(connection, voltVault.vaultMint),
      this.getDepositTokenNormalizationFactor(),
      this.getRoundByNumber(voltVault.roundNumber),
      this.getPendingDepositForGivenUser(pubkey),
      this.getPendingWithdrawalForGivenUser(pubkey),
      getAccount(this.sdk.readonlyProvider.connection, vaultTokenAccountKey),
    ]);

    if (
      vaultMintInfoResult.status === "rejected" ||
      depositTokenNormFactorResult.status === "rejected" ||
      roundInfoResult.status === "rejected"
    ) {
      throw new Error("failed to load critical account for calculation");
    }

    const vaultMintInfo = vaultMintInfoResult.value;
    const roundInfo = roundInfoResult.value;

    const depositTokenNormFactor = depositTokenNormFactorResult.value;
    const vaultNormFactor = new Decimal(10).pow(vaultMintInfo.decimals);

    const voltTokenSupply = new Decimal(vaultMintInfo.supply.toString()).add(
      new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString())
    );

    let userVoltTokens: Decimal = new Decimal(0);
    if (vaultTokenAccount.status === "fulfilled") {
      userVoltTokens = new Decimal(vaultTokenAccount.value.amount.toString());
    }

    const [
      totalVaultValueExcludingPendingDepositsUnnormalized,
      pendingDepositAccounts,
      pendingWithdrawalAccounts,
    ] = await Promise.all([
      this.getTvlWithoutPendingInDepositToken(depositTokenNormFactor),
      (async (): Promise<{
        roundForPendingDeposit: Round | undefined;
        pendingDepositsRoundVoltTokensAccount: Account | undefined;
      }> => {
        if (
          pendingDepositInfoResult.status === "fulfilled" &&
          pendingDepositInfoResult.value.numUnderlyingDeposited.gtn(0)
        ) {
          const pendingDepositInfo = pendingDepositInfoResult.value;

          const [
            roundForPendingDeposit,
            pendingDepositsRoundVoltTokensAccount,
          ] = await Promise.all([
            this.getRoundByNumber(pendingDepositInfo.roundNumber),
            getAccount(
              this.sdk.readonlyProvider.connection,
              (
                await VoltSDK.findRoundVoltTokensAddress(
                  this.voltKey,
                  pendingDepositInfo.roundNumber,
                  this.sdk.programs.Volt.programId
                )
              )[0]
            ),
          ]);

          return {
            roundForPendingDeposit,
            pendingDepositsRoundVoltTokensAccount,
          };
        }

        return {
          roundForPendingDeposit: undefined,
          pendingDepositsRoundVoltTokensAccount: undefined,
        };
      })(),
      (async (): Promise<{
        roundForPendingWithdrawal: Round | undefined;
        underlyingTokensForPendingWithdrawalRoundTokenAccount:
          | Account
          | undefined;
      }> => {
        if (
          pendingWithdrawalInfoResult.status === "fulfilled" &&
          pendingWithdrawalInfoResult.value.numVoltRedeemed.gtn(0)
        ) {
          const pendingWithdrawalInfo = pendingWithdrawalInfoResult.value;

          const [
            roundForPendingWithdrawal,
            underlyingTokensForPendingWithdrawalRoundTokenAccount,
          ] = await Promise.all([
            this.getRoundByNumber(pendingWithdrawalInfo.roundNumber),
            getAccount(
              this.sdk.readonlyProvider.connection,
              (
                await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
                  this.voltKey,
                  pendingWithdrawalInfo.roundNumber,
                  this.sdk.programs.Volt.programId
                )
              )[0]
            ),
          ]);

          return {
            roundForPendingWithdrawal,
            underlyingTokensForPendingWithdrawalRoundTokenAccount,
          };
        }

        return {
          roundForPendingWithdrawal: undefined,
          underlyingTokensForPendingWithdrawalRoundTokenAccount: undefined,
        };
      })(),
    ]);

    const totalVaultValueExcludingPendingDeposits =
      totalVaultValueExcludingPendingDepositsUnnormalized.mul(
        depositTokenNormFactor
      );

    let userValueFromPendingWithdrawals = new Decimal(0);
    let userClaimableUnderlying = new Decimal(0);

    if (
      pendingWithdrawalAccounts.roundForPendingWithdrawal !== undefined &&
      pendingWithdrawalAccounts.underlyingTokensForPendingWithdrawalRoundTokenAccount !==
        undefined &&
      pendingWithdrawalInfoResult.status === "fulfilled"
    ) {
      const pendingWithdrawalInfo = pendingWithdrawalInfoResult.value;
      const underlyingTokensForPendingWithdrawalRoundTokenAccount =
        pendingWithdrawalAccounts.underlyingTokensForPendingWithdrawalRoundTokenAccount;
      const roundForPendingWithdrawal =
        pendingWithdrawalAccounts.roundForPendingWithdrawal;

      const underlyingTokensForPendingWithdrawalRound = new Decimal(
        underlyingTokensForPendingWithdrawalRoundTokenAccount.amount.toString()
      );

      userValueFromPendingWithdrawals = voltTokenSupply.lte(0)
        ? new Decimal(0)
        : pendingWithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
        ? new Decimal(pendingWithdrawalInfo.numVoltRedeemed.toString())
            .mul(
              new Decimal(totalVaultValueExcludingPendingDeposits.toString())
            )
            .div(voltTokenSupply)
        : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
        ? new Decimal(0)
        : new Decimal(pendingWithdrawalInfo.numVoltRedeemed.toString())
            .mul(underlyingTokensForPendingWithdrawalRound)
            .div(
              new Decimal(
                roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
              )
            );

      userClaimableUnderlying =
        voltTokenSupply.lte(0) ||
        pendingWithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(0)
          : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
          ? new Decimal(0)
          : new Decimal(pendingWithdrawalInfo.numVoltRedeemed.toString())
              .mul(underlyingTokensForPendingWithdrawalRound)
              .div(
                new Decimal(
                  roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
                )
              );
    }

    let userValueFromPendingDeposits = new Decimal(0);
    let userMintableShares = new Decimal(0);

    if (
      pendingDepositAccounts.roundForPendingDeposit !== undefined &&
      pendingDepositAccounts.pendingDepositsRoundVoltTokensAccount !==
        undefined &&
      pendingDepositInfoResult.status === "fulfilled"
    ) {
      const pendingDepositsRoundVoltTokensAccount =
        pendingDepositAccounts.pendingDepositsRoundVoltTokensAccount;
      const roundForPendingDeposit =
        pendingDepositAccounts.roundForPendingDeposit;
      const pendingDepositInfo = pendingDepositInfoResult.value;

      const voltTokensForPendingDepositRound = new Decimal(
        pendingDepositsRoundVoltTokensAccount.amount.toString()
      );

      userValueFromPendingDeposits =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0)
          ? new Decimal(0)
          : pendingDepositInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              )
              .mul(totalVaultValueExcludingPendingDeposits)
              .div(voltTokenSupply);

      userMintableShares =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0) ||
        pendingDepositInfo.roundNumber.gte(this.voltVault.roundNumber)
          ? new Decimal(0)
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              );
    }

    // const totalVaultValueExcludingPendingDeposits = (
    //   await this.getTvlWithoutPendingInDepositToken(depositTokenNormFactor)
    // ).mul(depositTokenNormFactor);

    const userValueExcludingPendingDeposits = voltTokenSupply.lte(0)
      ? new Decimal(0)
      : totalVaultValueExcludingPendingDeposits
          .mul(userVoltTokens)
          .div(voltTokenSupply);

    const totalUserValue = userValueExcludingPendingDeposits
      .add(userValueFromPendingDeposits)
      .add(userValueFromPendingWithdrawals);

    return {
      totalBalance: totalUserValue.div(depositTokenNormFactor),
      normalBalance: userValueExcludingPendingDeposits.div(
        depositTokenNormFactor
      ),
      pendingDeposits: userValueFromPendingDeposits.div(depositTokenNormFactor),
      pendingWithdrawals: userValueFromPendingWithdrawals.div(
        depositTokenNormFactor
      ),
      mintableShares: userMintableShares.div(depositTokenNormFactor),
      claimableUnderlying: userClaimableUnderlying.div(depositTokenNormFactor),
      normFactor: depositTokenNormFactor,
      vaultNormFactor: vaultNormFactor,
    };
  }

  // crab volt calculations //

  async fetchAuctionResults(): Promise<AuctionResult[]> {
    const globalId = await this.getGlobalId();
    let retries = 0;
    while (true && retries < 5) {
      const response = await fetch(
        `https://api.friktion.fi/auction_results?GlobalID=${globalId}`
      );
      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = (await response.json()) as any[];
        console.log("data = ", data);
        const output: AuctionResult[] = data as AuctionResult[];
        // for (const auction of data) {
        //   output.push({
        //     GlobalID: auction[0] as string,
        //     Product: auction[1] as string,
        //     StartEpoch: auction[2] as number,
        //     EndEpoch: auction[3] as number,
        //     BalanceStart: auction[4] as number,
        //     BalancePnl: auction[5] as number,
        //     RealizedPnl: auction[6] as number,
        //     SpotPriceAtAuctionEnd: auction[7] as number,
        //     TxID: auction[8] as string,
        //   });
        // }
        return output;
      } else {
        console.error(response);
        console.error("status != 200, === ", response.status.toString());
      }
      retries += 1;
    }
    throw new Error("failed to retrieve auction results");
  }

  async fetchAuctionResultForEpochNumber(
    epochNumber: BN
  ): Promise<AuctionResult> {
    const fullAuctionResults: AuctionResult[] =
      await this.fetchAuctionResults();
    console.log(fullAuctionResults);
    const auctionResult = fullAuctionResults[epochNumber.subn(1).toNumber()];
    if (
      fullAuctionResults.length < epochNumber.toNumber() ||
      auctionResult === undefined
    )
      throw new Error(
        "no auction data for volt = " +
          (await this.getGlobalId()) +
          ", epoch number = " +
          epochNumber.toString()
      );

    return auctionResult;
  }

  // gets strike of option to be used with delta calculations.
  async getProductDetails() {
    const auctionResults: AuctionResult[] = await this.fetchAuctionResults();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const lastAuction: AuctionResult = auctionResults[
      auctionResults.length - 1
    ] as AuctionResult;

    // copied from dApp, need to remember this dependency
    const optionMatch = lastAuction.product.match(
      /([a-zA-Z-]*)-([\d.]*)-(CALL|PUT|CRAB|BASIS)-(\d{10})/
    );
    if (!optionMatch || optionMatch.length < 5) {
      throw new Error("Invalid GlobalID input");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access
    const expiry = new Date(parseInt(optionMatch[4]!) * 1000);
    const result = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      asset: optionMatch[1],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-non-null-assertion
      strike: parseFloat(optionMatch[2]!),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-non-null-assertion
      type: optionMatch[3],
      expiry: expiry,
    };
    return result.strike;
  }

  //// ACCOUNT LOADERS ////

  async getAllPendingDeposits(): Promise<PendingDepositWithKey[]> {
    const accts =
      (await this.sdk.programs.Volt.account.pendingDeposit.all()) as unknown as ProgramAccount<PendingDeposit>[];
    return accts.map((acct) => ({
      ...acct.account,
      key: acct.publicKey,
    }));
  }

  async getPendingDepositByKey(key: PublicKey): Promise<PendingDepositWithKey> {
    const acct = await this.sdk.programs.Volt.account.pendingDeposit.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getPendingDepositForGivenUser(
    user: PublicKey
  ): Promise<PendingDepositWithKey> {
    const key = (
      await VoltSDK.findPendingDepositInfoAddress(
        this.voltKey,
        user,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getPendingDepositByKey(key);
  }

  async getPendingWithdrawalForGivenUser(
    user: PublicKey
  ): Promise<PendingWithdrawalWithKey> {
    const key = (
      await VoltSDK.findPendingWithdrawalInfoAddress(
        this.voltKey,
        user,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getPendingWithdrawalByKey(key);
  }

  async getAllPendingWithdrawals(): Promise<PendingWithdrawalWithKey[]> {
    const accts =
      (await this.sdk.programs.Volt.account.pendingWithdrawal.all()) as unknown as ProgramAccount<PendingWithdrawal>[];
    return accts.map((acct) => ({
      ...acct.account,
      key: acct.publicKey,
    }));
  }

  async getPendingWithdrawalByKey(
    key: PublicKey
  ): Promise<PendingWithdrawalWithKey> {
    const acct = await this.sdk.programs.Volt.account.pendingWithdrawal.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEpochInfoByKey(key: PublicKey): Promise<FriktionEpochInfoWithKey> {
    const acct = await this.sdk.programs.Volt.account.friktionEpochInfo.fetch(
      key
    );
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getEpochInfoByNumber(
    roundNumber: BN
  ): Promise<FriktionEpochInfoWithKey> {
    const key = (
      await VoltSDK.findEpochInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return await this.getEpochInfoByKey(key);
  }

  async getAllEpochInfos(): Promise<FriktionEpochInfoWithKey[]> {
    let epochNumber = new BN(1);
    const epochInfoList = [];
    while (epochNumber.lte(this.voltVault.roundNumber)) {
      const epochInfo = await this.getEpochInfoByNumber(epochNumber);
      epochInfoList.push(epochInfo);
      epochNumber = epochNumber.addn(1);
    }
    return epochInfoList;
  }

  async getRoundVoltTokensByNumber(roundNumber: BN): Promise<BN> {
    const key = (
      await VoltSDK.findRoundVoltTokensAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return new BN(
      (
        await getAccount(this.sdk.readonlyProvider.connection, key)
      ).amount.toString()
    );
  }

  async getRoundUnderlyingTokensByNumber(roundNumber: BN): Promise<BN> {
    const key = (
      await VoltSDK.findRoundUnderlyingTokensAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return new BN(
      (
        await getAccount(this.sdk.readonlyProvider.connection, key)
      ).amount.toString()
    );
  }

  async getAllRounds(): Promise<RoundWithKey[]> {
    let roundNumber = new BN(1);
    const roundList = [];
    while (roundNumber.lte(this.voltVault.roundNumber)) {
      const round = await this.getRoundByNumber(roundNumber);
      roundList.push(round);
      roundNumber = roundNumber.addn(1);
    }
    return roundList;
  }

  async getRoundByKey(key: PublicKey): Promise<RoundWithKey> {
    const acct = await this.sdk.programs.Volt.account.round.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getRoundByNumber(roundNumber: BN): Promise<RoundWithKey> {
    const key = (
      await VoltSDK.findRoundInfoAddress(
        this.voltKey,
        roundNumber,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return this.getRoundByKey(key);
  }

  async loadInExtraVoltData() {
    const extraVoltData = await this.getExtraVoltData();
    this.extraVoltData = extraVoltData;
  }

  static async extraVoltDataForVoltKey(
    voltKey: PublicKey,
    sdk: FriktionSDK
  ): Promise<ExtraVoltDataWithKey> {
    const [key] = await VoltSDK.findExtraVoltDataAddress(
      voltKey,
      sdk.programs.Volt.programId
    );
    const acct = await sdk.programs.Volt.account.extraVoltData.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async getExtraVoltDataKey(): Promise<PublicKey> {
    return (await VoltSDK.findExtraVoltDataAddress(this.voltKey))[0];
  }

  async getExtraVoltData(): Promise<ExtraVoltDataWithKey> {
    const [key] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey,
      this.sdk.programs.Volt.programId
    );
    const acct = await this.sdk.programs.Volt.account.extraVoltData.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  //// FIND PDAs ////

  static async findUsefulAddresses(
    voltKey: PublicKey,
    voltVault: VoltVault,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<UsefulAddresses> {
    const [pendingDepositInfoKey] = await VoltSDK.findPendingDepositInfoAddress(
      voltKey,
      user,
      voltProgramId
    );

    const [pendingWithdrawalInfoKey] =
      await VoltSDK.findPendingWithdrawalInfoAddress(
        voltKey,
        user,
        voltProgramId
      );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(
      voltKey,
      voltProgramId
    );

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        voltKey,
        GLOBAL_MM_TOKEN_MINT
      );
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      epochInfoBump,
    } = await VoltSDK.findRoundAddresses(
      voltKey,
      voltVault.roundNumber,
      voltProgramId
    );

    return {
      extraVoltKey,
      pendingDepositInfoKey,
      roundInfoKey,
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      whitelistTokenAccountKey,
      epochInfoBump,
    };
  }

  static async findAuctionMetadataAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("auctionMetadata")],
      voltProgramId
    );
  }

  static async findExtraVoltDataAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("extraVoltData")],
      voltProgramId
    );
  }

  static async findVaultAuthorityAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("vaultAuthority")],
      voltProgramId
    );
  }
  static async findSharedInitializeAddresses(
    sdk: FriktionSDK,
    voltKey: PublicKey
  ): Promise<{
    vaultAuthorityBump: number;
    extraVoltKey: PublicKey;
    vaultMint: PublicKey;
    vaultAuthority: PublicKey;
    depositPoolKey: PublicKey;
    whitelistTokenAccountKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(voltKey);

    const [vaultMint, _vaultMintBump] = await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("vaultToken")],
      sdk.programs.Volt.programId
    );

    const [vaultAuthority, vaultAuthorityBump] =
      await VoltSDK.findVaultAuthorityAddress(voltKey);

    const [depositPoolKey] = await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("depositPool")],
      sdk.programs.Volt.programId
    );

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        voltKey,
        sdk.net.MM_TOKEN_MINT,
        sdk.programs.Volt.programId
      );

    return {
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      vaultAuthorityBump,
      depositPoolKey,
      whitelistTokenAccountKey,
    };
  }

  static async findWhitelistTokenAccountAddress(
    voltKey: PublicKey,
    whitelistMintKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ) {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        whitelistMintKey.toBuffer(),
        textEncoder.encode("whitelistTokenAccount"),
      ],
      voltProgramId
    );
  }

  static async findEntropyLendingAccountAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("entropyLendingAccount")],
      voltProgramId
    );
  }

  static async findEpochInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("epochInfo"),
      ],
      voltProgramId
    );
  }

  static async findRoundInfoAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("roundInfo"),
      ],
      voltProgramId
    );
  }

  static async findRoundVoltTokensAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("roundVoltTokens"),
      ],
      voltProgramId
    );
  }

  static async findRoundUnderlyingTokensAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();

    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("roundUnderlyingTokens"),
      ],
      voltProgramId
    );
  }

  static async findRoundUnderlyingPendingWithdrawalsAddress(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        new BN(roundNumber.toString()).toArrayLike(Buffer, "le", 8),
        textEncoder.encode("roundUlPending"),
      ],
      voltProgramId
    );
  }

  static async findRoundAddresses(
    voltKey: PublicKey,
    roundNumber: BN,
    voltProgramId: PublicKey = FRIKTION_PROGRAM_ID
  ): Promise<{
    roundInfoKey: PublicKey;
    roundInfoKeyBump: number;
    roundUnderlyingTokensKey: PublicKey;
    roundUnderlyingTokensKeyBump: number;
    roundVoltTokensKey: PublicKey;
    roundVoltTokensKeyBump: number;
    roundUnderlyingPendingWithdrawalsKey: PublicKey;
    roundUnderlyingPendingWithdrawalsBump: number;
    epochInfoKey: PublicKey;
    epochInfoBump: number;
  }> {
    const [roundInfoKey, roundInfoKeyBump] = await VoltSDK.findRoundInfoAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    const [roundUnderlyingTokensKey, roundUnderlyingTokensKeyBump] =
      await VoltSDK.findRoundUnderlyingTokensAddress(
        voltKey,
        roundNumber,
        voltProgramId
      );

    const [roundVoltTokensKey, roundVoltTokensKeyBump] =
      await VoltSDK.findRoundVoltTokensAddress(
        voltKey,
        roundNumber,
        voltProgramId
      );

    const [
      roundUnderlyingPendingWithdrawalsKey,
      roundUnderlyingPendingWithdrawalsBump,
    ] = await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    const [epochInfoKey, epochInfoBump] = await VoltSDK.findEpochInfoAddress(
      voltKey,
      roundNumber,
      voltProgramId
    );

    return {
      roundInfoKey,
      roundInfoKeyBump,
      roundUnderlyingTokensKey,
      roundUnderlyingTokensKeyBump,
      roundVoltTokensKey,
      roundVoltTokensKeyBump,
      roundUnderlyingPendingWithdrawalsKey,
      roundUnderlyingPendingWithdrawalsBump,
      epochInfoKey,
      epochInfoBump,
    };
  }

  static async findPendingDepositInfoAddress(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        user.toBuffer(),
        textEncoder.encode("pendingDeposit"),
      ],
      voltProgramId
    );
  }

  static async findPendingWithdrawalInfoAddress(
    voltKey: PublicKey,
    user: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        voltKey.toBuffer(),
        user.toBuffer(),
        textEncoder.encode("pendingWithdrawal"),
      ],
      voltProgramId
    );
  }

  async getBalancesForUserDeprecated(pubkey: PublicKey): Promise<
    | {
        totalBalance: Decimal;
        normalBalance: Decimal;
        pendingDeposits: Decimal;
        pendingWithdrawals: Decimal;
        mintableShares: Decimal;
        claimableUnderlying: Decimal;
        normFactor: Decimal;
        vaultNormFactor: Decimal;
      }
    | undefined
  > {
    const voltVault = this.voltVault;
    const connection = this.sdk.readonlyProvider.connection;

    const underlyingTokenMintInfo = await getMint(
      connection,
      voltVault.depositMint
    );
    const vaultTokenMintInfo = await getMint(connection, voltVault.vaultMint);

    const normFactor = new Decimal(10).pow(underlyingTokenMintInfo.decimals);
    const vaultNormFactor = new Decimal(10).pow(vaultTokenMintInfo.decimals);

    const totalVaultValueExcludingPendingDeposits = (
      await this.getTvlWithoutPendingInDepositToken(normFactor)
    ).mul(normFactor);

    const roundInfo = await this.getRoundByNumber(voltVault.roundNumber);

    const voltTokenSupply = new Decimal(
      vaultTokenMintInfo.supply.toString()
    ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));

    const vaultTokenAccount = await getAssociatedTokenAddress(
      voltVault.vaultMint,
      pubkey,
      true
    );

    let userVoltTokens = new Decimal(0);
    try {
      userVoltTokens = new Decimal(
        (
          await getAccount(
            this.sdk.readonlyProvider.connection,
            vaultTokenAccount
          )
        ).amount.toString()
      );
      // eslint-disable-next-line no-empty
    } catch (err) {}

    const userValueExcludingPendingDeposits = voltTokenSupply.lte(0)
      ? new Decimal(0)
      : totalVaultValueExcludingPendingDeposits
          .mul(userVoltTokens)
          .div(voltTokenSupply);

    let pendingDepositInfo = null;

    try {
      pendingDepositInfo = await this.getPendingDepositForGivenUser(pubkey);
    } catch (err) {
      pendingDepositInfo = null;
    }

    let userValueFromPendingDeposits = new Decimal(0);
    let userMintableShares = new Decimal(0);

    if (
      pendingDepositInfo !== null &&
      pendingDepositInfo.numUnderlyingDeposited.gtn(0)
    ) {
      const roundForPendingDeposit = await this.getRoundByNumber(
        pendingDepositInfo.roundNumber
      );
      const voltTokensForPendingDepositRound = new Decimal(
        (
          await getAccount(
            this.sdk.readonlyProvider.connection,
            (
              await VoltSDK.findRoundVoltTokensAddress(
                this.voltKey,
                roundForPendingDeposit.number,
                this.sdk.programs.Volt.programId
              )
            )[0]
          )
        ).amount.toString()
      );

      userValueFromPendingDeposits =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0)
          ? new Decimal(0)
          : pendingDepositInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              )
              .mul(totalVaultValueExcludingPendingDeposits)
              .div(voltTokenSupply);

      userMintableShares =
        voltTokenSupply.lte(0) ||
        roundForPendingDeposit.underlyingFromPendingDeposits.lten(0) ||
        pendingDepositInfo.roundNumber.gte(this.voltVault.roundNumber)
          ? new Decimal(0)
          : new Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
              .mul(voltTokensForPendingDepositRound)
              .div(
                new Decimal(
                  roundForPendingDeposit.underlyingFromPendingDeposits.toString()
                )
              );
    }

    let pendingwithdrawalInfo = null;

    try {
      pendingwithdrawalInfo = await this.getPendingWithdrawalForGivenUser(
        pubkey
      );
    } catch (err) {
      pendingwithdrawalInfo = null;
    }

    let userValueFromPendingWithdrawals = new Decimal(0);
    let userClaimableUnderlying = new Decimal(0);

    if (
      pendingwithdrawalInfo !== null &&
      pendingwithdrawalInfo.numVoltRedeemed.gtn(0)
    ) {
      const roundForPendingWithdrawal = await this.getRoundByNumber(
        pendingwithdrawalInfo.roundNumber
      );
      const underlyingTokensForPendingWithdrawalRound = new Decimal(
        (
          await getAccount(
            this.sdk.readonlyProvider.connection,
            (
              await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
                this.voltKey,
                roundForPendingWithdrawal.number,
                this.sdk.programs.Volt.programId
              )
            )[0]
          )
        ).amount.toString()
      );

      userValueFromPendingWithdrawals = voltTokenSupply.lte(0)
        ? new Decimal(0)
        : pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
        ? new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
            .mul(
              new Decimal(totalVaultValueExcludingPendingDeposits.toString())
            )
            .div(voltTokenSupply)
        : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
        ? new Decimal(0)
        : new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
            .mul(underlyingTokensForPendingWithdrawalRound)
            .div(
              new Decimal(
                roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
              )
            );

      userClaimableUnderlying =
        voltTokenSupply.lte(0) ||
        pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
          ? new Decimal(0)
          : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
          ? new Decimal(0)
          : new Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
              .mul(underlyingTokensForPendingWithdrawalRound)
              .div(
                new Decimal(
                  roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()
                )
              );
    }

    const totalUserValue = userValueExcludingPendingDeposits
      .add(userValueFromPendingDeposits)
      .add(userValueFromPendingWithdrawals);

    return {
      totalBalance: totalUserValue.div(normFactor),
      normalBalance: userValueExcludingPendingDeposits.div(normFactor),
      pendingDeposits: userValueFromPendingDeposits.div(normFactor),
      pendingWithdrawals: userValueFromPendingWithdrawals.div(normFactor),
      mintableShares: userMintableShares.div(normFactor),
      claimableUnderlying: userClaimableUnderlying.div(normFactor),
      normFactor: normFactor,
      vaultNormFactor: vaultNormFactor,
    };
  }

  async getAssociatedUnderlyingTokenAccountForUser(user: PublicKey) {
    return await getAssociatedTokenAddress(
      this.voltVault.depositMint,
      user,
      true
    );
  }

  async getAssociatedVaultTokenAccountForUser(user: PublicKey) {
    return await getAssociatedTokenAddress(
      this.voltVault.vaultMint,
      user,
      true
    );
  }

  async getCurrentRoundInfoAccounts(): Promise<{
    voltVault: PublicKey;
    roundInfo: PublicKey;
    epochInfo: PublicKey;
  }> {
    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    return {
      voltVault: this.voltKey,
      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,
    };
  }

  async getCurrentAllRoundAccounts(): Promise<{
    voltVault: PublicKey;
    roundInfo: PublicKey;
    roundUnderlyingTokens: PublicKey;
    roundUnderlyingTokensForPendingWithdrawals: PublicKey;
    roundVoltTokens: PublicKey;
  }> {
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      roundVoltTokensKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    return {
      voltVault: this.voltKey,
      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      roundVoltTokens: roundVoltTokensKey,
    };
  }

  async getEntropyLendingAccounts(): Promise<{
    voltVault: PublicKey;
    program: PublicKey;
    group: PublicKey;
    account: PublicKey;
  }> {
    const {
      entropyLendingProgramKey,
      entropyLendingGroupKey,
      entropyLendingAccountKey,
    } = await this.getEntropyLendingKeys();

    return {
      voltVault: this.voltKey,
      program: entropyLendingProgramKey,
      group: entropyLendingGroupKey,
      account: entropyLendingAccountKey,
    };
  }

  async getEntropyContextAccountsOrDefault(): Promise<EntropyBaseAccountsWithoutBanks> {
    return {
      extraVoltData: (await VoltSDK.findExtraVoltDataAddress(this.voltKey))[0],
      group: this.extraVoltData?.entropyGroup ?? SystemProgram.programId,
      account: this.extraVoltData?.entropyAccount ?? SystemProgram.programId,
      cache: this.extraVoltData?.entropyCache ?? SystemProgram.programId,
      program: this.extraVoltData?.entropyProgramId ?? SystemProgram.programId,
    };
  }

  async getPrincipalProtectionContextAccountsOrDefault(): Promise<PrincipalProtectionContextExtendedAccounts> {
    if (this.voltType() === VoltType.PrincipalProtection) {
      return await (
        this as unknown as PrincipalProtectionVoltSDK
      ).getPrincipalProtectionContextExtendedAccounts();
    } else {
      return {
        voltVault: SystemProgram.programId,
        ppVault: SystemProgram.programId,
        depositTrackingAccount: SystemProgram.programId,
        lendingSharesPool: SystemProgram.programId,
        depositTrackingPda: SystemProgram.programId,
        sharesMint: SystemProgram.programId,
        lendingVault: SystemProgram.programId,
        lendingVaultPda: SystemProgram.programId,
        lendingVaultProgram: SystemProgram.programId,
        optionTokenPool: SystemProgram.programId,
      };
    }
  }

  getOptionsProgramAccounts() {
    return {
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      spreadsProgram: OPTIONS_PROGRAM_IDS.Spreads,
    };
  }

  async getInitializeStartRoundAccounts(user: PublicKey) {
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber.addn(1),
      this.sdk.programs.Volt.programId
    );

    return {
      authority: user,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      depositPool: this.voltVault.depositPool,

      depositMint: this.voltVault.depositMint,
      vaultMint: this.voltVault.vaultMint,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      epochInfo: epochInfoKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };
  }

  static async findQuoteAssetPoolAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("premiumPool")],
      voltProgramId
    );
  }

  static async findPermissionedMarketPremiumPoolAddress(
    voltKey: PublicKey,
    voltProgramId: PublicKey
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [voltKey.toBuffer(), textEncoder.encode("permissionedMarketPremiumPool")],
      voltProgramId
    );
  }
}
