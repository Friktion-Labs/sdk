import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import { FriktionSDK } from "../../src";
import { getPayer } from "../utils/helpers";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-m, --match <string>",
    "set of characters to match volt address against"
  )
  .option(
    "-t, --match-mint <string>",
    "set of characters to match volt address against"
  )
  .option("-s, --short", "print out less info")
  .option("--very-short", "print out even less info")
  .option("--serum-markets", "print out serum markets")
  .parse(process.argv);

(async () => {
  const user = getPayer();
  const PROVIDER_URL =
    "https://friktion.rpcpool.com/132d5fccfadee1fd0c2fce38aa14";

  // const PROVIDER_URL = "https://ssc-dao.genesysgo.net/";
  // const PROVIDER_URL = "https://api.devnet.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  const provider = new anchor.Provider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  const friktionSdk = new FriktionSDK({
    provider: provider,
    // network: "devnet",
    network: "mainnet-beta",
  });
  const vv = await friktionSdk.loadVoltByKey(
    new PublicKey(cli.match as string)
  );
  const rounds = (await vv.getAllRounds()).sort((a, b) =>
    a.number.sub(b.number).toNumber()
  );
  for (const r of rounds) {
    console.log(
      "# ",
      r.number.toString(),
      "\npnl = ",
      r.underlyingPostSettle.sub(r.underlyingPreEnter).toString()
    );
  }
})();
