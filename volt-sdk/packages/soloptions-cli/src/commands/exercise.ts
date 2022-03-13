import { Command, flags } from "@oclif/command";
import { getContractByPublicKey, initAnchor } from "../common";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import {
  exerciseOption,
  getAllContracts,
  writeOption,
} from "../../../soloptions-client";
import { getOrCreateAssociatedTokenAccounts } from "../../../soloptions-common";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SOLOPTIONS_FEE_OWNER } from "../../../../src";

export default class ExerciseOption extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ soloptions-cli write-option
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
    "option-tokens": flags.string({
      description: "public key for token account with option tokens",
    }),
    "quote-source": flags.string({
      description: "public key for token account with quote token to pay for ",
    }),
    "underlying-destination": flags.string({
      description: "public key for token account to send underlying tokens to",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(ExerciseOption);
    console.log(`Write ${flags.num} options for ${flags.option}`);
    const { provider, program } = initAnchor();
    const contract = await getContractByPublicKey(program, flags.option);

    const [optionTokenSource, quoteSource, underlyingDestination] =
      await getOrCreateAssociatedTokenAccounts(provider, {
        accountParams: [
          { owner: provider.wallet.publicKey, mint: contract.optionMint },
          { owner: provider.wallet.publicKey, mint: contract.quoteMint },
          { owner: provider.wallet.publicKey, mint: contract.underlyingMint },
        ],
      });

    const exerciseFeeDestination = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      contract.quoteMint,
      SOLOPTIONS_FEE_OWNER
    );
    const params = {
      optionTokenSource: flags["option-tokens"]
        ? new PublicKey(flags["option-tokens"])
        : optionTokenSource,
      quoteTokenSource: flags["quote-source"]
        ? new PublicKey(flags["quote-source"])
        : quoteSource,
      underlyingTokenDestination: flags["underlying-destination"]
        ? new PublicKey(flags["underlying-destination"])
        : underlyingDestination,
      amount: flags.num,
      feeDestination: exerciseFeeDestination,
    };

    console.log(`option token source: ${params.optionTokenSource.toBase58()}`);
    console.log(`quote token source: ${params.quoteTokenSource.toBase58()}`);
    console.log(
      `underlying token destination: ${params.underlyingTokenDestination.toBase58()}`
    );
    await exerciseOption(program, contract, params);
    console.log(
      chalk.green(
        `Successfully exercised ${flags.num} options for contract ${flags.option}`
      )
    );
  }
}
