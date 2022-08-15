import {
  getBalanceOrZero,
  getMintSupplyOrZero,
  sendInsList,
  sleep,
} from "@friktion-labs/friktion-utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Connection, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";

import {
  SOL_NORM_FACTOR,
  VoltType,
  WRAPPED_SOL_ADDRESS,
} from "../../constants";
import type { EntropyVoltSDK } from "./EntropyVoltSDK";
import type { PrincipalProtectionVoltSDK } from "./Principal/PrincipalProtectionVoltSDK";
import { VoltSDK } from "./VoltSDK";
import type {
  PendingDeposit,
  PendingDepositWithKey,
  PendingWithdrawal,
  PendingWithdrawalWithKey,
  VoltProgram,
  VoltWithNewIdlProgram,
} from "./voltTypes";

/// NOTE: the following instructions currently consume > 200k CUs (forced to compile with opt-level Z in order to fit in program account size)
/// easy fix is to add a compute budget program request for 400k units (more than enough for any of these)
// 1. rebalanceEntropy
// 2. rebalanceSpotEntropy
// 3. setupRebalanceEntropy
// 4. takePerformanceFeesEntropy
// 5. setupRebalanceOtcEntropy
// 6. rebalanceOtcEntropy
// 7. checkRebalanceOtcHealth
// 8. initializeVolt (initialize for volt 1 & 2)
// 9. rebalanceEnter
// MAYBE:
// 1. depositWithClaim (when it claims or cancels and does instant deposit)
// 2. withdrawWithClaim (same as above)

export abstract class ConnectedVoltSDK extends VoltSDK {
  readonly connection: Connection;
  readonly wallet: PublicKey;
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    voltSDK: VoltSDK,
    connection: Connection,
    user: PublicKey,
    daoAuthority?: PublicKey | undefined
  ) {
    super(
      voltSDK.sdk,
      voltSDK.voltKey,
      voltSDK.voltVault,
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

  /// GETTERS ///

  async getAssociatedUnderlyingTokenAccount(): Promise<PublicKey> {
    return this.getAssociatedUnderlyingTokenAccountForUser(
      this.daoAuthority ? this.daoAuthority : this.wallet
    );
  }

  async getAssociatedVaultTokenAccount(): Promise<PublicKey> {
    return this.getAssociatedVaultTokenAccountForUser(
      this.daoAuthority ? this.daoAuthority : this.wallet
    );
  }

  async updateVoltForRefactor(): Promise<TransactionInstruction> {
    await sleep(1);
    throw new Error("disabled");
    // const textEncoder = new TextEncoder();
    // const aMetadata = (
    //   await PublicKey.findProgramAddress(
    //     [this.voltKey.toBuffer(), textEncoder.encode("auctionMetadata")],
    //     FRIKTION_PROGRAM_ID
    //   )
    // )[0];
    // const refactorAccountsStruct: Parameters<
    //   VoltWithNewIdlProgram["instruction"]["updateVoltForRefactor"]["accounts"]
    // >[0] = {
    //   authority: this.wallet,

    //   voltVault: this.voltKey,

    //   vaultAuthority: this.voltVault.vaultAuthority,

    //   auctionMetadata: aMetadata,

    //   systemProgram: SystemProgram.programId,
    //   tokenProgram: TOKEN_PROGRAM_ID,
    // };

    // const voltTypeNum =
    //   this.voltType() === VoltType.ShortOptions
    //     ? 0
    //     : this.voltType() === VoltType.Entropy
    //     ? 1
    //     : undefined;

    // if (voltTypeNum === undefined)
    //   throw new Error("volt not intended for refactor");

    // const isCallBn =
    //   this.voltType() === VoltType.ShortOptions &&
    //   !this.sdk.isKeyAStableCoin(this.voltVault.depositMint)
    //     ? new BN(1)
    //     : new BN(0);
    // return this.sdk.programs.VoltWithNewIdl.instruction.updateVoltForRefactor(
    //   isCallBn,
    //   voltTypeNum as number,
    //   {
    //     accounts: refactorAccountsStruct,
    //   }
    // );
  }

  addShareTokenMetadata(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbol: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    uri: string
  ): TransactionInstruction {
    throw new Error("disabled");
    // const textEncoder = new TextEncoder();
    // const [tokenMetadataKey] = PublicKey.findProgramAddressSync(
    //   [
    //     textEncoder.encode("metadata"),
    //     METAPLEX_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //     this.voltVault.vaultMint.toBuffer(),
    //   ],
    //   METAPLEX_TOKEN_METADATA_PROGRAM_ID
    // );
    // const addShareTokenMetadataAccounts: Parameters<
    //   VoltWithNewIdlProgram["instruction"]["addShareTokenMetadata"]["accounts"]
    // >[0] = {
    //   authority: this.wallet,
    //   voltVault: this.voltKey,
    //   vaultAuthority: this.voltVault.vaultAuthority,
    //   systemProgram: SystemProgram.programId,
    //   tokenProgram: TOKEN_PROGRAM_ID,
    //   vaultMint: this.voltVault.vaultMint,
    //   metaplexTokenMetadataProgram: METAPLEX_TOKEN_METADATA_PROGRAM_ID,
    //   newTokenMetadata: tokenMetadataKey,
    //   rent: SYSVAR_RENT_PUBKEY,
    // };
    // return this.sdk.programs.VoltWithNewIdl.instruction.addShareTokenMetadata(
    //   name,
    //   symbol,
    //   uri,
    //   {
    //     accounts: addShareTokenMetadataAccounts,
    //   }
    // );
  }
  //// CLIENT-FACING INSTRUCTIONS ////

  /**
   * humanDepositAmount: human readable amount of underlying token to deposit (e.g 1.1 USDC, 0.0004 BTC). this is normalized by the 10^(num decimals)
   * underlyingTokenSource: address of token account used to deposit tokens
   * vaultTokenDestination: if instant transfers are enabled, the token acccount that should receive the new vault tokens (shares of volt)
   * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
   **/
  async deposit(
    humanDepositAmount: Decimal,
    underlyingTokenSource: PublicKey,
    vaultTokenDestination: PublicKey,
    nonPayerAuthority?: PublicKey,
    decimals?: number
  ): Promise<TransactionInstruction> {
    if (nonPayerAuthority === undefined) nonPayerAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      pendingDepositInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      nonPayerAuthority !== undefined ? nonPayerAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const normFactor = decimals
      ? new Decimal(10 ** decimals)
      : await this.getDepositTokenNormalizationFactor();

    const normalizedDepositAmount = new BN(
      humanDepositAmount.mul(normFactor).toString()
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    // TODO: delete this for efficiencies sake

    const depositAccountsStruct: Parameters<
      VoltWithNewIdlProgram["instruction"]["deposit"]["accounts"]
    >[0] = {
      // tx fee + rent payer, optionally authority on underlyingTokenSource token account
      payerAuthority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      nonPayerAuthority:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
      authorityCheck:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,

      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: this.voltVault.vaultAuthority,
      whitelist: this.extraVoltData?.whitelist ?? SystemProgram.programId,

      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      userUlTokens: underlyingTokenSource,
      userVaultTokens: vaultTokenDestination,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,

      epochInfo: epochInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.VoltWithNewIdl.instruction.deposit(
      normalizedDepositAmount,
      {
        accounts: depositAccountsStruct,
        remainingAccounts:
          this.voltType() === VoltType.PrincipalProtection
            ? await (
                this as unknown as PrincipalProtectionVoltSDK
              ).getPrincipalProtectionContextAccountsAsRemaining()
            : this.voltType() === VoltType.Entropy
            ? await (
                this as unknown as EntropyVoltSDK
              ).getEntropyContextAccountsAsRemaining()
            : [],
      }
    );
  }

  async depositWithClaim(
    trueDepositAmount: Decimal,
    underlyingTokenSource: PublicKey,
    vaultTokenDestination: PublicKey,
    shouldTransferSol = false,
    solTransferAuthority?: PublicKey,
    nonPayerAuthority?: PublicKey,
    decimals?: number
  ): Promise<TransactionInstruction> {
    if (nonPayerAuthority === undefined) nonPayerAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      epochInfoKey,
      pendingDepositInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      nonPayerAuthority !== undefined ? nonPayerAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const normFactor = decimals
      ? new Decimal(10 ** decimals)
      : await this.getDepositTokenNormalizationFactor();

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
      VoltWithNewIdlProgram["instruction"]["depositWithClaim"]["accounts"]
    >[0] = {
      payerAuthority: this.wallet,
      nonPayerAuthority:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      authorityCheck:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      solTransferAuthority: solTransferAuthority
        ? solTransferAuthority
        : this.wallet,
      voltVault: this.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: this.voltVault.vaultAuthority,
      vaultMint: this.voltVault.vaultMint,

      depositPool: this.voltVault.depositPool,
      writerTokenPool: this.voltVault.writerTokenPool,

      userUlTokens: underlyingTokenSource,
      userVaultTokens: vaultTokenDestination,

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

    return this.sdk.programs.VoltWithNewIdl.instruction.depositWithClaim(
      normalizedDepositAmount,
      shouldTransferSol,
      {
        accounts: depositWithClaimAccounts,
        remainingAccounts:
          this.voltType() === VoltType.PrincipalProtection
            ? await (
                this as unknown as PrincipalProtectionVoltSDK
              ).getPrincipalProtectionContextAccountsAsRemaining()
            : this.voltType() === VoltType.Entropy
            ? await (
                this as unknown as EntropyVoltSDK
              ).getEntropyContextAccountsAsRemaining()
            : [],
      }
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
    normFactor?: Decimal | undefined,
    withClaim = false
  ): Promise<TransactionInstruction> {
    const estimatedTotalWithoutPendingDepositTokenAmount =
      await this.getTvlWithoutPendingInDepositToken(normFactor);
    console.log(
      "estimated total tvl without pending : ",
      estimatedTotalWithoutPendingDepositTokenAmount.toString()
    );
    const roundInfo = await this.getRoundByKey(
      (
        await VoltSDK.findRoundInfoAddress(
          this.voltKey,
          this.voltVault.roundNumber,
          this.sdk.programs.Volt.programId
        )
      )[0]
    );
    const userVoltTokenBalance = new Decimal(
      (await getBalanceOrZero(this.connection, userVaultTokens)).toString()
    );

    const vaultMintSupply = (
      await getMintSupplyOrZero(this.connection, this.voltVault.vaultMint)
    ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));
    const humanAmount = new Decimal(withdrawAmount.toString());

    let withdrawalAmountVaultTokens = humanAmount
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
      "withdraw amt volt tokens = ",
      withdrawalAmountVaultTokens.toString()
    );
    if (withClaim) {
      return await this.withdrawWithClaim(
        new BN(withdrawalAmountVaultTokens),
        userVaultTokens,
        underlyingTokenDestination,
        daoAuthority
      );
    } else {
      return await this.withdraw(
        new BN(withdrawalAmountVaultTokens),
        userVaultTokens,
        underlyingTokenDestination,
        daoAuthority
      );
    }
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
    nonPayerAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    console.log("withdraw amount = ", withdrawAmount.toString());
    if (!nonPayerAuthority) nonPayerAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      nonPayerAuthority !== undefined ? nonPayerAuthority : this.wallet,
      this.sdk.programs.Volt.programId
    );

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);

    const withdrawAccountsStruct: Parameters<
      VoltProgram["instruction"]["withdraw"]["accounts"]
    >[0] = {
      // tx fee + rent payer, optionally authority on underlyingTokenSource token account
      payerAuthority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      nonPayerAuthority:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
      authorityCheck:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
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
    nonPayerAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    if (!nonPayerAuthority) nonPayerAuthority = this.daoAuthority;
    const {
      roundInfoKey,
      roundUnderlyingTokensKey,
      pendingWithdrawalInfoKey,
      epochInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      nonPayerAuthority !== undefined ? nonPayerAuthority : this.wallet,
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
      payerAuthority: this.wallet,
      // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
      nonPayerAuthority:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
          : this.extraVoltData?.isForDao
          ? this.extraVoltData.daoAuthority
          : this.wallet,
      // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
      authorityCheck:
        nonPayerAuthority !== undefined
          ? nonPayerAuthority
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
    };

    return this.sdk.programs.Volt.instruction.cancelPendingDeposit({
      accounts: cancelPendingDepositAccountsStruct,
    });
  }

  async claimPendingDepositWithoutSigning(
    vaultTokenDestination: PublicKey,
    replacementAuthority?: PublicKey
  ): Promise<TransactionInstruction> {
    const ix: TransactionInstruction = await this.claimPendingDeposit(
      vaultTokenDestination,
      replacementAuthority
    );
    if (ix.keys[0] === undefined)
      throw new Error("first account of instruction must be valid");
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
    if (ix.keys[0] === undefined)
      throw new Error("first account of instruction must be valid");
    ix.keys[0].isSigner = false;
    return ix;
  }

  async claimPendingDeposit(
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
      VoltProgram["instruction"]["claimPendingDeposit"]["accounts"]
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

    return this.sdk.programs.Volt.instruction.claimPendingDeposit({
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

  //// DEPOSIT/WITHDRAW HELPERS ////

  async doFullDeposit(
    depositAmount: Decimal,
    solTransferAuthorityReplacement?: PublicKey
  ) {
    await sendInsList(
      this.sdk.readonlyProvider,
      await this.fullDepositInstructions(
        depositAmount,
        solTransferAuthorityReplacement
      )
    );
  }

  async doFullWithdraw(withdrawAmount: Decimal) {
    await sendInsList(
      this.sdk.readonlyProvider,
      await this.fullWithdrawInstructions(withdrawAmount)
    );
  }

  async fullDepositInstructions(
    depositAmount: Decimal,
    solTransferAuthorityReplacement?: PublicKey
  ): Promise<TransactionInstruction[]> {
    const payer = this.wallet;
    const authority = this.daoAuthority ? this.daoAuthority : this.wallet;
    const solTransferAuthority = solTransferAuthorityReplacement ?? this.wallet;
    const voltVault = this.voltVault;
    const depositMint = voltVault.depositMint;
    const vaultMint = voltVault.vaultMint;

    const isWrappedSol =
      depositMint.toString() === WRAPPED_SOL_ADDRESS.toString();
    const depositInstructions: TransactionInstruction[] = [];

    const depositTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
      depositMint,
      authority,
      true
    );
    const vaultTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
      vaultMint,
      authority,
      true
    );

    if (isWrappedSol) {
      try {
        // try to get account info
        await getAccount(this.connection, depositTokenAccountKey);
        const numLamports =
          (
            await this.sdk.readonlyProvider.connection.getAccountInfo(
              depositTokenAccountKey
            )
          )?.lamports ?? 0;
        const additionalLamportsRequired = Math.max(
          depositAmount.toNumber() * SOL_NORM_FACTOR - numLamports,
          0
        );

        if (additionalLamportsRequired > 0) {
          depositInstructions.push(
            SystemProgram.transfer({
              fromPubkey: solTransferAuthority,
              toPubkey: depositTokenAccountKey,
              lamports: additionalLamportsRequired,
            })
          );
          depositInstructions.push(
            createSyncNativeInstruction(
              depositTokenAccountKey,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }
      } catch (err) {
        depositInstructions.push(
          SystemProgram.transfer({
            fromPubkey: solTransferAuthority,
            toPubkey: depositTokenAccountKey,
            lamports: depositAmount.toNumber() * SOL_NORM_FACTOR,
          })
        );
        depositInstructions.push(
          createAssociatedTokenAccountInstruction(
            payer,
            depositTokenAccountKey,
            authority,
            depositMint
          )
        );
      }
    }

    try {
      await getAccount(this.connection, vaultTokenAccountKey);
    } catch (err) {
      depositInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer,
          vaultTokenAccountKey,
          authority,
          vaultMint
        )
      );
    }

    // if instant transfers aren't currently possible, need to handle already existing pending deposits
    if (!this.areInstantDepositsEnabled()) {
      let pendingDepositInfo: PendingDeposit | undefined;
      try {
        pendingDepositInfo = await this.getPendingDepositForGivenUser(
          authority
        );
      } catch (err) {
        pendingDepositInfo = undefined;
      }

      // if a pending deposit exists, need to handle it
      if (
        pendingDepositInfo &&
        pendingDepositInfo?.numUnderlyingDeposited?.gtn(0) &&
        pendingDepositInfo.roundNumber.gtn(0)
      ) {
        // if is claimable, then claim it first
        if (pendingDepositInfo.roundNumber.lt(voltVault.roundNumber)) {
          depositInstructions.push(
            await this.claimPendingDeposit(vaultTokenAccountKey)
          );
        }
        // else, cancel the deposit or throw an error
        else {
          depositInstructions.push(
            await this.cancelPendingDeposit(depositTokenAccountKey)
          );
          // if don't want to override existing deposit, can throw error instead
          // throw new Error("pending deposit already exists")
        }
      }
    }

    depositInstructions.push(
      await this.deposit(
        depositAmount,
        depositTokenAccountKey,
        vaultTokenAccountKey,
        authority
      )
    );

    if (isWrappedSol) {
      // OPTIONAL: close account once done with it. Don't do this by default since ATA will be useful in future
      // const closeWSolIx = createCloseAccountInstruction(
      //   depositTokenAccountKey,
      //   this.wallet, // Send any remaining SOL to the owner
      //   this.wallet,
      //   []
      // );
      // depositInstructions.push(closeWSolIx);
    }

    return depositInstructions;
  }

  async fullWithdrawInstructions(
    // in deposit token
    withdrawAmount: Decimal
  ): Promise<TransactionInstruction[]> {
    const payer = this.wallet;
    const authority = this.daoAuthority ? this.daoAuthority : this.wallet;

    const voltVault = this.voltVault;
    const depositMint = voltVault.depositMint;
    const vaultMint = voltVault.vaultMint;

    const withdrawalInstructions: TransactionInstruction[] = [];

    const depositTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
      depositMint,
      authority
    );
    const vaultTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
      vaultMint,
      authority
    );

    try {
      // try to get account info
      await getAccount(this.connection, depositTokenAccountKey);
    } catch (err) {
      withdrawalInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer,
          depositTokenAccountKey,
          authority,
          depositMint
        )
      );
    }

    // NOTE: Shouldn't be necessary since user must have created to receive volt tokens if now withdrawing
    try {
      await getAccount(this.connection, vaultTokenAccountKey);
    } catch (err) {
      withdrawalInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer,
          vaultTokenAccountKey,
          authority,
          vaultMint
        )
      );
    }

    // if instant transfers aren't currently possible, need to handle already existing pending withdrawals
    if (!this.areInstantWithdrawalsEnabled()) {
      let pendingWithdrawalInfo: PendingWithdrawal | undefined;
      try {
        pendingWithdrawalInfo = await this.getPendingWithdrawalForGivenUser(
          authority
        );
      } catch (err) {
        pendingWithdrawalInfo = undefined;
      }

      // if a pending withdrawal exists, need to handle it
      if (
        pendingWithdrawalInfo &&
        pendingWithdrawalInfo?.numVoltRedeemed?.gtn(0) &&
        pendingWithdrawalInfo.roundNumber?.gtn(0)
      ) {
        // if is claimable, then claim it first
        if (pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber)) {
          withdrawalInstructions.push(
            await this.claimPendingWithdrawal(depositTokenAccountKey)
          );
        }
        // else, cancel the withdrawal or throw an error
        else {
          withdrawalInstructions.push(
            await this.cancelPendingWithdrawal(vaultTokenAccountKey)
          );
          // if don't want to override existing withdrawal, can throw error instead
          // throw new Error("pending withdrawal already exists")
        }
      }
    }

    withdrawalInstructions.push(
      await this.withdrawHumanAmount(
        withdrawAmount,
        vaultTokenAccountKey,
        depositTokenAccountKey,
        authority
      )
    );

    return withdrawalInstructions;
  }

  //// ADMIN INSTRUCTIONS ////

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

  async changeCapacity(
    capacity: BN,
    individualCapacity: BN
  ): Promise<TransactionInstruction> {
    const [roundInfo] = await VoltSDK.findRoundInfoAddress(
      this.voltKey,
      this.voltVault.roundNumber,
      this.sdk.programs.Volt.programId
    );

    const changeCapacityAccounts: Parameters<
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
        accounts: changeCapacityAccounts,
      }
    );
  }

  async changeFees(
    performanceFeeBps: BN,
    withdrawalFeeBps: BN,
    aumFeeBps: BN,
    dovTakeFeesInUnderlying?: boolean,
    useCustomFees?: boolean
  ): Promise<TransactionInstruction> {
    if (dovTakeFeesInUnderlying === undefined || useCustomFees === undefined) {
      await this.loadInExtraVoltData();
      if (dovTakeFeesInUnderlying === undefined)
        dovTakeFeesInUnderlying =
          this.extraVoltData?.dovPerformanceFeesInUnderlying;
      if (useCustomFees === undefined)
        useCustomFees =
          (this.extraVoltData?.useCustomFees?.toNumber() ?? 0) > 0;
    }
    const { extraVoltKey } = await VoltSDK.findUsefulAddresses(
      this.voltKey,
      this.voltVault,
      this.wallet,
      this.sdk.programs.Volt.programId
    );

    const changeFeesAccounts: Parameters<
      VoltProgram["instruction"]["changeFees"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      vaultAuthority: this.voltVault.vaultAuthority,
      extraVoltData: extraVoltKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.sdk.programs.Volt.instruction.changeFees(
      performanceFeeBps,
      withdrawalFeeBps,
      aumFeeBps,
      dovTakeFeesInUnderlying as boolean,
      useCustomFees,
      {
        accounts: changeFeesAccounts,
      }
    );
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

  //// ENTROPY LENDING INSTRUCTIONS ////
}
