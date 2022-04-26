/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { AnchorProvider } from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";

import {
  INERTIA_EXERCISE_FEE_BPS,
  INERTIA_FEE_OWNER,
  INERTIA_MINT_FEE_BPS,
  OPTIONS_PROGRAM_IDS,
  OTHER_IDLS,
} from "../..";
import type { NetworkName } from "../../helperTypes";
import type { ProviderLike } from "../../miscUtils";
import { providerToAnchorProvider } from "../../miscUtils";
import type { OptionMarketWithKey } from "../Volt";
import type { InertiaIXAccounts } from ".";
import type { InertiaContractWithKey, InertiaProgram } from "./inertiaTypes";
import { getInertiaMarketByKey } from "./inertiaUtils";

export interface InertiaNewMarketParams {
  user: PublicKey;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: BN;
  quoteAmount: BN;
  expiryTs: BN;
  isCall: boolean;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
}

export interface InertiaRevertSettleOptionParams {
  user: PublicKey;
}

export interface InertiaSettleOptionParams {
  user: PublicKey;
  settlePrice: number;
}

export interface InertiaExerciseOptionParams {
  user: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: BN;
}

export interface InertiaWriteOptionParams {
  user: PublicKey;
  writerUnderlyingFundingTokens: PublicKey;
  writerTokenDestination: PublicKey;
  optionTokenDestination: PublicKey;
  amount: BN;
  feeDestination: PublicKey;
}

export interface InertiaRedeemOptionParams {
  user: PublicKey;
  redeemerTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export interface InertiaClosePositionParams {
  user: PublicKey;
  writerTokenSource: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export const DefaultInertiaSDKOpts = {
  network: "mainnet-beta",
};

export type InertiaSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
};

export class InertiaSDK {
  readonly optionMarket: InertiaContractWithKey;
  readonly optionKey: PublicKey;
  readonly program: InertiaProgram;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;

  constructor(optionMarket: InertiaContractWithKey, opts: InertiaSDKOpts) {
    const defaultedOpts = Object.assign({}, opts, DefaultInertiaSDKOpts);
    this.readonlyProvider = providerToAnchorProvider(defaultedOpts.provider);

    this.network = !opts.network
      ? "mainnet-beta"
      : opts.network === "testnet" || opts.network === "localnet"
      ? "mainnet-beta"
      : opts.network;

    const inertiaIdl = OTHER_IDLS.Inertia;
    if (!inertiaIdl) {
      console.error("INERTIA_IDLS", OTHER_IDLS);
      // this used to be a big bug
      throw new Error("Unable to load InertiaSDK because idl is missing");
    }

    const Inertia = new Program(
      inertiaIdl,
      OPTIONS_PROGRAM_IDS.Inertia.toString(),
      this.readonlyProvider
    );

    this.program = Inertia as unknown as InertiaProgram;

    this.optionMarket = optionMarket;
    this.optionKey = optionMarket.key;
  }

  async getInertiaExerciseFeeAccount(): Promise<PublicKey> {
    return await InertiaSDK.getGenericInertiaExerciseFeeAccount(
      this.optionMarket.quoteMint
    );
  }

  static async getGenericInertiaExerciseFeeAccount(quoteAssetMint: PublicKey) {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteAssetMint,
      INERTIA_FEE_OWNER
    );
  }

  mintFeeAmount(numOptionTokensMinted: BN): BN {
    if (numOptionTokensMinted.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensMinted
      .mul(this.optionMarket.underlyingAmount)
      .muln(INERTIA_MINT_FEE_BPS)
      .divn(10000);
  }

  exerciseFeeAmount(numOptionTokensToExercise: BN): BN {
    if (numOptionTokensToExercise.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensToExercise
      .mul(this.optionMarket.underlyingAmount)
      .muln(INERTIA_EXERCISE_FEE_BPS)
      .divn(10000);
  }

  static async getOptionMarketByKey(
    program: InertiaProgram,
    key: PublicKey
  ): Promise<OptionMarketWithKey> {
    const optionMarket = await getInertiaMarketByKey(program, key);
    if (!optionMarket) {
      throw new Error("could not find Inertia market for key");
    }
    return optionMarket;
  }

  static async getProgramAddress(
    program: InertiaProgram,
    kind:
      | "OptionsContract"
      | "WriterMint"
      | "OptionMint"
      | "UnderlyingPool"
      | "ClaimablePool",
    underlyingMint: PublicKey,
    quoteMint: PublicKey,
    underlyingAmount: BN,
    quoteAmount: BN,
    expiry: BN,
    isCall: boolean
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        textEncoder.encode(kind),
        underlyingMint.toBuffer(),
        quoteMint.toBuffer(),
        new u64(underlyingAmount.toString()).toBuffer(),
        new u64(quoteAmount.toString()).toBuffer(),
        new u64(expiry.toString()).toBuffer(),
        isCall ? new u64(1).toBuffer() : new u64(0).toBuffer(),
      ],
      program.programId
    );
  }

  async exercise(
    params: InertiaExerciseOptionParams
  ): Promise<TransactionInstruction> {
    const { amount, optionTokenSource, underlyingTokenDestination } = params;

    const seeds = [
      this.optionMarket.underlyingMint,
      this.optionMarket.quoteMint,
      this.optionMarket.underlyingAmount,
      this.optionMarket.quoteAmount,
      this.optionMarket.expiryTs,
      this.optionMarket.isCall.toNumber() > 0 ? true : false,
    ] as const;

    const [claimablePool, _] = await InertiaSDK.getProgramAddress(
      this.program,
      "ClaimablePool",
      ...seeds
    );

    const exerciseAccounts: InertiaIXAccounts["exercise"] = {
      contract: this.optionKey,
      exerciserAuthority: params.user,
      optionMint: this.optionMarket.optionMint,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      claimablePool,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionExercise(amount, {
      accounts: exerciseAccounts,
    });
  }

  async settle(
    params: InertiaSettleOptionParams,
    bypassCode?: BN
  ): Promise<TransactionInstruction> {
    if (bypassCode === undefined) {
      bypassCode = new BN(0);
    }

    if (bypassCode.ltn(0)) {
      throw new Error("bypass code must be positive (u64 in rust)");
    }
    const seeds = [
      this.optionMarket.underlyingMint,
      this.optionMarket.quoteMint,
      this.optionMarket.underlyingAmount,
      this.optionMarket.quoteAmount,
      this.optionMarket.expiryTs,
      this.optionMarket.isCall.toNumber() > 0 ? true : false,
    ] as const;
    const [claimablePool, _] = await InertiaSDK.getProgramAddress(
      this.program,
      "ClaimablePool",
      ...seeds
    );

    console.log("token program id = ", TOKEN_PROGRAM_ID.toString());
    const settleAccounts: InertiaIXAccounts["settle"] = {
      authority: params.user,
      oracleAi: this.optionMarket.oracleAi,
      contract: this.optionKey,
      claimablePool,
      underlyingMint: this.optionMarket.underlyingMint,
      quoteMint: this.optionMarket.quoteMint,
      contractUnderlyingTokens: this.optionMarket.underlyingPool,
      exerciseFeeAccount: await this.getInertiaExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionSettle(
      new BN(params.settlePrice),
      bypassCode,
      {
        accounts: settleAccounts,
      }
    );
  }

  async revertSettle(
    params: InertiaRevertSettleOptionParams
  ): Promise<TransactionInstruction> {
    const seeds = [
      this.optionMarket.underlyingMint,
      this.optionMarket.quoteMint,
      this.optionMarket.underlyingAmount,
      this.optionMarket.quoteAmount,
      this.optionMarket.expiryTs,
      this.optionMarket.isCall.toNumber() > 0 ? true : false,
    ] as const;
    const [claimablePool, _] = await InertiaSDK.getProgramAddress(
      this.program,
      "ClaimablePool",
      ...seeds
    );

    const revertSettleAccounts: InertiaIXAccounts["revertSettle"] = {
      authority: params.user,
      oracleAi: this.optionMarket.oracleAi,
      contract: this.optionKey,
      claimablePool,
      underlyingMint: this.optionMarket.underlyingMint,
      quoteMint: this.optionMarket.quoteMint,
      contractUnderlyingTokens: this.optionMarket.underlyingPool,
      exerciseFeeAccount: await this.getInertiaExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.revertOptionSettle(new BN(0), {
      accounts: revertSettleAccounts,
    });
  }

  write(params: InertiaWriteOptionParams): TransactionInstruction {
    const {
      amount,
      user,
      writerUnderlyingFundingTokens,
      writerTokenDestination,
      optionTokenDestination,
      feeDestination,
    } = params;

    const writeAccounts: InertiaIXAccounts["write"] = {
      contract: this.optionMarket.key,
      optionMint: this.optionMarket.optionMint,
      quoteMint: this.optionMarket.quoteMint,
      optionTokenDestination,
      underlyingMint: this.optionMarket.underlyingMint,
      underlyingPool: this.optionMarket.underlyingPool,
      writerMint: this.optionMarket.writerMint,
      writerTokenDestination,
      writerAuthority: user,
      userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
      feeDestination,
      clock: SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.program.instruction.optionWrite(amount, {
      accounts: writeAccounts,
    });
  }

  redeem(params: InertiaRedeemOptionParams): TransactionInstruction {
    const { user, underlyingTokenDestination, redeemerTokenSource, amount } =
      params;

    const redeemAccounts: InertiaIXAccounts["redeem"] = {
      contract: this.optionKey,
      redeemerAuthority: user,
      writerMint: this.optionMarket.writerMint,
      contractUnderlyingTokens: this.optionMarket.underlyingPool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionRedeem(new BN(amount), {
      accounts: redeemAccounts,
    });
  }

  close(params: InertiaClosePositionParams): TransactionInstruction {
    const {
      user,
      underlyingTokenDestination,
      writerTokenSource,
      optionTokenSource,
      amount,
    } = params;

    const closePositionAccounts: InertiaIXAccounts["close"] = {
      contract: this.optionKey,
      closeAuthority: user,
      writerMint: this.optionMarket.writerMint,
      optionMint: this.optionMarket.optionMint,
      writerTokenSource: writerTokenSource,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      underlyingPool: this.optionMarket.underlyingPool,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.closePosition(new BN(amount), {
      accounts: closePositionAccounts,
    });
  }

  // async reclaimFundsFromExerciseAdmin(
  //   user: PublicKey,
  //   numToClaim: BN
  // ): Promise<TransactionInstruction> {
  //   const seeds = [
  //     this.optionMarket.underlyingMint,
  //     this.optionMarket.quoteMint,
  //     this.optionMarket.underlyingAmount,
  //     this.optionMarket.quoteAmount,
  //     this.optionMarket.expiryTs,
  //     this.optionMarket.isCall.toNumber() > 0 ? true : false,
  //   ] as const;
  //   const [claimablePool, _] = await InertiaSDK.getProgramAddress(
  //     this.program,
  //     "ClaimablePool",
  //     ...seeds
  //   );

  //   const associatedTokenAddress = await Token.getAssociatedTokenAddress(
  //     ASSOCIATED_TOKEN_PROGRAM_ID,
  //     TOKEN_PROGRAM_ID,
  //     this.optionMarket.underlyingMint,
  //     user
  //   );

  //   const reclaimFundsFromExerciseAdminAccounts: InertiaIXAccounts["reclaimFundsFromExerciseAdmin"] =
  //     {
  //       authority: user,
  //       oracleAi: this.optionMarket.oracleAi,
  //       contract: this.optionKey,
  //       claimablePool,
  //       underlyingMint: this.optionMarket.underlyingMint,
  //       quoteMint: this.optionMarket.quoteMint,
  //       // contractUnderlyingTokens: this.optionMarket.underlyingPool,
  //       exerciseFeeAccount: await this.getInertiaExerciseFeeAccount(),

  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       clock: SYSVAR_CLOCK_PUBKEY,
  //       userUnderlyingTokens: associatedTokenAddress,
  //     };

  //   return this.program.instruction.reclaimFundsFromExerciseAdmin(numToClaim, {
  //     accounts: reclaimFundsFromExerciseAdminAccounts,
  //   });
  // }

  // async reinitializeUnderlyingMint(
  //   user: PublicKey,
  //   targetPool: PublicKey,
  //   newUnderlyingMint: PublicKey
  // ): Promise<TransactionInstruction> {
  //   const seeds = [
  //     this.optionMarket.underlyingMint,
  //     this.optionMarket.quoteMint,
  //     this.optionMarket.underlyingAmount,
  //     this.optionMarket.quoteAmount,
  //     this.optionMarket.expiryTs,
  //     this.optionMarket.isCall.toNumber() > 0 ? true : false,
  //   ] as const;
  //   const [claimablePool, _] = await InertiaSDK.getProgramAddress(
  //     this.program,
  //     "ClaimablePool",
  //     ...seeds
  //   );

  //   const associatedTokenAddress = await Token.getAssociatedTokenAddress(
  //     ASSOCIATED_TOKEN_PROGRAM_ID,
  //     TOKEN_PROGRAM_ID,
  //     this.optionMarket.underlyingMint,
  //     user
  //   );

  //   const reinitializeUnderlyingMintAccounts: InertiaIXAccounts["reinitializeUnderlyingMint"] =
  //     {
  //       authority: user,
  //       oracleAi: this.optionMarket.oracleAi,
  //       contract: this.optionKey,
  //       underlyingMint: this.optionMarket.underlyingMint,
  //       newUnderlyingMint: newUnderlyingMint,

  //       targetPool: targetPool,

  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //       userUnderlyingTokens: associatedTokenAddress,
  //       rent: SYSVAR_RENT_PUBKEY,
  //     };

  //   return this.program.instruction.reinitializeUnderlyingMint({
  //     accounts: reinitializeUnderlyingMintAccounts,
  //   });
  // }
}
