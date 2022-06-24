import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import { ConnectedVoltSDK, FriktionSDK } from "../../src";
import { RoundWithKey } from "@friktion-labs/friktion-sdk";
import { parse } from "csv-parse/sync";

const cli = new Command();

cli
  .version("1.0.0")
  .description("opts tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-v, --volt <string>", "volt address to load accounts for")
  .option("-r, --round <number>", "round number to retrieve")
  .option("--all-rounds", "print all rounds")
  .parse(process.argv);

const opts = cli.opts();

const printRound = (round: RoundWithKey) => {
  Object.entries(round).forEach((e) => {
    const key = e[0];
    const value = e[1];
    console.log(key.toString(), " = ", value.toString());
  });
};
(async () => {
  const provider = anchor.AnchorProvider.env();
  const friktionSdk = new FriktionSDK({
    provider: provider,
  });
  const voltSdk = new ConnectedVoltSDK(
    provider.connection,
    provider.wallet.publicKey,
    await friktionSdk.loadVoltByKey(new PublicKey(opts.volt as string))
  );
  if (opts.round) {
    console.log(printRound(await voltSdk.getRoundByNumber(opts.round)));
    console.log(
      (await voltSdk.getEpochInfoByNumber(new anchor.BN(opts.round as number)))
        .vaultTokenPrice
    );
  } else {
    console.log((await voltSdk.getAllRounds()).forEach((r) => printRound(r)));
  }
})();
