import type { ProviderLike } from "@friktion-labs/friktion-utils";
import { providerToAnchorProvider } from "@friktion-labs/friktion-utils";
import type { AnchorProvider, ProgramAccount } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

import type { NetworkSpecificConstants, OptionsProtocol } from "./constants";
import {
  FRIKTION_IDLS,
  FRIKTION_PROGRAM_ID,
  OPTIONS_PROGRAM_IDS,
  OTHER_IDLS,
  SIMPLE_SWAP_PROGRAM_ID,
  USE_SDK_NET_TO_GET_CONSTANTS_DEVNET,
  USE_SDK_NET_TO_GET_CONSTANTS_MAINNET,
  VoltType,
} from "./constants";
import { checkAnchorErrorCode } from "./errorCodes";
import { InertiaSDK } from "./programs/Inertia";
import type {
  InertiaContractWithKey,
  InertiaProgram,
} from "./programs/Inertia/inertiaTypes";
import {
  getInertiaContractByKey,
  getInertiaMarketByKey,
} from "./programs/Inertia/inertiaUtils";
import { SoloptionsSDK } from "./programs/Soloptions";
import type {
  SoloptionsContract,
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "./programs/Soloptions/soloptionsTypes";
import { getSoloptionsContractByKey } from "./programs/Soloptions/soloptionsUtils";
import { SpreadsSDK } from "./programs/Spreads";
import type {
  SpreadsContractWithKey,
  SpreadsProgram,
} from "./programs/Spreads/spreadsTypes";
import {
  convertSpreadsContractToOptionMarket,
  getSpreadsContractByKey,
} from "./programs/Spreads/spreadsUtils";
import { SwapSDK } from "./programs/Swap/SwapSDK";
import type {
  SimpleSwapOrder,
  SimpleSwapProgram,
  SimpleSwapUserOrdersWithKey,
} from "./programs/Swap/swapTypes";
import type { VoltProgram, VoltVault, Whitelist } from "./programs/Volt";
import { EntropyVoltSDK } from "./programs/Volt/EntropyVoltSDK";
import { ShortOptionsVoltSDK } from "./programs/Volt/ShortOptionsVoltSDK";
import { SimpleVoltSDK } from "./programs/Volt/SimpleVoltSDK";
import type { NetworkName } from "./programs/Volt/utils/helperTypes";
import { getFriktionSnapshot } from "./programs/Volt/utils/networkUtils";
import { VoltSDK } from "./programs/Volt/VoltSDK";
import type {
  EntropyMetadata,
  ExtraVoltData,
  GenericOptionsContractWithKey,
} from "./programs/Volt/voltTypes";

export type LegacyAnchorPrograms = {
  Volt: Program;
  Soloptions: Program;
  Inertia: Program;
};

export type FriktionPrograms = {
  Volt: VoltProgram;
  Soloptions: SoloptionsProgram;
  Inertia: InertiaProgram;
  Spreads: SpreadsProgram;
  SimpleSwap: SimpleSwapProgram;
};

export type NetOpts = {
  MM_TOKEN_MINT: PublicKey;
};

export type TestingOpts = {
  netOpts: NetOpts;
};

export type FriktionSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
  testingOpts?: TestingOpts;
};

/**
 * The API needs to be stable!!! DONT CHANGE.
 * NOTE: Adding new items is ok but under no circumstances change names of existing variables.
 */
export type VoltSnapshot = {
  // IDs / account addresses
  globalId: string;
  voltVaultId: string;
  extraVaultDataId: string;
  vaultAuthority: string;

  // mints
  quoteMint: string;
  underlyingMint: string;
  depositTokenMint: string;

  // share token
  shareTokenMint: string;
  shareTokenSymbol: string;
  shareTokenDecimals: number;

  // token prices
  shareTokenPrice: number;
  depositTokenPrice: number;

  // total value locked
  tvlUsd: number;
  tvlDepositToken: number;

  // capacities
  capacityUsd: number;
  capacityDepositToken: number;

  // pools
  depositPool: string;
  premiumPool: string;

  // serum
  spotSerumMarketId: string;

  // deposit token. The token user actually deposits into the volt
  depositTokenSymbol: string;
  depositTokenCoingeckoId: string;

  // the underlying asset used in volt 1/2 (options volts)
  underlyingTokenSymbol: string;
  underlyingTokenCoingeckoId: string;

  // volt number (as shown in the UI)
  voltType: number;

  latestEpochYield: number;
  // (percentage yield for various time periods)
  weeklyPy: number;
  monthlyPy: number;
  // without compounding
  apr: number;
  apy: number;
  apyAfterFees: number;

  // fees in basis points (0.01%)
  performanceFeeRate: number;
  withdrawalFeeRate: number;

  // does this volt have a non-weekly epoch
  abnormalEpochLength?: number;

  // is this a high voltage volt?
  isVoltage: boolean;

  // is this volt in circuits (DAO treasury management)
  isInCircuits: boolean;

  // high voltage global id
  highVoltage: string;

  // in milliseconds
  nextAutocompoundingTime: number;

  //// Strategy Details ////

  // volt 1/2
  lastTradedOption: string;
};

export type FriktionSnapshot = {
  updateTime: number;
  totalTvlUSD: number;
  coinsByCoingeckoId: Record<string, number>;
  sharePricesByGlobalId: Record<string, number>;
  pricesByCoingeckoId: Record<string, number>;
  depositTokenByGlobalId: Record<string, number>;
  usdValueByGlobalId: Record<string, number>;
  globalIdToDepositTokenCoingeckoId: Record<string, string>;
  apyByGlobalId: Record<string, number>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  allMainnetVolts: (VoltSnapshot | {})[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  allDevnetVolts: (VoltSnapshot | {})[];
};

export const DefaultFriktionSDKOpts = {
  network: "mainnet-beta",
};

/**
 * sdk is stateless and readonly unless a signer is loaded.
 */
export class FriktionSDK {
  readonly programs: FriktionPrograms;
  readonly legacyAnchorPrograms: LegacyAnchorPrograms;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;
  readonly testingOpts?: TestingOpts;
  snapshot: FriktionSnapshot | undefined;

  constructor(opts: FriktionSDKOpts) {
    const defaultedOpts = Object.assign({}, opts, DefaultFriktionSDKOpts);
    this.readonlyProvider = providerToAnchorProvider(defaultedOpts.provider);

    this.testingOpts = opts.testingOpts;

    this.network = !opts.network
      ? "mainnet-beta"
      : opts.network === "testnet" || opts.network === "localnet"
      ? "mainnet-beta"
      : opts.network;

    const voltIdl = FRIKTION_IDLS.Volt;
    if (!voltIdl) {
      console.error("FRIKTION_IDLS", FRIKTION_IDLS);
      // this used to be a big bug
      throw new Error("Unable to load FriktionSDK because idl is missing");
    }
    const soloptionsIdl = OTHER_IDLS.Soloptions;
    if (!soloptionsIdl) {
      console.error("OTHER_IDLS", OTHER_IDLS);
      // this used to be a big bug
      throw new Error(
        "Unable to load FriktionSDK because Soloptions idl is missing"
      );
    }
    const inertiaIdl = OTHER_IDLS.Inertia;
    if (!inertiaIdl) {
      throw new Error(
        "Unable to load FriktionSDK because Inertia idl is missing"
      );
    }
    const swapIdl = OTHER_IDLS.SimpleSwap;
    if (!swapIdl)
      throw new Error(
        "Unable to load FriktionSDK because SimpleSwap idl is missing"
      );

    const spreadsIdl = OTHER_IDLS.Spreads;
    if (!spreadsIdl) {
      throw new Error(
        "Unable to load FriktionSDK because Inertia idl is missing"
      );
    }

    let voltProgramIdForNetwork = null;
    if (this.network === "mainnet-beta") {
      voltProgramIdForNetwork = FRIKTION_PROGRAM_ID;
    } else if (this.network === "devnet") {
      voltProgramIdForNetwork = FRIKTION_PROGRAM_ID;
    } else {
      throw new Error(
        `Unknown network. No public key for network id ${JSON.stringify(
          this.network
        )}`
      );
    }

    const Volt = new Program(
      voltIdl,
      voltProgramIdForNetwork,
      this.readonlyProvider
    );
    const Soloptions = new Program(
      soloptionsIdl,
      OPTIONS_PROGRAM_IDS.Soloptions.toString(),
      this.readonlyProvider
    );
    const Inertia = new Program(
      inertiaIdl,
      OPTIONS_PROGRAM_IDS.Inertia.toString(),
      this.readonlyProvider
    );
    const SimpleSwap = new Program(
      swapIdl,
      SIMPLE_SWAP_PROGRAM_ID.toString(),
      this.readonlyProvider
    );

    const Spreads = new Program(
      spreadsIdl,
      OPTIONS_PROGRAM_IDS.Spreads.toString(),
      this.readonlyProvider
    );

    this.programs = {
      Volt: Volt as unknown as VoltProgram,
      Soloptions: Soloptions as unknown as SoloptionsProgram,
      Inertia: Inertia as unknown as InertiaProgram,
      SimpleSwap: SimpleSwap as unknown as SimpleSwapProgram,
      Spreads: Spreads as unknown as SpreadsProgram,
    };

    this.legacyAnchorPrograms = {
      Volt: Volt,
      Soloptions: Soloptions,
      Inertia: Inertia,
    };
  }

  // Keep all network specific items in here
  /**
   * Returns constants for the current network
   */
  get net(): NetworkSpecificConstants {
    if (this.network === "mainnet-beta") {
      return {
        ...USE_SDK_NET_TO_GET_CONSTANTS_MAINNET,
        ...(this.testingOpts?.netOpts ?? {}),
      } as NetworkSpecificConstants;
    } else {
      return USE_SDK_NET_TO_GET_CONSTANTS_DEVNET;
    }
  }

  get devnet() {
    return USE_SDK_NET_TO_GET_CONSTANTS_DEVNET;
  }

  get mainnet() {
    throw new Error("Don't do this. Use sdk.net");
  }

  async reloadSnapshot(): Promise<void> {
    this.snapshot = await getFriktionSnapshot();
  }

  setSnapshot(snapshot: FriktionSnapshot) {
    this.snapshot = snapshot;
  }

  async getSnapshot(): Promise<FriktionSnapshot> {
    if (this.snapshot === undefined) await this.reloadSnapshot();
    return this.snapshot as FriktionSnapshot;
  }

  async loadUserOrdersByKey(
    key: PublicKey
  ): Promise<SimpleSwapUserOrdersWithKey> {
    const acct = await this.programs.SimpleSwap.account.userOrders.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  async loadSwapByKey(swapOrderKey: PublicKey): Promise<SwapSDK> {
    const swapData: SimpleSwapOrder =
      await this.programs.SimpleSwap.account.swapOrder.fetch(swapOrderKey);

    return new SwapSDK(swapData, swapOrderKey, {
      provider: this.readonlyProvider,
      network: this.network,
    });
  }

  loadSimpleVoltSDK(
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData?: ExtraVoltData
  ): SimpleVoltSDK {
    return new SimpleVoltSDK(this, voltKey, voltVault, extraVoltData);
  }

  loadShortOptionsVoltSDK(
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData?: ExtraVoltData
  ): ShortOptionsVoltSDK {
    return new ShortOptionsVoltSDK(this, voltKey, voltVault, {
      extraVoltData,
    });
  }

  loadEntropyVoltSDK(
    voltKey: PublicKey,
    voltVault: VoltVault,
    extraVoltData: ExtraVoltData,
    entropyMetadata: EntropyMetadata
  ): EntropyVoltSDK {
    return new EntropyVoltSDK(
      this,
      voltKey,
      voltVault,
      extraVoltData,
      entropyMetadata
    );
  }

  async loadEntropyVoltSDKByKey(
    key: PublicKey,
    voltVault?: VoltVault | undefined,
    extraVoltData?: ExtraVoltData | undefined,
    loadExtraVoltData = false,
    entropyMetadata?: EntropyMetadata | undefined
  ): Promise<EntropyVoltSDK> {
    const sdk = await this.loadVoltSDKByKey(
      key,
      voltVault,
      extraVoltData,
      loadExtraVoltData,
      entropyMetadata
    );
    if (!(sdk instanceof EntropyVoltSDK)) {
      throw new Error(
        `Volt key ${key.toString()} is not an entropy volt. Got ${sdk.voltType()}`
      );
    }
    return sdk;
  }
  async loadShortOptionsVoltSDKByKey(
    key: PublicKey,
    voltVault?: VoltVault | undefined,
    extraVoltData?: ExtraVoltData | undefined,
    loadExtraVoltData = false
  ): Promise<ShortOptionsVoltSDK> {
    const sdk = await this.loadVoltSDKByKey(
      key,
      voltVault,
      extraVoltData,
      loadExtraVoltData
    );
    if (!(sdk instanceof ShortOptionsVoltSDK)) {
      throw new Error(
        `Volt key ${key.toString()} is not a short options volt. Got ${sdk.voltType()}`
      );
    }
    return sdk;
  }

  async loadVoltSDKWithExtraDataByKey(voltKey: PublicKey): Promise<VoltSDK> {
    const sdk = await this.loadVoltSDKByKey(
      voltKey,
      undefined,
      undefined,
      true
    );
    return sdk;
  }

  /**
   * Please memo this.
   *
   * Automatically loads the volt for you by doing a RPC call. You may want to
   * load it yourself using sail, because loadVoltByKey doesn't have ANY
   * caching, so you could end up calling this 100 times.
   */
  async loadVoltSDKByKey(
    voltKey: PublicKey,
    voltVault?: VoltVault | undefined,
    extraVoltData?: ExtraVoltData | undefined,
    loadExtraVoltData = false,
    entropyMetadata?: EntropyMetadata | undefined,
    forceIgnoreEntropyMetadata = false
  ): Promise<VoltSDK> {
    if (!voltKey) {
      throw new Error("falsy voltKey passed into loadVoltByKey");
    }

    if (voltVault === undefined) {
      voltVault = await this.programs.Volt.account.voltVault.fetch(voltKey);
    }

    const voltType = VoltSDK.voltTypeFromRaw(voltVault);

    const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(voltKey);

    if (voltType === VoltType.ShortOptions) {
      if (loadExtraVoltData) {
        extraVoltData = await this.programs.Volt.account.extraVoltData.fetch(
          extraVoltKey
        );
      }
      return this.loadShortOptionsVoltSDK(voltKey, voltVault, extraVoltData);
    } else if (voltType === VoltType.Entropy) {
      if (extraVoltData === undefined) {
        extraVoltData = await this.programs.Volt.account.extraVoltData.fetch(
          extraVoltKey
        );
      }

      if (entropyMetadata === undefined) {
        if (forceIgnoreEntropyMetadata) {
          entropyMetadata = entropyMetadata as unknown as EntropyMetadata;
        } else {
          const [entropyMetadataKey] =
            await EntropyVoltSDK.findEntropyMetadataAddress(voltKey);

          entropyMetadata =
            await this.programs.Volt.account.entropyMetadata.fetch(
              entropyMetadataKey
            );
        }
      }

      return this.loadEntropyVoltSDK(
        voltKey,
        voltVault,
        extraVoltData,
        entropyMetadata
      );
    } else {
      throw new Error("Volt SDK of unknown type");
    }
  }

  async getAllVoltVaults(loadExtravoltData = false): Promise<VoltSDK[]> {
    const accts =
      (await this.programs.Volt?.account?.voltVault?.all()) as unknown as ProgramAccount<VoltVault>[];

    return await Promise.all(
      accts.map(async (acct) => {
        return await this.loadVoltSDKByKey(
          acct.publicKey,
          acct.account,
          undefined,
          loadExtravoltData
        );
      })
    );
  }

  async getAllVoltVaultsWithExtraVoltData(): Promise<VoltSDK[]> {
    return this.getAllVoltVaults(true);
  }

  async getOptionsProtocolForKey(key: PublicKey): Promise<OptionsProtocol> {
    const accountInfo = await this.readonlyProvider.connection.getAccountInfo(
      key
    );
    if (!accountInfo) {
      throw new Error(
        "account does not exist, can't determine options protocol owner"
      );
    }

    if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Inertia.toString()
    ) {
      return "Inertia";
    } else if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Soloptions.toString()
    ) {
      return "Soloptions";
    } else if (
      accountInfo.owner.toString() === OPTIONS_PROGRAM_IDS.Spreads.toString()
    ) {
      return "Spreads";
    } else {
      throw new Error("owner is not a supported options protocol");
    }
  }

  async getOptionMarketByKey(
    key: PublicKey,
    optionsProtocol?: OptionsProtocol
  ): Promise<GenericOptionsContractWithKey> {
    if (!optionsProtocol) {
      optionsProtocol = await this.getOptionsProtocolForKey(key);
    }
    let optionMarket: GenericOptionsContractWithKey | null;
    if (optionsProtocol === "Inertia") {
      optionMarket = await getInertiaMarketByKey(this.programs.Inertia, key);
    } else if (optionsProtocol === "Soloptions") {
      optionMarket = await SoloptionsSDK.getOptionMarketByKey(
        this.programs.Soloptions,
        key
      );
    } else if (optionsProtocol === "Spreads") {
      optionMarket = convertSpreadsContractToOptionMarket(
        await SpreadsSDK.getSpreadsContractByKey(this.programs.Spreads, key)
      );
    } else {
      throw new Error("options protocol not supported");
    }

    if (!optionMarket) {
      throw new Error("option market does not exist");
    }

    return optionMarket;
  }

  async loadOptionsSDKByKey(
    key: PublicKey
  ): Promise<SoloptionsSDK | InertiaSDK | SpreadsSDK> {
    const optionMarket = await this.getOptionMarketByKey(key);
    const rawContractWithKey = {
      key: optionMarket.key,
      ...optionMarket.rawContract,
    };
    const protocol = optionMarket.protocol;

    if (protocol === "Inertia") {
      return new InertiaSDK(rawContractWithKey as InertiaContractWithKey, {
        provider: this.readonlyProvider,
      });
    } else if (protocol === "Soloptions") {
      return this.loadSoloptionsSDK(
        rawContractWithKey as SoloptionsContractWithKey
      );
    } else if (protocol === "Spreads") {
      return new SpreadsSDK(rawContractWithKey as SpreadsContractWithKey, {
        provider: this.readonlyProvider,
      });
    } else {
      throw new Error("option markets protocol not supported");
    }
  }

  loadSpreadsSDK(spreadsContract: SpreadsContractWithKey): SpreadsSDK {
    return new SpreadsSDK(spreadsContract, {
      provider: this.readonlyProvider,
      network: this.network,
    });
  }

  async loadSpreadsSDKBykey(
    spreadsContractKey: PublicKey
  ): Promise<SpreadsSDK> {
    const spreadsContract: SpreadsContractWithKey = {
      ...(await getSpreadsContractByKey(
        this.programs.Spreads,
        spreadsContractKey
      )),
      key: spreadsContractKey,
    };
    return this.loadSpreadsSDK(spreadsContract);
  }

  loadInertiaSDK(inertiaContract: InertiaContractWithKey): InertiaSDK {
    return new InertiaSDK(inertiaContract, {
      provider: this.readonlyProvider,
      network: this.network,
    });
  }

  async loadInertiaSDKByKey(optionContractKey: PublicKey): Promise<InertiaSDK> {
    const inertiaContract: InertiaContractWithKey = {
      ...(await getInertiaContractByKey(
        this.programs.Inertia,
        optionContractKey
      )),
      key: optionContractKey,
    };
    return this.loadInertiaSDK(inertiaContract);
  }

  loadSoloptionsSDK(
    soloptionsContract: SoloptionsContractWithKey
  ): SoloptionsSDK {
    return new SoloptionsSDK(this, soloptionsContract);
  }

  async loadSoloptionsSDKByKey(
    optionMarketKey: PublicKey
  ): Promise<SoloptionsSDK> {
    const soloptionsContract: SoloptionsContractWithKey = {
      ...(await getSoloptionsContractByKey(
        this.programs.Soloptions,
        optionMarketKey
      )),
      key: optionMarketKey,
    };
    return this.loadSoloptionsSDK(soloptionsContract);
  }

  async getAllSoloptionsSDKs(): Promise<SoloptionsSDK[]> {
    const accts =
      (await this.programs.Soloptions?.account?.optionsContract?.all()) as unknown as ProgramAccount<SoloptionsContract>[];
    return accts.map((acct) =>
      this.loadSoloptionsSDK({
        ...acct.account,
        key: acct.publicKey,
      })
    );
  }

  async getWhitelist(key: PublicKey): Promise<Whitelist> {
    const whitelist: Whitelist =
      await this.programs.Volt.account.whitelist.fetch(key);
    return whitelist;
  }

  async initWhitelist(
    user: PublicKey,
    seed?: PublicKey
  ): Promise<{
    instruction: TransactionInstruction;
    whitelistKey: PublicKey;
  }> {
    const textEncoder = new TextEncoder();

    // If desired, change the SDK to allow custom seed
    if (!seed) seed = new Keypair().publicKey;

    const [whitelistKey, _whitelistBump] = await PublicKey.findProgramAddress(
      [seed.toBuffer(), textEncoder.encode("whitelist")],
      this.programs.Volt.programId
    );

    const initWhitelistAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["initWhitelist"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: user,

      seed: seed,

      whitelist: whitelistKey,

      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    };

    const instruction = this.programs.Volt.instruction.initWhitelist({
      accounts: initWhitelistAccounts,
    });

    return {
      instruction: instruction,
      whitelistKey: whitelistKey,
    };
  }

  addWhitelist(
    user: PublicKey,
    whitelistKey: PublicKey,
    keyToAdd: PublicKey
  ): TransactionInstruction {
    const addWhitelistAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["addWhitelist"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: user,

      whitelist: whitelistKey,

      accountToAdd: keyToAdd,

      systemProgram: SystemProgram.programId,
    };

    const instruction = this.programs.Volt.instruction.addWhitelist({
      accounts: addWhitelistAccounts,
    });

    return instruction;
  }

  removeWhitelist(
    user: PublicKey,
    whitelistKey: PublicKey,
    keyToRemove: PublicKey
  ): TransactionInstruction {
    const removeWhitelistAccounts: {
      [K in keyof Parameters<
        VoltProgram["instruction"]["removeWhitelist"]["accounts"]
      >[0]]: PublicKey;
    } = {
      authority: user,

      whitelist: whitelistKey,

      accountToRemove: keyToRemove,

      systemProgram: SystemProgram.programId,
    };

    const instruction = this.programs.Volt.instruction.removeWhitelist({
      accounts: removeWhitelistAccounts,
    });

    return instruction;
  }

  /**
   * Parses Solana transaction logs and searches for error codes. Searches through
   * the IDL and also through the Anchor error codes.
   *
   * TODO: Solana program error  codes
   *
   * Example log:
   * const logs = [
   *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb invoke [1]",
   *   "Program log: blah blah",
   *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb consumed 85219 of 200000 compute units",
   *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb failed: custom program error: 0x137",
   * ];
   *
   * Example output: Program error in "foobar": some human readable error message from the idl (eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb 0x137 = 311)
   */
  static parseError(logs: string[]): {
    fullMessage: string;
    mainMessage: string;
    extraDetails: string;
  } | null {
    for (const log of logs) {
      const customProgramErrorMatch = log.match(
        /Program ([a-zA-Z0-9]{43,44}) failed: custom program error: (0x[0-9a-z]*)/
      );
      if (
        customProgramErrorMatch &&
        customProgramErrorMatch[1] &&
        customProgramErrorMatch[2]
      ) {
        const programId = customProgramErrorMatch[1];
        const errorCodeHex = customProgramErrorMatch[2];
        const errorCodeDec = Number(errorCodeHex);

        const anchorErrorMessage = checkAnchorErrorCode(errorCodeDec);
        if (anchorErrorMessage) {
          const idl = FRIKTION_IDLS[programId];
          const prefix = idl
            ? `Program error in "${idl.name}`
            : `Program error in unknown program`;

          const mainMessage = `${prefix}: ${anchorErrorMessage}`;
          const extraDetails = `${programId} error code ${errorCodeHex} = ${errorCodeDec}`;
          return {
            fullMessage: `${mainMessage} (${extraDetails})`,
            mainMessage,
            extraDetails,
          };
        }
        const idl = FRIKTION_IDLS["Volt"]; // VOLT2: Support multiple volts
        if (idl && idl.errors) {
          for (const error of idl.errors) {
            if (error.code === errorCodeDec && error.msg) {
              const mainMessage = `Program error in "${idl.name}": ${error.msg}`;
              const extraDetails = `${programId} erred with ${errorCodeHex} = ${errorCodeDec}`;
              return {
                fullMessage: `${mainMessage} (${extraDetails})`,
                mainMessage,
                extraDetails,
              };
            }
          }
        }
      }
    }
    return null;
  }
}
