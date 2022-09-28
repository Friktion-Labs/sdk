import { FriktionSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@friktion-labs/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// SOL Covered Call Volt
const voltVaultId = new PublicKey(
  "CbPemKEEe7Y7YgBmYtFaZiECrVTP5sGrYzrrrviSewKY"
);
const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
const CLUSTER = "mainnet-beta";
const provider = new AnchorProvider(
  new Connection(PROVIDER_URL),
  Wallet.local(),
  {}
);
const friktionSDK: FriktionSDK = new FriktionSDK({
  provider: provider,
  network: CLUSTER,
});
const user = provider.wallet.publicKey;

const roundNumber = new BN(25);

(async () => {
  const voltSdk = await friktionSDK.loadVoltSDKByKey(voltVaultId);
  // cached
  const snapshot = await voltSdk.getSnapshot();
  // force reload cache
  await voltSdk.reloadSnapshot();
  console.log("snapshot = ", snapshot);

  //// sample fields ////
  console.log(
    "SNAPSHOT\n------------",
    "\nisHighVoltage: ",
    snapshot.isVoltage,
    // await voltSdk.isHighVoltage()
    "\nlast option traded: ",
    snapshot.lastTradedOption.toString(),
    // await voltSdk.getLastTradedOptionKey()
    "\nunderlying asset symbol: ",
    snapshot.underlyingTokenSymbol,
    // await voltSdk.getUnderlyingTokenSymbol()
    "\nvolt token symbol: ",
    snapshot.shareTokenSymbol,
    // await voltSdk.getShareTokenSymbol()
    "\nnext autocompounding time: ",
    snapshot.nextAutocompoundingTime,
    // await voltSdk.getNextAutocompoundingTime();
    "\nperformance fee: ",
    snapshot.performanceFeeRate,
    // await voltSdk.getPerformanceFeeRate()
    "\nwithdrawal fee: ",
    snapshot.withdrawalFeeRate
    // await voltSdk.getWithdrawalFeeRate()

    // etc.
  );
})();
