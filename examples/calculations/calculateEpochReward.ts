import { FriktionSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
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

// epoch number
// NOTE: some of these queries weren't supported until later in Friktion's history. Thus, historical epochs may
// not support this functionality.
const roundNumber = new BN(25);

(async () => {
  const voltSdk = await friktionSDK.loadVoltAndExtraDataByKey(voltVaultId);
  console.log("epoch pnl: ", await voltSdk.getPnlForEpoch(roundNumber));

  // calculate # of volt tokens user had ownership over during that round.
  // finds apportioned pnl by
  console.log(
    'apportioned pnl (100000000 volt tokens): ', await voltSdk.getApportionedPnlForEpoch(roundNumber, new BN(1_00_000_000))
  );

  // if some deposits haven't been claimed, can sum volt tokens in wallet and mintableShares
  const mintableSharesForRound = 50_000_000;
  const numVoltTokensInWallet = 1_00_000_000;
  console.log(
    'apportioned pnl including pending deposits, (150000000 volt tokens): ', await voltSdk.getApportionedPnlForEpoch(
      roundNumber,
      new BN(numVoltTokensInWallet + mintableSharesForRound)
    )
  );
})();
