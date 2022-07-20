import {
  ConnectedVoltSDK,
  FriktionSDK,
  toConnectedSDK,
} from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

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
const connection = provider.connection;

const friktionSDK: FriktionSDK = new FriktionSDK({
  provider: provider,
  network: CLUSTER,
});

const user = provider.wallet.publicKey;

const withdrawAmount: Decimal = new Decimal(0.00001);

(async () => {
  const cVoltSDK = toConnectedSDK(
    await friktionSDK.loadVoltSDKByKey(voltVaultId),
    connection,
    user,
    // below field is only used if depositing from a PDA or other program-owned account
    undefined
  );

  await cVoltSDK.doFullWithdraw(withdrawAmount);
})();
