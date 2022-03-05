import type {
  ProgramAccount,
  Provider as AnchorProvider,
} from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import type { TransactionInstruction } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

import { OPTIONS_PROGRAM_IDS, OTHER_IDLS, SoloptionsSDK, VoltSDK } from ".";
import type { NetworkSpecificConstants } from "./constants";
import {
  FRIKTION_IDLS,
  FRIKTION_PROGRAM_ID,
  USE_SDK_NET_TO_GET_CONSTANTS_DEVNET,
  USE_SDK_NET_TO_GET_CONSTANTS_MAINNET,
} from "./constants";
import { checkAnchorErrorCode } from "./errorCodes";
import type { NetworkName } from "./helperTypes";
import type { ProviderLike } from "./miscUtils";
import { providerToAnchorProvider } from "./miscUtils";
import type { InertiaProgram } from "./programs/Inertia/inertiaTypes";
import type {
  SoloptionsContract,
  SoloptionsProgram,
} from "./programs/Soloptions/soloptionsTypes";
import { convertSoloptionsContractToOptionMarket } from "./programs/Soloptions/soloptionsUtils";
import type {
  OptionMarketWithKey,
  VoltProgram,
  VoltVault,
} from "./programs/Volt";

export type LegacyAnchorPrograms = {
  Volt: Program;
  Soloptions: Program;
  Inertia: Program;
};

export type FriktionPrograms = {
  Volt: VoltProgram;
  Soloptions: SoloptionsProgram;
  Inertia: InertiaProgram;
};

export type FriktionSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
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

  constructor(opts: FriktionSDKOpts) {
    const defaultedOpts = Object.assign({}, opts, DefaultFriktionSDKOpts);
    this.readonlyProvider = providerToAnchorProvider(defaultedOpts.provider);

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
      console.error("OTHER_IDLS", OTHER_IDLS);
      // this used to be a big bug
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

    this.programs = {
      Volt: Volt as unknown as VoltProgram,
      Soloptions: Soloptions as unknown as SoloptionsProgram,
      Inertia: Inertia as unknown as InertiaProgram,
    };

    this.legacyAnchorPrograms = {
      Volt: Volt,
      Soloptions: Soloptions,
      Inertia: Inertia,
    };
  }

  loadVolt(voltVault: VoltVault, voltKey: PublicKey): VoltSDK {
    return new VoltSDK(this, voltVault, voltKey);
  }

  // devnetMainnet<T>(ifDevnet: T, ifMainnet: T) {
  //   if (this.network === "mainnet-beta") {
  //     return ifMainnet;
  //   } else {
  //     return ifDevnet;
  //   }
  // }

  // Keep all network specific items in here
  /**
   * Returns constants for the current network
   */
  get net(): NetworkSpecificConstants {
    if (this.network === "mainnet-beta") {
      return USE_SDK_NET_TO_GET_CONSTANTS_MAINNET as NetworkSpecificConstants;
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

  /**
   * Please memo this.
   *
   * Automatically loads the volt for you by doing a RPC call. You may want to
   * load it yourself using sail, because loadVoltByKey doesn't have ANY
   * cacheing, so you could end up calling this 100 times.
   */
  async loadVoltByKey(voltKey: PublicKey): Promise<VoltSDK> {
    if (!voltKey) {
      throw new Error("falsy voltKey passed into loadVoltByKey");
    }
    const voltVaultData: VoltVault =
      await this.programs.Volt.account.voltVault.fetch(voltKey);

    return this.loadVolt(voltVaultData, voltKey);
  }

  async loadVoltAndExtraDataByKey(voltKey: PublicKey): Promise<VoltSDK> {
    if (!voltKey) {
      throw new Error("falsy voltKey passed into loadVoltByKey");
    }
    const voltVaultData: VoltVault =
      await this.programs.Volt.account.voltVault.fetch(voltKey);

    return this.loadVolt(voltVaultData, voltKey);
  }

  async getAllVoltVaults(): Promise<VoltSDK[]> {
    const accts =
      (await this.programs.Volt?.account?.voltVault?.all()) as unknown as ProgramAccount<VoltVault>[];

    return accts.map((acct) => {
      return this.loadVolt(acct.account, acct.publicKey);
    });
  }

  loadSoloptionsMarket(soloptionsMarket: OptionMarketWithKey): SoloptionsSDK {
    return new SoloptionsSDK(this, soloptionsMarket);
  }

  async loadSoloptionsMarketByKey(
    optionMarketKey: PublicKey
  ): Promise<SoloptionsSDK> {
    const soloptionsMarket: OptionMarketWithKey =
      await SoloptionsSDK.getOptionMarketByKey(
        this.programs.Soloptions,
        optionMarketKey
      );
    return this.loadSoloptionsMarket(soloptionsMarket);
  }

  async getAllSoloptionsMarkets(): Promise<SoloptionsSDK[]> {
    const accts =
      (await this.programs.Soloptions?.account?.optionsContract?.all()) as unknown as ProgramAccount<SoloptionsContract>[];
    return accts.map((acct) =>
      this.loadSoloptionsMarket(
        convertSoloptionsContractToOptionMarket({
          ...acct.account,
          key: acct.publicKey,
        })
      )
    );
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
