import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { exec } from "child_process";
import { Command } from "commander";
import { FriktionSDK, VoltSDK } from "../../src";
import { wait } from "../../tests/utils/helpers";
import { getPayer } from "../utils/helpers";

const cli = new Command();

cli
  .version("1.0.0")
  .description("opts tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-i, --instruction <string>", "instruction to run on all volts")
  .option("--extra-args <string>", "args to append to end of volt.ts command")
  .parse(process.argv);

const opts = cli.opts();

(async () => {
  const user = getPayer();

  const PROVIDER_URL = "https://ssc-dao.genesysgo.net/";
  // const PROVIDER_URL = "https://api.devnet.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  let voltVaults: VoltSDK[];
  const friktionSdk = new FriktionSDK({
    provider: provider,
    // network: "devnet",
    network: "mainnet-beta",
  });

  voltVaults = await friktionSdk.getAllVoltVaults();
  for (const vv of voltVaults) {
    console.log("args = ", opts.extraArgs);
    const command =
      "ts-node volt.ts -i " +
        opts.instruction +
        " --volt " +
        vv.voltKey +
        " " +
        opts.extraArgs ?? "";
    console.log(command);
    const process = exec(command, (error, stdout, stderr) => {
      // if (error) {
      //  extraArgs  return;
      // }
      // if (stderr) {
      //   console.log(`stderr: ${stderr}`);
      //   return;
      // }
      // console.log(`stdout: ${stdout}`);
    });

    process.stdout?.on("data", function (data) {
      console.log(data);
    });

    await wait(10000);
  }
})();
