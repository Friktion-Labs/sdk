import { FriktionSDK, VoltSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@friktion-labs/anchor";
import { getMint } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { ENTROPY_PROGRAM_ID } from "@friktion-labs/friktion-sdk";
import { EntropyVoltSDK } from "@friktion-labs/friktion-sdk";
import { getRandomInt } from "../../tests/utils/volt_helpers";

const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
const CLUSTER = "mainnet-beta";

const provider = new AnchorProvider(
  new Connection(PROVIDER_URL),
  Wallet.local(),
  {}
);
const connection = provider.connection;

const friktionSDK: FriktionSDK = new FriktionSDK({
  provider: provider,
  network: CLUSTER,
});
const user = provider.wallet.publicKey;

(async () => {
  const ulMint = friktionSDK.net.mints.USDC;
  const ulNormFactor = Math.pow(
    10,
    (await getMint(connection, ulMint)).decimals
  ); // 10^9 for SOL
  const voltKey = await EntropyVoltSDK.doInitializeVolt({
    sdk: friktionSDK,
    provider,
    adminKey: user,
    vaultName:
      "testEntropy" +
      user.toString().slice(0, 5) +
      "_" +
      getRandomInt(100_000).toString(),
    underlyingAssetMint: ulMint,
    capacity: new BN(10000 * ulNormFactor), // 10000 USDC
    individualCapacity: new BN(100 * ulNormFactor), // 100 USDC
    entropyProgramId: ENTROPY_PROGRAM_ID,
    entropyGroupKey: friktionSDK.net.ENTROPY_GROUP,
    // perp market keys (https://github.com/Friktion-Labs/entropy-client/blob/main/src/ids.json)
    // this is the BTC^2 perp market
    targetPerpMarket: new PublicKey(
      "HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu"
    ),
    // BTC perp market
    spotPerpMarket: new PublicKey(
      "9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i"
    ),
    // BTC spot market (https://github.com/blockworks-foundation/mango-client-v3/blob/b3e9387b98c3ea7167ac497de863e1e53b9c9984/src/ids.json#L359)
    spotMarket: new PublicKey("A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw"),
    targetLeverageRatio: -1.0,
    targetLeverageLenience: 0.1,
    shouldHedge: true,
    hedgeWithSpot: false,
    targetHedgeRatio: -2.0,
    targetHedgeLenience: 0.05,
    rebalancingLenience: 0.1,
    requiredBasisFromOracle: 0.0,
    exitEarlyRatio: 0.0,
  });

  console.log("if successful, new volt key = ", voltKey.toString());
})();
