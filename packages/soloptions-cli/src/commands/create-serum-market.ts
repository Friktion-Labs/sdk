import { Command, flags } from "@oclif/command";
import { getContractByPublicKey, initAnchor } from "../common";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import {
  getAllContracts,
  initializeMarket,
  writeOption,
} from "../../../soloptions-client";
import { getOrCreateAssociatedTokenAccounts } from "@friktion-labs/friktion-utils";

export default class CreateSerumMarket extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ soloptions-cli create-serum-market
        `,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    option: flags.string({
      char: "o",
      description: "Option contract pubkey",
      required: true,
    }),
    "dust-limit": flags.integer({
      description: "quote currency dust limit",
      default: 100,
    }),
    "lot-size": flags.integer({
      description: "quote currency lot size",
      default: 100,
    }),
    "serum-program-id": flags.string({
      description: "serum program public key, defaults to testnet",
      default: "5dKskCnLbJ2VNsPLt5duYU8DGfcqX5UAnmNQynQWnXvP",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(CreateSerumMarket);
    const { provider, program } = initAnchor();
    const contract = await getContractByPublicKey(program, flags.option);
    console.log(`contract: ${contract.key.toBase58()}`);
    // @ts-ignore
    const market = await initializeMarket(program, provider, {
      optionContract: contract.key,
      optionMint: contract.optionMint,
      quoteCurrencyMint: contract.quoteMint,
      quoteCurrencyDustLimit: new BN(flags["dust-limit"]),
      quoteCurrencyLotSize: new BN(flags["lot-size"]),
      serumProgram: new PublicKey(flags["serum-program-id"]),
    });
    console.log(chalk.green(`Created serum market ID ${market.serumMarket}`));
  }
}
