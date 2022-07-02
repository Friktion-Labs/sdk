import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { getMint } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import { Command } from "commander";
import { parse } from "csv-parse/sync";
import Decimal from "decimal.js";
import * as fs from "fs";
import invariant from "tiny-invariant";
import { sleep } from "@friktion-labs/friktion-utils";
import { sendInsListCatching } from "@friktion-labs/friktion-utils";
import { getOrCreateAssociatedTokenAccounts } from "@friktion-labs/friktion-utils";
import {
  FriktionSDK,
  InertiaSDK,
  INERTIA_FEE_OWNER,
  NetworkName,
  OPTIONS_PROGRAM_IDS,
  OTHER_IDLS,
} from "@friktion-labs/friktion-sdk";
import { anchorProviderToSerumProvider } from "@friktion-labs/friktion-utils";
import { getInertiaContractByKey } from "@friktion-labs/friktion-sdk";
import { Inertia } from "../../target/types/inertia";

const cli = new Command();

cli
  .version("1.0.0")
  .description("options tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-f, --file <string>", "file to read market information from")
  .option("--expiry <number>", "expiry of each option market to be created")
  .parse(process.argv);

const options = cli.opts();

const PROVIDER_URL =
  "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
// const PROVIDER_URL = "https://ssc-dao.genesysgo.net";
// const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
// const PROVIDER_URL = "https://solana-api.projectserum.com";
const provider = new anchor.AnchorProvider(
  new Connection(PROVIDER_URL),
  anchor.Wallet.local(),
  {}
);
const inertiaProgram = new Program(
  OTHER_IDLS.Inertia,
  OPTIONS_PROGRAM_IDS.Inertia,
  provider
);

const connection = provider.connection;
const CLUSTER: NetworkName = "mainnet-beta";
const friktionSdk = new FriktionSDK({
  provider: provider,
  network: CLUSTER,
});

const user = provider.wallet.publicKey;

const file = fs.readFileSync(options.file);

const run = async () => {
  const rows = parse(fs.readFileSync(options.file).toString(), {
    delimiter: ",",
    columns: true,
    skip_empty_lines: true,
  });

  let createPromises: Promise<any>[] = [];
  let ixsList: TransactionInstruction[] = [];
  const optionMarketsByVolt: Record<string, string> = {};
  const settlePricesByVolt: Record<string, number> = {};

  let done = false;
  while (!done) {
    for (var row of rows) {
      console.log("auction?: ", row["Auction?"]);
      if ((row["Auction?"] as string).toLowerCase() === "no") {
        console.log(
          'skipping volt = "' + row["name"] + ' due to auction? == "NO"'
        );
        continue;
      }
      const voltKey = new PublicKey(row["volt"]);
      const name = row["name"];
      if (name.includes("high")) {
        const lowComparator = rows.find(
          (r: any) =>
            r["ul mint"] === row["ul mint"] &&
            r["quote mint"] === row["quote mint"] &&
            r["type"] === row["type"] &&
            !(r["name"] as string).includes("high")
        );
        console.log(row["type"], row["strike"], lowComparator["strike"]);
        invariant(
          row["type"] === "CALL"
            ? parseFloat(lowComparator["strike"]) > parseFloat(row["strike"])
            : parseFloat(lowComparator["strike"]) < parseFloat(row["strike"])
        );
      }

      const underlyingMint = new PublicKey(row["ul mint"]);
      const quoteMint = new PublicKey(row["quote mint"]);
      const oracleAi = new PublicKey(row["oracle"]);
      const strike = parseFloat(row["strike"]);
      const expiry = parseInt(row["expiry"]);

      const currTime = new Date().getUTCSeconds();
      invariant(currTime <= expiry + 7 * 24 * 60 * 60);
      const ulDecimals = parseInt(row["ul decimals"]);
      const quoteDecimals = parseInt(row["quote decimals"]);
      const modifier = parseFloat(row["modifier"]);

      const ulApc: BN = new BN(row["underlying amount per contract"]);
      const quoteApc: BN = new BN(row["quote amount per contract"]);

      const calcedStrike = parseFloat(row["calced strike"]);
      const strikesEqual = row["strikes equal?"] === "TRUE";

      invariant(row["type"] === "CALL" || row["type"] === "PUT");
      const isCall = row["type"] === "CALL";

      invariant(
        strikesEqual,
        "set and calced strike not equal accoriding to spreadsheet"
      );
      console.log("strike = ", strike, calcedStrike);
      invariant(strike === calcedStrike, "strike and calced strike not equal");

      const numUnderlyingDecimals = (
        await getMint(provider.connection, underlyingMint)
      ).decimals;

      const numQuoteDecimals = (await getMint(provider.connection, quoteMint))
        .decimals;

      invariant(
        ulDecimals === numUnderlyingDecimals,
        "given and calced ul decimals not equal"
      );
      invariant(
        quoteDecimals === numQuoteDecimals,
        "given and calced quote decimals not equal"
      );

      let calcedUlApc: BN, calcedQuoteApc: BN;
      if (isCall) {
        calcedUlApc = new BN(
          new Decimal(10).pow(ulDecimals).mul(modifier).toString()
        );

        calcedQuoteApc = new BN(
          new Decimal(10)
            .pow(quoteDecimals)
            .mul(modifier)
            .mul(strike)
            .toString()
        );
      } else {
        calcedQuoteApc = new BN(
          new Decimal(10).pow(quoteDecimals).mul(modifier).toString()
        );

        calcedUlApc = new BN(
          new Decimal(10).pow(ulDecimals).mul(strike).mul(modifier).toString()
        );
      }

      console.log(ulApc.toString(), calcedUlApc.toString());

      invariant(
        ulApc.eq(calcedUlApc),
        "given & calced underlying amount per contract not equal"
      );

      invariant(
        quoteApc.eq(calcedQuoteApc),
        "given & calced underlying amount per contract not equal"
      );

      const settlePrice = parseFloat(row["settle price"]);
      settlePricesByVolt[voltKey.toString()] = settlePrice;

      const seeds = [
        underlyingMint,
        quoteMint,
        ulApc,
        quoteApc,
        new anchor.BN(expiry),
        isCall,
      ] as const;
      const [contractKey, contractBump] = await InertiaSDK.getProgramAddress(
        inertiaProgram as any,
        "OptionsContract",
        ...seeds
      );

      optionMarketsByVolt[voltKey.toString()] = contractKey.toString();

      try {
        await getInertiaContractByKey(inertiaProgram as any, contractKey);
        console.log(
          "volt = " +
            voltKey.toString() +
            ", " +
            "contract = " +
            contractKey.toString() +
            " already created"
        );

        continue;
      } catch (err) {
        console.log("need to create contract");
      }

      const [inertiaMintFeeAccount, inertiaExerciseFeeAccount] =
        await getOrCreateAssociatedTokenAccounts(provider, {
          accountParams: [
            {
              mint: underlyingMint,
              owner: INERTIA_FEE_OWNER,
              payer: provider.wallet.publicKey,
            },
            {
              mint: quoteMint,
              owner: INERTIA_FEE_OWNER,
              payer: provider.wallet.publicKey,
            },
          ],
        });

      const { optionsContract, ix } =
        await InertiaSDK.initializeOptionsContract(
          friktionSdk,
          {
            user,
            oracleAi,
            quoteMint,
            underlyingMint,
            underlyingAmount: ulApc,
            quoteAmount: quoteApc,
            expiryTs: new anchor.BN(expiry),
            isCall,
          },
          user
        );

      console.log(
        "\n, contract key = ",
        optionsContract.key.toString(),
        "volt = ",
        voltKey.toString(),
        "\nstrike = ",
        strike,
        ", expiry = ",
        expiry,
        ", ",
        new Date(expiry * 1000),
        "\n-------------------------------------------------"
      );

      ixsList.push(ix);

      // try {
      //   await sendIns(provider, createContractIx);
      //   console.log("SUCCESSFUL");
      // } catch (err) {
      //   continue;
      // }

      try {
        console.log("ixslist length: ", ixsList.length);
        if (ixsList.length == 2) {
          createPromises.push(sendInsListCatching(provider, ixsList));
          ixsList = [];
        }
        console.log("SUCCESSFUL");
      } catch (err) {
        console.log(err);
        continue;
      }

      if (ixsList.length > 0) {
        createPromises.push(sendInsListCatching(provider, ixsList));
        ixsList = [];
      }
    }
    console.log("create promises = ", await Promise.allSettled(createPromises));

    done = createPromises.length === 0;

    createPromises = [];

    await sleep(2500);
  }

  fs.writeFile(
    "optionMarketsParsedFiles/" + (options.file as string).split("/").at(-1),
    "volt,option\n" +
      Object.entries(optionMarketsByVolt)
        .map((ov: any) => ov[0].toString() + "," + ov[1].toString())
        .join("\n"),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  fs.writeFile(
    "settlePricesFiles/" +
      (options.file as string).split("/").at(-1)?.split(".").at(0) +
      "SettlePrices.csv",
    "volt,settle price\n" +
      Object.entries(settlePricesByVolt)
        .map((ov: any) => ov[0].toString() + "," + ov[1].toString())
        .join("\n"),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  console.log("done!!!");
};

(async () => {
  await run();
})();
