import { Command, flags } from "@oclif/command";
import { getContractByPublicKey, initAnchor } from "../common";
import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccounts } from "../../../soloptions-common";
import { writeOption } from "../../../soloptions-client";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SOLOPTIONS_FEE_OWNER } from "../../../../src";

export default class WriteOption extends Command {
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
    "funding-tokens": flags.string({
      description: "public key for token account with underlying tokens",
      required: true,
    }),
    "writer-destination": flags.string({
      description: "public key for token account to send writer tokens to",
    }),
    "option-destination": flags.string({
      description: "public key for token account to send option tokens to",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(WriteOption);
    console.log(`Write ${flags.num} options for ${flags.option}`);
    const { provider, program } = initAnchor();
    const contract = await getContractByPublicKey(program, flags.option);
    const [writerTokenDestination, optionTokenDestination] =
      await getOrCreateAssociatedTokenAccounts(provider, {
        accountParams: [
          { owner: provider.wallet.publicKey, mint: contract.writerMint },
          { owner: provider.wallet.publicKey, mint: contract.optionMint },
        ],
      });

    const mintFeeDestination = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      contract.underlyingMint,
      SOLOPTIONS_FEE_OWNER
    );
    const tx = await writeOption(program, contract, {
      writerUnderlyingFundingTokens: new PublicKey(flags["funding-tokens"]),
      amount: flags.num,
      writerTokenDestination,
      optionTokenDestination,
      feeDestination: mintFeeDestination,
    });
    console.log(
      `writer token destination: ${writerTokenDestination.toBase58()}`
    );
    console.log(
      `option token destination: ${optionTokenDestination.toBase58()}`
    );
    console.log(`txid: ${tx}`);
    console.log(chalk.green(`successfully wrote ${flags.num} contract(s)`));
  }
}
