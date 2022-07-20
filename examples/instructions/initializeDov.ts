import { FriktionSDK, VoltSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { getMint } from "@solana/spl-token";
import { Connection, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { ShortOptionsVoltSDK } from "@friktion-labs/friktion-sdk";

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
  const ulMint = friktionSDK.net.mints.SOL;
  const ulNormFactor = Math.pow(
    10,
    (await getMint(connection, ulMint)).decimals
  ); // 10^9 for SOL
  const voltKey = await ShortOptionsVoltSDK.doInitializeVolt({
    sdk: friktionSDK,
    provider,
    adminKey: user,
    underlyingAssetMint: ulMint,
    quoteAssetMint: friktionSDK.net.mints.USDC, // USDC mainnet mint. The mint used as the token for quote price when settling an option.
    permissionedMarketPremiumMint: friktionSDK.net.mints.USDC, // Mint used to bid on options contracts in epoch-based auctions
    underlyingAmountPerContract: new BN(ulNormFactor), // 1 SOL per contract
    serumProgramId: friktionSDK.net.SERUM_DEX_PROGRAM_ID,
    expirationInterval: new BN(7 * 24 * 60 * 60), // expected time between each epoch. Not stricly enforced. set to 7 days here
    capacity: new BN(10000 * ulNormFactor), // 10000 SOL
    individualCapacity: new BN(100 * ulNormFactor), // 100 SOL
    permissionlessAuctions: false,
  });

  console.log("if successful, new volt key = ", voltKey.toString());
})();
