import { FriktionSDK, VoltSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@friktion-labs/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

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

(async () => {
  const voltSdk: VoltSDK = await friktionSDK.loadVoltSDKByKey(voltVaultId);
  console.log(
    "balances for wallet = ",
    user.toString(),
    "\n",
    await voltSdk.getBalancesForUser(user)
  );
})();
