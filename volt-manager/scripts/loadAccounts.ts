import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import { ConnectedVoltSDK, FriktionSDK } from "../../src";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-v, --volt <string>", "volt address to load accounts for")
  .parse(process.argv);

(async () => {
  const provider = anchor.AnchorProvider.env();
  let voltSdk: ConnectedVoltSDK;
  const friktionSdk = new FriktionSDK({
    provider: provider,
  });
  (voltSdk = new ConnectedVoltSDK(
    provider.connection,
    provider.wallet.publicKey,
    await friktionSdk.loadVoltByKey(new PublicKey(cli.volt as string))
  )),
    console.log(await voltSdk.getRoundByNumber(voltSdk.voltVault.roundNumber));
  console.log(
    (
      await voltSdk.getRoundUnderlyingTokensByNumber(
        voltSdk.voltVault.roundNumber
      )
    ).toString()
  );
  console.log(
    (
      await voltSdk.getRoundVoltTokensByNumber(voltSdk.voltVault.roundNumber)
    ).toString()
  );
  console.log(await voltSdk.getPendingDepositForUser());
  // console.log(await voltSdk.getPendingWithdrawalForUser());
  console.log(
    (await voltSdk.getAllRounds())
      .map((r) => r.underlyingFromPendingDeposits)
      .reduce((sum, current) => sum.add(current))
      .toString()
  );
})();
