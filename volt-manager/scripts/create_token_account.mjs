import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as fs from "fs";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const MSRM_MINT = new PublicKey(
  "MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L"
);
export const MSRM_DECIMALS = 0;

export const SRM_MINT = new PublicKey(
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"
);

async function initializeTokenAccountTx({
  connection,
  extraLamports = 0,
  payerKey,
  mintPublicKey,
  owner,
  rentBalance,
}) {
  const newAccount = new Account();
  const transaction = new Transaction();

  let _rentBalance = rentBalance;
  if (!rentBalance) {
    _rentBalance = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    );
  }

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payerKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: _rentBalance + extraLamports,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mintPublicKey,
      newAccount.publicKey,
      owner
    )
  );

  return { transaction, newTokenAccount: newAccount };
}

const sendSignedTransaction = async function ({
  signedTransaction,
  connection,
  sendingMessage = "Sending transaction...",
  successMessage = "Transaction confirmed",
  timeout = 10,
}) {
  console.log(signedTransaction.verifySignatures());
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  console.log("raw transaction", rawTransaction);

  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
  });

  //   const explorerUrl = buildSolanaExplorerUrl(txid);

  //   pushNotification({
  //     severity: NotificationSeverity.INFO,
  //     message: sendingMessage,
  //     link: (
  //       <Link href={explorerUrl} target="_new">
  //         View on Solana Explorer
  //       </Link>
  //     ),
  //     txid,
  //   });

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(300);
    }
  })();
  try {
    await awaitTransactionSignatureConfirmation(txid, timeout, connection);
  } catch (err) {
    if (err) {
      console.log("may have Timed out awaiting confirmation on transaction...");
    }
    let simulateResult = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, "confirmed")
      ).value;
    } catch (e) {
      console.error("Error: ", e);
    }

    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; i -= 1) {
          const line = simulateResult.logs[i];
          if (line.startsWith("Program log: ")) {
            throw new TransactionError(
              `Transaction failed: ${line.slice("Program log: ".length)}`,
              signedTransaction,
              txid
            );
          }
        }
      }
      throw new TransactionError(
        JSON.stringify(simulateResult.err),
        signedTransaction,
        txid
      );
    }
    throw new TransactionError("Transaction failed", signedTransaction, txid);
  } finally {
    done = true;
  }

  console.log("Latency", txid, getUnixTs() - startTime);
  return txid;
};

const makeAndSendTx = async (connection, tx, signers, owner) => {
  console.log("tx", tx);
  tx.feePayer = owner.publicKey;
  const { blockhash } = await connection.getRecentBlockhash(); // eslint-disable-line
  tx.recentBlockhash = blockhash;
  console.log("signers", signers);
  tx.sign(owner);
  // const signedTx = await owner.signTransaction(tx);
  // console.log("signedTx", signedTx);

  await sendSignedTransaction({
    signedTransaction: tx,
    connection,
    sendingMessage: "Sending: deposit in volt",
    successMessage: "Confirmed: Initialize Volt",
  });
};

var text = fs.readFileSync("/Users/jasonchitla/.config/solana/id.json");
let addr_in_bytes = JSON.parse(text);
console.log(addr_in_bytes);
let owner = new Account(addr_in_bytes);
let endpointUrl = "https://api.devnet.solana.com";
let connection = new Connection(endpointUrl, "recent");
let keypair = Keypair.fromSecretKey(new Uint8Array(addr_in_bytes));
console.log(keypair);
const { transaction, newTokenAccount } = await initializeTokenAccountTx({
  connection: connection,
  payerKey: owner.publicKey,
  mintPublicKey: MSRM_MINT,
  owner: keypair.publicKey,
  rentBalance: null,
});

makeAndSendTx(connection, transaction, [keypair], keypair);

const { transaction2, newTokenAccount2 } = await initializeTokenAccountTx({
  connection: connection,
  payerKey: owner.publicKey,
  mintPublicKey: SRM_MINT,
  owner: keypair.publicKey,
  rentBalance: null,
});
makeAndSendTx(connection, transaction2, [keypair], keypair);
