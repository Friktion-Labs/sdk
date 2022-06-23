import * as anchor from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Command } from "commander";

const cli = new Command();

cli
  .version("1.0.0")
  .description("opts tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-p, --print", "print")
  .option("-c, --create", "create")
  .option("-a, --account <string>", "address of token account")
  .option("-o, --owner <string>", "address of owner of token account")
  .option("-m, --mint <string>", "mint of token")
  .parse(process.argv);

const opts = cli.opts();
(async () => {
  const provider = anchor.AnchorProvider.env();
  let address: PublicKey;

  const mint = new PublicKey(opts.mint);
  if (opts.account) address = new PublicKey(opts.account);
  else
    address = new PublicKey(
      await getAssociatedTokenAddress(mint, new PublicKey(opts.owner))
    );
  if (opts.print) {
    const tAccount = console.log(
      "mint: ",
      mint.toString(),
      "address: ",
      address.toString(),
      ", balance: ",
      (await getAccount(provider.connection, address)).amount.toString()
    );
  } else if (opts.create) {
    const ix = createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      await getAssociatedTokenAddress(mint, new PublicKey(opts.owner)),
      new PublicKey(opts.owner),
      mint
    );

    const tx = new Transaction();
    tx.add(ix);
    await provider.sendAndConfirm(tx);
  }
})();
