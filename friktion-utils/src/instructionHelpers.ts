import type * as anchor from "@project-serum/anchor";
import type {
  Commitment,
  Signer,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";

import { makeAndSendTx, sleep } from "./sendTransactionHelpers";

export type SendInsParams = {
  signers?: Signer[];
  timeout?: number;
  computeUnits?: number;
};

export const sendIns = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction,
  params?: SendInsParams
): Promise<TransactionSignature> => {
  const tx = new Transaction();

  if (params?.computeUnits !== undefined)
    tx.add(
      ComputeBudgetProgram.requestUnits({
        units: params?.computeUnits,
        additionalFee: 0,
      })
    );

  tx.add(ins);

  return await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    params?.signers ?? [],
    params?.timeout
  );
};

export const sendInsListCatching = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  params?: SendInsParams
): Promise<{
  success: boolean;
  error: unknown | undefined;
  txid: TransactionSignature | undefined;
}> => {
  try {
    const txid = await sendInsList(provider, insList, params);
    return {
      success: true,
      error: undefined,
      txid: txid,
    };
  } catch (err) {
    return {
      success: false,
      error: err,
      txid: undefined,
    };
  }
};

export const sendInsList = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  params?: SendInsParams
): Promise<TransactionSignature> => {
  const tx = new Transaction();

  if (params?.computeUnits !== undefined)
    tx.add(
      ComputeBudgetProgram.requestUnits({
        units: params?.computeUnits,
        additionalFee: 0,
      })
    );
  for (const ix of insList) {
    tx.add(ix);
  }

  return await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    params?.signers ?? [],
    params?.timeout
  );
};

export type AnchorContext<T extends keyof any> = {
  [K in T]: PublicKey | AnchorContext<T>;
};

export function printAnchorAccounts<AnchorContext>(ctx: AnchorContext) {
  // @ts-ignore
  Object.entries(ctx).forEach(([key, value]) => {
    if (value instanceof PublicKey) console.log(`${key}: ${value}`);
    else {
      console.log(`${key}`);
      printAnchorAccounts(value);
    }
  });
}
