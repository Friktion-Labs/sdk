import * as anchor from "@project-serum/anchor";
import { AnchorProvider } from "@project-serum/anchor";
import { sleep } from "@project-serum/common";
import { Market } from "@project-serum/serum";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";
import { Command } from "commander";
import { parse } from "csv-parse/sync";
import Decimal from "decimal.js";
import * as fs from "fs";
import fetch from "node-fetch";
import invariant from "tiny-invariant";
import { sendInsCatching } from "@friktion-labs/friktion-utils";
import {
  ConnectedVoltSDK,
  FriktionSDK,
  getInertiaContractByKeyOrNull,
  InertiaSDK,
  OptionsProtocol,
  PERFORMANCE_FEE_BPS,
  WITHDRAWAL_FEE_BPS,
} from "../../src";
import { INERTIA_PX_NORM_FACTOR } from "@friktion-labs/friktion-sdk";
import { NetworkName } from "@friktion-labs/friktion-sdk";
import { getInertiaContractByKey } from "@friktion-labs/friktion-sdk";
import {
  getBalanceOrZero,
  sendInsListCatching,
} from "@friktion-labs/friktion-utils";
import { VoltSDK } from "@friktion-labs/friktion-sdk";
import { crankEventQueue } from "../../tests/utils/serum";
import { initSerumMarketForVolt } from "../utils/instruction_helpers";

const cli = new Command();

cli
  .version("1.0.0")
  .description("options tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-d, --debug",
    "activate more debug messages. Can be set by env var DEBUG.",
    false
  )
  .option("-v, --volt <string>", "address of volt to send instructions for")
  .option("--circuits", "do auction for circuits volts")
  .option("--dov", "do auction for DOV volts")
  .option("--entropy", "do auction for entropy volts")
  .option("--mint-options", "set and mint next option")
  .option("--option-markets-file <string>", "new option markets file")
  .option("--serum-markets", "create serum markets")
  .option("--crank-serum", "crank serum markets")
  .option(
    "--settle-crank-options",
    "settle crank the existing options on volts"
  )
  .option("--speedy-like-bot", "send a million txs fuck it")
  .option(
    "--settle-prices-file <string>",
    "file with option markets settlement pxs"
  )
  .parse(process.argv);

const options = cli.opts();

export const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.once("data", (data) => {
      process.stdin.setRawMode(false);
      console.log("inputted data: ", data.toString());
      invariant(data.toString() === "y");
      resolve();
    })
  );
};

export const loadSerumMarketCatching = async (
  voltSdk: VoltSDK,
  serumMarketKey: PublicKey
): Promise<boolean> => {
  try {
    const market = await Market.load(
      voltSdk.sdk.readonlyProvider.connection,
      serumMarketKey,
      {},
      voltSdk.sdk.net.SERUM_DEX_PROGRAM_ID
    );
    return true;
  } catch (err) {
    return false;
  }
};

export const runDOVAuction = async (
  provider: AnchorProvider,
  voltSdk: ConnectedVoltSDK,
  snapshotData: any,
  nextOptionMarket?: PublicKey
) => {
  const RETRY_TIME = 10000;

  console.log("-------------------");
  console.log("running auction for volt = " + voltSdk.voltKey.toString());
  console.log(
    "prev option market = ",
    voltSdk.voltVault.optionMarket.toString()
  );
  console.log("next option market = ", nextOptionMarket?.toString());

  // while (!voltSdk.extraVoltData.dovPerformanceFeesInUnderlying) {
  //   await sendInsCatching(
  //     provider,
  //     await voltSdk.changeFees(
  //       new BN(PERFORMANCE_FEE_BPS),
  //       new BN(WITHDRAWAL_FEE_BPS),
  //       true
  //     )
  //   );
  //   voltSdk = await voltSdk.refresh();
  // }

  let needToCreateSerumMarket: boolean = false;

  {
    const { serumMarketKey } = await voltSdk.getCurrentMarketAndAuthorityInfo();

    try {
      await Market.load(
        voltSdk.sdk.readonlyProvider.connection,
        serumMarketKey,
        {},
        voltSdk.sdk.net.SERUM_DEX_PROGRAM_ID
      );
    } catch {
      console.log("need to create serum market!");
      needToCreateSerumMarket = true;
    }
  }

  if (
    voltSdk.voltVault.optionMarket.toString() ===
      nextOptionMarket?.toString() &&
    voltSdk.voltVault.prepareIsFinished &&
    !needToCreateSerumMarket
  ) {
    console.log(
      "already minted new option and created serum market for volt = " +
        snapshotData["globalId"].toString()
    );
    return;
  }

  while (
    voltSdk.voltVault.prepareIsFinished &&
    !voltSdk.voltVault.enterIsFinished &&
    nextOptionMarket !== undefined &&
    nextOptionMarket.toString() !== voltSdk.voltVault.optionMarket.toString()
  ) {
    console.log("resetting option market...");
    await sendInsListCatching(provider, [await voltSdk.resetOptionMarket()]);
    voltSdk = await voltSdk.refresh();
  }

  if (
    voltSdk.voltVault.optionMarket.toString() !=
    SystemProgram.programId.toString()
  ) {
    if (
      (await voltSdk.getOptionsProtocolForKey(
        voltSdk.voltVault.optionMarket
      )) === "Inertia"
    ) {
      console.log("inertia protocol");
      const contract = await getInertiaContractByKeyOrNull(
        voltSdk.sdk.programs.Inertia,
        voltSdk.voltVault.optionMarket
      );

      if (contract === null) {
        throw new Error("contract is null!");
      }

      if (
        voltSdk.voltVault.optionMarket.toString() !==
          nextOptionMarket?.toString() &&
        !contract.wasSettleCranked &&
        voltSdk.voltVault.enterIsFinished
      ) {
        console.log(
          "option market must be settled before anything else can be done :)"
        );
        return;
      }
    }
  }

  if (
    voltSdk.voltVault.optionMarket.toString() !==
      nextOptionMarket?.toString() &&
    !voltSdk.voltVault.currOptionWasSettled &&
    voltSdk.voltVault.firstEverOptionWasSet
  ) {
    console.log("still need to settle option...");

    const epochInfo = await voltSdk.getCurrentEpochInfo();

    while (
      (
        await getBalanceOrZero(
          provider.connection,
          voltSdk.voltVault.permissionedMarketPremiumPool
        )
      ).toNumber() !== 0 &&
      !voltSdk.definitelyDoesntRequirePermissionedSettle()
      // !snapshotData["globalId"].toString().includes("tsUSDC") &&
      // !snapshotData["globalId"].toString().includes("PAI")
    ) {
      console.log("settling permissioned market premium funds");
      await sendInsCatching(
        provider,
        await voltSdk.settlePermissionedMarketPremiumFunds()
      );
    }

    while (epochInfo.swapPremiumNumTimesCalled.toNumber() === 0) {
      console.log(
        "volt sdk is call: ",
        voltSdk.isCall(),
        ", ",
        voltSdk.voltVault.underlyingAssetMint.toString()
      );
      if (voltSdk.isCall())
        throw new Error("if call, swap premium should be called manually");

      console.log("still need to call swap premium, trying...");
      const spotSerumMarketKey = new PublicKey(
        snapshotData["spotSerumMarketId"]
      );

      await sendInsListCatching(provider, [
        await voltSdk.rebalanceSwapPremium(
          spotSerumMarketKey,
          undefined,
          undefined,
          voltSdk.isCall() ? false : true
        ),
        // NOTE: not necessary since settle funds is called inside rebalance_swap_premium
        // await voltSdk.settleSwapPremiumFunds(spotSerumMarketKey),
      ]);

      console.log("waiting a bit after swapping premium");

      await sleep(RETRY_TIME);
      voltSdk = await voltSdk.refresh();
    }

    while (!voltSdk.voltVault.currOptionWasSettled) {
      console.log("settling option...");
      await sendInsCatching(provider, await voltSdk.rebalanceSettle());
      await sleep(RETRY_TIME);
      voltSdk = await voltSdk.refresh();
    }
  }

  while (
    voltSdk.voltVault.roundHasStarted &&
    voltSdk.voltVault.currOptionWasSettled &&
    voltSdk.voltVault.enterIsFinished
  ) {
    console.log("option settled, ending round through start round...");
    await sendInsListCatching(provider, [
      await voltSdk.endRound(),
      await voltSdk.takePendingWithdrawalFees(),
      await voltSdk.startRound(),
    ]);

    await sleep(RETRY_TIME);
    voltSdk = await voltSdk.refresh();
  }

  // NOTE: temporary addition to make all volts take fees in USDC when hitting bids during auction
  // fees are taken in settle_enter_funds
  while (voltSdk.extraVoltData?.dovPerformanceFeesInUnderlying) {
    await sendInsListCatching(provider, [
      await voltSdk.changeFees(
        new BN(PERFORMANCE_FEE_BPS),
        new BN(WITHDRAWAL_FEE_BPS),
        false
      ),
    ]);
    voltSdk = await voltSdk.refresh();
  }
  if (nextOptionMarket !== undefined) {
    while (!voltSdk.voltVault.nextOptionWasSet) {
      console.log("setting option...");

      await sendInsListCatching(provider, [
        await voltSdk.setNextOption(nextOptionMarket),
      ]);

      await sleep(RETRY_TIME);
      voltSdk = await voltSdk.refresh();
    }

    while (!voltSdk.voltVault.prepareIsFinished) {
      console.log("minting...");
      await sendInsListCatching(provider, [await voltSdk.rebalancePrepare()]);

      await sleep(RETRY_TIME);
      voltSdk = await voltSdk.refresh();
    }

    const { serumMarketKey } = await voltSdk.getCurrentMarketAndAuthorityInfo();

    console.log("loadSerumMarketCatching...");
    while (!(await loadSerumMarketCatching(voltSdk, serumMarketKey))) {
      console.log("creating serum market");
      await initSerumMarketForVolt(voltSdk);
      await sleep(RETRY_TIME);
      voltSdk = await voltSdk.refresh();
    }
  }

  if (nextOptionMarket === undefined) {
    console.log(
      "volt " +
        voltSdk.voltKey.toString() +
        " ready for set next option + mint, no option market given!"
    );
    return;
  } else {
    console.log("volt " + voltSdk.voltKey.toString() + " ready for bidding!!");
  }
};

export const checkDateAndTime = (
  actualDay: number,
  expectedDay: number,
  actualTime: number,
  expectedTime: number
) => {
  // if (actualDay !== expectedDay)
  //   throw new Error(
  //     "utc day " + actualDay + ' does not match expected for "DOV" auctions'
  //   );
  // else if (Math.abs(actualTime - expectedTime) > 1.01)
  //   throw new Error(
  //     "utc hour " + actualTime + ' does not match expected for "DOV" auctions'
  //   );
};

(async () => {
  console.log("beginning...");
  const CLUSTER: NetworkName = "mainnet-beta";
  const PROVIDER_URL =
    "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
  // "https://friktion.rpcpool.com/8236ce58a8cc909af597734efe5f";
  // const PROVIDER_URL = "https://ssc-dao.genesysgo.net";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );

  const connection = provider.connection;
  const friktionSdk = new FriktionSDK({
    provider: provider,
    network: CLUSTER,
  });

  const OPTIONS_PROTOCOL: OptionsProtocol = "Inertia";
  const WHITELIST_MINT_KEY = friktionSdk.net.MM_TOKEN_MINT;
  const SERUM_PROGRAM_ID = friktionSdk.net.SERUM_DEX_PROGRAM_ID;
  const REFERRER_QUOTE_KEY =
    friktionSdk.net.SERUM_REFERRER_IDS[friktionSdk.net.mints.USDC.toString()];

  // thursday (wednesday night)
  const EXPECTED_CIRCUITS_AUCTION_DAY = 4;
  // 2am UTC
  const EXPECTED_CIRCUITS_AUCTION_TIME = 2;

  // friday (thursday night)
  const EXPECTED_NORMAL_AUCTION_DAY = 5;
  // 2am UTC
  const EXPECTED_NORMAL_AUCTION_TIME = 2;

  // wednesday afternoon
  const EXPECTED_ENTROPY_AUCTION_DAY = 3;
  // 9pm UTC
  const EXPECTED_ENTROPY_AUCTION_TIME = 21;

  // fetch most recent friktion snapshot
  const FRIKTION_SNAPSHOT_URL =
    "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";
  const response = await fetch(FRIKTION_SNAPSHOT_URL);
  const snapshotData: any = await response.json();

  const currentVolts: any[] = snapshotData["allMainnetVolts"];
  const circuitsVolts: any[] = currentVolts.filter((volt) =>
    (volt["globalId"] as string).includes("circuits")
  );
  const entropyVolts: any[] = currentVolts.filter(
    (volt) => volt["voltType"] === 3 || volt["voltType"] === 4
  );

  const CURRENT_DAY = new Date().getUTCDay();
  const CURRENT_TIME = new Date().getUTCHours();

  let filteredVolts: any[];

  if (options.entropy) {
    throw new Error("not yet supported");
  }
  if (options.dov) {
    checkDateAndTime(
      CURRENT_DAY,
      EXPECTED_NORMAL_AUCTION_DAY,
      CURRENT_TIME,
      EXPECTED_NORMAL_AUCTION_TIME
    );
    filteredVolts = currentVolts;
    // filteredVolts = currentVolts.filter(
    //   (volt) =>
    //     circuitsVolts.find(
    //       (cv) => cv["voltVaultId"] === volt["voltVaultId"]
    //     ) === undefined &&
    //     entropyVolts.find((ev) => ev["voltVaultId"] === volt["voltVaultId"]) ===
    //       undefined
    // );
  } else if (options.circuits) {
    checkDateAndTime(
      CURRENT_DAY,
      EXPECTED_CIRCUITS_AUCTION_DAY,
      CURRENT_TIME,
      EXPECTED_CIRCUITS_AUCTION_TIME
    );
    filteredVolts = circuitsVolts;
  } else {
    throw new Error("please specify a volt category (dov, circuits, entropy)");
  }

  const voltToSettlePrice: Record<string, string> = {};
  const voltToOptionMarket: Record<string, string> = {};

  if (options.mintOptions && !options.serumMarkets && !options.crankSerum) {
    const file = fs.readFileSync(options.optionMarketsFile);

    const rows = parse(fs.readFileSync(options.optionMarketsFile).toString(), {
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,
    });

    Object.values(rows).forEach((r: any) => {
      voltToOptionMarket[r["volt"]] = r["option"];
    });

    filteredVolts = filteredVolts.filter(
      (v) => voltToOptionMarket[v["voltVaultId"]] !== undefined
    );
  } else if (options.settleCrankOptions) {
    const file = fs.readFileSync(options.settlePricesFile);

    const rows = parse(fs.readFileSync(options.settlePricesFile).toString(), {
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,
    });

    Object.values(rows).forEach((r: any) => {
      voltToSettlePrice[r["volt"]] = r["settle price"];
    });

    filteredVolts = filteredVolts.filter(
      (v) => voltToSettlePrice[v["voltVaultId"]] !== undefined
    );
  }

  const voltsToAuction: ConnectedVoltSDK[] = await Promise.all(
    filteredVolts.map(
      async (v) =>
        new ConnectedVoltSDK(
          connection,
          provider.wallet.publicKey,
          await friktionSdk.loadVoltAndExtraDataByKey(
            new PublicKey(v["voltVaultId"])
          )
        )
    )
  );

  let auctionRunners = [];
  let settlePriceIxs = [];

  let doneWhenSpeedy = false;
  let iterations = 0;
  while (iterations < 1 || options.speedyLikeBot) {
    if (doneWhenSpeedy) break;

    doneWhenSpeedy = true;
    for (const voltSdk of voltsToAuction) {
      const snapshotData = currentVolts.find(
        (v) => v["voltVaultId"] === voltSdk.voltKey.toString()
      );
      const isLastVolt =
        voltsToAuction.at(-1)?.voltKey.toString() ===
        voltSdk.voltKey.toString();

      console.log(
        "volt = ",
        snapshotData["globalId"],
        ", ",
        snapshotData["voltVaultId"]
      );

      if (options.crankSerum) {
        const { serumMarketKey } =
          await voltSdk.getCurrentMarketAndAuthorityInfo();
        console.log(
          "volt = " + voltSdk.voltKey.toString() + ", serum market key = ",
          serumMarketKey.toString()
        );
        try {
          const market = await Market.load(
            connection,
            serumMarketKey,
            {},
            SERUM_PROGRAM_ID
          );
          auctionRunners.push(crankEventQueue(provider, market as any));
        } catch (err) {
          console.log("no serum market");
        }
      } else if (options.serumMarkets) {
        if (
          voltSdk.voltVault.optionMarket.toString() ===
          SystemProgram.programId.toString()
        ) {
          console.log(
            "option market is invalid, = " +
              voltSdk.voltVault.optionMarket.toString()
          );
          continue;
        }
        await initSerumMarketForVolt(voltSdk);
      } else if (options.settleCrankOptions) {
        console.log(
          "option market = ",
          voltSdk.voltVault.optionMarket.toString()
        );
        if (
          voltSdk.voltVault.optionMarket.toString() ===
          SystemProgram.programId.toString()
        ) {
          continue;
        }
        const contract = await getInertiaContractByKeyOrNull(
          friktionSdk.programs.Inertia,
          voltSdk.voltVault.optionMarket
        );
        if (contract === null) throw new Error("contract is null!");

        if (contract.wasSettleCranked) {
          console.log(
            "already settled " +
              snapshotData["underlyingTokenSymbol"] +
              ", continuing..."
          );
          continue;
        }

        doneWhenSpeedy = false;
        const headlineTokenPrice = (
          await voltSdk.headlineTokenPrice()
        ).toNumber();
        let settlePriceFloat = parseFloat(
          voltToSettlePrice[voltSdk.voltKey.toString()]
        );

        invariant(
          Math.abs(settlePriceFloat - headlineTokenPrice) <
            headlineTokenPrice * 0.2
        );

        settlePriceFloat *= 10000.0;

        if (settlePriceFloat === undefined || isNaN(settlePriceFloat)) {
          console.log(
            "undefined settle price = " +
              settlePriceFloat.toString() +
              " continuing"
          );
          continue;
        }

        const settlePriceNormalized = new BN(settlePriceFloat.toFixed(0));
        console.log(
          "symbol = " +
            snapshotData["underlyingTokenSymbol"] +
            ", settle price = ",
          settlePriceNormalized.toString(),
          ", normalized settle price = ",
          new Decimal(settlePriceNormalized.toString())
            .div(INERTIA_PX_NORM_FACTOR)
            .toString()
        );
        console.log("is this correct? type 'y' to continue");
        await keypress();
        console.log("continuing...");

        const inertiaSDK = new InertiaSDK(contract, {
          provider: provider,
          network: CLUSTER,
        });

        settlePriceIxs.push(
          await inertiaSDK.settle(
            {
              user: provider.wallet.publicKey,
              settlePrice: settlePriceNormalized,
            },
            new BN(123456789)
          )
        );

        if (
          settlePriceIxs.length === 4 ||
          (isLastVolt && settlePriceIxs.length > 0)
        ) {
          if (options.speedyLikeBot) {
            sendInsListCatching(provider, settlePriceIxs);
          } else {
            while (
              !(
                await getInertiaContractByKey(
                  friktionSdk.programs.Inertia,
                  voltSdk.voltVault.optionMarket
                )
              )?.wasSettleCranked
            ) {
              const succeeded = await sendInsListCatching(
                provider,
                settlePriceIxs
              );
              if (succeeded) break;
            }
          }
          settlePriceIxs = [];
        }
      } else if (options.mintOptions) {
        console.log("minting options for volt = ", snapshotData["globalId"]);
        auctionRunners.push(
          runDOVAuction(
            provider,
            voltSdk,
            snapshotData,
            options.mintOptions
              ? new PublicKey(voltToOptionMarket[voltSdk.voltKey.toString()])
              : undefined
          )
        );

        // setInterval(async () => {
        //   auctionRunners.push(
        //     runDOVAuction(
        //       provider,
        //       voltSdk,
        //       snapshotData,
        //       options.mintOptions
        //         ? new PublicKey(voltToOptionMarket[voltSdk.voltKey.toString()])
        //         : undefined
        //     )
        //   );
        // }, 2500);

        if (auctionRunners.length === 50) {
          const results = await Promise.allSettled(auctionRunners);
          console.log("results: ", results);
          auctionRunners = [];
        }
      } else {
        console.log(
          'no valid action provided, please give one of "mint options", "serum markets", "settle prices"'
        );
        process.exit(1);
      }

      // await sleep(1500);
    }

    if (auctionRunners.length > 0) {
      const results = await Promise.allSettled(auctionRunners);
      console.log("results: ", results);
      auctionRunners = [];
    }
    iterations += 1;
  }

  const results = await Promise.allSettled(auctionRunners);
  console.log("results: ", results);

  console.log("done!!!!");
})();
