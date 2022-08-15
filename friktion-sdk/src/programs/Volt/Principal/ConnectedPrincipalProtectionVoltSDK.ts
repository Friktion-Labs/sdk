import { printAnchorAccounts } from "@friktion-labs/friktion-utils";
import { use } from "@friktion-labs/typescript-mix";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import type Decimal from "decimal.js";

import { VoltType } from "../../../constants";
import type { FriktionSDK } from "../../../FriktionSDK";
import { VoltSDK } from "../VoltSDK";
import type {
  ExtraVoltData,
  PrincipalProtectionVaultV1,
  VoltVault,
  VoltWithNewIdlProgram,
} from "../voltTypes";
import { ConnectedVoltSDK } from "./../ConnectedVoltSDK";
import { GLOBAL_TULIP_V2_AUTHORITY } from "./constants";
import { PrincipalProtectionVoltSDK } from "./PrincipalProtectionVoltSDK";

// create typescript class that uses multiple inheritance via mixins
export interface ConnectedPrincipalProtectionVoltSDK
  extends ConnectedVoltSDK,
    PrincipalProtectionVoltSDK {}

export class ConnectedPrincipalProtectionVoltSDK {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @use(ConnectedVoltSDK, PrincipalProtectionVoltSDK) this: any;

  readonly sdk: FriktionSDK;
  readonly voltKey: PublicKey;
  readonly voltVault: VoltVault;
  readonly extraVoltData: ExtraVoltData;
  readonly principalProtectionVault: PrincipalProtectionVaultV1;

  normFactor: Decimal | undefined;

  readonly connection: Connection;
  readonly wallet: PublicKey;
  readonly daoAuthority?: PublicKey | undefined;

  constructor(
    sdk: PrincipalProtectionVoltSDK,
    connection: Connection,
    user: PublicKey,
    daoAuthority?: PublicKey | undefined
  ) {
    this.sdk = sdk.sdk;
    this.voltKey = sdk.voltKey;
    this.voltVault = sdk.voltVault;
    this.extraVoltData = sdk.extraVoltData;
    this.principalProtectionVault = sdk.principalProtectionVault;
    this.normFactor = sdk.normFactor;

    this.connection = connection;
    this.wallet = user;
    this.daoAuthority = daoAuthority;

    if (this.voltType() !== VoltType.PrincipalProtection) {
      throw new Error("Not a valid principal protection volt");
    }
  }

  async refresh(): Promise<PrincipalProtectionVoltSDK> {
    return new ConnectedPrincipalProtectionVoltSDK(
      await this.sdk.loadPrincipalProtectionVoltSDKByKey(this.voltKey),
      this.connection,
      this.wallet,
      this.daoAuthority
    );
  }

  async initTulipAccounts(): Promise<TransactionInstruction> {
    const lendingSharesPoolKey = await this.findLendingSharesPoolAddress();
    const initTulipAccountsAccounts: {
      [K in keyof Parameters<
        VoltWithNewIdlProgram["instruction"]["initTulipAccounts"]["accounts"]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      >[0]]: PublicKey | any;
    } = {
      authority: this.wallet,
      voltVault: this.voltKey,
      ppVault: this.getPrincipalProtectionVaultKey(),
      lendingSharesPool: lendingSharesPoolKey,
      depositIntoLendingAta: await this.getDepositIntoLendingAddress(),

      vaultAuthority: this.getVaultAuthority(),
      depositMint: this.getDepositMint(),
      tulipVault: this.getPrimaryVaultKey(),
      sharesMint: this.getPrimaryVaultSharesMintKey(),
      vaultProgram: this.getPrimaryVaultProgramId(),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,

      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      ...(await this.getTulipDepositTrackingAddresses()),
    };
    printAnchorAccounts(initTulipAccountsAccounts);

    return this.sdk.programs.VoltWithNewIdl.instruction.initTulipAccounts({
      accounts: initTulipAccountsAccounts,
    });
  }

  async startRound(): Promise<TransactionInstruction> {
    const startRoundStruct: Parameters<
      VoltWithNewIdlProgram["instruction"]["startRoundPrincipalProtection"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: await this.getExtraVoltDataKey(),
      ppVault: this.getPrincipalProtectionVaultKey(),
      ppContextAccounts: await this.getPrincipalProtectionContextAccounts(),
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      depositMint: this.voltVault.depositMint,
      vaultMint: this.voltVault.vaultMint,

      initializeStartRoundAccounts: await this.getInitializeStartRoundAccounts(
        this.wallet
      ),

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return this.sdk.programs.VoltWithNewIdl.instruction.startRoundPrincipalProtection(
      {
        accounts: startRoundStruct,
      }
    );
  }

  async deployLending(): Promise<TransactionInstruction> {
    const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
      this.voltKey,
      this.voltVault.roundNumber
    );

    const deployLendingAccounts: Parameters<
      VoltWithNewIdlProgram["instruction"]["deployLending"]["accounts"]
    >[0] = {
      authority: this.wallet,
      voltVault: this.voltKey,
      extraVoltData: await this.getExtraVoltDataKey(),
      ppVault: this.getPrincipalProtectionVaultKey(),
      ppContextAccounts:
        await this.getPrincipalProtectionContextExtendedAccounts(),
      vaultAuthority: this.voltVault.vaultAuthority,

      depositPool: this.voltVault.depositPool,
      depositMint: this.voltVault.depositMint,
      vaultMint: this.voltVault.vaultMint,
      depositIntoLendingAta: await this.getDepositIntoLendingAddress(),
      globalTulipV2Authority: GLOBAL_TULIP_V2_AUTHORITY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      lendingVaultUlAccount: this.getPrimaryVaultDepositQueue(),
      roundInfo: roundInfoKey,
      epochInfo: epochInfoKey,
    };
    printAnchorAccounts(deployLendingAccounts);
    return this.sdk.programs.VoltWithNewIdl.instruction.deployLending({
      accounts: deployLendingAccounts,
    });
  }
}
