import * as anchor from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import Decimal from "decimal.js";
import {
  DEVNET_WHITELIST_TOKEN,
  FriktionSDK,
  getMarketAndAuthorityInfo,
  marketLoader,
  VoltSDK,
} from "../../src";
import { getBalanceOrZero } from "../../src/programs/Volt/utils";
import { getPayer } from "../utils/helpers";
import fetch from "node-fetch";
import colors from "colors";
import { getAccount, getMint } from "@solana/spl-token";
import { connection } from "@project-serum/common";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-m, --match <string>",
    "set of characters to match volt address against"
  )
  .parse(process.argv);

const options = cli.opts();

const voltToCoinGeckoId: Record<string, string> = {};
const voltToSnapshot: Record<string, any> = {};
const FRIKTION_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";

let snapshotData: any;

const modifyCoinGeckoDict = async () => {
  if (snapshotData === undefined) {
    const response = await fetch(FRIKTION_SNAPSHOT_URL);
    snapshotData = await response.json();
  }
  const volts = snapshotData["allMainnetVolts"];
  volts.forEach((v: any) => {
    voltToCoinGeckoId[v["voltVaultId"]] = v["depositTokenCoingeckoId"];
    voltToSnapshot[v["voltVaultId"]] = v;
  });
};

// const getCgPrice = async (cgId: string): Promise<number> => {
//   console.log(cgId);
//   const url =
//     "https://api.coingecko.com/api/v3/simple/price?ids=" +
//     cgId +
//     "&vs_currencies=usd";
//   const response = await fetch(url);
//   const data = await response.json();

//   console.log(data);
//   return data[cgId]["usd"];
// };

(async () => {
  await modifyCoinGeckoDict();

  const PROVIDER_URL =
    "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
  // const PROVIDER_URL = "https://ssc-dao.genesysgo.net/";
  // const PROVIDER_URL = "https://api.devnet.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  const connection = provider.connection;
  let voltVaults: VoltSDK[];
  const friktionSdk = new FriktionSDK({
    provider: provider,
    // network: "devnet",
    network: "mainnet-beta",
  });
  if (!options.match) voltVaults = await friktionSdk.getAllVoltVaults();
  else
    voltVaults = [
      await friktionSdk.loadVoltByKey(new PublicKey(options.match as string)),
    ];

  let tvl = new Decimal(0);
  let totalPendingDeposits = new Decimal(0);
  let totalPendingWithdrawals = new Decimal(0);

  for (const vv of voltVaults) {
    const cgId = voltToCoinGeckoId[vv.voltKey.toString()];

    if (cgId === undefined) {
      console.log("skipping ", vv.voltKey.toString());
      continue;
    }

    const cgPrice = await vv.getCoingeckoPrice(cgId);

    if (
      options.match !== undefined &&
      !vv.voltKey.toString().includes(options.match)
    ) {
      // console.log("skipping since does not match");
      continue;
    }

    const vaultValueFromWriterTokens = new Decimal(
      (
        await getBalanceOrZero(connection, vv.voltVault.writerTokenPool)
      ).toString()
    ).mul(new Decimal(vv.voltVault.underlyingAmountPerContract.toString()));

    const totalVaultValueExcludingPendingDeposits = new Decimal(
      (await getAccount(connection, vv.voltVault.depositPool)).amount.toString()
    ).add(new Decimal(vaultValueFromWriterTokens.toString()));

    const normFactor = await vv.getDepositTokenNormalizationFactor();

    console.log(voltToSnapshot[vv.voltKey.toString()]["globalId"]);

    const voltDollarTvl = totalVaultValueExcludingPendingDeposits
      .div(normFactor)
      .mul(cgPrice);
    console.log(
      "TVL (underlying): ",
      totalVaultValueExcludingPendingDeposits.div(normFactor).toString(),
      "TVL ($): ",
      voltDollarTvl.toString()
    );

    if (vv.voltVault.roundNumber.gtn(0)) {
      const mostRecentRound = await vv.getCurrentRound();
      const voltTokenSupply = new Decimal(
        (await getMint(connection, vv.voltVault.vaultMint)).supply.toString()
      ).add(
        new Decimal(mostRecentRound.voltTokensFromPendingWithdrawals.toString())
      );

      const underlyingInPendingDeposits = new Decimal(
        (
          await getAccount(
            connection,
            (
              await VoltSDK.findRoundUnderlyingTokensAddress(
                vv.voltKey,
                vv.voltVault.roundNumber,
                vv.sdk.programs.Volt.programId
              )
            )[0]
          )
        ).amount.toString()
      ).div(normFactor);

      const underlyingInPendingWithdrawals = new Decimal(
        mostRecentRound.voltTokensFromPendingWithdrawals.toString()
      )
        .mul(totalVaultValueExcludingPendingDeposits)
        .div(voltTokenSupply)
        .div(normFactor);
      console.log(
        "pending deposits (underlying): ",
        underlyingInPendingDeposits,
        "\npending deposits ($): ",
        underlyingInPendingDeposits.mul(cgPrice)
      );
      console.log(
        "pending withdrawals (underlying): ",
        underlyingInPendingWithdrawals,
        "\npending withdrawals ($): ",
        underlyingInPendingWithdrawals.mul(cgPrice)
      );

      const netChange = underlyingInPendingDeposits
        .mul(cgPrice)
        .sub(underlyingInPendingWithdrawals.mul(cgPrice))
        .div(new Decimal(10).pow(6));
      console.log(
        netChange.gt(0)
          ? colors.green(`net change (mm$) ${netChange.toString()}`)
          : colors.red(`net change (mm$) ${netChange.toString()}`)
      );

      totalPendingDeposits = totalPendingDeposits.add(
        underlyingInPendingDeposits.mul(cgPrice)
      );

      totalPendingWithdrawals = totalPendingWithdrawals.add(
        underlyingInPendingWithdrawals.mul(cgPrice)
      );

      tvl = tvl.add(voltDollarTvl);
    }
  }
  console.log("---------------------------");
  console.log("SUMMARY: ");
  console.log("pending deposits: ", totalPendingDeposits.toString());
  console.log("pending withdrawals: ", totalPendingWithdrawals.toString());
  console.log("tvl this round: ", tvl.toString());
  console.log(
    "tvl next round: ",
    tvl.add(totalPendingDeposits).sub(totalPendingWithdrawals)
  );
})();
