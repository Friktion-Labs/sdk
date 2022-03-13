import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import { getAllContracts } from "../../../soloptions-client";
import { initAnchor } from "../common";
import { differenceInDays, format, isSameDay, parse } from "date-fns";
import { SoloptionsContractWithKey } from "../../../../src/programs/soloptionsTypes";

export default class ListOptions extends Command {
  static description = "Create an option contract";

  static examples = [
    `$ soloptions-cli list

`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    underlying: flags.string({
      char: "u",
      description: "Underlying mint pubkey",
    }),
    quote: flags.string({ char: "q", description: "quote mint pubkey" }),
    expiry: flags.string({
      char: "e",
      description: "expiry date (yyyy-mm-dd)",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(ListOptions);
    const { program } = initAnchor();
    const expiry = flags.expiry
      ? parse(flags.expiry, "yyyy-MM-dd", new Date())
      : new Date();
    const contracts = await getAllContracts(program)
      .then((contracts) =>
        contracts.filter(
          (c) =>
            !flags.underlying ||
            c.underlyingMint.toString() === flags.underlying
        )
      )
      .then((contracts) =>
        contracts.filter(
          (c) => !flags.quote || c.quoteMint.toString() === flags.quote
        )
      )
      .then((contracts) =>
        // timezones
        contracts.filter(
          (c) =>
            !flags.expiry ||
            isSameDay(new Date(c.expiryTs.toNumber() * 1000), expiry)
        )
      );
    cli.table(
      contracts,
      {
        publicKey: {
          get: (row: SoloptionsContractWithKey) => row.key.toBase58(),
        },
        quoteMint: {
          get: (row: SoloptionsContractWithKey) => row.quoteMint.toBase58(),
        },
        underlyingMint: {
          get: (row: SoloptionsContractWithKey) =>
            row.underlyingMint.toBase58(),
        },
        expiryTs: {
          get: (row: SoloptionsContractWithKey) =>
            format(new Date(row.expiryTs.toNumber() * 1000), "yyyy-MM-dd"),
        },
      },
      {
        printLine: this.log,
        ...flags, // parsed flags
      }
    );
  }
}
