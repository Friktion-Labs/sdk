import { VoltSDK, ConnectedVoltSDK, FriktionSDK } from "../src";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Signer } from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import Decimal from "decimal.js";

import { sendIns, wait } from "./utils";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-i, --instruction <string>", "instruction to run")
  .option("-v, --volt <string>", "address of volt to send instructions for")
  .option(
    "--underlying-serum-market <string>",
    "serum market the underlying asset is trading on"
  )
  .option(
    "-d, --debug",
    "activate more debug messages. Can be set by env var DEBUG.",
    false
  )
  // deposit/withdraw
  .option("--amount <number>", "amount to deposit/withdraw")
  // print deposits
  .option("--pubkey <string>", "pubkey to print information for")
  .option("--all-volts", "print info for all volts")
  .parse(process.argv);

// set up provider and programs
// const PROVIDER_URL = "https://api.devnet.solana.com";
// const PROVIDER_URL = "https://solana-api.projectserum.com";
const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
const provider = new anchor.Provider(
  new Connection(PROVIDER_URL),
  anchor.getProvider().wallet,
  {}
);
const user = (provider.wallet as anchor.Wallet).payer;
const connection = provider.connection;

const DELAY_MS = 5000;

const instruction = cli.instruction;

const run = async () => {
  const fSdk = new FriktionSDK({
    provider: provider,
    network: "mainnet-beta",
  });

  const voltKey = new PublicKey(cli.volt);
  const vv = await fSdk.loadVoltByKey(voltKey);

  const cSdk = new ConnectedVoltSDK(provider, vv);

  const underlyingToken = new Token(
    connection,
    vv.voltVault.underlyingAssetMint,
    TOKEN_PROGRAM_ID,
    user
  );

  const vaultToken = new Token(
    provider.connection,
    vv.voltVault.vaultMint,
    TOKEN_PROGRAM_ID,
    user
  );

  const quoteToken = new Token(
    provider.connection,
    vv.voltVault.quoteAssetMint,
    TOKEN_PROGRAM_ID,
    user
  );

  const optionToken = new Token(
    provider.connection,
    vv.voltVault.optionMint,
    TOKEN_PROGRAM_ID,
    user
  );

  const writerToken = new Token(
    provider.connection,
    vv.voltVault.writerTokenMint,
    TOKEN_PROGRAM_ID,
    user
  );

  try {
    await underlyingToken.getAccountInfo(
      await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        underlyingToken.publicKey,
        user.publicKey
      )
    );
  } catch (err) {
    await underlyingToken.createAssociatedTokenAccount(user.publicKey);
  }

  try {
    await vaultToken.getAccountInfo(
      await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        vaultToken.publicKey,
        user.publicKey
      )
    );
  } catch (err) {
    await vaultToken.createAssociatedTokenAccount(user.publicKey);
  }

  try {
    await quoteToken.getAccountInfo(
      await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        quoteToken.publicKey,
        user.publicKey
      )
    );
  } catch (err) {
    await quoteToken.createAssociatedTokenAccount(user.publicKey);
  }

  const underlyingTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    vv.voltVault.underlyingAssetMint,
    user.publicKey
  );

  const quoteTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    vv.voltVault.quoteAssetMint,
    user.publicKey
  );

  const vaultTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    vv.voltVault.vaultMint,
    user.publicKey
  );

  if (instruction === "printDeposits") {
    const pubkey = new PublicKey(cli.pubkey);

    let voltsToPrint: VoltSDK[] = [];
    if (cli.allVolts) {
      voltsToPrint = await fSdk.getAllVoltVaults();
    } else {
      voltsToPrint = [vv];
    }

    console.log(voltsToPrint);

    for (const voltSdk of voltsToPrint) {
      try {
        const structOrNull = await voltSdk.getBalancesForUser(pubkey);

        if (!structOrNull) {
          console.log("skipping...");
          continue;
        }

        const {
          totalBalance,
          normalBalance,
          pendingDeposits,
          pendingWithdrawals,
          mintableShares,
          claimableUnderlying,
          normFactor,
          vaultNormFactor,
        } = structOrNull;

        console.log("struct: ", structOrNull);
        if (totalBalance.gt(0)) {
          console.log("volt = ", voltSdk.voltKey.toString());

          console.log(
            "underlying mint = ",
            voltSdk.voltVault.underlyingAssetMint.toString()
          );
          console.log(
            "quote mint = ",
            voltSdk.voltVault.quoteAssetMint.toString()
          );

          console.log(
            "total balance: ",
            new Decimal(totalBalance.toString()).div(normFactor),
            "normal balance (from vault tokens): ",
            new Decimal(normalBalance.toString()).div(normFactor),
            "pending deposit balance: ",
            new Decimal(pendingDeposits.toString()).div(normFactor),
            "pending withdrawal balance: ",
            new Decimal(pendingWithdrawals.toString()).div(normFactor),
            "mintable shares: ",
            mintableShares.div(vaultNormFactor).toString(),
            "claimable underlying: ",
            claimableUnderlying.div(normFactor).toString()
          );
        }
      } catch (err) {
        console.log(err);
      }
    }

    return;
  } else if (instruction === "deposit") {
    console.log(
      "pre-deposit vault token balance = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );

    console.log(
      "pre-deposit underlying balance = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    const depositAmount = new Decimal(cli.amount);

    const depositIx = await cSdk.deposit(
      depositAmount,
      underlyingTokenAccount,
      vaultTokenAccount
    );

    await sendIns(provider, depositIx);

    await wait(DELAY_MS);

    console.log(
      "post-deposit underlying balance = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    console.log(
      "post-deposit vault token balance = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );
  } else if (instruction === "withdraw") {
    console.log(
      "pre-withdraw underlying balance = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    console.log(
      "pre-withdraw vault token balance = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );

    const withdrawAmountInVaultTokens = new Decimal(cli.amount)
      .mul(new Decimal((await vaultToken.getMintInfo()).supply.toString()))
      .div(
        new Decimal(
          (
            await underlyingToken.getAccountInfo(vv.voltVault.depositPool)
          ).amount.toString()
        )
      );

    const withdrawAmountInVaultTokensNormalized = new anchor.BN(
      withdrawAmountInVaultTokens
        .mul(
          new Decimal(
            Math.pow(
              10,
              (await underlyingToken.getMintInfo()).decimals
            ).toString()
          )
        )
        .toString()
    );
    console.log(
      "withdraw amount: ",
      cli.amount,
      "(",
      withdrawAmountInVaultTokensNormalized.toString(),
      "w/ no decimals) volt tokens"
    );

    const withdrawIx = await cSdk.withdraw(
      withdrawAmountInVaultTokensNormalized,
      vaultTokenAccount,
      underlyingTokenAccount
    );

    await sendIns(provider, withdrawIx);

    await wait(DELAY_MS);

    console.log(
      "post-withdraw underlying balance = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    console.log(
      "post-withdraw vault token balance = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );
  } else if (instruction == "claimPending") {
    console.log("claiming vault tokens from previous pending deposit");

    console.log(
      "vault tokens before = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );

    const claimPendingIx = await cSdk.claimPending(vaultTokenAccount);

    await sendIns(provider, claimPendingIx);

    await sendIns;
    console.log(
      "vault tokens after = ",
      (await vaultToken.getAccountInfo(vaultTokenAccount)).amount.toString()
    );

    console.log("succesfully claimed pending!");
    return;
  } else if (instruction == "claimPendingWithdrawal") {
    console.log("claiming vault tokens from previous pending deposit");

    console.log(
      "underlying tokens before = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    const claimPendingWithdrawalIx = await cSdk.claimPendingWithdrawal(
      underlyingTokenAccount
    );

    await sendIns(provider, claimPendingWithdrawalIx);

    console.log(
      "underlying tokens after = ",
      (
        await underlyingToken.getAccountInfo(underlyingTokenAccount)
      ).amount.toString()
    );

    console.log("succesfully claimed pending withdrawal!");
    return;
  }
};

(async () => {
  try {
    const text = await run();
    console.log(text);
  } catch (e) {
    console.log(e);
  }
})();
