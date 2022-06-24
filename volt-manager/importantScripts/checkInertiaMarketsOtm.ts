import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import fetch from "node-fetch";
import invariant from "tiny-invariant";

import { FriktionSDK, OptionsProtocol } from "../../src";
import { NetworkName } from "@friktion-labs/friktion-sdk";
import { VoltSDK } from "@friktion-labs/friktion-sdk";
import { getAccountBalance } from "../utils/tokenHelpers";

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

  const dovVoltsAny = currentVolts.filter(
    (volt) =>
      circuitsVolts.find((cv) => cv["voltVaultId"] === volt["voltVaultId"]) ===
        undefined &&
      entropyVolts.find((ev) => ev["voltVaultId"] === volt["voltVaultId"]) ===
        undefined
  );

  const allDovVolts: VoltSDK[] = await Promise.all(
    dovVoltsAny.map(
      async (v) =>
        await friktionSdk.loadVoltAndExtraDataByKey(
          new PublicKey(v["voltVaultId"])
        )
    )
  );

  await Promise.allSettled(
    allDovVolts.map(async (dov) => {
      const snapshot = snapshotData["allMainnetVolts"].find(
        (v: any) => v["voltVaultId"] === dov.voltKey.toString()
      );

      const inertiaOptionMarket = await friktionSdk.loadInertiaSDKByKey(
        dov.voltVault.optionMarket
      );

      const underlyingPoolAmount = await getAccountBalance(
        inertiaOptionMarket.readonlyProvider?.connection as Connection,
        inertiaOptionMarket.optionsContract.underlyingPool
      );

      const claimablePoolAmount = await getAccountBalance(
        inertiaOptionMarket.readonlyProvider?.connection as Connection,
        inertiaOptionMarket.optionsContract.claimablePool
      );
      console.log(
        "volt: ",
        dov.voltKey.toString(),
        "option market: ",
        inertiaOptionMarket.optionKey.toString(),
        "underlying amount: ",
        underlyingPoolAmount.toString(),
        "claimable amount: ",
        claimablePoolAmount.toString()
      );

      invariant(claimablePoolAmount.eqn(0));
      invariant(underlyingPoolAmount.gtn(0));
    })
  );

  console.log("all option markets finished OTM!");
})();
