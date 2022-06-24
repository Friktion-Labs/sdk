import { FriktionSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
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
  const voltSdk = await friktionSDK.loadVoltAndExtraDataByKey(voltVaultId);
  const tvl = await voltSdk.getTvlInDepositToken();
  const usdTvl = await voltSdk.getTvl();
  // or:
  // const usdTvl = tvl.mul(await voltSdk.depositTokenPrice());
  console.log("tvl (underlying): ", tvl, "tvl ($): ", usdTvl);

  // more detailed tvl stats
  const {
    // tvl
    // usdTvl
    strategyDeposits,
    pendingDeposits,
    pendingWithdrawals,
  } = await voltSdk.getTvlStats();

  console.log(
    "strategy deposits = ",
    strategyDeposits.toString(),
    "pending deposits = ",
    pendingDeposits.toString(),
    "pending withdrawals = ",
    pendingWithdrawals.toString()
  );
})();
