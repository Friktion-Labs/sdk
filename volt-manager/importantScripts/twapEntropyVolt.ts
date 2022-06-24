import {
  Config as MangoConfig,
  getMarketIndexBySymbol,
} from "@blockworks-foundation/mango-client";
import { nativeI80F48ToUi } from "@friktion-labs/entropy-client";
import * as anchor from "@project-serum/anchor";
import { ComputeBudgetProgram, Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import {
  normalizeBookChanges,
  normalizeTrades,
  OrderBook,
  streamNormalized,
} from "tardis-dev";
import { sendInsList } from "@friktion-labs/friktion-utils";
import { ConnectedVoltSDK, ExtraVoltData, FriktionSDK } from "../../src";
import { NetworkName } from "@friktion-labs/friktion-sdk";
import { sleep } from "../utils/send";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-d, --debug",
    "activate more debug messages. Can be set by env var DEBUG.",
    false
  )
  .option("-p, --params", "json file of quote params")
  .requiredOption(
    "-v, --volt <string>",
    "address of volt to send instructions for"
  )
  .parse(process.argv);

const options = cli.opts();

/*
    Data Layouts
*/

class TardisBook extends OrderBook {
  getSizedBestBid(quoteSize: number): number | undefined {
    let rem = quoteSize;
    for (const bid of this.bids()) {
      rem -= bid.amount * bid.price;
      if (rem <= 0) {
        return bid.price;
      }
    }
    return undefined;
  }
  getSizedBestAsk(quoteSize: number): number | undefined {
    let rem = quoteSize;
    for (const ask of this.asks()) {
      rem -= ask.amount * ask.price;
      if (rem <= 0) {
        return ask.price;
      }
    }
    return undefined;
  }
}

type Position = {
  spotPos: number;
  perpPos: number;
  lastUpdate: number;
};

/*
 *   Async CEX Provider
 */

async function listenBooks(symbol: string, tardisBook: TardisBook) {
  console.log("listen to binance books");
  const messages = streamNormalized(
    {
      exchange: "binance",
      symbols: [symbol + "USDT"],
    },
    normalizeTrades,
    normalizeBookChanges
  );
  for await (const msg of messages) {
    if (msg.type === "book_change") {
      tardisBook.update(msg);
    }
  }
}

/*
 *  Periodically fetch the Mango account and market state
 */
async function listenMangoState(
  position: Position,
  voltSdk: ConnectedVoltSDK,
  tokenIndex: number,
  stateRefreshInterval: number
) {
  while (true) {
    try {
      const { entropyAccount, entropyGroup, entropyCache } =
        await voltSdk.getEntropyObjectsForEvData();
      position.spotPos = entropyAccount.getBasePositionUiWithGroup(
        tokenIndex,
        entropyGroup
      );
      position.perpPos = nativeI80F48ToUi(
        entropyAccount.getNet(
          entropyCache.rootBankCache[tokenIndex],
          tokenIndex
        ),
        entropyGroup.tokens[tokenIndex].decimals
      ).toNumber();
      position.lastUpdate = Date.now();
    } catch (e) {
      console.error(
        `${new Date()
          .getUTCDate()
          .toString()} failed when loading account state: `,
        e
      );
      process.exit(1);
    } finally {
      await sleep(stateRefreshInterval);
    }
  }
}

/*
    Helpers
*/

function handleError(err: any) {
  console.log(new Date().toISOString() + `Error: ${err.message}`);
}

/*
    Makin' Markets
*/

async function initMarketMaker() {
  /*
   * Init connections
   */
  const CLUSTER: NetworkName = "mainnet-beta";
  const PROVIDER_URL =
    "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
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
  const voltSdk = new ConnectedVoltSDK(
    connection,
    provider.wallet.publicKey,
    await friktionSdk.loadVoltAndExtraDataByKey(new PublicKey(options.volt))
  );
  const paramsFileName = options.params || "quote_params.json";
  const params = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../importantScripts/${paramsFileName}`),
      "utf-8"
    )
  );

  const symbol = params.symbol;
  const refreshAccountStateInterval = params.refreshAccountStateInterval;
  const removeInterval = params.removeInterval;
  const maxPosImbalance = params.maxPosImbalanceNotl;
  const baseRemovalSize = params.baseRemovalSizeNotl;
  const basePerpEdge = params.basePerpEdge;
  const baseSpotEdge = params.baseSpotEdge;
  const maxStaleness = params.maxStaleness;
  const direction = params.direction;

  /* Get token index stuff */
  const ev = voltSdk.extraVoltData as ExtraVoltData;
  const entropyGroupConfig = Object.values(MangoConfig.ids().groups).find(
    (g) => g.publicKey.toString() === ev.entropyGroup.toString()
  );
  const tokenIndex = getMarketIndexBySymbol(entropyGroupConfig as any, symbol);
  // listenMangoState(3, entropyAccount, entropyGroup, entropyCache, 5000);

  /* CEX theos */
  const tardisBook = new TardisBook();
  listenBooks(symbol, tardisBook);

  /* Positions */
  const position: Position = {
    spotPos: 0,
    perpPos: 0,
    lastUpdate: Date.now(),
  };
  listenMangoState(position, voltSdk, tokenIndex, refreshAccountStateInterval);

  /* Event Loop */
  while (true) {
    try {
      /* Freshness Check */
      let now = Date.now();
      if (now - position.lastUpdate > maxStaleness) {
        console.log(
          new Date().toISOString() +
            " Skipped event loop due to stale positions..."
        );
        continue;
      }

      /* Get CEX vals */
      let bid = tardisBook.getSizedBestBid(maxPosImbalance);
      let ask = tardisBook.getSizedBestAsk(maxPosImbalance);
      let spread = (ask as number) - (bid as number);
      let midpoint =
        Math.floor((((bid as number) + (ask as number)) * 100) / 2) / 100;

      console.log(
        new Date().toISOString(),
        "Bid:",
        bid,
        "Ask:",
        ask,
        "Mid:",
        midpoint,
        "Spread:",
        spread.toFixed(2)
      );

      /* Skip when CEX data is invalid */
      if (
        bid === undefined ||
        isNaN(bid) ||
        ask === undefined ||
        isNaN(ask) ||
        bid > ask
      ) {
        continue;
      }

      /* Sizes */
      let imbal = (position.spotPos + position.perpPos) * midpoint;
      console.log("Imbal: ", imbal.toFixed(2));
      // Don't increase imbalanced position if above threshold
      let shouldRemoveSpot = imbal > -1 * maxPosImbalance;
      let shouldRemovePerp = imbal < maxPosImbalance;
      // Scale sizes based on imbalance
      let relPos = imbal / maxPosImbalance;
      let relPosSizeMult = 1.2;

      let spotRemoveSize = new anchor.BN(
        (1 + relPos * relPosSizeMult) * baseRemovalSize * 1e6
      );
      let perpRemoveSize = new anchor.BN(
        (1 - relPos * relPosSizeMult) * baseRemovalSize * 1e6
      );
      console.log(
        "shouldRemoveSpot:",
        shouldRemoveSpot,
        "shouldRemovePerp",
        shouldRemovePerp,
        "relativePos:",
        relPos.toFixed(2),
        "spotRemoveSize:",
        spotRemoveSize.toNumber() / 1e6,
        "perpRemoveSize:",
        perpRemoveSize.toNumber() / 1e6
      );

      /* Edges */
      let relPosSpreadMult = 3;
      let spotEdge = baseSpotEdge + relPosSpreadMult * relPos * -1;
      let perpEdge = basePerpEdge + relPosSpreadMult * relPos;

      let spotRemPrice = midpoint + spotEdge * spread;
      let perpRemPrice = midpoint - perpEdge * spread;
      console.log(
        "relPosSpreadMult:",
        relPosSpreadMult,
        "spotEdge:",
        spotEdge,
        "perpEdge:",
        perpEdge,
        "spotRemPrice:",
        spotRemPrice,
        "perpRemPrice:",
        perpRemPrice
      );

      /* Removals */
      let tradeLeg = "target";
      const spotIns = await voltSdk.rebalanceSpotEntropy(
        new anchor.BN(spotRemPrice * 1000),
        new anchor.BN(spotRemPrice * 1000),
        spotRemoveSize
      );
      const perpIns = await voltSdk.rebalanceEntropy(
        new anchor.BN(perpRemPrice * 100),
        new anchor.BN(perpRemPrice * 100),
        perpRemoveSize,
        tradeLeg === "target" ? false : true
      );
      if (shouldRemoveSpot) {
        sendInsList(provider, [
          ComputeBudgetProgram.requestUnits({
            units: 400000,
            additionalFee: 0,
          }),
          spotIns,
        ]).catch(handleError);
      }
      if (shouldRemovePerp) {
        sendInsList(provider, [
          ComputeBudgetProgram.requestUnits({
            units: 400000,
            additionalFee: 0,
          }),
          perpIns,
        ]).catch(handleError);
      }
    } catch (e) {
      console.log(e);
      process.exit(1);
    } finally {
      await sleep(removeInterval);
    }
  }
}

initMarketMaker();
