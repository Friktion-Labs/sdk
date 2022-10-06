import type * as anchor from "@project-serum/anchor";
import type {
  Commitment,
  Signer,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import {
  sendIns,
  sendInsList,
  sendInsListCatching,
} from "./instructionHelpers";

import { SendInsParams } from "./instructionHelpers";
import { sleep } from "./sendTransactionHelpers";

export type TransactionMachineParams = {
  // keep sending txs
  blastAway?: boolean;
  blastInterval?: number;
  commitmentLevel?: Commitment;
  timeout?: number;
  signers?: Signer[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TransactionMachine {
  static BLAST_TIMEOUT = 250;
  readonly provider: anchor.AnchorProvider;
  blastAway: boolean | undefined;
  blastInterval: number | undefined;
  commitmentLevel: Commitment;
  signers: Signer[];
  timeout?: number;

  constructor(
    provider: anchor.AnchorProvider,
    params: TransactionMachineParams
  ) {
    this.provider = provider;
    this.timeout = params.timeout;
    this.setBlastAway(params.blastAway ?? false, params.blastInterval ?? 500);
    this.commitmentLevel = params.commitmentLevel ?? "processed";
    this.signers = params.signers ?? [];
  }

  getDefaultSendInsParams(): SendInsParams {
    return {
      signers: this.signers,
      timeout: this.timeout,
    };
  }

  getAndOverrideDefaultSendInsParams(params?: SendInsParams): SendInsParams {
    return {
      ...this.getDefaultSendInsParams(),
      ...(params ?? {}),
    };
  }

  setBlastAway(shouldBlast: boolean, blastInterval: number) {
    if (shouldBlast) {
      this.blastAway = true;
      this.blastInterval = blastInterval;
      console.log(
        "modifying timeout to very long period since blasting requires this"
      );
      this.timeout;
    } else {
      this.blastAway = false;
      this.blastInterval = 0;
    }
  }

  async blastTx(
    insList: TransactionInstruction[],
    params?: SendInsParams
  ): Promise<TransactionSignature> {
    let txid: TransactionSignature | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const id = setInterval(async () => {
      try {
        const thisTxid = await this.sendInsList(insList, params);
        txid = thisTxid;
      } catch (err) {}
    }, this.blastInterval);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (txid !== undefined) {
        clearInterval(id);
        return txid;
      }
      await sleep(500);
    }
  }

  async sendIns(
    ins: TransactionInstruction,
    params?: SendInsParams
  ): Promise<TransactionSignature> {
    if (this.blastAway) return await this.blastTx([ins], params);
    return await sendIns(
      this.provider,
      ins,
      this.getAndOverrideDefaultSendInsParams(params)
    );
  }

  async sendInsCatching(
    ins: TransactionInstruction,
    params?: SendInsParams
  ): Promise<{
    success: boolean;
    error: unknown | undefined;
    txid: TransactionSignature | undefined;
  }> {
    // if (this.blastAway)
    return await sendInsCatching(
      this.provider,
      ins,
      this.getAndOverrideDefaultSendInsParams(params)
    );
  }

  async sendInsList(
    insList: TransactionInstruction[],
    params?: SendInsParams
  ): Promise<TransactionSignature> {
    if (this.blastAway) return await this.blastTx(insList, params);

    if (params?.signers) params.signers = params.signers?.concat(this.signers);
    return await sendInsList(
      this.provider,
      insList,
      this.getAndOverrideDefaultSendInsParams(params)
    );
  }

  async sendInsListCatching(
    insList: TransactionInstruction[],
    params?: SendInsParams
  ) {
    if (params?.signers) params.signers = params.signers?.concat(this.signers);
    await sendInsListCatching(
      this.provider,
      insList,
      this.getAndOverrideDefaultSendInsParams(params)
    );
  }
}

export const sendInsListUntilSuccess = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  params?: SendInsParams
): Promise<string> => {
  while (true) {
    const { success, txid } = await sendInsListCatching(
      provider,
      insList,
      params
    );
    if (success) {
      return txid as string;
    }
  }
};

export const sendInsCatching = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction,
  params?: SendInsParams
): Promise<{
  success: boolean;
  error: string | undefined;
  txid: TransactionSignature | undefined;
}> => {
  try {
    const txid = await sendIns(provider, ins, params);
    return {
      success: true,
      error: undefined,
      txid,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
      txid: undefined,
    };
  }
};
