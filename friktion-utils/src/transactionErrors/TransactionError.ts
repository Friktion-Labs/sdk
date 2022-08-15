import type { Transaction } from "@solana/web3.js";

export type InstructionError = [
  number,
  {
    Custom: number;
  }
];

export class TransactionError extends Error {
  txid: string;

  transaction: Transaction;

  instructionError?: InstructionError;

  constructor(message: string, transaction: Transaction, txid: string) {
    super(message);
    this.txid = txid;
    this.transaction = transaction;
    if (message.match(/{"InstructionError":\[\d+,{"Custom":\d+}\]}/)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      this.instructionError = JSON.parse(message).InstructionError;
    }
  }
}
