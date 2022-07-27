export class TimeoutError extends Error {
  override message: string;
  txid: string;

  constructor({ txid }: { txid: string }) {
    super();
    this.message = `Timed out awaiting confirmation. Please confirm in the explorer: `;
    this.txid = txid;
  }
}
