import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, Signer, Transaction } from "@solana/web3.js";
import { Command } from "commander";
import { FriktionSDK, VoltSDK } from "../../src";
import { getAccount } from "@solana/spl-token";

const cli = new Command();

cli
  .version("1.0.0")
  .description("opts tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-a, --address <string>",
    "address to create associated token accounts for"
  )
  .parse(process.argv);

  const opts = cli.opts();

(async () => {
  const address: PublicKey = new PublicKey(opts.address);

  const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  let voltVaults: VoltSDK[];
  const friktionSdk = new FriktionSDK({
    provider: provider,
    // network: "devnet",
    network: "mainnet-beta",
  });
  voltVaults = await friktionSdk.getAllVoltVaults();

  for (var vv of voltVaults) {
    const referrerAcct = await getAssociatedTokenAddress(
      vv.voltVault.underlyingAssetMint,
      address
    );
    try {
      console.log(
        (await getAccount(provider.connection, referrerAcct)).amount.toString()
      );
      console.log("account already exists");
    } catch (err) {
      console.log("account doesn't exist");
      const ix = createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        await getAssociatedTokenAddress(
          vv.voltVault.underlyingAssetMint,
          address
        ),
        provider.wallet.publicKey,
        vv.voltVault.underlyingAssetMint
      );

      console.log(
        "creating token account for : ",
        vv.voltVault.underlyingAssetMint.toString()
      );

      const tx = new Transaction();
      tx.add(ix);
      await provider.sendAndConfirm(tx);
    }
  }
})();
