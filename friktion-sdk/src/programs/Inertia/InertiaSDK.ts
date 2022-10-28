import type { ProviderLike } from "@friktion-labs/friktion-utils";
import { providerToAnchorProvider } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import type Decimal from "decimal.js";

import type { FriktionSDK } from "../..";
import {
  INERTIA_FEE_OWNER,
  INERTIA_MINT_FEE_BPS,
  OPTIONS_PROGRAM_IDS,
  OTHER_IDLS,
  RuntimeEnvironment,
} from "../..";
import type { GenericOptionsContractWithKey } from "../Volt";
import type { NetworkName } from "../Volt/utils/helperTypes";
import { getStrikeFromOptionsContract } from "../Volt/utils/optionMarketUtils";
import type { InertiaIXAccounts } from ".";
import type {
  InertiaContractWithKey,
  InertiaProgram,
  InertiaStubOracleWithKey,
} from "./inertiaTypes";
import {
  convertInertiaContractToGenericOptionsContract,
  getInertiaMarketByKey,
} from "./inertiaUtils";

export interface InertiaNewContractParams {
  user: PublicKey;
  quoteMint: PublicKey;
  underlyingMint: PublicKey;
  underlyingAmount: BN;
  quoteAmount: BN;
  expiryTs: BN;
  isCall: boolean;
  oracleAi: PublicKey;
}

export interface InertiaRevertSettleOptionParams {
  user: PublicKey;
}

export interface InertiaSettleOptionParams {
  user: PublicKey;
  settlePrice?: BN;
  env?: RuntimeEnvironment;
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
  readonly optionsContract: InertiaContractWithKey;
  readonly optionKey: PublicKey;
  readonly program: InertiaProgram;
  readonly readonlyProvider?: AnchorProvider;
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

    this.optionsContract = optionMarket;
    this.optionKey = optionMarket.key;
  }

  asOptionMarket(): GenericOptionsContractWithKey {
    return convertInertiaContractToGenericOptionsContract(this.optionsContract);
  }

  canExercise(): boolean {
    return this.optionsContract.wasSettleCranked;
  }

  async getStrike(): Promise<Decimal> {
    if (this.readonlyProvider === undefined)
      throw new Error("read only provider must be generated");
    return getStrikeFromOptionsContract(
      this.readonlyProvider,
      this.asOptionMarket(),
      this.optionsContract.isCall.gtn(0)
    );
  }

  static async getStubOracleByKey(
    sdk: FriktionSDK,
    key: PublicKey
  ): Promise<InertiaStubOracleWithKey> {
    const acct = await sdk.programs.Inertia.account.stubOracle.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  static async findStubOracleAddress(
    user: PublicKey,
    pdaString: string,
    programId: PublicKey = OPTIONS_PROGRAM_IDS.Inertia
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        textEncoder.encode("stubOracle"),
        user.toBuffer(),
        textEncoder.encode(pdaString),
      ],
      programId
    );
  }
  static async createStubOracle(
    sdk: FriktionSDK,
    user: PublicKey,
    price: number,
    pdaString: string
  ): Promise<{
    oracleKey: PublicKey;
    instruction: TransactionInstruction;
  }> {
    const [oracleKey] = await InertiaSDK.findStubOracleAddress(user, pdaString);

    const accounts: InertiaIXAccounts["createStubOracle"] = {
      authority: user,
      stubOracle: oracleKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return {
      oracleKey,
      instruction: sdk.programs.Inertia.instruction.createStubOracle(
        price,
        pdaString,
        {
          accounts: accounts,
        }
      ),
    };
  }

  static setStubOracle(
    sdk: FriktionSDK,
    user: PublicKey,
    stubOracleKey: PublicKey,
    price: number
  ): TransactionInstruction {
    const accounts: InertiaIXAccounts["setStubOracle"] = {
      authority: user,
      stubOracle: stubOracleKey,
      systemProgram: SystemProgram.programId,
    };

    return sdk.programs.Inertia.instruction.setStubOracle(price, {
      accounts: accounts,
    });
  }

  async getInertiaExerciseFeeAccount(): Promise<PublicKey> {
    return await InertiaSDK.getGenericInertiaExerciseFeeAccount(
      this.optionsContract.quoteMint
    );
  }

  static async getGenericInertiaExerciseFeeAccount(quoteAssetMint: PublicKey) {
    return await getAssociatedTokenAddress(quoteAssetMint, INERTIA_FEE_OWNER);
  }

  toGenericOptionsContract(): GenericOptionsContractWithKey {
    return convertInertiaContractToGenericOptionsContract(this.optionsContract);
  }

  isCall(): boolean {
    return this.optionsContract.isCall.gtn(0);
  }

  mintFeeAmount(numOptionTokensMinted: BN): BN {
    if (numOptionTokensMinted.lten(0)) {
      return new BN(0);
    }
    return numOptionTokensMinted
      .mul(this.optionsContract.underlyingAmount)
      .muln(INERTIA_MINT_FEE_BPS)
      .divn(10000);
  }

  static async getOptionMarketByKey(
    program: InertiaProgram,
    key: PublicKey
  ): Promise<GenericOptionsContractWithKey> {
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
        new BN(underlyingAmount.toString()).toArrayLike(Buffer, "le", 8),
        new BN(quoteAmount.toString()).toArrayLike(Buffer, "le", 8),
        new BN(expiry.toString()).toArrayLike(Buffer, "le", 8),
        isCall
          ? new BN(1).toArrayLike(Buffer, "le", 8)
          : new BN(0).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  }

  exercise(params: InertiaExerciseOptionParams): TransactionInstruction {
    const { amount, optionTokenSource, underlyingTokenDestination } = params;

    const exerciseAccounts: InertiaIXAccounts["exercise"] = {
      contract: this.optionKey,
      exerciserAuthority: params.user,
      optionMint: this.optionsContract.optionMint,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      claimablePool: this.optionsContract.claimablePool,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.program.instruction.optionExercise(amount, {
      accounts: exerciseAccounts,
    });
  }

  async settle(
    params: InertiaSettleOptionParams,
    bypassCode?: BN
  ): Promise<TransactionInstruction> {
    // TODO: get rid of requiring a defined settle price. long term need to use oracles every time
    if (
      params.settlePrice === undefined &&
      params.env === RuntimeEnvironment.Production
    )
      throw new Error("stop using oracles for a bit, pls pass in settle price");

    const settlePrice = params.settlePrice ?? new BN(0);
    if (
      params.settlePrice !== undefined &&
      params.settlePrice !== new BN(0) &&
      bypassCode?.toString() !== "123456789"
    )
      bypassCode = new BN(11111111);
    else if (bypassCode === undefined) {
      bypassCode = new BN(0);
    }

    if (bypassCode.ltn(0)) {
      throw new Error("bypass code must be positive");
    }

    const settleAccounts: InertiaIXAccounts["settle"] = {
      authority: params.user,
      oracleAi: this.optionsContract.oracleAi,
      contract: this.optionKey,
      claimablePool: this.optionsContract.claimablePool,
      underlyingMint: this.optionsContract.underlyingMint,
      quoteMint: this.optionsContract.quoteMint,
      contractUnderlyingTokens: this.optionsContract.underlyingPool,
      exerciseFeeAccount: await this.getInertiaExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
    };

    console.log(
      "settle px = ",
      settlePrice.toString(),
      ", bypass code = ",
      bypassCode.toString()
    );
    return this.program.instruction.optionSettle(settlePrice, bypassCode, {
      accounts: settleAccounts,
    });
  }

  async revertSettle(
    params: InertiaRevertSettleOptionParams
  ): Promise<TransactionInstruction> {
    const seeds = [
      this.optionsContract.underlyingMint,
      this.optionsContract.quoteMint,
      this.optionsContract.underlyingAmount,
      this.optionsContract.quoteAmount,
      this.optionsContract.expiryTs,
      this.optionsContract.isCall.toNumber() > 0 ? true : false,
    ] as const;
    const [claimablePool, _] = await InertiaSDK.getProgramAddress(
      this.program,
      "ClaimablePool",
      ...seeds
    );

    const revertSettleAccounts: InertiaIXAccounts["revertSettle"] = {
      authority: params.user,
      oracleAi: this.optionsContract.oracleAi,
      contract: this.optionKey,
      claimablePool,
      underlyingMint: this.optionsContract.underlyingMint,
      quoteMint: this.optionsContract.quoteMint,
      contractUnderlyingTokens: this.optionsContract.underlyingPool,
      exerciseFeeAccount: await this.getInertiaExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.program.instruction.revertOptionSettle({
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
      contract: this.optionsContract.key,
      optionMint: this.optionsContract.optionMint,
      optionTokenDestination,
      underlyingPool: this.optionsContract.underlyingPool,
      writerMint: this.optionsContract.writerMint,
      writerTokenDestination,
      authority: user,
      userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
      feeDestination,
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
      writerMint: this.optionsContract.writerMint,
      contractUnderlyingTokens: this.optionsContract.underlyingPool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
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
      writerMint: this.optionsContract.writerMint,
      optionMint: this.optionsContract.optionMint,
      writerTokenSource: writerTokenSource,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      underlyingPool: this.optionsContract.underlyingPool,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.program.instruction.closePosition(new BN(amount), {
      accounts: closePositionAccounts,
    });
  }

  static async initializeOptionsContract(
    sdk: FriktionSDK,
    params: InertiaNewContractParams,
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
      isCall,
      oracleAi,
    } = params;
    const seeds = [
      underlyingMint,
      quoteMint,
      underlyingAmount,
      quoteAmount,
      expiryTs,
      isCall,
    ] as const;
    const program = sdk.programs.Inertia;
    const [contract, contractBump] = await InertiaSDK.getProgramAddress(
      program,
      "OptionsContract",
      ...seeds
    );
    const [optionMint, optionBump] = await InertiaSDK.getProgramAddress(
      program,
      "OptionMint",
      ...seeds
    );
    const [writerMint, writerBump] = await InertiaSDK.getProgramAddress(
      program,
      "WriterMint",
      ...seeds
    );

    const [underlyingPool, underlyingPoolBump] =
      await InertiaSDK.getProgramAddress(program, "UnderlyingPool", ...seeds);
    const [claimablePool, claimablePoolBump] =
      await InertiaSDK.getProgramAddress(program, "ClaimablePool", ...seeds);

    const mintFeeAccount = await getAssociatedTokenAddress(
      underlyingMint,
      INERTIA_FEE_OWNER
    );
    const exerciseFeeAccount = await getAssociatedTokenAddress(
      quoteMint,
      INERTIA_FEE_OWNER
    );

    const genericOptionsContractStruct: InertiaContractWithKey = {
      ...{
        ...params,
        isCall: isCall ? new BN(1) : new BN(0),
      },
      adminKey: user,
      expiryTs: new BN(expiryTs),
      underlyingAmount: new BN(params.underlyingAmount),
      quoteAmount: new BN(params.quoteAmount),
      key: contract,
      underlyingPool,
      claimablePool,
      writerMint,
      optionMint,
      mintFeeAccount,
      exerciseFeeAccount,
      contractBump,
      optionBump,
      writerBump,
      underlyingPoolBump,
      wasSettleCranked: false,
      claimablePoolBump,
      extraKey1: SystemProgram.programId,
      exerciseAmount: new BN(0),
      totalAmount: new BN(0),
    };

    const newContractIx = sdk.programs.Inertia.instruction.newContract(
      params.underlyingAmount,
      params.quoteAmount,
      new BN(expiryTs),
      isCall ? new BN(1) : new BN(0),
      {
        accounts: {
          payer: user,
          adminKey: user,
          contract,
          writerMint,
          optionMint,
          quoteMint: quoteMint,
          underlyingMint: underlyingMint,
          underlyingPool,
          claimablePool,
          oracleAi,
          mintFeeAccount: mintFeeAccount,
          exerciseFeeAccount: exerciseFeeAccount,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    );

    const optionsContract = convertInertiaContractToGenericOptionsContract(
      genericOptionsContractStruct
    );

    return {
      ix: newContractIx,
      optionsContract,
      optionKey: genericOptionsContractStruct.key,
    };
  }
}
