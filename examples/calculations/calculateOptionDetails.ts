import { FriktionSDK } from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { getStrikeFromOptionsContract } from "@friktion-labs/friktion-sdksrc/programs/Volt/optionMarketUtils";

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

  // currently (epoch = ), optionsContract =
  const optionsContract = await voltSdk.getCurrentOptionsContract();
  const strike = await voltSdk.getStrikeFromOptionsContract(optionsContract); //
  const details = await voltSdk.optionsContractToDetailsString(optionsContract);

  console.log(
    "key = ",
    optionsContract.key.toString(),
    "\noptions contract = ",
    optionsContract,
    "strike = ",
    strike,
    "details = ",
    details
  );
})();
