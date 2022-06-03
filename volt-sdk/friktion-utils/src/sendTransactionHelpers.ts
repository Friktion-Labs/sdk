/* eslint-disable */
import { WalletAdapter } from "@friktion-labs/entropy-client";
import {
  Account,
  Commitment,
  Connection,
  Keypair,
  RpcResponseAndContext,
  Signer,
  SimulatedTransactionResponse,
  Transaction,
  TransactionConfirmationStatus,
  TransactionSignature,
} from "@solana/web3.js";

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getUnixTs = (): number => {
  return new Date().getTime() / 1000;
};

export class TimeoutError extends Error {
  override message: string;
  txid: string;

  constructor({ txid }: { txid: string }) {
    super();
    this.message = `Timed out awaiting confirmation. Please confirm in the explorer: `;
    this.txid = txid;
  }
}

export class FriktionTransactionError extends Error {
  override message: string;
  txid: string;

  constructor({ txid, message }: { txid: string; message: string }) {
    super();
    this.message = message;
    this.txid = txid;
  }
}

export const makeAndSendTx = async (
  connection: Connection,
  user: Keypair,
  tx: Transaction,
  signers: Signer[],
  timeout?: number
): Promise<TransactionSignature> => {
  await signTransaction({
    transaction: tx,
    payer: user,
    signers,
    connection,
  });

  const txSig = await sendSignedTransaction({
    signedTransaction: tx,
    connection,
    timeout: timeout ?? 60000,
  });

  return txSig;
};

export async function signTransaction({
  transaction,
  payer,
  signers,
  connection,
}: {
  transaction: Transaction;
  payer: any;
  signers: Signer[];
  connection: Connection;
}) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash("confirmed")
  ).blockhash;
  transaction.setSigners(payer.publicKey, ...signers.map((s) => s.publicKey));
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  if (payer?.connected) {
    console.log(new Date().toUTCString(), "signing as wallet", payer.publicKey);
    return await payer.signTransaction(transaction);
  } else {
    transaction.sign(...[payer].concat(signers));
  }
}
// TODO - switch Account to Keypair and switch off setSigners due to deprecated
/**
 * Send a transaction using the Solana Web3.js connection on the mango client
 *
 * @param transaction
 * @param payer
 * @param additionalSigners
 * @param timeout Retries sending the transaction and trying to confirm it until the given timeout. Defaults to 30000ms. Passing null will disable the transaction confirmation check and always return success.
 */
export async function sendTransaction(
  connection: Connection,
  transaction: Transaction,
  payer: Account | Keypair,
  additionalSigners: Account[],
  timeout: number | null = 30000,
  confirmLevel: TransactionConfirmationStatus = "confirmed",
  marketName?: string
): Promise<TransactionSignature> {
  await signTransaction({
    transaction,
    payer,
    signers: additionalSigners,
    connection,
  });
  console.log(marketName);
  const rawTransaction = transaction.serialize();
  const startTime = getUnixTs();

  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction
    // { skipPreflight: true },
  );

  // if (postSendTxCallback) {
  //   try {
  //     postSendTxCallback({ txid });
  //   } catch (e) {
  //     console.log(new Date().toUTCString(), `postSendTxCallback error ${e}`);
  //   }
  // }

  // console.log('checking timeout');

  if (!timeout) return txid;

  console.log(
    new Date().toUTCString(),
    "Started awaiting confirmation for tx: ",
    txid,
    " size:",
    rawTransaction.length
  );

  let done = false;

  let retrySleep = 17000;
  (async () => {
    // TODO - make sure this works well on mainnet
    while (!done && getUnixTs() - startTime < timeout / 1000) {
      await sleep(retrySleep);
      // console.log(new Date().toUTCString(), ' sending tx ', txid);
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      if (retrySleep <= 6000) {
        retrySleep = retrySleep * 2;
      }
    }
  })();

  try {
    await awaitTransactionSignatureConfirmation(
      connection,
      txid,
      timeout,
      confirmLevel
    );
  } catch (err: any) {
    if (err.timeout) {
      throw new TimeoutError({ txid });
    }
    let simulateResult: SimulatedTransactionResponse | null = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, transaction, "confirmed")
      ).value;
    } catch (e) {
      console.warn("Simulate transaction failed");
    }

    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line?.startsWith("Program log: ")) {
            throw new FriktionTransactionError({
              message:
                "Transaction fai led: " + line?.slice("Program log: ".length),
              txid,
            });
          }
        }
      }
      throw new FriktionTransactionError({
        message: JSON.stringify(simulateResult.err),
        txid,
      });
    }
    throw new FriktionTransactionError({ message: "Transaction failed", txid });
  } finally {
    done = true;
  }

  console.log("Latency", txid, getUnixTs() - startTime);
  return txid;
}
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString("base64");
  const config: any = {
    encoding: "base64",
    commitment,
    replaceRecentBlockhash: true,
  };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest("simulateTransaction", args);
  if (res.error) {
    throw new Error("failed to simulate transaction: " + res.error.message);
  }
  return res.result;
}

export async function sendSignedTransaction({
  connection,
  signedTransaction,
  timeout = 30000,
  confirmLevel = "confirmed",
}: {
  connection: Connection;
  signedTransaction: Transaction;
  timeout?: number;
  confirmLevel?: TransactionConfirmationStatus;
}): Promise<TransactionSignature> {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();

  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    }
  );

  // if (this.postSendTxCallback) {
  //   try {
  //     this.postSendTxCallback({ txid });
  //   } catch (e) {
  //     console.log(new Date().toUTCString(), `postSendTxCallback error ${e}`);
  //   }
  // }

  // console.log('Started awaiting confirmation for', txid);

  let done = false;
  (async () => {
    await sleep(500);
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(1000);
    }
  })();
  try {
    await awaitTransactionSignatureConfirmation(
      connection,
      txid,
      timeout,
      confirmLevel
    );
  } catch (err: any) {
    if (err.timeout) {
      throw new TimeoutError({ txid });
    }
    let simulateResult: SimulatedTransactionResponse | null = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, "confirmed")
      ).value;
    } catch (e) {
      console.log(new Date().toUTCString(), "Simulate tx failed", e);
    }
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line?.startsWith("Program log: ")) {
            throw new FriktionTransactionError({
              message: "Transaction failed: " + simulateResult.logs.join("\n"),
              txid,
            });
          }
        }
      }
      throw new FriktionTransactionError({
        message: JSON.stringify(simulateResult.err),
        txid,
      });
    }
    throw new FriktionTransactionError({ message: "Transaction failed", txid });
  } finally {
    done = true;
  }

  // console.log('Latency', txid, getUnixTs() - startTime);
  return txid;
}

export async function awaitTransactionSignatureConfirmation(
  connection: Connection,
  txid: TransactionSignature,
  timeout: number,
  confirmLevel: TransactionConfirmationStatus
) {
  let done = false;

  const confirmLevels: (TransactionConfirmationStatus | null | undefined)[] = [
    "finalized",
  ];

  if (confirmLevel === "confirmed") {
    confirmLevels.push("confirmed");
  } else if (confirmLevel === "processed") {
    confirmLevels.push("confirmed");
    confirmLevels.push("processed");
  }
  let subscriptionId;

  const result = await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.log(new Date().toUTCString(), "Timed out for txid: ", txid);
        reject({ timeout: true });
      }, timeout);
      try {
        subscriptionId = connection.onSignature(
          txid,
          (result, context) => {
            subscriptionId = undefined;
            done = true;
            if (result.err) {
              reject(result.err);
            } else {
              // lastSlot = context?.slot;
              resolve(result);
            }
          },
          "confirmed"
        );
      } catch (e) {
        done = true;
        console.log(new Date().toUTCString(), "WS error in setup", txid, e);
      }
      let retrySleep = 1500;
      console.log("polling tx ", txid);
      while (!done) {
        // eslint-disable-next-line no-loop-func
        await sleep(retrySleep);
        (async () => {
          try {
            const response = await connection.getSignatureStatuses([txid]);

            const result = response && response.value[0];
            if (!done) {
              if (!result) {
                // console.log("REST null result for", txid, result);
              } else if (result.err) {
                console.log(
                  new Date().toUTCString(),
                  "REST error for",
                  txid,
                  result
                );
                done = true;
                reject(result.err);
              } else if (
                !(
                  result.confirmations ||
                  confirmLevels.includes(result.confirmationStatus)
                )
              ) {
                console.log(
                  new Date().toUTCString(),
                  "REST not confirmed",
                  txid,
                  result
                );
              } else {
                // lastSlot = response?.context?.slot;
                // console.log('REST confirmed', txid, result);
                done = true;
                resolve(result);
              }
            }
          } catch (e) {
            if (!done) {
              console.log(
                new Date().toUTCString(),
                "REST connection error: txid",
                txid,
                e
              );
            }
          }
        })();
        if (retrySleep <= 1600) {
          retrySleep = retrySleep * 2;
        }
      }
    })();
  });

  if (subscriptionId) {
    connection.removeSignatureListener(subscriptionId).catch((e) => {
      console.log(new Date().toUTCString(), "WS error in cleanup", e);
    });
  }

  done = true;
  return result;
}
