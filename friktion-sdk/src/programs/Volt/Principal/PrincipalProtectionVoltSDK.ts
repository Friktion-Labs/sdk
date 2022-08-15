import type { Accounts, Address } from "@friktion-labs/anchor";
import {
  getAccountBalanceOrZeroStruct,
  printAnchorAccounts,
} from "@friktion-labs/friktion-utils";
import * as serumAssoToken from "@project-serum/associated-token";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { AccountMeta, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";

import {
  FRIKTION_PROGRAM_ID,
  VoltStrategy,
  VoltType,
} from "../../../constants";
import type { FriktionSDK } from "../../../FriktionSDK";
import { OrderTypeValues, SelfTradeBehaviorValues } from "../utils";
import type { PrincipalProtectionArgs } from "../voltArgs";
import { VoltSDK } from "../VoltSDK";
import type {
  ExtraVoltData,
  OptionsContractKeys,
  PrimaryVault,
  PrincipalProtectionContextAccounts,
  PrincipalProtectionContextExtendedAccounts,
  PrincipalProtectionVaultV1,
  VoltVault,
  VoltWithNewIdlProgram,
} from "../voltTypes";
import { TULIP_V2_VAULTS_PROGRAM_ID } from "./constants";
import {
  deriveTrackingAddress,
  deriveTrackingPdaAddress,
  deriveTrackingQueueAddress,
} from "./tulip/helpers";

// export type PrincipalProtectionVoltSDKParams = {
//   extraVoltData?: ExtraVoltData | undefined;
export const LendingStrategyValues = {
  TulipOptimizer: {
    tulipOptimizer: {
      params: {
        maxAllowedUtilizationBps: new BN(9000),
      },
    },
  },
};
export const SecondLegAllocationStrategyValues = {
  MinApr: {
    minApr: {
      apr: new BN(200),
    },
  },
  ProjectedPnlFraction: {
    projectedPnlFraction: {
      fractionBps: new BN(5000),
    },
  },
  FixedFraction: {
    fixedFraction: {
      fractionBps: new BN(20),
    },
  },
};

export enum LendingProtocol {
  // Solend,
  // MangoV3,
  // Tulip,
  TulipOptimizer,
}

export type TulipDepositTrackingAddresses = {
  depositTrackingAccount: PublicKey;
  depositTrackingQueue: PublicKey;
  depositTrackingHold: PublicKey;
  depositTrackingPda: PublicKey;
};

export type TulipBaseVault = {
  vault: PublicKey;
  vaultPda: PublicKey;
  sharesMint: PublicKey;
  depositQueue: PublicKey;
};

export type TulipParentOptimizerVault = TulipBaseVault & {
  mangoVaultSharesAccount: PublicKey;
  solendVaultSharesAccount: PublicKey;
  tulipVaultSharesAccount: PublicKey;
  withdrawQueue: PublicKey;
};

export type TulipSubVault = TulipBaseVault & {
  platformInformation: PublicKey;
  platformConfigDataAccount: PublicKey;
};

export type TulipSubVaultMango = TulipSubVault & {
  mangoGroup: PublicKey;
  mangoAccount: PublicKey;
  mangoCache: PublicKey;
  mangoRootBank: PublicKey;
  mangoNodeBank: PublicKey;
  mangoGroupSigner: PublicKey;
  tokenAccountForDeposits: PublicKey;
  programId: PublicKey;
};

export type TulipSubVaultSolend = TulipSubVault & {
  reserveAccount: PublicKey;
  reserveLiquiditySupply: PublicKey;
  reserveCollateralMint: PublicKey;
  lendingMarketAccount: PublicKey;
  lendingMarketAuthority: PublicKey;
  reservePythPriceAccount: PublicKey;
  reserveSwitchboardPriceAccount: PublicKey;
  tokenAccountForCollateral: PublicKey;
  programId: PublicKey;
};

export type TulipSubVaultTulip = TulipSubVault & {
  reserveAccount: PublicKey;
  reserveLiquiditySupply: PublicKey;
  reserveCollateralMint: PublicKey;
  lendingMarketAccount: PublicKey;
  lendingMarketAuthority: PublicKey;
  reservePythPriceAccount: PublicKey;
  tokenAccountForCollateral: PublicKey;
  programId: PublicKey;
};

export type TulipOptimizerConfig = {
  tulipAccounts: {
    underlyingMint: PublicKey;
    programId: PublicKey;
    optimizerVault: TulipParentOptimizerVault;
    mangoVault: TulipSubVaultMango;
    solendVault: TulipSubVaultSolend;
    tulipLendingVault: TulipSubVaultTulip;
  };
};

// left out solend collateral token account and tulip collateral token account

export type LendingConfig = {
  protocol: LendingProtocol;
  // add | for additional config types
  protocolConfig: TulipOptimizerConfig;
};

// export type PrincipalProtectionContextAccounts = {
//   voltVault: PublicKey;
//   ppVault: PublicKey;
//   depositTrackingAccount: PublicKey;
//   lendingVault: PublicKey;
//   lendingVaultProgram: PublicKey;
//   optionTokenPool: PublicKey;
// };

// SUPER DUPER IMPORTANT NOTE: cannot allow any imports from "./" inside this file since it will import ConnectedShortOptionsVoltSDK and make you cry
export class PrincipalProtectionVoltSDK extends VoltSDK {
  override extraVoltData: ExtraVoltData;

  constructor(
    sdk: FriktionSDK,
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData: ExtraVoltData,
    readonly principalProtectionVault: PrincipalProtectionVaultV1 // params?: PrincipalProtectionVoltSDKParams
  ) {
    super(sdk, voltKey, voltVault, extraVoltData);
    this.extraVoltData = extraVoltData;
    if (this.voltType() !== VoltType.PrincipalProtection) {
      throw new Error("Not a valid PP volt");
    }
  }

  getHeadlineMint(): PublicKey {
    return this.voltVault.depositMint;
  }
  printHighLevelStats(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  printStrategyParams(): void {
    throw new Error("Method not implemented.");
  }
  printPositionStats(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  printAuctionDetails(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  printStateMachine(): void {
    throw new Error("Method not implemented.");
  }
  voltStrategy(): VoltStrategy {
    return VoltStrategy.ProtectionAndPuts;
  }

  specificVoltName(): Promise<string> {
    return new Promise(
      () =>
        "principal protection vault (lending details) (option market details)"
    );
  }

  async getPrimaryStrategyTvlWithNormFactor(
    normFactor: Decimal
  ): Promise<Decimal> {
    const res: {
      balance: BN;
    } = await getAccountBalanceOrZeroStruct(
      this.sdk.readonlyProvider.connection,
      this.voltVault.depositPool
    );
    // throw new Error("Method not implemented.");
    return new Decimal(res.balance.toString()).div(normFactor);
  }

  estimateCurrentPerformanceAsPercentage(): Promise<Decimal> {
    return new Promise(() => new Decimal(0.0));
  }

  getPrincipalProtectionVaultKey(): PublicKey {
    return PrincipalProtectionVoltSDK.findPrincipalProtectionVaultAddress(
      this.voltKey
    )[0];
  }

  getPrimaryVault(): PrimaryVault {
    return this.principalProtectionVault.keys.lendingKeys.primaryVault;
  }

  getOptionsContractKeys(): OptionsContractKeys {
    return this.principalProtectionVault.keys.optionsKeys;
  }

  getPrimaryVaultKey(): PublicKey {
    return this.getPrimaryVault().vault;
  }

  getOptionTokenPoolKey(): PublicKey {
    return this.getOptionsContractKeys().optionTokenPool;
  }

  getLendingSharesPoolKey(): PublicKey {
    return this.principalProtectionVault.keys.lendingSharesPool;
  }

  getPrimaryVaultPda(): PublicKey {
    return this.getPrimaryVault().vaultPda;
  }

  getPrimaryVaultDepositQueue(): PublicKey {
    return this.getPrimaryVault().underlyingDepositQueue;
  }

  getPrimaryVaultWithdrawQueue(): PublicKey {
    return this.getPrimaryVault().underlyingWithdrawQueue;
  }

  getPrimaryVaultSharesMintKey(): PublicKey {
    return this.getPrimaryVault().sharesMint;
  }

  getPrimaryVaultProgramId(): PublicKey {
    return this.getPrimaryVault().programId;
  }

  // // NOTE: only works for multi deposit optimizer vaults (v2)
  // static async findTulipDepositTrackingAccountAddress(
  //   voltKey: PublicKey,
  //   tulipVault: PublicKey
  // ): Promise<[PublicKey, number]> {
  //   return deriveTrackingAddress(
  //     TULIP_V2_VAULTS_PROGRAM_ID,
  //     tulipVault,
  //     (await VoltSDK.findVaultAuthorityAddress(voltKey))[0]
  //   );
  // }

  async findLendingSharesPoolAddress(): Promise<PublicKey> {
    return await getAssociatedTokenAddress(
      this.getPrimaryVaultSharesMintKey(),
      this.getVaultAuthority(),
      true
    );
  }

  async getDepositIntoLendingAddress(): Promise<PublicKey> {
    return await getAssociatedTokenAddress(
      this.getDepositMint(),
      this.getVaultAuthority(),
      true
    );
  }

  async getTulipDepositTrackingAddresses(): Promise<TulipDepositTrackingAddresses> {
    return await PrincipalProtectionVoltSDK.findTulipDepositTrackingAddresses(
      this.getVaultAuthority(),
      this.getPrimaryVaultKey(),
      this.getPrimaryVaultSharesMintKey()
    );
  }

  static async findTulipDepositTrackingAddresses(
    authority: PublicKey,
    tulipVault: PublicKey,
    sharesMint: PublicKey
  ): Promise<TulipDepositTrackingAddresses> {
    const depositTrackingAccountKey = (
      await PrincipalProtectionVoltSDK.findTulipDepositTrackingAccountAddress(
        authority,
        tulipVault
      )
    )[0];
    const depositTrackingPdaKey = (
      await deriveTrackingPdaAddress(
        TULIP_V2_VAULTS_PROGRAM_ID,
        depositTrackingAccountKey
      )
    )[0];
    const depositTrackingHoldKey =
      await serumAssoToken.getAssociatedTokenAddress(
        depositTrackingPdaKey,
        sharesMint
      );
    return {
      depositTrackingAccount: depositTrackingAccountKey,
      depositTrackingQueue: (
        await deriveTrackingQueueAddress(
          TULIP_V2_VAULTS_PROGRAM_ID,
          depositTrackingPdaKey
        )
      )[0],
      depositTrackingPda: depositTrackingPdaKey,
      depositTrackingHold: depositTrackingHoldKey,
    };
  }

  // // async getDepositTrackingAddress

  static async findTulipDepositTrackingAccountAddress(
    authority: PublicKey,
    tulipVault: PublicKey
  ): Promise<[PublicKey, number]> {
    return deriveTrackingAddress(
      TULIP_V2_VAULTS_PROGRAM_ID,
      tulipVault,
      authority
    );
  }

  /**
   * For an admin to create a volt
   *
   * spotMarket and seed are dynamically generated. Change the code if you want custom.
   */
  static async getInitializeVoltInstruction({
    sdk,
    args,
  }: {
    sdk: FriktionSDK;
    args: PrincipalProtectionArgs;
  }): Promise<{
    instruction: TransactionInstruction;
    voltKey: PublicKey;
  }> {
    const {
      vault,
      vaultAuthorityBump,
      extraVoltKey,
      vaultAuthority,
      vaultMint,
      depositPoolKey,
      whitelistTokenAccountKey,
      principalProtectionVaultKey,
      auctionMetadataKey,
    } = await PrincipalProtectionVoltSDK.findInitializeAddresses(
      sdk,
      args.baseArgs.vaultName
    );
    const [quoteAssetPoolKey] = await VoltSDK.findQuoteAssetPoolAddress(
      vault,
      sdk.programs.Volt.programId
    );

    const [permissionedMarketPremiumPoolKey] =
      await VoltSDK.findPermissionedMarketPremiumPoolAddress(
        vault,
        sdk.programs.Volt.programId
      );

    let instruction: TransactionInstruction;
    const config = args.lendingConfig.protocolConfig;

    if (args.lendingConfig.protocol === LendingProtocol.TulipOptimizer) {
      const {
        depositTrackingAccount: depositTrackingAccountKey,
        depositTrackingQueue: depositTrackingQueueKey,
        depositTrackingPda: depositTrackingPdaKey,
        depositTrackingHold: depositTrackingHoldKey,
      } = await PrincipalProtectionVoltSDK.findTulipDepositTrackingAddresses(
        vaultAuthority,
        config.tulipAccounts.optimizerVault.vault,
        config.tulipAccounts.optimizerVault.sharesMint
      );

      console.log("args =", args);
      console.log("deposit tracking keys = ", {
        depositTrackingAccountKey,
        depositTrackingQueueKey,
        depositTrackingPdaKey,
        depositTrackingHoldKey,
      });

      const initializePrincipalProtectionAccounts: Parameters<
        VoltWithNewIdlProgram["instruction"]["initializePrincipalProtection"]["accounts"]
      >[0] = {
        voltVault: vault,
        principalProtectionVault: principalProtectionVaultKey,
        initializeAccounts: {
          initializeBaseAccounts: {
            authority: args.baseArgs.adminKey,
            adminKey: args.baseArgs.adminKey,
            voltVault: vault,
            vaultAuthority: vaultAuthority,
            vaultMint: vaultMint,

            extraVoltData: extraVoltKey,

            depositMint: args.baseArgs.depositMint,

            depositPool: depositPoolKey,

            whitelistTokenAccount: whitelistTokenAccountKey,
            whitelistTokenMint: sdk.net.MM_TOKEN_MINT,

            dexProgram: sdk.net.SERUM_DEX_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },

          quoteAssetMint: args.dovArgs.quoteAssetMint,
          quoteAssetPool: quoteAssetPoolKey,

          permissionedMarketPremiumMint:
            args.dovArgs.permissionedMarketPremiumMint,
          permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,

          auctionMetadata: auctionMetadataKey,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },

        tulipAccounts: {
          // tulip vault
          vault: config.tulipAccounts.optimizerVault.vault,
          sharesMint: config.tulipAccounts.optimizerVault.sharesMint,
        },
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      };

      const completeArgs = {
        baseArgs: {
          vaultName: args.baseArgs.vaultName,
          capacity: args.baseArgs.capacity,
          individualCapacity: args.baseArgs.individualCapacity,
          bumps: {
            vaultAuthorityBump,
          },
        } as never,
        dovArgs: {
          serumArgs: {
            serumOrderSize: new BN(1),
            serumOrderType: OrderTypeValues.ImmediateOrCancel,
            serumSelfTradeBehavior: SelfTradeBehaviorValues.AbortTransaction,
          },
          optionsArgs: {
            expirationInterval: args.dovArgs.optionsArgs.expirationInterval,
            underlyingAmountPerContract:
              args.dovArgs.optionsArgs.underlyingAmountPerContract,
            optionType: args.dovArgs.optionsArgs.optionType,
            participantType: args.dovArgs.optionsArgs.participantType,
          },
          permissionlessAuctions: args.dovArgs.permissionlessAuctions
            ? new BN(1)
            : new BN(0),
        } as never,
        allocationStrategy:
          SecondLegAllocationStrategyValues.ProjectedPnlFraction,
        lendingStrategy: LendingStrategyValues.TulipOptimizer,
      };

      console.log("initialize accounts");
      printAnchorAccounts(initializePrincipalProtectionAccounts);

      instruction =
        sdk.programs.VoltWithNewIdl.instruction.initializePrincipalProtection(
          completeArgs as never,
          {
            accounts: initializePrincipalProtectionAccounts,
          }
        );
    } else {
      throw new Error("unsupported lending protocol");
    }

    return {
      instruction,
      voltKey: vault,
    };
  }

  static async findInitializeAddresses(
    sdk: FriktionSDK,
    pdaStr: string
  ): Promise<{
    vault: PublicKey;
    vaultBump: number;
    vaultAuthorityBump: number;
    extraVoltKey: PublicKey;
    vaultMint: PublicKey;
    vaultAuthority: PublicKey;
    depositPoolKey: PublicKey;
    principalProtectionVaultKey: PublicKey;
    whitelistTokenAccountKey: PublicKey;
    auctionMetadataKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();

    const [vault, vaultBump] = await PublicKey.findProgramAddress(
      [
        new BN(VoltType.PrincipalProtection).toArrayLike(Buffer, "le", 8),
        textEncoder.encode(pdaStr),
        textEncoder.encode("vault"),
      ],
      sdk.programs.Volt.programId
    );

    const {
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      vaultAuthorityBump,
      whitelistTokenAccountKey,
    } = await VoltSDK.findSharedInitializeAddresses(sdk, vault);

    const [auctionMetadataKey] = await VoltSDK.findAuctionMetadataAddress(
      vault
    );
    const [principalProtectionVaultKey] =
      PrincipalProtectionVoltSDK.findPrincipalProtectionVaultAddress(vault);

    return {
      vault,
      vaultBump,
      vaultAuthorityBump,
      extraVoltKey,
      vaultMint,
      vaultAuthority,
      depositPoolKey,
      principalProtectionVaultKey,
      whitelistTokenAccountKey,
      auctionMetadataKey,
    };
  }

  static findPrincipalProtectionVaultAddress(
    voltKey: PublicKey
  ): [PublicKey, number] {
    const textEncoder = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [voltKey.toBuffer(), textEncoder.encode("protectionVault")],
      FRIKTION_PROGRAM_ID
    );
  }

  async getPrincipalProtectionContextExtendedAccounts(): Promise<PrincipalProtectionContextExtendedAccounts> {
    const {
      depositTrackingAccount: depositTrackingAccountKey,
      depositTrackingPda: depositTrackingPdaKey,
    } = await this.getTulipDepositTrackingAddresses();
    return {
      voltVault: this.voltKey,
      ppVault: this.getPrincipalProtectionVaultKey(),
      depositTrackingAccount: depositTrackingAccountKey,
      depositTrackingPda: depositTrackingPdaKey,
      sharesMint: this.getPrimaryVaultSharesMintKey(),
      lendingSharesPool: this.getLendingSharesPoolKey(),
      lendingVault: this.getPrimaryVaultKey(),
      lendingVaultPda: this.getPrimaryVaultPda(),
      lendingVaultProgram: this.getPrimaryVaultProgramId(),
      optionTokenPool: this.getOptionTokenPoolKey(),
    };
  }

  async getPrincipalProtectionContextAccounts(): Promise<PrincipalProtectionContextAccounts> {
    const extendedAccts =
      (await this.getPrincipalProtectionContextExtendedAccounts()) as Accounts;
    return {
      voltVault: extendedAccts.voltVault as Address,
      ppVault: extendedAccts.ppVault as Address,
      depositTrackingAccount: extendedAccts.depositTrackingAccount as Address,
      lendingSharesPool: extendedAccts.lendingSharesPool as Address,
      lendingVault: extendedAccts.lendingVault as Address,
      lendingVaultProgram: extendedAccts.lendingVaultProgram as Address,
    };
  }

  async getPrincipalProtectionContextAccountsAsRemaining(): Promise<
    AccountMeta[]
  > {
    const accts =
      (await this.getPrincipalProtectionContextAccounts()) as Accounts;
    console.log(typeof accts);
    return [
      {
        pubkey: accts.voltVault as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.ppVault as PublicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: accts.depositTrackingAccount as PublicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: accts.lendingSharesPool as PublicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: accts.lendingVault as PublicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: accts.lendingVaultProgram as PublicKey,
        isSigner: false,
        isWritable: false,
      },
    ];
  }
}
