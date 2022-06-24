import { Command, flags } from "@oclif/command";
import { getContractByPublicKey, initAnchor } from "../common";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import {
  getAllContracts,
  redeemOption,
  writeOption,
} from "../../../soloptions-client";
import { getOrCreateAssociatedTokenAccounts } from "@friktion-labs/friktion-utils";

export default class RedeemOption extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ ANCHOR_WALLET=~/.config/solana/id.json ./bin/run redeem --option 78QyuTmdDyQxDhYiFguLFv8PGyx6HaJModnafAxpSKM7
        `,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    option: flags.string({
      char: "o",
      description: "Option contract pubkey",
      required: true,
    }),
    num: flags.integer({
      char: "n",
      description: "number of contracts to write",
      default: 1,
    }),
    "redeemer-tokens": flags.string({
      description: "public key for token account with option tokens",
    }),
    "quote-destination": flags.string({
      description:
        "public key for token account with quote token to send funds to",
    }),
    "underlying-destination": flags.string({
      description: "public key for token account to send underlying tokens to",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(RedeemOption);
    console.log(`Write ${flags.num} options for ${flags.option}`);
    const { provider, program } = initAnchor();
    const contract = await getContractByPublicKey(program, flags.option);
    const [redeemerTokenSource, quoteDestination, underlyingDestination] =
      await getOrCreateAssociatedTokenAccounts(provider, {
        accountParams: [
          { owner: provider.wallet.publicKey, mint: contract.writerMint },
          { owner: provider.wallet.publicKey, mint: contract.quoteMint },
          { owner: provider.wallet.publicKey, mint: contract.underlyingMint },
        ],
      });

    const params = {
      redeemerTokenSource: flags["redeemer-tokens"]
        ? new PublicKey(flags["redeemer-tokens"])
        : redeemerTokenSource,
      quoteTokenDestination: flags["quote-destination"]
        ? new PublicKey(flags["quote-destination"])
        : quoteDestination,
      underlyingTokenDestination: flags["underlying-destination"]
        ? new PublicKey(flags["underlying-destination"])
        : underlyingDestination,
      amount: flags["num"],
    };
    console.log(
      `redeemer token source: ${params.redeemerTokenSource.toBase58()}`
    );
    console.log(
      `quote token destination: ${params.quoteTokenDestination.toBase58()}`
    );
    console.log(
      `underlying token destination: ${params.underlyingTokenDestination.toBase58()}`
    );
    await redeemOption(program, contract, params);
    console.log(
      chalk.green(
        `Successfully redeemed ${flags.num} options for contract ${flags.option}`
      )
    );
  }
}
