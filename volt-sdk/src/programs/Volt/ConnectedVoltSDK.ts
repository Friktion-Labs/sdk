import type {
  EntropyGroup,
  I80F48,
  PerpMarket,
  RootBank,
} from "@friktion-labs/entropy-client";
import type NodeBank from "@friktion-labs/entropy-client";
import {
  EntropyClient,
  makeCachePerpMarketsInstruction,
  makeCachePricesInstruction,
  makeCacheRootBankInstruction,
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
  InertiaSDK,
  OPTIONS_PROGRAM_IDS,
  SOLOPTIONS_FEE_OWNER,
  SoloptionsSDK,
} from "../..";
import { REFERRAL_AUTHORITY } from "../../constants";
import {
  getMarketAndAuthorityInfo,
  getVaultOwnerAndNonce,
  marketLoader,
} from "./serum";
import { getBalanceOrZero, getMintSupplyOrZero } from "./utils";
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
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    connection: Connection,
    user: PublicKey,
    voltSDK: VoltSDK,
    daoAuthority?: PublicKey | undefined
  ) {
    super(
      voltSDK.sdk,
      voltSDK.voltVault,
      voltSDK.voltKey,
      voltSDK.extraVoltData
    );

    this.connection = connection;
    this.wallet = user;
    // = providerToContribProvider(providerMut);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.daoAuthority = daoAuthority;

    // There is an obscure bug where the wallet.publicKey was a naked BN and not
    // a PublicKey. Please use this.user instead of this.providerMut.wallet.publicKey
    this.wallet = new PublicKey(this.wallet);
  }

  /**
   * trueDepositAmount: human readable amount of underlying token to deposit (e.g 1.1 USDC, 0.0004 BTC). this is normalized by the 10^(num decimals)
   * underlyingTokenSource: address of token account used to deposit tokens
   * vaultTokenDestination: if instant transfers are enabled, the token acccount that should receive the new vault tokens (shares of volt)
   * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
   **/
  async deposit(
    humanWithdrawAmount: Decimal,
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
      humanWithdrawAmount.mul(normFactor).toString()
    );

    console.log(
      "writer token pool = ",
      this.voltVault.writerTokenPool.toString()
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const depositAccountsStruct: Parameters<
      VoltProgram["instruction"]["deposit"]["accounts"]
    >[0] = {
      // tx fee + rent payer, optionally authority on underlyingTokenSource token account
      authority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
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

      // required to calculate total $ value of volts integrated w/ entropy or mango
      entropyGroup: this.extraVoltData?.entropyGroup ?? SystemProgram.programId,
      entropyAccount:
        this.extraVoltData?.entropyAccount ?? SystemProgram.programId,
      entropyCache: this.extraVoltData?.entropyCache ?? SystemProgram.programId,
      entropyProgram:
        this.extraVoltData?.entropyProgramId ?? SystemProgram.programId,
    };

    return this.sdk.programs.Volt.instruction.deposit(normalizedDepositAmount, {
      accounts: depositAccountsStruct,
    });
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
      epochInfoKey,
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
      roundUnderlyingTokensKey: pendingDepositRoundUnderlyingTokensKey,
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
      // whitelist: this?.extraVoltData?.whitelist ?? SystemProgram.programId,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      underlyingTokenSource: underlyingTokenSource,
      vaultTokenDestination: vaultTokenDestination,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      epochInfo: epochInfoKey,
      pendingDepositInfo: pendingDepositInfoKey,

      pendingDepositRoundInfo: pendingDepositRoundInfoKey,
      pendingDepositRoundVoltTokens: pendingDepositRoundVoltTokensKey,
      pendingDepositRoundUnderlyingTokens:
        pendingDepositRoundUnderlyingTokensKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
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
    daoAuthority?: PublicKey,
    normFactor?: Decimal | undefined
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
    const humanAmount = new Decimal(withdrawAmount.toString());
    const withdrawalAmountNormalized = humanAmount.mul(
      normFactor ? normFactor : await this.getNormalizationFactor()
    );
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
   * withdrawAmount is in vault tokens, where 1 = smallest unit of token
   * userVaultTokens: token account for volt tokens (shares). Used to redeem underlying in volt
   * underlyingTokenDestination: token account to receive redeemed underlying tokens
   * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
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
      // tx fee + rent payer, optionally authority on underlyingTokenSource token account
      authority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
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

  async withdrawWithClaim(
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

    let pendingWithdrawalInfo: PendingWithdrawalWithKey | undefined;
    try {
      pendingWithdrawalInfo = await this.getPendingWithdrawalByKey(
        pendingWithdrawalInfoKey
      );
    } catch (err) {
      // pass
    }

    const {
      roundInfoKey: pendingWithdrawalRoundInfoKey,
      roundUnderlyingPendingWithdrawalsKey:
        pendingWithdrawalRoundUnderlyingForPendingKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      pendingWithdrawalInfo?.roundNumber ?? new BN(0),
      this.sdk.programs.Volt.programId
    );

    const withdrawWithClaimAccountsStruct: Parameters<
      VoltProgram["instruction"]["withdrawWithClaim"]["accounts"]
    >[0] = {
      // tx fee + rent payer, optionally authority on underlyingTokenSource token account
      authority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      daoAuthority:
        daoAuthority !== undefined
          ? daoAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : SystemProgram.programId,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
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

      depositPool: this.voltVault.depositPool,
      vaultTokenSource: userVaultTokens,

      underlyingTokenDestination: underlyingTokenDestination,

      roundInfo: roundInfoKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      epochInfo: epochInfoKey,

      pendingWithdrawalInfo: pendingWithdrawalInfoKey,
      pendingWithdrawalRoundInfo: pendingWithdrawalRoundInfoKey,
      pendingWithdrawalRoundUnderlyingTokensForPws:
        pendingWithdrawalRoundUnderlyingForPendingKey,

      feeAcct: await this.getFeeTokenAccount(),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.withdrawWithClaim(
      withdrawAmount,
      {
        accounts: withdrawWithClaimAccountsStruct,
      }
    );
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

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const cancelPendingWithdrawalAccountsStruct: Parameters<
      VoltProgram["instruction"]["cancelPendingWithdrawal"]["accounts"]
    >[0] = {
      authority: authority,

      vaultMint: this.voltVault.vaultMint,

      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
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

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const cancelPendingDepositAccountsStruct: Parameters<
      VoltProgram["instruction"]["cancelPendingDeposit"]["accounts"]
    >[0] = {
      authority: authority,

      vaultMint: this.voltVault.vaultMint,

      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
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

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const claimPendingStruct: Parameters<
      VoltProgram["instruction"]["claimPending"]["accounts"]
    >[0] = {
      authority: authority,

      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
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

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const claimPendingWithdrawalStruct: Parameters<
      VoltProgram["instruction"]["claimPendingWithdrawal"]["accounts"]
    >[0] = {
      authority: authority,

      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
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

  async turnOffDepositsAndWithdrawals(
    code?: BN
  ): Promise<TransactionInstruction> {
    if (code === undefined) code = new BN(0);

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const turnOffDepositsAndWithdrawalsAccounts: Parameters<
      VoltProgram["instruction"]["turnOffDepositsAndWithdrawals"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.turnOffDepositsAndWithdrawals(
      code,
      {
        accounts: turnOffDepositsAndWithdrawalsAccounts,
      }
    );
  }

  changeQuoteMint(newQuoteMint: PublicKey): TransactionInstruction {
    const changeQuoteMintAccounts: Parameters<
      VoltProgram["instruction"]["changeQuoteMint"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      newQuoteMint: newQuoteMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.changeQuoteMint({
      accounts: changeQuoteMintAccounts,
    });
  }

  async adjustPendingDeposit(
    newPdAmount: BN,
    targetUser: PublicKey
  ): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const { roundInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [pendingDepositInfoKey] = await VoltSDK.findPendingDepositInfoAddress(
      this.voltKey,
      targetUser,
      this.sdk.programs.Volt.programId
    );

    const adjustPendingDepositAccounts: Parameters<
      VoltProgram["instruction"]["adjustPendingDeposit"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      targetUser: targetUser,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      extraVoltData: extraVoltKey,
      vaultMint: this.voltVault.vaultMint,
      roundInfo: roundInfoKey,
      pendingDepositInfo: pendingDepositInfoKey,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.adjustPendingDeposit(
      newPdAmount,
      {
        accounts: adjustPendingDepositAccounts,
      }
    );
  }

  async bypassSettlement(
    userWriterTokenAccount: PublicKey
  ): Promise<TransactionInstruction> {
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
    const bypassSettlementAccounts: Parameters<
      VoltProgram["instruction"]["bypassSettlement"]["accounts"]
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

      userWriterTokenAccount: userWriterTokenAccount,

      quoteAssetPool: optionMarket.quoteAssetPool,
      underlyingAssetPool: optionMarket.underlyingAssetPool,

      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,

      feeOwner: INERTIA_FEE_OWNER,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.bypassSettlement({
      accounts: bypassSettlementAccounts,
    });
  }

  async changeDecimalsByFactor(factor: BN): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const { epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const changeDecimalsByFactorAccounts: Parameters<
      VoltProgram["instruction"]["changeDecimalsByFactor"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      extraVoltData: extraVoltKey,
      epochInfo: epochInfoKey,
    };

    return this.sdk.programs.Volt.instruction.changeDecimalsByFactor(factor, {
      accounts: changeDecimalsByFactorAccounts,
    });
  }

  async reduceDecimalsByFactor(factor: BN): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const reduceDecimalsByFactorAccounts: Parameters<
      VoltProgram["instruction"]["reduceDecimalsByFactor"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      extraVoltData: extraVoltKey,
      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,
    };

    return this.sdk.programs.Volt.instruction.reduceDecimalsByFactor(factor, {
      accounts: reduceDecimalsByFactorAccounts,
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
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.startRound({
      accounts: startRoundStruct,
    });
  }

  async startRoundEntropy(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
      epochInfoKey,
      entropyRoundInfoKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber.addn(1),
      this.sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const startRoundEntropyStruct: Parameters<
      VoltProgram["instruction"]["startRoundEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
      vaultMint: this.voltVault.vaultMint,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

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

    return this.sdk.programs.Volt.instruction.startRoundEntropy({
      accounts: startRoundEntropyStruct,
    });
  }

  async takePerformanceFeesEntropy(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) throw new Error("extra volt data must be set");

    const {
      epochInfoKey,
      entropyRoundInfoKey,
      roundVoltTokensKey,
      roundUnderlyingPendingWithdrawalsKey,
    } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    console.log(
      "entropy program = ",
      this.extraVoltData.entropyProgramId.toString()
    );
    const takePerformanceFeesEntropyAccounts: Parameters<
      VoltProgram["instruction"]["takePerformanceFeesEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

      vaultMint: this.voltVault.vaultMint,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,

      epochInfo: epochInfoKey,
      entropyMetadata: entropyMetadataKey,

      systemProgram: SystemProgram.programId,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      tokenProgram: TOKEN_PROGRAM_ID,

      feeAccount: await this.getFeeTokenAccount(),
    };

    return this.sdk.programs.Volt.instruction.takePerformanceFeesEntropy({
      accounts: takePerformanceFeesEntropyAccounts,
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
      underlyingAssetMint: this.voltVault.underlyingAssetMint,
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

      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
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
    return await this.getPendingDepositForGivenUser(this.wallet);
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

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async changeHedging(
    shouldHedge: boolean,
    hedgeWithSpot: boolean,
    targetHedgeRatio: number,
    targetHedgeLenience: number
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );
    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );

    const changeHedgingAccounts: Parameters<
      VoltProgram["instruction"]["changeHedging"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
      entropyMetadata: entropyMetadataKey,
    };

    return this.sdk.programs.Volt.instruction.changeHedging(
      shouldHedge,
      hedgeWithSpot,
      targetHedgeRatio,
      targetHedgeLenience,
      {
        accounts: changeHedgingAccounts,
      }
    );
  }

  /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
  async resetRebalancing(
    onlyResetHedge: boolean
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const resetRebalancingAccounts: Parameters<
      VoltProgram["instruction"]["resetRebalancing"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
    };

    return this.sdk.programs.Volt.instruction.resetRebalancing(onlyResetHedge, {
      accounts: resetRebalancingAccounts,
    });
  }

  async setStrategyParams(
    targetLeverageRatio: Decimal,
    targetLeverageLenience: Decimal,
    targetHedgeRatio: Decimal,
    targetHedgeLenience: Decimal
  ): Promise<TransactionInstruction> {
    const [extraVoltDataKey] = await VoltSDK.findExtraVoltDataAddress(
      this.voltKey
    );

    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );

    const setStrategyAccounts: Parameters<
      VoltProgram["instruction"]["setStrategyParams"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltDataKey,
      entropyMetadata: entropyMetadataKey,
    };
    return this.sdk.programs.Volt.instruction.setStrategyParams(
      targetLeverageRatio.toNumber(),
      targetLeverageLenience.toNumber(),
      targetHedgeRatio.toNumber(),
      targetHedgeLenience.toNumber(),
      {
        accounts: setStrategyAccounts,
      }
    );
  }

  async rebalanceEntropy(
    clientBidPrice?: BN,
    clientAskPrice?: BN
  ): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const { entropyGroup, rootBank, nodeBank, depositIndex } =
      await this.getGroupAndBanks(client, this.extraVoltData.depositMint);

    const powerPerpBaseDecimals = entropyGroup.tokens[depositIndex]?.decimals;
    if (powerPerpBaseDecimals === undefined)
      throw new Error(
        "power perp base decimnals is undefined, likely market index does not exist in the entropy group"
      );

    const quoteDecimals = entropyGroup.getQuoteTokenInfo().decimals;

    const powerPerpMarket = await client.getPerpMarket(
      this.extraVoltData.powerPerpMarket,
      powerPerpBaseDecimals,
      quoteDecimals
    );

    let perpMarket = powerPerpMarket;

    if (this.extraVoltData.doneRebalancingPowerPerp) {
      console.log(
        "hedging spot market = ",
        this.extraVoltData.hedgingSpotPerpMarket.toString()
      );
      const spotPerpIndex = entropyGroup.getPerpMarketIndex(
        this.extraVoltData.hedgingSpotPerpMarket
      );
      const spotPerpBaseDecimals = entropyGroup.tokens[spotPerpIndex]
        ?.decimals as number;
      perpMarket = await client.getPerpMarket(
        this.extraVoltData.hedgingSpotPerpMarket,
        spotPerpBaseDecimals,
        quoteDecimals
      );
    }

    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    ({ bid: clientBidPrice, ask: clientAskPrice } =
      await this.getBidAskLimitsForEntropy(perpMarket));

    const [entropyRoundInfoKey] = await VoltSDK.findEntropyRoundInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
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

      entropyMetadata: entropyMetadataKey,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,
      entropyRound: entropyRoundInfoKey,

      spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
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
      epochInfo: epochInfoKey,
    };

    return this.sdk.programs.Volt.instruction.rebalanceEntropy(
      clientBidPrice,
      clientAskPrice,
      {
        accounts: rebalanceEntropyStruct,
      }
    );
  }

  async getGroupAndBanks(
    client: EntropyClient,
    mint: PublicKey
  ): Promise<{
    entropyGroup: EntropyGroup;
    rootBank: RootBank | undefined;
    nodeBank: NodeBank.NodeBank | undefined;
    quoteRootBank: RootBank | undefined;
    quoteNodeBank: NodeBank.NodeBank | undefined;
    depositIndex: number;
  }> {
    if (!this.extraVoltData) throw new Error("extra volt data must be defined");
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const bankIndex = entropyGroup.tokens.findIndex(
      (ti) => ti.mint.toString() === mint.toString()
    );

    if (bankIndex === undefined)
      throw new Error("bank index not found for mint = " + mint.toString());

    const rootBank = banks[bankIndex];
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    const quoteRootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    const quoteNodeBank = (
      await quoteRootBank?.loadNodeBanks(this.connection)
    )?.[0];

    return {
      entropyGroup,
      rootBank,
      nodeBank,
      quoteRootBank,
      quoteNodeBank,
      depositIndex: bankIndex,
    };
  }

  async getBidAskLimitsForSpot(
    serumMarket: Market,
    clientBidPrice?: BN,
    clientAskPrice?: BN
  ): Promise<{
    bid: BN;
    ask: BN;
  }> {
    if (!clientAskPrice) {
      const asks = await serumMarket.loadAsks(this.connection);
      console.log("asks = ", asks.getL2(10));
      const bestAskPrice = asks.getL2(10)[0]?.[2];
      if (bestAskPrice === undefined) {
        throw new Error("no ask exists on the orderbook");
      }
      clientAskPrice = bestAskPrice;
    }

    if (!clientBidPrice) {
      const bids = await serumMarket.loadBids(this.connection);
      console.log("asks = ", bids.getL2(10));
      const bestBidPrice = bids.getL2(10)[0]?.[2];
      if (bestBidPrice === undefined) {
        // throw new Error("no bid exists on the orderbook");
        clientBidPrice = clientAskPrice;
      } else {
        clientBidPrice = bestBidPrice;
      }
    }

    console.log(
      "client bid price = ",
      clientBidPrice.toString(),
      ", client ask price = ",
      clientAskPrice.toString()
    );

    return {
      bid: clientBidPrice,
      ask: clientAskPrice,
    };
  }

  async getBidAskLimitsForEntropy(
    perpMarket: PerpMarket,
    clientBidPrice?: BN,
    clientAskPrice?: BN
  ): Promise<{
    bid: BN;
    ask: BN;
  }> {
    console.log(
      "perp market quote lot size = ",
      perpMarket.quoteLotSize.toString()
    );
    if (!clientAskPrice) {
      const asks = await perpMarket.loadAsks(this.connection);
      const bestAsk = asks.getBest();

      if (bestAsk === undefined) {
        throw new Error("no ask exists on the orderbook");
      }

      clientAskPrice = perpMarket.uiToNativePriceQuantity(
        bestAsk.price,
        bestAsk.size
      )[0];
    }

    if (!clientBidPrice) {
      const bids = await perpMarket.loadBids(this.connection);
      const bestBid = bids.getBest();
      if (bestBid === undefined) {
        // throw new Error("no bid exists on the orderbook");
        clientBidPrice = clientAskPrice;
      } else {
        console.log("best bid = ", bestBid.price);

        clientBidPrice = perpMarket.uiToNativePriceQuantity(
          bestBid.price,
          bestBid.size
        )[0];
      }
    }

    console.log(
      "client bid price = ",
      clientBidPrice?.toString(),
      ", client ask price = ",
      clientAskPrice?.toString()
    );

    return {
      bid: clientBidPrice,
      ask: clientAskPrice,
    };
  }

  async rebalanceSpotEntropy(
    clientBidPrice?: BN,
    clientAskPrice?: BN
  ): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const spotMarket = await Market.load(
      this.connection,
      this.extraVoltData.hedgingSpotMarket,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const [ulOpenOrders] = await VoltSDK.findEntropyOpenOrdersAddress(
      this.voltKey,
      spotMarket.address
    );

    const { entropyGroup, rootBank, nodeBank, quoteRootBank, quoteNodeBank } =
      await this.getGroupAndBanks(client, spotMarket.baseMintAddress);

    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const { bid, ask } = await this.getBidAskLimitsForSpot(
      spotMarket,
      clientBidPrice,
      clientAskPrice
    );

    const dexSigner = await PublicKey.createProgramAddress(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      [
        spotMarket.address.toBuffer(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
      ],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      spotMarket._programId
    );

    const rebalanceSpotEntropyAccounts: Parameters<
      VoltProgram["instruction"]["rebalanceSpotEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,
      entropyCache: this.extraVoltData.entropyCache,

      spotMarket: this.extraVoltData.hedgingSpotMarket,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      bids: spotMarket.bidsAddress,
      asks: spotMarket.asksAddress,

      openOrders: ulOpenOrders,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexRequestQueue: spotMarket._decoded.requestQueue,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexEventQueue: spotMarket._decoded.eventQueue,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexBase: spotMarket._decoded.baseVault,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      dexQuote: spotMarket._decoded.quoteVault,

      baseRootBank: rootBank?.publicKey as PublicKey,
      baseNodeBank: nodeBank?.publicKey as PublicKey,
      baseVault: nodeBank?.vault as PublicKey,

      quoteRootBank: quoteRootBank?.publicKey as PublicKey,
      quoteNodeBank: quoteNodeBank?.publicKey as PublicKey,
      quoteVault: quoteNodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,
      dexSigner: dexSigner,

      msrmOrSrmVault: entropyGroup.msrmVault,

      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.rebalanceSpotEntropy(bid, ask, {
      accounts: rebalanceSpotEntropyAccounts,
    });
  }

  async initSpotOpenOrdersEntropy(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be loaded");
    }
    if (this.extraVoltData?.entropyProgramId === PublicKey.default) {
      throw new Error("entropy program id must be set (currently default)");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const spotMarket = await Market.load(
      this.connection,
      this.extraVoltData.hedgingSpotMarket,
      {},
      this.sdk.net.SERUM_DEX_PROGRAM_ID
    );

    const [ulOpenOrders] = await VoltSDK.findEntropyOpenOrdersAddress(
      this.voltKey,
      spotMarket.address
    );

    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const dexSigner = await PublicKey.createProgramAddress(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      [
        spotMarket.address.toBuffer(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
      ],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      spotMarket._programId
    );

    const initSpotOpenOrdersEntropyAccounts: Parameters<
      VoltProgram["instruction"]["initSpotOpenOrdersEntropy"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      entropyMetadata: entropyMetadataKey,

      vaultAuthority: this.voltVault.vaultAuthority,

      entropyProgram: this.extraVoltData.entropyProgramId,
      entropyGroup: this.extraVoltData.entropyGroup,
      entropyAccount: this.extraVoltData.entropyAccount,

      spotMarket: this.extraVoltData.hedgingSpotMarket,
      dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,

      openOrders: ulOpenOrders,

      signer: entropyGroup.signerKey,
      dexSigner: dexSigner,

      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    return this.sdk.programs.Volt.instruction.initSpotOpenOrdersEntropy({
      accounts: initSpotOpenOrdersEntropyAccounts,
    });
  }

  async cacheQuoteRootBank(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const cacheIx = makeCacheRootBankInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      [entropyGroup.getQuoteTokenInfo().rootBank]
    );

    return cacheIx;
  }

  async cacheRelevantPrices(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }
    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const oracles = [
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(this.extraVoltData.powerPerpMarket)
      ],
      entropyGroup.oracles[
        entropyGroup.getPerpMarketIndex(
          this.extraVoltData.hedgingSpotPerpMarket
        )
      ],
    ];

    return makeCachePricesInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      oracles as PublicKey[]
    );
  }

  async cacheRelevantPerpMarkets(): Promise<TransactionInstruction> {
    if (!this.extraVoltData) {
      throw new Error("extra volt data must be initiailzied");
    }

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );
    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    return makeCachePerpMarketsInstruction(
      this.extraVoltData.entropyProgramId,
      entropyGroup.publicKey,
      entropyGroup.entropyCache,
      [
        this.extraVoltData?.powerPerpMarket,
        this.extraVoltData?.hedgingSpotPerpMarket,
      ]
    );
  }

  async setupRebalanceEntropy(
    clientOraclePx?: I80F48
  ): Promise<TransactionInstruction> {
    const {
      roundVoltTokensKey,
      roundUnderlyingTokensKey,
      roundInfoKey,
      roundUnderlyingPendingWithdrawalsKey,
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

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );
    const entropyCache = await entropyGroup.loadCache(
      this.sdk.readonlyProvider.connection
    );
    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    console.log(await rootBank?.loadNodeBanks(this.connection));
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

    if (!clientOraclePx)
      clientOraclePx = this.oraclePriceForDepositToken(
        entropyGroup,
        entropyCache
      );

    const { entropyRoundInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );
    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );

    const [epochInfoKey] = await VoltSDK.findEpochInfoAddress(
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
      entropyMetadata: entropyMetadataKey,

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

      spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
      powerPerpMarket: this.extraVoltData.powerPerpMarket,

      rootBank: rootBank?.publicKey as PublicKey,
      nodeBank: nodeBank?.publicKey as PublicKey,
      vault: nodeBank?.vault as PublicKey,

      signer: entropyGroup.signerKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.sdk.programs.Volt.instruction.setupRebalanceEntropy(
      clientOraclePx,
      {
        accounts: setupRebalanceEntropyStruct,
      }
    );
  }

  transferDeposit(
    targetPool: PublicKey,
    underlyingDestination: PublicKey,
    amount: BN
  ): TransactionInstruction {
    const transferDepositAccounts: Parameters<
      VoltProgram["instruction"]["transferDeposit"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,

      underlyingUserAcct: underlyingDestination,
      targetPool: targetPool,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.transferDeposit(amount, {
      accounts: transferDepositAccounts,
    });
  }

  async reinitializeMint(
    targetPool: PublicKey,
    newMint: PublicKey,
    underlyingDestination: PublicKey
  ): Promise<TransactionInstruction> {
    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    console.log("target pool = ", targetPool.toString());
    console.log("new mint = ", newMint.toString());
    const reinitializeMintAccounts: Parameters<
      VoltProgram["instruction"]["reinitializeMint"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      targetPool: targetPool,

      oldMint: this.voltVault.underlyingAssetMint,
      newMint: newMint,

      userTokens: underlyingDestination,

      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.reinitializeMint({
      accounts: reinitializeMintAccounts,
    });
  }

  async endRoundEntropy(): Promise<TransactionInstruction> {
    const { roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey } =
      await VoltSDK.findRoundAddresses(
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

    const client = new EntropyClient(
      this.connection,
      this.extraVoltData.entropyProgramId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    const [entropyMetadataKey] = await VoltSDK.findEntropyMetadataAddress(
      this.voltKey
    );

    const entropyGroup = await client.getEntropyGroup(
      this.extraVoltData.entropyGroup
    );

    const banks = await entropyGroup.loadRootBanks(this.connection);

    const rootBank =
      banks[
        entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)
      ];
    console.log(await rootBank?.loadNodeBanks(this.connection));
    const nodeBank = (await rootBank?.loadNodeBanks(this.connection))?.[0];

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
      entropyMetadata: entropyMetadataKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokensForPendingWithdrawals:
        roundUnderlyingPendingWithdrawalsKey,
      signer: entropyGroup.signerKey,

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
}
