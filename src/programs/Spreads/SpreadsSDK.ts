import type { ProviderLike } from "@friktion-labs/friktion-utils";
import { providerToAnchorProvider } from "@friktion-labs/friktion-utils";
import type { AnchorProvider } from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import Decimal from "decimal.js";

import type { FriktionSDK } from "../..";
import {
  OPTIONS_PROGRAM_IDS,
  OTHER_IDLS,
  SPREADS_FEE_OWNER,
  SPREADS_MINT_FEE_BPS,
} from "../..";
import type { NetworkName } from "../../helperTypes";
import type { SpreadsIXAccounts } from ".";
import type {
  SpreadsContractWithKey,
  SpreadsProgram,
  SpreadsStubOracleWithKey,
} from "./spreadsTypes";
import { getSpreadsContractByKeyOrNull } from "./spreadsUtils";

export interface SpreadsNewMarketParams {
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

export interface SpreadsRevertSettleOptionParams {
  user: PublicKey;
}

export interface SpreadsSettleOptionParams {
  user: PublicKey;
  settlePrice?: BN;
}

export interface SpreadsExerciseOptionParams {
  user: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: BN;
}

export interface SpreadsWriteOptionParams {
  user: PublicKey;
  writerUnderlyingFundingTokens: PublicKey;
  writerTokenDestination: PublicKey;
  optionTokenDestination: PublicKey;
  amount: BN;
  feeDestination: PublicKey;
}

export interface SpreadsRedeemOptionParams {
  user: PublicKey;
  redeemerTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export interface SpreadsClosePositionParams {
  user: PublicKey;
  writerTokenSource: PublicKey;
  optionTokenSource: PublicKey;
  underlyingTokenDestination: PublicKey;
  amount: number;
}

export const DefaultSpreadsSDKOpts = {
  network: "mainnet-beta",
};

export type SpreadsSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
};

export type NewSpreadsContractParams = {
  underlyingMint: PublicKey;
  quoteMint: PublicKey;
  underlyingAmountBuy: BN;
  quoteAmountBuy: BN;
  underlyingAmountSell: BN;
  quoteAmountSell: BN;
  expiryTs: BN;
  isCall: boolean;
  oracleAi: PublicKey;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
};

export class SpreadsSDK {
  readonly spreadsContract: SpreadsContractWithKey;
  readonly spreadsKey: PublicKey;
  readonly program: SpreadsProgram;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;

  constructor(spreadsContract: SpreadsContractWithKey, opts: SpreadsSDKOpts) {
    const defaultedOpts = Object.assign({}, opts, DefaultSpreadsSDKOpts);
    this.readonlyProvider = providerToAnchorProvider(defaultedOpts.provider);

    this.network = !opts.network
      ? "mainnet-beta"
      : opts.network === "testnet" || opts.network === "localnet"
      ? "mainnet-beta"
      : opts.network;

    const spreadsIdl = OTHER_IDLS.Spreads;
    if (!spreadsIdl) {
      console.error("SPREADS_IDLS", OTHER_IDLS);
      // this used to be a big bug
      throw new Error("Unable to load SpreadsSDK because idl is missing");
    }

    const Spreads = new Program(
      spreadsIdl,
      OPTIONS_PROGRAM_IDS.Spreads.toString(),
      this.readonlyProvider
    );

    this.program = Spreads as unknown as SpreadsProgram;

    this.spreadsContract = spreadsContract;
    this.spreadsKey = spreadsContract.key;
  }

  static async createSpread(
    sdk: FriktionSDK,
    params: NewSpreadsContractParams,
    admin: PublicKey
  ): Promise<{
    ix: TransactionInstruction;
    spreadsKey: PublicKey;
  }> {
    const {
      underlyingMint,
      quoteMint,
      underlyingAmountBuy,
      quoteAmountBuy,
      underlyingAmountSell,
      quoteAmountSell,
      mintFeeAccount,
      exerciseFeeAccount,
      expiryTs,
      isCall,
      oracleAi,
    } = params;

    const [contract] = await SpreadsSDK.findContractAddress(
      underlyingMint,
      quoteMint,
      underlyingAmountBuy,
      quoteAmountBuy,
      underlyingAmountSell,
      quoteAmountSell,
      expiryTs,
      isCall ? new BN(1) : new BN(0),
      sdk.programs.Spreads.programId
    );
    const [optionMint] = await SpreadsSDK.findOptionMintAddress(contract);

    const [writerMint] = await SpreadsSDK.findWriterMintAddress(contract);

    const [underlyingPool] = await SpreadsSDK.findUnderlyingPoolAddress(
      contract
    );

    const [claimablePool] = await SpreadsSDK.findClaimablePoolAddress(contract);

    const initializeAccounts: SpreadsIXAccounts["newSpread"] = {
      adminKey: admin,
      payer: admin,
      oracleAi,
      contract,
      writerMint,
      optionMint,
      quoteMint,
      underlyingMint,
      underlyingPool,
      claimablePool,
      mintFeeAccount: mintFeeAccount,
      exerciseFeeAccount: exerciseFeeAccount,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const newContractIx = sdk.programs.Spreads.instruction.newSpread(
      underlyingAmountBuy,
      quoteAmountBuy,
      underlyingAmountSell,
      quoteAmountSell,
      expiryTs,
      isCall ? new BN(1) : new BN(0),
      {
        accounts: initializeAccounts,
      }
    );

    return {
      ix: newContractIx,
      spreadsKey: contract,
    };
  }

  canExercise(): boolean {
    return this.spreadsContract.wasSettleCranked;
  }

  static async getStubOracleByKey(
    sdk: FriktionSDK,
    key: PublicKey
  ): Promise<SpreadsStubOracleWithKey> {
    const acct = await sdk.programs.Spreads.account.stubOracle.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  static async findStubOracleAddress(
    user: PublicKey,
    pdaString: string,
    programId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
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
    const [oracleKey] = await SpreadsSDK.findStubOracleAddress(user, pdaString);

    const accounts: SpreadsIXAccounts["createStubOracle"] = {
      authority: user,
      stubOracle: oracleKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return {
      oracleKey,
      instruction: sdk.programs.Spreads.instruction.createStubOracle(
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
    const accounts: SpreadsIXAccounts["setStubOracle"] = {
      authority: user,
      stubOracle: stubOracleKey,
      systemProgram: SystemProgram.programId,
    };

    return sdk.programs.Spreads.instruction.setStubOracle(price, {
      accounts: accounts,
    });
  }

  async getSpreadsExerciseFeeAccount(): Promise<PublicKey> {
    return await SpreadsSDK.getGenericSpreadsExerciseFeeAccount(
      this.spreadsContract.quoteMint
    );
  }

  static async getGenericSpreadsExerciseFeeAccount(quoteAssetMint: PublicKey) {
    return await getAssociatedTokenAddress(quoteAssetMint, SPREADS_FEE_OWNER);
  }

  isCall(): boolean {
    return this.spreadsContract.isCall.gtn(0);
  }

  totalPossibleToMint(ulAmount: BN): BN {
    return ulAmount.div(
      this.getRequiredCollateral(new BN(1)).add(this.mintFeeAmount(new BN(1)))
    );
  }

  getRequiredCollateral(numOptionTokensMinted: BN): BN {
    let requiredCollateralForOneToken: BN;
    if (this.isCall()) {
      requiredCollateralForOneToken = new BN(
        new Decimal(
          this.spreadsContract.quoteAmountBuy
            .sub(this.spreadsContract.quoteAmountSell)
            .toString()
        )
          .mul(new Decimal(this.spreadsContract.underlyingAmountBuy.toString()))
          .div(new Decimal(this.spreadsContract.quoteAmountSell.toString()))
          .ceil()
          .toFixed(0)
      );
    } else {
      requiredCollateralForOneToken =
        this.spreadsContract.underlyingAmountSell.sub(
          this.spreadsContract.underlyingAmountBuy
        );
    }

    return requiredCollateralForOneToken.mul(numOptionTokensMinted);
  }

  mintFeeAmount(numOptionTokensMinted: BN): BN {
    if (numOptionTokensMinted.lten(0)) {
      return new BN(0);
    }

    return numOptionTokensMinted
      .mul(this.getRequiredCollateral(numOptionTokensMinted))
      .muln(SPREADS_MINT_FEE_BPS)
      .divn(10000);
  }

  static async getSpreadsContractByKey(
    program: SpreadsProgram,
    key: PublicKey
  ): Promise<SpreadsContractWithKey> {
    const spreadsContract = await getSpreadsContractByKeyOrNull(program, key);
    if (!spreadsContract) {
      throw new Error("could not find Spreads market for key");
    }
    return spreadsContract;
  }

  static async getProgramAddress(
    program: SpreadsProgram,
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
        new BN(underlyingAmount.toString()).toBuffer("le", 8),
        new BN(quoteAmount.toString()).toBuffer("le", 8),
        new BN(expiry.toString()).toBuffer("le", 8),
        isCall ? new BN(1).toBuffer() : new BN(0).toBuffer("le", 8),
      ],
      program.programId
    );
  }

  async getOptionMintAddress(): Promise<PublicKey> {
    return (await SpreadsSDK.findOptionMintAddress(this.spreadsKey))[0];
  }

  async getWriterMintAddress(): Promise<PublicKey> {
    return (await SpreadsSDK.findWriterMintAddress(this.spreadsKey))[0];
  }

  async getClaimablePoolAddress(): Promise<PublicKey> {
    return (await SpreadsSDK.findClaimablePoolAddress(this.spreadsKey))[0];
  }

  async getUnderlyingPoolAddress(): Promise<PublicKey> {
    return (await SpreadsSDK.findUnderlyingPoolAddress(this.spreadsKey))[0];
  }

  static async findOptionMintAddress(
    contractKey: PublicKey,
    spreadsProgramId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("OptionMint"), contractKey.toBuffer()],
      spreadsProgramId
    );
  }

  static async findWriterMintAddress(
    contractKey: PublicKey,
    spreadsProgramId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("WriterMint"), contractKey.toBuffer()],
      spreadsProgramId
    );
  }

  static async findUnderlyingPoolAddress(
    contractKey: PublicKey,
    spreadsProgramId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("UnderlyingPool"), contractKey.toBuffer()],
      spreadsProgramId
    );
  }

  static async findClaimablePoolAddress(
    contractKey: PublicKey,
    spreadsProgramId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("ClaimablePool"), contractKey.toBuffer()],
      spreadsProgramId
    );
  }

  static async findContractAddress(
    underlyingMint: PublicKey,
    quoteMint: PublicKey,
    underlyingAmountBuy: BN,
    quoteAmountBuy: BN,
    underlyingAmountSell: BN,
    quoteAmountSell: BN,
    expiryTs: BN,
    isCall: BN,
    spreadsProgramId: PublicKey = OPTIONS_PROGRAM_IDS.Spreads
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    console.log("program id = ", spreadsProgramId.toString());
    return await PublicKey.findProgramAddress(
      [
        textEncoder.encode("SpreadsContract"),
        underlyingMint.toBuffer(),
        quoteMint.toBuffer(),
        new BN(underlyingAmountBuy.toString()).toBuffer("le", 8),
        new BN(quoteAmountBuy.toString()).toBuffer("le", 8),
        new BN(underlyingAmountSell.toString()).toBuffer("le", 8),
        new BN(quoteAmountSell.toString()).toBuffer("le", 8),
        new BN(expiryTs.toString()).toBuffer("le", 8),
        new BN(isCall.toString()).toBuffer("le", 8),
      ],
      spreadsProgramId
    );
  }

  exercise(params: SpreadsExerciseOptionParams): TransactionInstruction {
    const { amount, optionTokenSource, underlyingTokenDestination } = params;

    const exerciseAccounts: SpreadsIXAccounts["exercise"] = {
      contract: this.spreadsKey,
      exerciserAuthority: params.user,
      optionMint: this.spreadsContract.optionMint,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      claimablePool: this.spreadsContract.claimablePool,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.exercise(amount, {
      accounts: exerciseAccounts,
    });
  }

  async settle(
    params: SpreadsSettleOptionParams,
    bypassCode?: BN
  ): Promise<TransactionInstruction> {
    const settlePrice = params.settlePrice ?? new BN(0);
    if (params.settlePrice !== undefined && params.settlePrice !== new BN(0))
      bypassCode = new BN(11111111);
    else if (bypassCode === undefined) {
      bypassCode = new BN(0);
    }

    if (bypassCode.ltn(0)) {
      throw new Error("bypass code must be positive");
    }

    const settleAccounts: SpreadsIXAccounts["settle"] = {
      authority: params.user,
      oracleAi: this.spreadsContract.oracleAi,
      contract: this.spreadsKey,
      claimablePool: this.spreadsContract.claimablePool,
      underlyingMint: this.spreadsContract.underlyingMint,
      quoteMint: this.spreadsContract.quoteMint,
      contractUnderlyingTokens: this.spreadsContract.underlyingPool,
      exerciseFeeAccount: await this.getSpreadsExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.settle(settlePrice, bypassCode, {
      accounts: settleAccounts,
    });
  }

  async revertSettle(
    params: SpreadsRevertSettleOptionParams
  ): Promise<TransactionInstruction> {
    const revertSettleAccounts: SpreadsIXAccounts["revertSettle"] = {
      authority: params.user,
      oracleAi: this.spreadsContract.oracleAi,
      contract: this.spreadsKey,
      claimablePool: this.spreadsContract.claimablePool,
      underlyingMint: this.spreadsContract.underlyingMint,
      quoteMint: this.spreadsContract.quoteMint,
      contractUnderlyingTokens: this.spreadsContract.underlyingPool,
      exerciseFeeAccount: await this.getSpreadsExerciseFeeAccount(),

      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.revertSettle({
      accounts: revertSettleAccounts,
    });
  }

  write(params: SpreadsWriteOptionParams): TransactionInstruction {
    const {
      amount,
      user,
      writerUnderlyingFundingTokens,
      writerTokenDestination,
      optionTokenDestination,
      feeDestination,
    } = params;

    const writeAccounts: SpreadsIXAccounts["write"] = {
      authority: user,
      contract: this.spreadsContract.key,
      optionMint: this.spreadsContract.optionMint,
      optionTokenDestination,
      underlyingPool: this.spreadsContract.underlyingPool,
      writerMint: this.spreadsContract.writerMint,
      writerTokenDestination,
      userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
      feeDestination,
      clock: SYSVAR_CLOCK_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return this.program.instruction.write(amount, {
      accounts: writeAccounts,
    });
  }

  redeem(params: SpreadsRedeemOptionParams): TransactionInstruction {
    const { user, underlyingTokenDestination, redeemerTokenSource, amount } =
      params;

    const redeemAccounts: SpreadsIXAccounts["redeem"] = {
      contract: this.spreadsKey,
      authority: user,
      writerMint: this.spreadsContract.writerMint,
      contractUnderlyingTokens: this.spreadsContract.underlyingPool,
      writerTokenSource: redeemerTokenSource,
      underlyingTokenDestination,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.redeem(new BN(amount), {
      accounts: redeemAccounts,
    });
  }

  close(params: SpreadsClosePositionParams): TransactionInstruction {
    const {
      user,
      underlyingTokenDestination,
      writerTokenSource,
      optionTokenSource,
      amount,
    } = params;

    const closePositionAccounts: SpreadsIXAccounts["close"] = {
      contract: this.spreadsKey,
      authority: user,
      writerMint: this.spreadsContract.writerMint,
      optionMint: this.spreadsContract.optionMint,
      writerTokenSource: writerTokenSource,
      optionTokenSource: optionTokenSource,
      underlyingTokenDestination,
      underlyingPool: this.spreadsContract.underlyingPool,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    };

    return this.program.instruction.closePosition(new BN(amount), {
      accounts: closePositionAccounts,
    });
  }
}
