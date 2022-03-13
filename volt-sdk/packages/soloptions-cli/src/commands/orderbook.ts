import { Command, flags } from "@oclif/command";
import { getContractByPublicKey, initAnchor } from "../common";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import {
  getAllContracts,
  initializeMarket,
  loadMarketForOption,
  writeOption,
} from "../../../soloptions-client";

export default class LoadOrderbook extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ soloptions-cli create-serum-market
        `,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    "market-id": flags.string({
      char: "m",
      description: "Serum market pubkey",
      required: true,
    }),
    "serum-program-id": flags.string({
      description: "serum program public key, defaults to testnet",
      default: "5dKskCnLbJ2VNsPLt5duYU8DGfcqX5UAnmNQynQWnXvP",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(LoadOrderbook);
    const { provider, program } = initAnchor();
    const market = await loadMarketForOption(
      provider,
      new PublicKey(flags["market-id"]),
      new PublicKey(flags["serum-program-id"])
    );
    const bids = await market.loadBids(provider.connection);
    const asks = await market.loadAsks(provider.connection);
    console.log(bids);
    console.log(asks);
  }
}
