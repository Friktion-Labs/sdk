import { Keypair, SystemInstruction } from "@solana/web3.js";
import { Command } from "commander";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-p, --prefix <string>", "prefix to search for")
  .parse(process.argv);

const options = cli.opts();
const prefix = (options.prefix as string).toLowerCase();

export const matchKey = async (prefix: string) => {
  const keypair = new Keypair();
  const pubkey = keypair.publicKey;
  if (
    pubkey.toString().toLowerCase().startsWith(prefix.toString().toLowerCase())
  ) {
    console.log(keypair.publicKey.toString());
    console.log(keypair.secretKey);
    process.exit();
  }
};

(async () => {
  while (true) {
    matchKey(prefix);
  }
})();
