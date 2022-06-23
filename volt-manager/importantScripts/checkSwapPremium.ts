import * as anchor from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import { Connection, PublicKey } from "@solana/web3.js";
import colors from "colors";
import Decimal from "decimal.js";
import fetch from "node-fetch";
import invariant from "tiny-invariant";

import { FriktionSDK, OptionsProtocol } from "../../src";
import { NetworkName } from "../../src/helperTypes";
import { anchorProviderToSerumProvider } from "../../src/miscUtils";
import { VoltSDK } from "../../src/programs/Volt/VoltSDK";
import { getAccountBalance } from "../utils/tokenHelpers";

export const checkSwapPremium = async () => {
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

  let voltsRequiringSwapPremium: VoltSDK[] = await Promise.all(
    dovVoltsAny.map(
      async (v) =>
        await friktionSdk.loadVoltAndExtraDataByKey(
          new PublicKey(v["voltVaultId"])
        )
    )
  );
  voltsRequiringSwapPremium = voltsRequiringSwapPremium.filter((callVoltSdk) =>
    callVoltSdk.requiresSwapPremium()
  );

  await Promise.allSettled(
    voltsRequiringSwapPremium.map(async (dov) => {
      const snapshot = snapshotData["allMainnetVolts"].find(
        (v: any) => v["voltVaultId"] === dov.voltKey.toString()
      );
      let decimals = (
        await getMintInfo(
          anchorProviderToSerumProvider(provider),
          dov.voltVault.quoteAssetMint
        )
      ).decimals;
      let factor = new Decimal(10).pow(decimals);
      const premiumPoolAmount = new Decimal(
        (
          await getAccountBalance(connection, dov.voltVault.premiumPool)
        ).toString()
      ).div(factor);

      decimals = (
        await getMintInfo(
          anchorProviderToSerumProvider(provider),
          dov.voltVault.permissionedMarketPremiumMint
        )
      ).decimals;
      factor = new Decimal(10).pow(decimals);
      const permisssionedMarketPremiumPoolAmount = new Decimal(
        (
          await getAccountBalance(
            connection,
            dov.voltVault.permissionedMarketPremiumPool
          )
        ).toString()
      ).div(factor);

      console.log(colors.blue(snapshot["globalId"].toString()));
      console.log("premium pool amount = ", premiumPoolAmount.toString());
      console.log(
        "permissioned market premium pool amount = ",
        permisssionedMarketPremiumPoolAmount.toString()
      );

      invariant(premiumPoolAmount.lt(new Decimal(100)));
      invariant(permisssionedMarketPremiumPoolAmount.lt(new Decimal(100)));
    })
  );

  console.log("all volts have swapped/settled premium!");
};

(async () => {
  await checkSwapPremium();
})();
