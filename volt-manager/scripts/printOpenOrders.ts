import * as anchor from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";

const cli = new Command();

cli
  .version("1.0.0")
  .description("opts tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-p, --print", "print info of option")

  .option("-o, --open-orders <string>", "address of open orders account")
  .parse(process.argv);
const opts = cli.opts();

(async () => {
  const PROVIDER_URL = "https://solana-api.projectserum.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );

  const openOrdersKey = new PublicKey(opts.openOrders);
  const openOrders = await OpenOrders.load(
    provider.connection,
    openOrdersKey,
    new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")
  );

  console.log(
    "openorders: ",
    openOrders.address.toString(),
    "\n, base total: ",
    openOrders.baseTokenTotal.toString(),
    "\n, quote total: ",
    openOrders.quoteTokenTotal.toString(),
    "\n, base free: ",
    openOrders.baseTokenFree.toString(),
    "\n, quote free: ",
    openOrders.quoteTokenFree.toString()
  );
  // const { serumMarketKey } = await getMarketAndAuthorityInfo(
  //   americanOptionsProgram,
  //   optionMarket.key,
  //   SERUM_PROGRAM_IDS.Devnet,
  //   DEVNET_USDC_MINT
  // );
  // console.log("option serum market key = ", serumMarketKey.toString());
})();
