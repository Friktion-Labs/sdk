import {
  ConnectedVoltSDK,
  FriktionSDK,
  PendingDeposit,
} from "@friktion-labs/friktion-sdk";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { Signer, TransactionInstruction } from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Decimal from "decimal.js";

// SOL Covered Call Volt
const voltVaultId = new PublicKey(
  "CbPemKEEe7Y7YgBmYtFaZiECrVTP5sGrYzrrrviSewKY"
);
const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
const CLUSTER = "mainnet-beta";

const SOL_NORM_FACTOR = Math.pow(10, 9);

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

(async () => {
  const cVoltSDK = new ConnectedVoltSDK(
    connection,
    user,
    await friktionSDK.loadVoltAndExtraDataByKey(voltVaultId),
    // below field is only used if depositing from a PDA or other program-owned account
    undefined
  );

  const payer = user;
  const authority = user;
  const solTransferAuthority = user;
  const voltVault = cVoltSDK.voltVault;
  const depositMint = voltVault.underlyingAssetMint;
  const vaultMint = voltVault.vaultMint;

  const isWrappedSol =
    depositMint.toString() === friktionSDK.net.mints.SOL.toString();
  const depositInstructions: TransactionInstruction[] = [];

  const depositTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
    depositMint,
    authority,
    true
  );
  const vaultTokenAccountKey: PublicKey = await getAssociatedTokenAddress(
    vaultMint,
    authority,
    true
  );

  const depositAmount: Decimal = new Decimal(0.001);

  if (isWrappedSol) {
    try {
      // try to get account info
      await getAccount(connection, depositTokenAccountKey);
      const numLamports =
        (await connection.getAccountInfo(depositTokenAccountKey))?.lamports ??
        0;
      const additionalLamportsRequired = Math.max(
        depositAmount.toNumber() * SOL_NORM_FACTOR - numLamports,
        0
      );
      if (additionalLamportsRequired > 0) {
        depositInstructions.push(
          SystemProgram.transfer({
            fromPubkey: solTransferAuthority,
            toPubkey: depositTokenAccountKey,
            lamports: additionalLamportsRequired,
          })
        );
        depositInstructions.push(
          createSyncNativeInstruction(
            depositTokenAccountKey,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    } catch (err) {
      depositInstructions.push(
        SystemProgram.transfer({
          fromPubkey: solTransferAuthority,
          toPubkey: depositTokenAccountKey,
          lamports: depositAmount.toNumber() * SOL_NORM_FACTOR,
        })
      );
      depositInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer,
          depositTokenAccountKey,
          authority,
          depositMint
        )
      );
    }
  }

  try {
    await getAccount(connection, vaultTokenAccountKey);
  } catch (err) {
    depositInstructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        vaultTokenAccountKey,
        authority,
        vaultMint
      )
    );
  }

  // if instant transfers aren't currently possible, need to handle already existing pending deposits
  if (!voltVault.instantTransfersEnabled) {
    let pendingDepositInfo: PendingDeposit | undefined;
    try {
      pendingDepositInfo = await cVoltSDK.getPendingDepositForGivenUser(
        authority
      );
    } catch (err) {
      pendingDepositInfo = undefined;
    }

    // if a pending deposit exists, need to handle it
    if (
      pendingDepositInfo &&
      pendingDepositInfo?.numUnderlyingDeposited?.gtn(0) &&
      pendingDepositInfo.roundNumber.gtn(0)
    ) {
      // if is claimable, then claim it first
      if (pendingDepositInfo.roundNumber.lt(voltVault.roundNumber)) {
        depositInstructions.push(
          await cVoltSDK.claimPending(vaultTokenAccountKey)
        );
      }
      // else, cancel the deposit or throw an error
      else {
        depositInstructions.push(
          await cVoltSDK.cancelPendingDeposit(depositTokenAccountKey)
        );
        // if don't want to override existing deposit, can throw error instead
        // throw new Error("pending deposit already exists")
      }
    }
  }

  depositInstructions.push(
    await cVoltSDK.deposit(
      depositAmount,
      depositTokenAccountKey,
      vaultTokenAccountKey,
      authority
    )
  );

  if (isWrappedSol) {
    // OPTIONAL: close account once done with it. Don't do this by default since ATA will be useful in future
    // const closeWSolIx = createCloseAccountInstruction(
    //   depositTokenAccountKey,
    //   this.wallet, // Send any remaining SOL to the owner
    //   this.wallet,
    //   []
    // );
    // depositInstructions.push(closeWSolIx);
  }

  const transaction = new Transaction();

  for (const ix of depositInstructions) {
    transaction.add(ix);
  }

  console.log("sending transaction...");
  const txResult = await provider.sendAndConfirm(transaction);
  console.log("tx result = ", txResult);

  return txResult;
})();
