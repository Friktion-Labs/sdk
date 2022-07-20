import type { ProviderLike } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

import type { FriktionSDK, GenericOptionsContractWithKey } from "../..";
import {
  SOLOPTIONS_EXERCISE_FEE_BPS,
  SOLOPTIONS_FEE_OWNER,
  SOLOPTIONS_MINT_FEE_BPS,
} from "../..";
import type { NetworkName } from "../Volt/utils/helperTypes";
import type { SoloptionsIXAccounts } from ".";
import { convertSoloptionsContractToOptionMarket } from ".";
import type {
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "./soloptionsTypes";
import { getSoloptionsContractByKey } from "./soloptionsUtils";

export interface NewContractParams {
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: BN;
  quoteAmount: BN;
  expiryTs: number;
}

export interface ExerciseOptionParams {
  user: PublicKey;
  quoteTokenSource: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: BN;
}

export interface WriteOptionParams {
  user: PublicKey;
  writerUnderlyingFundingTokens: PublicKey;
  writerTokenDestination: PublicKey;
  optionTokenDestination: PublicKey;
  amount: BN;
}

export interface RedeemOptionParams {
  user: PublicKey;
  redeemerTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  quoteTokenDestination: PublicKey;
  amount: number;
}

export const DefaultSoloptionsSDKOpts = {
  network: "mainnet-beta",
};

export type SoloptionsSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
};
export class SoloptionsSDK {
  readonly optionsContract: SoloptionsContractWithKey;
  readonly optionKey: PublicKey;
  readonly program: SoloptionsProgram;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;

  constructor(
    friktionSdk: FriktionSDK,
    optionMarket: SoloptionsContractWithKey
  ) {
    this.readonlyProvider = friktionSdk.readonlyProvider;
    this.network = friktionSdk.network;
    this.program = friktionSdk.programs.Soloptions;

    this.optionsContract = optionMarket;
    this.optionKey = optionMarket.key;
  }

  async getSoloptionsExerciseFeeAccount(): Promise<PublicKey> {
    return await SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(
      this.optionsContract.quoteMint
    );
  }

  static async getGenericSoloptionsExerciseFeeAccount(
    quoteAssetMint: PublicKey
  ) {
    return await getAssociatedTokenAddress(
      quoteAssetMint,
      SOLOPTIONS_FEE_OWNER
    );
  }

  mintFeeAmount(numOptionTokensMinted: BN): BN {
    if (numOptionTokensMinted.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensMinted
      .mul(this.optionsContract.underlyingAmount)
      .muln(SOLOPTIONS_MINT_FEE_BPS)
      .divn(10000);
  }

  exerciseFeeAmount(numOptionTokensToExercise: BN): BN {
    if (numOptionTokensToExercise.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensToExercise
      .mul(this.optionsContract.underlyingAmount)
      .muln(SOLOPTIONS_EXERCISE_FEE_BPS)
      .divn(10000);
  }

  static async getOptionMarketByKey(
    program: SoloptionsProgram,
    key: PublicKey
  ): Promise<GenericOptionsContractWithKey> {
    const optionMarket = convertSoloptionsContractToOptionMarket({
      ...(await getSoloptionsContractByKey(program, key)),
      key: key,
    });
    if (!optionMarket) {
      throw new Error("could not find Soloptions market for key");
    }
    return optionMarket;
  }

  static async getProgramAddress(
    program: SoloptionsProgram,
    kind: "OptionsContract" | "WriterMint" | "OptionMint",
    underlyingMint: PublicKey,
    quoteMint: PublicKey,
    underlyingAmount: BN,
    quoteAmount: BN,
    expiry: number
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        textEncoder.encode(kind),
        underlyingMint.toBuffer(),
        quoteMint.toBuffer(),
        new BN(underlyingAmount.toString()).toBuffer("le", 8),
        new BN(quoteAmount.toString()).toBuffer("le", 8),
        new BN(expiry.toString()).toBuffer("le", 8),
      ],
      program.programId
    );
  }

  static async initializeOptionsContract(
    sdk: FriktionSDK,
    params: NewContractParams,
    user: PublicKey
  ): Promise<{
    ix: TransactionInstruction;
    optionsContract: GenericOptionsContractWithKey;
    optionKey: PublicKey;
  }> {
    const {
      underlyingMint,
      quoteMint,
      underlyingAmount,
      quoteAmount,
      expiryTs,
    } = params;
    const seeds = [
      underlyingMint,
      quoteMint,
      underlyingAmount,
      quoteAmount,
      expiryTs,
    ] as const;
    const [contract, contractBump] = await SoloptionsSDK.getProgramAddress(
      sdk.programs.Soloptions,
      "OptionsContract",
      ...seeds
    );
    const [optionMint, optionBump] = await SoloptionsSDK.getProgramAddress(
      sdk.programs.Soloptions,
      "OptionMint",
      ...seeds
    );
    const [writerMint, writerBump] = await SoloptionsSDK.getProgramAddress(
      sdk.programs.Soloptions,
      "WriterMint",
      ...seeds
    );

    const underlyingPool: PublicKey = await getAssociatedTokenAddress(
      underlyingMint,
      contract,
      true
    );

    const quotePool: PublicKey = await getAssociatedTokenAddress(
      quoteMint,
      contract,
      true
    );

    const mintFeeAccount = await getAssociatedTokenAddress(
      underlyingMint,
      SOLOPTIONS_FEE_OWNER
    );
    const exerciseFeeAccount = await getAssociatedTokenAddress(
      quoteMint,
      SOLOPTIONS_FEE_OWNER
    );

    const extraKeys = SystemProgram.programId;
    const genericOptionsContractStruct: SoloptionsContractWithKey = {
      ...params,
      expiryTs: new BN(expiryTs),
      underlyingAmount: new BN(params.underlyingAmount),
      quoteAmount: new BN(params.quoteAmount),
      key: contract,
      underlyingPool,
      quotePool,
      writerMint,
      optionMint,
      mintFeeAccount,
      exerciseFeeAccount,
      contractBump,
      optionBump,
      writerBump,
      extraKey1: extraKeys,
      extraKey2: extraKeys,
      extraInt1: new BN(0),
      extraInt2: new BN(0),
      extraBool: false,
    };

    const newContractIx = sdk.programs.Soloptions.instruction.newContract(
      params.underlyingAmount,
      params.quoteAmount,
      new BN(expiryTs),
      contractBump,
      optionBump,
      writerBump,
      {
        accounts: {
          payer: user,
          contract,
          writerMint,
          optionMint,
          quoteMint: quoteMint,
          underlyingMint: underlyingMint,
          quotePool,
          underlyingPool,
          mintFeeAccount: mintFeeAccount,
          exerciseFeeAccount: exerciseFeeAccount,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        },
      }
    );

    const optionsContract = convertSoloptionsContractToOptionMarket(
      genericOptionsContractStruct
    );

    return {
      ix: newContractIx,
      optionsContract,
      optionKey: genericOptionsContractStruct.key,
    };
  }

  canExercise(): boolean {
    return this.optionsContract.expiryTs.lt(new BN(Date.now()).divn(1000));
  }

  async exercise(
    params: ExerciseOptionParams
  ): Promise<TransactionInstruction> {
    const {
      amount,
      quoteTokenSource,
      optionTokenSource,
      underlyingTokenDestination,
    } = params;

    const feeDestination = await this.getSoloptionsExerciseFeeAccount();

    const exerciseAccounts: SoloptionsIXAccounts["exercise"] = {
      contract: this.optionKey,
      exerciserAuthority: params.user,
      quoteTokenSource,
      contractQuoteTokens: this.optionsContract.quotePool,
      optionMint: this.optionsContract.optionMint,
      optionTokenSource: optionTokenSource,
      contractUnderlyingTokens: this.optionsContract.underlyingPool,
      underlyingTokenDestination,
      underlyingMint: this.optionsContract.underlyingMint,
      quoteMint: this.optionsContract.quoteMint,
      feeDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionExercise(amount, {
      accounts: exerciseAccounts,
    });
  }

  async write(params: WriteOptionParams): Promise<TransactionInstruction> {
    const {
      amount,
      user,
      writerUnderlyingFundingTokens,
      writerTokenDestination,
      optionTokenDestination,
    } = params;

    const feeDestination = await this.getSoloptionsExerciseFeeAccount();

    const writeAccounts: SoloptionsIXAccounts["write"] = {
      contract: this.optionsContract.key,
      optionMint: this.optionsContract.optionMint,
      quoteMint: this.optionsContract.quoteMint,
      optionTokenDestination,
      underlyingMint: this.optionsContract.underlyingMint,
      underlyingPool: this.optionsContract.underlyingPool,
      writerMint: this.optionsContract.writerMint,
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

  redeem(params: RedeemOptionParams): TransactionInstruction {
    const {
      user,
      underlyingTokenDestination,
      quoteTokenDestination,
      redeemerTokenSource,
      amount,
    } = params;

    const redeemAccounts: SoloptionsIXAccounts["redeem"] = {
      contract: this.optionKey,
      redeemerAuthority: user,
      writerMint: this.optionsContract.writerMint,
      contractUnderlyingTokens: this.optionsContract.underlyingPool,
      contractQuoteTokens: this.optionsContract.quotePool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      quoteTokenDestination,
      underlyingMint: this.optionsContract.underlyingMint,
      quoteMint: this.optionsContract.quoteMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionRedeem(new BN(amount), {
      accounts: redeemAccounts,
    });
  }
}
