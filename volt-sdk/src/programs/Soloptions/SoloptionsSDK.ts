/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Provider as AnchorProvider } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { SolanaProvider } from "@saberhq/solana-contrib";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {TextEncoder} from "util";
import { getAssociatedTokenAddress } from "../../../friktion-utils";
import type { FriktionSDK } from "../..";
import {
  SOLOPTIONS_EXERCISE_FEE_BPS,
  SOLOPTIONS_FEE_OWNER,
  SOLOPTIONS_MINT_FEE_BPS,
} from "../..";
import type { NetworkName } from "../../helperTypes";
import type { ProviderLike } from "../../miscUtils";
import type { OptionMarketWithKey } from "../Volt";
import type { SoloptionsIXAccounts } from ".";
import { convertSoloptionsContractToOptionMarket } from ".";
import type { SoloptionsProgram } from "./soloptionsTypes";
import { getSoloptionsMarketByKey } from "./soloptionsUtils";

export interface NewMarketParams {
  user: PublicKey;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: BN;
  quoteAmount: BN;
  expiryTs: number;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
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
  readonly optionMarket: OptionMarketWithKey;
  readonly optionKey: PublicKey;
  readonly program: SoloptionsProgram;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;

  constructor(friktionSdk: FriktionSDK, optionMarket: OptionMarketWithKey) {
    this.readonlyProvider = friktionSdk.readonlyProvider;
    this.network = friktionSdk.network;
    this.program = friktionSdk.programs.Soloptions;

    this.optionMarket = optionMarket;
    this.optionKey = optionMarket.key;
  }

  async getSoloptionsExerciseFeeAccount(): Promise<PublicKey> {
    return await SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(
      this.optionMarket.quoteAssetMint
    );
  }

  static async getGenericSoloptionsExerciseFeeAccount(
    quoteAssetMint: PublicKey
  ) {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteAssetMint,
      SOLOPTIONS_FEE_OWNER
    );
  }

  mintFeeAmount(numOptionTokensMinted: BN): BN {
    if (numOptionTokensMinted.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensMinted
      .mul(this.optionMarket.underlyingAmountPerContract)
      .muln(SOLOPTIONS_MINT_FEE_BPS)
      .divn(10000);
  }

  exerciseFeeAmount(numOptionTokensToExercise: BN): BN {
    if (numOptionTokensToExercise.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensToExercise
      .mul(this.optionMarket.underlyingAmountPerContract)
      .muln(SOLOPTIONS_EXERCISE_FEE_BPS)
      .divn(10000);
  }

  static async getOptionMarketByKey(
    program: SoloptionsProgram,
    key: PublicKey
  ): Promise<OptionMarketWithKey> {
    const optionMarket = await getSoloptionsMarketByKey(program, key);
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
        new u64(underlyingAmount.toString()).toBuffer(),
        new u64(quoteAmount.toString()).toBuffer(),
        new u64(expiry.toString()).toBuffer(),
      ],
      program.programId
    );
  }

  static async initializeOptionMarketAndGetSdk(
    sdk: FriktionSDK,
    opts: SoloptionsSDKOpts,
    providerMut: SolanaProvider,
    params: NewMarketParams,
    user: PublicKey
  ): Promise<{
    ix: TransactionInstruction;
    optionMarket: OptionMarketWithKey;
    optionKey: PublicKey;
  }> {
    const {
      underlyingMint,
      quoteMint,
      underlyingAmount,
      quoteAmount,
      mintFeeAccount,
      exerciseFeeAccount,
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

    console.log(
      params.underlyingAmount,
      params.quoteAmount,
      new BN(expiryTs),
      contractBump,
      optionBump,
      writerBump
    );

    const extraKeys = SystemProgram.programId;
    const optionMarketStruct = {
      ...params,
      expiryTs: new BN(expiryTs),
      underlyingAmount: new BN(params.underlyingAmount),
      quoteAmount: new BN(params.quoteAmount),
      key: contract,
      underlyingPool,
      quotePool,
      writerMint,
      optionMint,
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

    const optionMarket =
      convertSoloptionsContractToOptionMarket(optionMarketStruct);

    return {
      ix: newContractIx,
      optionMarket: optionMarket,
      optionKey: optionMarketStruct.key,
    };
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
      contractQuoteTokens: this.optionMarket.quoteAssetPool,
      optionMint: this.optionMarket.optionMint,
      optionTokenSource: optionTokenSource,
      contractUnderlyingTokens: this.optionMarket.underlyingAssetPool,
      underlyingTokenDestination,
      underlyingMint: this.optionMarket.underlyingAssetMint,
      quoteMint: this.optionMarket.quoteAssetMint,
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
      contract: this.optionMarket.key,
      optionMint: this.optionMarket.optionMint,
      quoteMint: this.optionMarket.quoteAssetMint,
      optionTokenDestination,
      underlyingMint: this.optionMarket.underlyingAssetMint,
      underlyingPool: this.optionMarket.underlyingAssetPool,
      writerMint: this.optionMarket.writerTokenMint,
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
      writerMint: this.optionMarket.writerTokenMint,
      contractUnderlyingTokens: this.optionMarket.underlyingAssetPool,
      contractQuoteTokens: this.optionMarket.quoteAssetPool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      quoteTokenDestination,
      underlyingMint: this.optionMarket.underlyingAssetMint,
      quoteMint: this.optionMarket.quoteAssetMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.optionRedeem(new BN(amount), {
      accounts: redeemAccounts,
    });
  }
}
