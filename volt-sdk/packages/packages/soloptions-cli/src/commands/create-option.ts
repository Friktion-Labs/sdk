import { Command, flags } from "@oclif/command";
import { newContract } from "../../../soloptions-client";
import { PublicKey } from "@solana/web3.js";
import { initAnchor } from "../common";
import parse from "date-fns/parse";
import chalk from "chalk";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { OPTIONS_PROGRAM_IDS, SOLOPTIONS_FEE_OWNER } from "../../../../src";
import { formatRelativeWithOptions } from "date-fns/fp";
import { Config, IConfig, load, Options } from "@oclif/config";
export default class CreateOption extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ ANCHOR_WALLET=~/.config/solana/id.json soloptions-cli create-option --underlying 4fuX1HYC9NakAGfkuGFY9sJuNmJViAcbYcL5HLcdhNdg --quote n9oo8ouj1vSLFz9qoDc7AW6SDcMNprUqwxUJA5BftRb --strike 5 -e 2021-11-09
        `,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    underlying: flags.string({
      char: "u",
      description: "Underlying mint pubkey",
      required: true,
    }),
    quote: flags.string({
      char: "q",
      description: "quote mint pubkey",
      required: true,
    }),
    // strike: flags.integer({
    //   char: "s",
    //   description: "strike price",
    //   required: true,
    // }),
    underlyingAmount: flags.integer({
      description: "underlying amount",
      default: 1_000_000_000,
    }),
    quoteAmount: flags.integer({
      description: "quote amount",
      default: 1_000_000_000,
    }),
    expiry: flags.integer({
      char: "e",
      description: "expiry in unix epoch timetamp",
      required: true,
    }),
    // expiry: flags.string({
    //   char: "e",
    //   description: "expiry in yyyy-mm-dd format",
    //   required: true,
    // }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(CreateOption);
    // const expiry = parse(flags.expiry, "yyyy-MM-dd", new Date());
    const expiryTs = flags.expiry;
    const { program } = initAnchor();
    console.log(`Creating an option contract for underlying asset mint ${
      flags.underlying
    }
        quote asset mint ${flags.quote} strike: ${
      flags.underlyingAmount / flags.quoteAmount
    } at expiry ts ${expiryTs}`);
    const contract = await newContract(program as any, {
      underlyingMint: new PublicKey(flags.underlying),
      quoteMint: new PublicKey(flags.quote),
      expiryTs,
      underlyingAmount: new anchor.BN(flags.underlyingAmount),
      quoteAmount: new anchor.BN(flags.quoteAmount),
      mintFeeAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(flags.underlying),
        SOLOPTIONS_FEE_OWNER
      ),
      exerciseFeeAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(flags.quote),
        SOLOPTIONS_FEE_OWNER
      ),
    });
    console.log(chalk.green(`Contract created successfully: ${contract.key}`));
  }
}

// (async () => {
//   new CreateOption(process.argv, new Config(await load(undefined))).run();
// })();
