import {
  ConnectedVoltSDK,
  FriktionSDK,
  PendingWithdrawal,
} from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
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

const withdrawAmount: Decimal = new Decimal(0.001);

(async () => {
  const cVoltSDK = new ConnectedVoltSDK(
    connection,
    user,
    await friktionSDK.loadVoltAndExtraDataByKey(voltVaultId),
    // below field is only used if depositing from a PDA or other program-owned account
    undefined
  );

  const payer = cVoltSDK.wallet;
  const authority = cVoltSDK.daoAuthority
    ? cVoltSDK.daoAuthority
    : cVoltSDK.wallet;

  const voltVault = cVoltSDK.voltVault;
  const depositMint = voltVault.underlyingAssetMint;
  const vaultMint = voltVault.vaultMint;

  const withdrawalInstructions: TransactionInstruction[] = [];

  const depositTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
    depositMint,
    authority
  );
  const vaultTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
    vaultMint,
    authority
  );

  try {
    // try to get account info
    await getAccount(connection, depositTokenAccountKey);
  } catch (err) {
    withdrawalInstructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        depositTokenAccountKey,
        authority,
        depositMint
      )
    );
  }

  // NOTE: Shouldn't be necessary since user must have created to receive volt tokens if now withdrawing
  try {
    await getAccount(connection, vaultTokenAccountKey);
  } catch (err) {
    withdrawalInstructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        vaultTokenAccountKey,
        authority,
        vaultMint
      )
    );
  }

  // if instant transfers aren't currently possible, need to handle already existing pending withdrawals
  if (!voltVault.instantTransfersEnabled) {
    let pendingWithdrawalInfo: PendingWithdrawal | undefined;
    try {
      pendingWithdrawalInfo = await cVoltSDK.getPendingWithdrawalForGivenUser(
        authority
      );
    } catch (err) {
      pendingWithdrawalInfo = undefined;
    }

    // if a pending withdrawal exists, need to handle it
    if (
      pendingWithdrawalInfo &&
      pendingWithdrawalInfo?.numVoltRedeemed?.gtn(0) &&
      pendingWithdrawalInfo.roundNumber?.gtn(0)
    ) {
      // if is claimable, then claim it first
      if (pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber)) {
        withdrawalInstructions.push(
          await cVoltSDK.claimPendingWithdrawal(depositTokenAccountKey)
        );
      }
      // else, cancel the withdrawal or throw an error
      else {
        withdrawalInstructions.push(
          await cVoltSDK.cancelPendingWithdrawal(vaultTokenAccountKey)
        );
        // if don't want to override existing withdrawal, can throw error instead
        // throw new Error("pending withdrawal already exists")
      }
    }
  }

  withdrawalInstructions.push(
    await cVoltSDK.withdrawHumanAmount(
      withdrawAmount,
      vaultTokenAccountKey,
      depositTokenAccountKey,
      authority
    )
  );

  const transaction = new Transaction();

  for (const ix of withdrawalInstructions) {
    transaction.add(ix);
  }

  console.log("sending transaction...");
  const txResult = await provider.sendAndConfirm(transaction);
  console.log("tx result = ", txResult);
})();
