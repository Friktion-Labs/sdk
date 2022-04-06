import {
  EntropyClient,
  I80F48,
  makeCachePerpMarketsInstruction,
  makeCachePricesInstruction,
} from "@friktion-labs/entropy-client";
import { Market } from "@project-serum/serum";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";

import {
  INERTIA_FEE_OWNER,
  OPTIONS_PROGRAM_IDS,
  REFERRAL_AUTHORITY,
  SOLOPTIONS_FEE_OWNER,
} from "../..";
import { ENTROPY_PROGRAM_ID, VoltType } from "../../constants";
import { InertiaSDK, SoloptionsSDK } from "..";
import type { ExtraVoltData } from ".";
import {
  getMarketAndAuthorityInfo,
  getVaultOwnerAndNonce,
  marketLoader,
} from "./serum";
import {
  getAccountBalance,
  getAccountBalanceOrZero,
  getBalanceOrZero,
  getMintSupplyOrZero,
} from "./utils";
import { VoltSDK } from "./VoltSDK";
import type {
  OptionsProtocol,
  PendingDepositWithKey,
  PendingWithdrawalWithKey,
  VoltProgram,
} from "./voltTypes";

export class ConnectedVoltSDK extends VoltSDK {
  readonly connection: Connection;
  readonly wallet: PublicKey;
  readonly extraVoltData?: ExtraVoltData | undefined;
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    connection: Connection,
    user: PublicKey,
    voltSDK: VoltSDK,
    extraVoltData?: ExtraVoltData | undefined,
    daoAuthority?: PublicKey | undefined
  ) {
    super(voltSDK.sdk, voltSDK.voltVault, voltSDK.voltKey);

    this.connection = connection;
    this.wallet = user;
    // = providerToContribProvider(providerMut);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.extraVoltData = extraVoltData;
    this.daoAuthority = daoAuthority;

    // There is an obscure bug where the wallet.publicKey was a naked BN and not
    // a PublicKey. Please use this.user instead of this.providerMut.wallet.publicKey
    this.wallet = new PublicKey(this.wallet);
  }

  /**
   *
   * trueDepositAmount is NOT normalized. We do that for you :)
   *
   * Actually jk. If you are on the browser, you MUST pass in decimals
   */
  async deposit(
    trueDepositAmount: Decimal,
    underlyingTokenSource: PublicKey,
    vaultTokenDestination: PublicKey,
    daoAuthority?: PublicKey,
    decimals?: number
  ): Promise<TransactionInstruction> {
    if (daoAuthority === undefined) daoAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      pendingDepositInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      daoAuthority !== undefined ? daoAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const normFactor = decimals
      ? new Decimal(10 ** decimals)
      : await this.getNormalizationFactor();

    const normalizedDepositAmount = new BN(
      trueDepositAmount.mul(normFactor).toString()
    );

    console.log(
      "writer token pool = ",
      this.voltVault.writerTokenPool.toString()
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const depositAccountsStruct: Parameters<
      VoltProgram["instruction"]["deposit"]["accounts"]
    >[0] = {
      authority: this.wallet,
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      authorityCheck:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: this.voltVault.vaultAuthority,
      whitelist: this?.extraVoltData?.whitelist ?? SystemProgram.programId,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      underlyingTokenSource: underlyingTokenSource,
      vaultTokenDestination: vaultTokenDestination,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.deposit(normalizedDepositAmount, {
      accounts: depositAccountsStruct,
    });
  }

  async depositWithTransfer(
    trueDepositAmount: Decimal,
    underlyingTokenSource: PublicKey,
    vaultTokenDestination: PublicKey,
    solTransferAuthority: PublicKey,
    daoAuthority?: PublicKey,
    decimals?: number
  ): Promise<TransactionInstruction> {
    if (daoAuthority === undefined) daoAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      pendingDepositInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      daoAuthority !== undefined ? daoAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const normFactor = decimals
      ? new Decimal(10 ** decimals)
      : await this.getNormalizationFactor();

    const normalizedDepositAmount = new BN(
      trueDepositAmount.mul(normFactor).toString()
    );

    console.log(
      "writer token pool = ",
      this.voltVault.writerTokenPool.toString()
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    console.log("this.extraVoltData: ", this.extraVoltData);
    console.log("extraVoltKey: ", extraVoltKey.toString());
    console.log(
      "SystemProgram.programId: ",
      SystemProgram.programId.toString()
    );
    console.log("whitelist: ", this.extraVoltData?.whitelist);
    const depositWithTransferAccounts: Parameters<
      VoltProgram["instruction"]["depositWithTransfer"]["accounts"]
    >[0] = {
      authority: this.wallet,
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      authorityCheck:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      solTransferAuthority: solTransferAuthority,
      // underlyingAssetMint: this.voltVault.underlyingAssetMint,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: this.voltVault.vaultAuthority,
      whitelist: this?.extraVoltData?.whitelist ?? SystemProgram.programId,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      underlyingTokenSource: underlyingTokenSource,
      vaultTokenDestination: vaultTokenDestination,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,
      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      // rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.depositWithTransfer(
      normalizedDepositAmount,
      {
        accounts: depositWithTransferAccounts,
      }
    );
  }

  async depositWithClaim(
    trueDepositAmount: Decimal,
    underlyingTokenSource: PublicKey,
    vaultTokenDestination: PublicKey,
    shouldTransferSol = false,
    solTransferAuthority?: PublicKey,
    daoAuthority?: PublicKey,
    decimals?: number
  ): Promise<TransactionInstruction> {
    if (daoAuthority === undefined) daoAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      pendingDepositInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      daoAuthority !== undefined ? daoAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const normFactor = decimals
      ? new Decimal(10 ** decimals)
      : await this.getNormalizationFactor();

    const normalizedDepositAmount = new BN(
      trueDepositAmount.mul(normFactor).toString()
    );

    let pendingDepositInfo: PendingDepositWithKey | undefined;
    try {
      pendingDepositInfo = await this.getPendingDepositByKey(
        pendingDepositInfoKey
      );
    } catch (err) {
      // pass
    }

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const {
      roundInfoKey: pendingDepositRoundInfoKey,
      roundVoltTokensKey: pendingDepositRoundVoltTokensKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      pendingDepositInfo?.roundNumber ?? new BN(0),
      this.sdk.programs.Volt.programId
    );
    const depositWithClaimAccounts: Parameters<
      VoltProgram["instruction"]["depositWithClaim"]["accounts"]
    >[0] = {
      authority: this.wallet,
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      authorityCheck:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      solTransferAuthority: solTransferAuthority
        ? solTransferAuthority
        : this.wallet,
      // underlyingAssetMint: this.voltVault.underlyingAssetMint,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: this.voltVault.vaultAuthority,
      whitelist: this?.extraVoltData?.whitelist ?? SystemProgram.programId,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      underlyingTokenSource: underlyingTokenSource,
      vaultTokenDestination: vaultTokenDestination,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,

      pendingDepositRoundInfo: pendingDepositRoundInfoKey,
      pendingDepositRoundVoltTokens: pendingDepositRoundVoltTokensKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      // rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.depositWithClaim(
      normalizedDepositAmount,
      shouldTransferSol,
      {
        accounts: depositWithClaimAccounts,
      }
    );
  }

  async getFeeTokenAccount() {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.voltVault.underlyingAssetMint,
      REFERRAL_AUTHORITY
    );
  }

  async getSoloptionsMintFeeAccount() {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.voltVault.underlyingAssetMint,
      SOLOPTIONS_FEE_OWNER
    );
  }

  async getInertiaMintFeeAccount() {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.voltVault.underlyingAssetMint,
      INERTIA_FEE_OWNER
    );
  }

  async getSoloptionsExerciseFeeAccount() {
    return await SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(
      this.voltVault.quoteAssetMint
    );
  }

  async getInertiaExerciseFeeAccount() {
    return await InertiaSDK.getGenericInertiaExerciseFeeAccount(
      this.voltVault.quoteAssetMint
    );
  }

  /**
   * Do not provide withdrawAmount in num of vault tokens. Provide human amount.
   * you must normalize yourself
   */
  async withdrawHumanAmount(
    withdrawAmount: Decimal,
    userVaultTokens: PublicKey,
    underlyingTokenDestination: PublicKey,
    daoAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    const estimatedTotalWithoutPendingDepositTokenAmount =
      await this.getVoltValueInDepositToken();
    const roundInfo = await this.getRoundByKey(
      (
        await VoltSDK.findRoundInfoAddress(
          this.voltKey,
          this.voltVault.roundNumber,
          this.sdk.programs.Volt.programId
        )
      )[0]
    );
    const userVoltTokenBalance = await getBalanceOrZero(
      new Token(
        this.connection,
        this.voltVault.vaultMint,
        TOKEN_PROGRAM_ID,
        null as unknown as Signer
      ),
      userVaultTokens
    );

    const vaultMintSupply = (
      await getMintSupplyOrZero(this.connection, this.voltVault.vaultMint)
    ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));
    const normFactor = await this.getNormalizationFactor();
    const humanAmount = new Decimal(withdrawAmount.toString());
    const withdrawalAmountNormalized = humanAmount.mul(normFactor);
    let withdrawalAmountVaultTokens = withdrawalAmountNormalized
      .mul(vaultMintSupply)
      .div(
        new Decimal(estimatedTotalWithoutPendingDepositTokenAmount.toString())
      )
      .toFixed(0);

    /** If user's is withdrawing between 99.8-102%, we set withdrawal to 100.0% */
    if (userVoltTokenBalance) {
      const withdrawalAmountVaultTokensDec = new Decimal(
        withdrawalAmountVaultTokens
      );
      const withdrawRatio = withdrawalAmountVaultTokensDec
        .div(userVoltTokenBalance)
        .toNumber();
      if (withdrawRatio > 0.998 && withdrawRatio < 1.02) {
        withdrawalAmountVaultTokens = userVoltTokenBalance.toString();
      }
    }

    console.log(
      "withdrawal amount vault tokens: ",
      withdrawalAmountVaultTokens.toString()
    );
    return await this.withdraw(
      new BN(withdrawalAmountVaultTokens),
      userVaultTokens,
      underlyingTokenDestination,
      daoAuthority
    );
  }

  /**
   * trueWithdrawAmount is in vault tokens. you must normalize yourself
   */
  async withdraw(
    withdrawAmount: BN,
    userVaultTokens: PublicKey,
    underlyingTokenDestination: PublicKey,
    daoAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    if (!daoAuthority) daoAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      daoAuthority !== undefined ? daoAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const withdrawAccountsStruct: Parameters<
      VoltProgram["instruction"]["withdraw"]["accounts"]
    >[0] = {
      authority: this.wallet,

      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      authorityCheck:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      vaultMint: this.voltVault.vaultMint,

      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      extraVoltData: extraVoltKey,
      whitelist:
        this.extraVoltData?.isWhitelisted && this.extraVoltData?.whitelist
          ? this.extraVoltData.whitelist
          : SystemProgram.programId,

      depositPool: this.voltVault.depositPool,
      underlyingTokenDestination: underlyingTokenDestination,
      vaultTokenSource: userVaultTokens,

      roundInfo: roundInfoKey,

      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingWithdrawalInfo: pendingWithdrawalInfoKey,
      epochInfo: epochInfoKey,

      feeAcct: await this.getFeeTokenAccount(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.withdraw(withdrawAmount, {
      accounts: withdrawAccountsStruct,
    });
  }

  /**
   * cancel pending withdrawal
   */
  async cancelPendingWithdrawal(
    userVaultTokens: PublicKey
  ): Promise<TransactionInstruction> {
    const authority =
      this.daoAuthority !== undefined ? this.daoAuthority : this.wallet;
    const { roundInfoKey, pendingWithdrawalInfoKey, epochInfoKey } =
      await VoltSDK.findUsefulAddresses(
        this.voltKey,
        this.voltVault,
        authority,
        this.sdk.programs.Volt.programId
      );

    const cancelPendingWithdrawalAccountsStruct: Parameters<
      VoltProgram["instruction"]["cancelPendingWithdrawal"]["accounts"]
    >[0] = {
      authority: authority,

      vaultMint: this.voltVault.vaultMint,

      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultTokenDestination: userVaultTokens,

      roundInfo: roundInfoKey,

      pendingWithdrawalInfo: pendingWithdrawalInfoKey,

      epochInfo: epochInfoKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.cancelPendingWithdrawal({
      accounts: cancelPendingWithdrawalAccountsStruct,
    });
  }

  /**
   * cancel pending deposit
   */
  async cancelPendingDeposit(
    userUnderlyingTokens: PublicKey
  ): Promise<TransactionInstruction> {
    const authority =
      this.daoAuthority !== undefined ? this.daoAuthority : this.wallet;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      pendingDepositInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      authority,
      this.sdk.programs.Volt.programId
    );

    const cancelPendingDepositAccountsStruct: Parameters<
      VoltProgram["instruction"]["cancelPendingDeposit"]["accounts"]
    >[0] = {
      authority: authority,

      vaultMint: this.voltVault.vaultMint,

      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      underlyingTokenDestination: userUnderlyingTokens,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      pendingDepositInfo: pendingDepositInfoKey,

      epochInfo: epochInfoKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.cancelPendingDeposit({
      accounts: cancelPendingDepositAccountsStruct,
    });
  }

  async claimPendingWithoutSigning(
    vaultTokenDestination: PublicKey,
    replacementAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    const ix: TransactionInstruction = await this.claimPending(
      vaultTokenDestination,
      replacementAuthority
    );
    if (ix.keys[0] === undefined) throw new Error("eat my ass");
    ix.keys[0].isSigner = false;
    return ix;
  }

  async claimPendingWithdrawalWithoutSigning(
    underlyingTokenDestinationKey: PublicKey,
    replacementAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    const ix: TransactionInstruction = await this.claimPendingWithdrawal(
      underlyingTokenDestinationKey,
      replacementAuthority
    );
    if (ix.keys[0] === undefined) throw new Error("eat my ass");
    ix.keys[0].isSigner = false;
    return ix;
  }

  async claimPending(
    vaultTokenDestination: PublicKey,
    replacementAuthority?: PublicKey
    // additionalSigners?: Signer[]
  ): Promise<TransactionInstruction> {
    const authority = replacementAuthority
      ? replacementAuthority
      : this.daoAuthority
      ? this.daoAuthority
      : this.wallet;
    const { pendingDepositInfoKey } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      authority,
      this.sdk.programs.Volt.programId
    );

    const pendingDeposit = this.getPendingDepositByKey(pendingDepositInfoKey);

    const { roundInfoKey, roundVoltTokensKey } =
      await VoltSDK.findRoundAddresses(
        this.voltKey,
        (
          await pendingDeposit
        ).roundNumber,
        this.sdk.programs.Volt.programId
      );

    const claimPendingStruct: Parameters<
      VoltProgram["instruction"]["claimPending"]["accounts"]
    >[0] = {
      authority: authority,

      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      pendingDepositRoundInfo: roundInfoKey,
      pendingDepositRoundVoltTokens: roundVoltTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,

      userVaultTokens: vaultTokenDestination,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.claimPending({
      accounts: claimPendingStruct,
    });
  }

  async claimPendingWithdrawal(
    underlyingTokenDestinationKey: PublicKey,
    replacementAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    const authority = replacementAuthority
      ? replacementAuthority
      : this.daoAuthority
      ? this.daoAuthority
      : this.wallet;
    const [pendingWithdrawalInfoKey] =
      await VoltSDK.findPendingWithdrawalInfoAddress(
        this.voltKey,
        authority,
        this.sdk.programs.Volt.programId
      );

    const pendingWithdrawal = await this.getPendingWithdrawalByKey(
      pendingWithdrawalInfoKey
    );

    const { roundInfoKey, roundUnderlyingPendingWithdrawalsKey } =
      await VoltSDK.findRoundAddresses(
        this.voltKey,
        pendingWithdrawal.roundNumber,
        this.sdk.programs.Volt.programId
      );

    const claimPendingWithdrawalStruct: Parameters<
      VoltProgram["instruction"]["claimPendingWithdrawal"]["accounts"]
    >[0] = {
      authority: authority,

      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,

      pendingWithdrawalRoundInfo: roundInfoKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      pendingWithdrawalInfo: pendingWithdrawalInfoKey,

      underlyingTokenDestination: underlyingTokenDestinationKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.claimPendingWithdrawal({
      accounts: claimPendingWithdrawalStruct,
    });
  }

  async changeCapacity(
    capacity: BN,
    individualCapacity: BN
  ): Promise<TransactionInstruction> {
    const [roundInfo] = await VoltSDK.findRoundInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const changeVarsAccounts: Parameters<
      VoltProgram["instruction"]["changeCapacity"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      roundInfo: roundInfo,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.changeCapacity(
      capacity,
      individualCapacity,
      {
        accounts: changeVarsAccounts,
      }
    );
  }

  async startRound(): Promise<TransactionInstruction> {
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

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    console.log(
      "ul mint in start round = ",
      this.voltVault.underlyingAssetMint.toString()
    );

    const startRoundStruct: Parameters<
      VoltProgram["instruction"]["startRound"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      vaultMint: this.voltVault.vaultMint,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    Object.entries(startRoundStruct).map(function (key, value) {
      console.log(key.toString() + " = " + value.toString());
    });
    return this.sdk.programs.Volt.instruction.startRound({
      accounts: startRoundStruct,
    });
  }

  async endRound(): Promise<TransactionInstruction> {
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const endRoundStruct: Parameters<
      VoltProgram["instruction"]["endRound"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      epochInfo: epochInfoKey,

      feeAcct: await this.getFeeTokenAccount(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.endRound({
      accounts: endRoundStruct,
    });
  }

  async takePendingWithdrawalFees(): Promise<TransactionInstruction> {
    const { roundUnderlyingPendingWithdrawalsKey, epochInfoKey } =
      await VoltSDK.findUsefulAddresses(
        this.voltKey,
        this.voltVault,
        this.wallet,
        this.sdk.programs.Volt.programId
      );

    const takePendingWithdrawalFeesStruct: Parameters<
      VoltProgram["instruction"]["takePendingWithdrawalFees"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,

      feeAcct: await this.getFeeTokenAccount(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.takePendingWithdrawalFees({
      accounts: takePendingWithdrawalFeesStruct,
    });
  }

  async setNextOption(
    newOptionMarketKey: PublicKey,
    optionSerumMarketKey: PublicKey,
    whitelistMintKey: PublicKey,
    serumProgramId: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      newOptionMarketKey,
      optionsProtocol
    );

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        this.voltKey,
        whitelistMintKey,
        this.sdk.programs.Volt.programId
      );

    const { marketAuthorityBump } = await getMarketAndAuthorityInfo(
      this.sdk.programs.Volt.programId,
      optionMarket.key,
      whitelistMintKey,
      serumProgramId
    );

    const optionSerumMarketProxy = await marketLoader(
      this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
      optionMarket.key,
      whitelistTokenAccountKey,
      marketAuthorityBump,
      serumProgramId,
      optionSerumMarketKey
    );

    const { openOrdersBump } =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
        optionSerumMarketProxy
      );

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const { optionPoolKey, writerTokenPoolKey } =
      await VoltSDK.findSetNextOptionAddresses(
        this.voltKey,
        optionMarket.optionMint,
        optionMarket.writerTokenMint,
        this.sdk.programs.Volt.programId
      );

    const setNextOptionStruct: Parameters<
      VoltProgram["instruction"]["setNextOption"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      optionPool: optionPoolKey,
      writerTokenPool: writerTokenPoolKey,

      rawOptionMarket: newOptionMarketKey,
      optionMint: optionMarket.optionMint,
      writerTokenMint: optionMarket.writerTokenMint,

      roundInfo: roundInfoKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.setNextOption(
      openOrdersBump,
      marketAuthorityBump,
      {
        accounts: setNextOptionStruct,
      }
    );
  }

  async resetOptionMarket(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    const { backupOptionPoolKey, backupWriterTokenPoolKey } =
      await VoltSDK.findBackupPoolAddresses(this.voltKey, this.voltVault);

    const resetOptionMarketAccounts: Parameters<
      VoltProgram["instruction"]["resetOptionMarket"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,

      depositPool: this.voltVault.depositPool,
      optionPool: this.voltVault.optionPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      rawOptionMarket: this.voltVault.optionMarket,
      optionMint: optionMarket.optionMint,
      writerTokenMint: optionMarket.writerTokenMint,

      backupOptionPool: backupOptionPoolKey,
      backupWriterTokenPool: backupWriterTokenPoolKey,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.resetOptionMarket({
      accounts: resetOptionMarketAccounts,
    });
  }

  async rebalancePrepare(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    const optionsProtocol = await this.getOptionsProtocolForKey(
      this.voltVault.optionMarket
    );

    const underlyingToken = new Token(
      this.connection,
      optionMarket.underlyingAssetMint,
      TOKEN_PROGRAM_ID,
      undefined as unknown as Signer
    );

    let feeDestinationKey: PublicKey;
    const remainingAccounts: AccountMeta[] = [];
    if (optionsProtocol === "Inertia") {
      feeDestinationKey = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        underlyingToken.publicKey,
        INERTIA_FEE_OWNER
      );
    } else if (optionsProtocol === "Soloptions") {
      feeDestinationKey = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        underlyingToken.publicKey,
        SOLOPTIONS_FEE_OWNER
      );
    } else {
      throw new Error("weird options protocol");
    }

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalancePrepareStruct: Parameters<
      VoltProgram["instruction"]["rebalancePrepare"]["accounts"]
    >[0] = {
      authority: this.wallet,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      optionPool: this.voltVault.optionPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      rawOptionMarket: this.voltVault.optionMarket,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      quoteAssetMint: this.voltVault.quoteAssetMint,
      optionMint: this.voltVault.optionMint,
      writerTokenMint: this.voltVault.writerTokenMint,

      underlyingAssetPool: optionMarket.underlyingAssetPool,

      optionProtocolFeeDestination: feeDestinationKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalancePrepare({
      accounts: rebalancePrepareStruct,
      remainingAccounts: remainingAccounts,
    });
  }

  getPermissionedMarketReferrerPremiumAcct(): PublicKey {
    const referrerPremiumMintAcct =
      this.sdk.net.SERUM_REFERRER_IDS[
        this.voltVault.permissionedMarketPremiumMint.toString()
      ];

    if (!referrerPremiumMintAcct) {
      throw new Error(
        "No referrer acct found for mint: " +
          this.voltVault.permissionedMarketPremiumMint.toString()
      );
    }

    return referrerPremiumMintAcct;
  }

  getReferrerQuoteAcct(mint: PublicKey): PublicKey {
    const referrerQuoteAcct = this.sdk.net.SERUM_REFERRER_IDS[mint.toString()];

    if (!referrerQuoteAcct) {
      throw new Error(
        "No referrer acct found for mint: " +
          this.voltVault.quoteAssetMint.toString()
      );
    }

    return referrerQuoteAcct;
  }

  async rebalanceEnter(
    optionSerumMarketKey: PublicKey,
    whitelistMintKey: PublicKey,
    clientPrice: BN,
    clientSize: BN,
    serumProgramId: PublicKey,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        this.voltKey,
        whitelistMintKey,
        this.sdk.programs.Volt.programId
      );

    const { marketAuthority, marketAuthorityBump } =
      await getMarketAndAuthorityInfo(
        this.sdk.programs.Volt.programId,
        optionMarket.key,
        whitelistMintKey,
        serumProgramId
      );

    const optionSerumMarketProxy = await marketLoader(
      this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
      optionMarket.key,
      whitelistTokenAccountKey,
      marketAuthorityBump,
      serumProgramId,
      optionSerumMarketKey
    );

    const optionSerumMarket = optionSerumMarketProxy.market;

    const [vaultOwner /*, nonce*/] = await getVaultOwnerAndNonce(
      optionSerumMarketProxy.market.address,
      optionSerumMarketProxy.dexProgramId
    );

    const { openOrdersKey, openOrdersBump } =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
        optionSerumMarketProxy
      );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getPermissionedMarketReferrerPremiumAcct();

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalanceEnterStruct: Parameters<
      VoltProgram["instruction"]["rebalanceEnter"]["accounts"]
    >[0] = {
      authority: this.wallet,
      middlewareProgram: this.sdk.programs.Volt.programId,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      optionPool: this.voltVault.optionPool,
      premiumPool: this.voltVault.premiumPool,

      rawOptionMarket: this.voltVault.optionMarket,

      srmReferralAcct: srmReferralAcct,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: optionSerumMarketProxy.dexProgramId,
      openOrders: openOrdersKey,
      market: optionSerumMarketProxy.market.address,
      serumMarketAuthority: marketAuthority,

      whitelistTokenAccount: whitelistTokenAccountKey,

      epochInfo: epochInfoKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestQueue: optionSerumMarket._decoded.requestQueue as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      eventQueue: optionSerumMarket._decoded.eventQueue as PublicKey,
      marketBids: optionSerumMarket.bidsAddress,
      marketAsks: optionSerumMarket.asksAddress,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: optionSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: optionSerumMarket._decoded.quoteVault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEnter(
      clientPrice,
      clientSize,
      openOrdersBump,
      marketAuthorityBump,
      {
        accounts: rebalanceEnterStruct,
      }
    );
  }

  async rebalanceSettle(): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const rebalanceSettleStruct: Parameters<
      VoltProgram["instruction"]["rebalanceSettle"]["accounts"]
    >[0] = {
      authority: this.wallet,
      soloptionsProgram: OPTIONS_PROGRAM_IDS.Soloptions,
      inertiaProgram: OPTIONS_PROGRAM_IDS.Inertia,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      writerTokenPool: this.voltVault.writerTokenPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      rawOptionMarket: this.voltVault.optionMarket,

      writerTokenMint: this.voltVault.writerTokenMint,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      quoteAssetMint: this.voltVault.quoteAssetMint,

      quoteAssetPool: optionMarket.quoteAssetPool,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      feeOwner: INERTIA_FEE_OWNER,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSettle({
      accounts: rebalanceSettleStruct,
    });
  }

  async rebalanceSwapPremium(
    spotSerumMarketKey: PublicKey,
    clientPrice: BN,
    clientSize: BN,
    serumProgramId: PublicKey,
    usePermissionedMarketPremium = false,
    referrerQuoteAcctReplacement?: PublicKey,
    referralSRMAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [ulOpenOrdersKey, ulOpenOrdersBump] =
      await VoltSDK.findUnderlyingOpenOrdersAddress(
        this.voltKey,
        spotSerumMarketKey,
        this.sdk.programs.Volt.programId
      );

    const [ulOpenOrdersMetadataKey] =
      await VoltSDK.findUnderlyingOpenOrdersMetadataAddress(
        this.voltKey,
        spotSerumMarketKey,
        this.sdk.programs.Volt.programId
      );
    const spotSerumMarket = await Market.load(
      this.connection,
      spotSerumMarketKey,
      {},
      serumProgramId
    );

    const [vaultOwner] = await getVaultOwnerAndNonce(
      spotSerumMarket.address,
      spotSerumMarket.programId
    );

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);

    const srmReferralAcct =
      referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;

    const rebalanceSwapPremiumStruct: Parameters<
      VoltProgram["instruction"]["rebalanceSwapPremium"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      tradingPool: !usePermissionedMarketPremium
        ? this.voltVault.premiumPool
        : this.voltVault.permissionedMarketPremiumPool,

      srmReferralAcct: srmReferralAcct,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: spotSerumMarket.programId,
      openOrders: ulOpenOrdersKey,
      openOrdersMetadata: ulOpenOrdersMetadataKey,
      market: spotSerumMarket.address,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestQueue: spotSerumMarket._decoded.requestQueue as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      eventQueue: spotSerumMarket._decoded.eventQueue as PublicKey,
      marketBids: spotSerumMarket.bidsAddress,
      marketAsks: spotSerumMarket.asksAddress,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: spotSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: spotSerumMarket._decoded.quoteVault as PublicKey,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSwapPremium(
      clientPrice,
      clientSize,
      ulOpenOrdersBump,
      {
        accounts: rebalanceSwapPremiumStruct,
      }
    );
  }

  async attachWhitelist(
    whitelistKey: PublicKey
  ): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const attachWhitelistAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["attachWhitelist"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: this.wallet,

      voltVault: this.voltKey,

      extraVoltData: extraVoltKey,
      whitelist: whitelistKey,

      systemProgram: SystemProgram.programId,
    };

    const instruction = this.sdk.programs.Volt.instruction.attachWhitelist({
      accounts: attachWhitelistAccounts,
    });

    return instruction;
  }

  async attachDao(
    daoProgramId: PublicKey,
    daoAuthority: PublicKey
  ): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const attachDaoAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["attachDao"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: this.wallet,

      voltVault: this.voltKey,

      extraVoltData: extraVoltKey,

      daoProgram: daoProgramId,

      daoAuthority: daoAuthority,
    };

    const instruction = this.sdk.programs.Volt.instruction.attachDao({
      accounts: attachDaoAccounts,
    });

    return instruction;
  }

  async detachDao(): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const detachDaoAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["detachDao"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: this.wallet,

      voltVault: this.voltKey,

      extraVoltData: extraVoltKey,
    };

    const instruction = this.sdk.programs.Volt.instruction.detachDao({
      accounts: detachDaoAccounts,
    });

    return instruction;
  }

  settlePermissionedMarketPremiumFunds() {
    const settlePermissionedMarketPremiumFundsStruct: Parameters<
      VoltProgram["instruction"]["settlePermissionedMarketPremiumFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      rawOptionMarket: this.voltVault.optionMarket,

      writerTokenMint: this.voltVault.writerTokenMint,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.settlePermissionedMarketPremiumFunds(
      {
        accounts: settlePermissionedMarketPremiumFundsStruct,
      }
    );
  }

  async settleEnterFunds(
    optionSerumMarketKey: PublicKey,
    whitelistMintKey: PublicKey,
    serumProgramId: PublicKey,
    referrerQuoteAcctReplacement?: PublicKey
  ) {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [whitelistTokenAccountKey] =
      await VoltSDK.findWhitelistTokenAccountAddress(
        this.voltKey,
        whitelistMintKey,
        this.sdk.programs.Volt.programId
      );

    const { marketAuthority, marketAuthorityBump } =
      await getMarketAndAuthorityInfo(
        this.sdk.programs.Volt.programId,
        optionMarket.key,
        whitelistMintKey,
        serumProgramId
      );

    const optionSerumMarketProxy = await marketLoader(
      this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
      optionMarket.key,
      whitelistTokenAccountKey,
      marketAuthorityBump,
      serumProgramId,
      optionSerumMarketKey
    );

    const optionSerumMarket = optionSerumMarketProxy.market;

    const { openOrdersKey } =
      await this.findVaultAuthorityPermissionedOpenOrdersKey(
        this.sdk.programs.Volt as unknown as Parameters<typeof marketLoader>[0],
        optionSerumMarketProxy
      );

    const [vaultOwner] = await getVaultOwnerAndNonce(
      optionSerumMarketProxy.market.address,
      optionSerumMarketProxy.dexProgramId
    );

    const [roundInfoKey] = await VoltSDK.findRoundInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getPermissionedMarketReferrerPremiumAcct();

    const settleEnterFundsStruct: Parameters<
      VoltProgram["instruction"]["settleEnterFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      middlewareProgram: this.sdk.programs.Volt.programId,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      optionPool: this.voltVault.optionPool,
      premiumPool: this.voltVault.premiumPool,
      permissionedMarketPremiumPool:
        this.voltVault.permissionedMarketPremiumPool,

      roundInfo: roundInfoKey,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: optionSerumMarketProxy.dexProgramId,
      openOrders: openOrdersKey,

      market: optionSerumMarketProxy.market.address,
      serumMarketAuthority: marketAuthority,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: optionSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: optionSerumMarket._decoded.quoteVault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    Object.entries(settleEnterFundsStruct).map(function (key, value) {
      console.log(key.toString() + " = " + value.toString());
    });

    return this.sdk.programs.Volt.instruction.settleEnterFunds({
      accounts: settleEnterFundsStruct,
    });
  }

  async settleSwapPremiumFunds(
    spotSerumMarketKey: PublicKey,
    serumProgramId: PublicKey,
    referrerQuoteAcctReplacement?: PublicKey
  ): Promise<TransactionInstruction> {
    const optionMarket = await this.getOptionMarketByKey(
      this.voltVault.optionMarket
    );

    if (optionMarket === null)
      throw new Error("option market on volt vault does not exist");

    const [ulOpenOrdersKey] = await VoltSDK.findUnderlyingOpenOrdersAddress(
      this.voltKey,
      spotSerumMarketKey,
      this.sdk.programs.Volt.programId
    );

    const spotSerumMarket = await Market.load(
      this.connection,
      spotSerumMarketKey,
      {},
      serumProgramId
    );

    const [vaultOwner] = await getVaultOwnerAndNonce(
      spotSerumMarket.address,
      spotSerumMarket.programId
    );

    const referrerQuoteAcct =
      referrerQuoteAcctReplacement ||
      this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);

    const settleSwapPremiumFundsStruct: Parameters<
      VoltProgram["instruction"]["settleSwapPremiumFunds"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      tradingPool:
        this.voltVault.quoteAssetMint === spotSerumMarket.quoteMintAddress
          ? this.voltVault.premiumPool
          : this.voltVault.permissionedMarketPremiumPool,

      pcReferrerWallet: referrerQuoteAcct,
      serumVaultSigner: vaultOwner as PublicKey,

      dexProgram: spotSerumMarket.programId,
      openOrders: ulOpenOrdersKey,
      market: spotSerumMarket.address,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      coinVault: spotSerumMarket._decoded.baseVault as PublicKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pcVault: spotSerumMarket._decoded.quoteVault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.settleSwapPremiumFunds({
      accounts: settleSwapPremiumFundsStruct,
    });
  }

  async getPendingDepositForUser(): Promise<PendingDepositWithKey> {
    const key = (
      await VoltSDK.findPendingDepositInfoAddress(
        this.voltKey,
        this.wallet,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return this.getPendingDepositByKey(key);
  }

  async getPendingWithdrawalForUser(): Promise<PendingWithdrawalWithKey> {
    const key = (
      await VoltSDK.findPendingWithdrawalInfoAddress(
        this.voltKey,
        this.wallet,
        this.sdk.programs.Volt.programId
      )
    )[0];
    return this.getPendingWithdrawalByKey(key);
  }

  // Entropy Instructions

  async rebalanceEntropy(): Promise<TransactionInstruction> {
    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }
    const client = new EntropyClient(this.connection, ENTROPY_PROGRAM_ID);
    const powerPerpMarket = await client.getPerpMarket(
      this.extraVoltData.powerPerpMarket,
      0,
      0
    );

    let perpMarket = powerPerpMarket;
    let perpMarketKey = this.extraVoltData.powerPerpMarket;

    if (this.extraVoltData.doneRebalancingPowerPerp) {
      perpMarket = await client.getPerpMarket(
        this.extraVoltData.spotPerpMarket,
        0,
        0
      );
      perpMarketKey = this.extraVoltData.spotPerpMarket;
    }

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))![0];

    const { entropyRoundInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const rebalanceEntropyStruct: Parameters<
      VoltProgram["instruction"]["rebalanceEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      dexProgram: this.extraVoltData.serumProgramId,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      spotPerpMarket: this.extraVoltData.spotPerpMarket,
      powerPerpEventQueue: powerPerpMarket.eventQueue,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      eventQueue: perpMarket.eventQueue,

      vault: nodeBank?.vault as PublicKey,

      bids: perpMarket.bids,
      asks: perpMarket.asks,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEntropy(
      new BN("18446744073709551614"),
      new BN("18446744073709551614"),
      {
        accounts: rebalanceEntropyStruct,
      }
    );
  }

  async cacheRelevantPrices(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }
    const client = new EntropyClient(this.connection, ENTROPY_PROGRAM_ID);
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const oracles = [
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(this.extraVoltData.powerPerpMarket)
      ],
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(this.extraVoltData.spotPerpMarket)
      ],
    ];

    return makeCachePricesInstruction(
      ENTROPY_PROGRAM_ID,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      oracles as PublicKey[]
    );
  }

  async cacheRelevantPerpMarkets(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }

    const client = new EntropyClient(this.connection, ENTROPY_PROGRAM_ID);
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    return makeCachePerpMarketsInstruction(
      ENTROPY_PROGRAM_ID,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      [this.extraVoltData?.powerPerpMarket, this.extraVoltData?.spotPerpMarket]
    );
  }

  async setupRebalanceEntropy(): Promise<TransactionInstruction> {
    const {
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      roundInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(this.connection, ENTROPY_PROGRAM_ID);
    const powerPerpMarket = await client.getPerpMarket(
      this.extraVoltData.powerPerpMarket,
      0,
      0
    );

    const spotPerpMarket = await client.getPerpMarket(
      this.extraVoltData.spotPerpMarket,
      0,
      0
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    console.log(await rootBank?.loadNodeBanks(this.connection));
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))![0];

    const { entropyRoundInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const setupRebalanceEntropyStruct: Parameters<
      VoltProgram["instruction"]["setupRebalanceEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      vaultMint: this.voltVault.vaultMint,
      depositPool: this.voltVault.depositPool,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      spotPerpMarket: this.extraVoltData.spotPerpMarket,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.setupRebalanceEntropy({
      accounts: setupRebalanceEntropyStruct,
    });
  }

  async endRoundEntropy(): Promise<TransactionInstruction> {
    const {
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      roundInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(this.connection, ENTROPY_PROGRAM_ID);
    const powerPerpMarket = await client.getPerpMarket(
      this.extraVoltData.powerPerpMarket,
      0,
      0
    );

    const spotPerpMarket = await client.getPerpMarket(
      this.extraVoltData.spotPerpMarket,
      0,
      0
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    console.log(await rootBank?.loadNodeBanks(this.connection));
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))![0];

    const { entropyRoundInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const endRoundEntropyStruct: Parameters<
      VoltProgram["instruction"]["endRoundEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,
      roundVoltTokens: roundVoltTokensKey,

      entropyRound: entropyRoundInfoKey,

      dexProgram: this.extraVoltData.serumProgramId,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.endRoundEntropy({
      accounts: endRoundEntropyStruct,
    });
  }

  // entropy stuff: requires extra volt data

  async oraclePriceForDepositToken(): Promise<I80F48> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }

    const { entropyClient, entropyGroup, entropyCache, entropyAccount } =
      await this.getEntropyObjects();

    const quoteInfo = entropyGroup.getQuoteTokenInfo();
    if (
      quoteInfo.mint.toString() === this.extraVoltData.depositMint.toString()
    ) {
      return I80F48.fromNumber(1);
    } else {
      const tokenIndex = entropyGroup.getTokenIndex(
        this.extraVoltData.depositMint
      );
      console.log("token index = ", tokenIndex.toString());
      const oraclePrice = entropyCache.priceCache[tokenIndex]?.price;
      if (oraclePrice === undefined)
        throw new Error("oracle price was undefined");
      return oraclePrice;
    }
  }

  // entropy get methods
  async getVoltValueInDepositToken(): Promise<BN> {
    const depositTokenMint = this.voltVault.underlyingAssetMint;

    const voltType = this.voltType();

    if (voltType === VoltType.ShortOptions) {
      const res = await getAccountBalanceOrZero(
        this.sdk.readonlyProvider.connection,
        depositTokenMint,
        this.voltVault.depositPool
      );
      if (res.token === null) throw new Error("Could not find Deposit token");

      const normFactor = new Decimal(
        10 ** (await res.token.getMintInfo()).decimals
      );

      const voltDepositTokenBalance = res.balance;
      const { balance: voltWriterTokenBalance } = await getAccountBalance(
        this.sdk.readonlyProvider.connection,
        this.voltVault.writerTokenMint,
        this.voltVault.writerTokenPool
      );
      const estimatedTotalWithoutPendingDepositTokenAmount =
        voltDepositTokenBalance
          .plus(
            voltWriterTokenBalance.mul(
              new Decimal(this.voltVault.underlyingAmountPerContract.toString())
            )
          )
          .div(normFactor);

      return new BN(estimatedTotalWithoutPendingDepositTokenAmount.toFixed());
    } else if (voltType === VoltType.Entropy) {
      const { entropyGroup, entropyAccount, entropyCache } =
        await this.getEntropyObjects();
      const acctEquity: I80F48 = entropyAccount.getHealthUnweighted(
        entropyGroup,
        entropyCache
      );
      const oraclePrice = await this.oraclePriceForDepositToken();
      const acctValueInDepositToken = acctEquity.div(oraclePrice);
      console.log(acctValueInDepositToken.toFixed(0));
      return new BN(acctValueInDepositToken.toFixed(0));
    } else {
      throw new Error("volt type not recognized");
    }
  }
}
