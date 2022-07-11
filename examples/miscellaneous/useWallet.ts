import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useConnectedWallet } from "@saberhq/use-solana";

const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(PROVIDER_URL);

const wallet = useConnectedWallet();

if (wallet === null) throw new Error("wallet must not be null");

console.log(wallet.publicKey);

// don't use this in prod
const targetWalletPubkey = new PublicKey(
  "2kmD7NGtkh2c2Uf2YMB5dXmCmZHubBr4UtXfcTFHGxCr"
);

const transferTransaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: targetWalletPubkey,
    lamports: 1,
  })
);

const signedTransaction = await wallet.signTransaction(transferTransaction);

await sendAndConfirmTransaction(connection, signedTransaction, []);
