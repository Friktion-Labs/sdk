import { AnchorProvider } from "@project-serum/anchor";
import { Provider as SerumProvider } from "@project-serum/common";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

export interface AnchorWallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export type ProviderLike =
  | SerumProvider
  | AnchorProvider
  | {
      connection: Connection;
      wallet: AnchorWallet;
    };

export type SimpleProvider = {
  connection: Connection;
};

/**
 * There are lots of different Provider derivatives. FriktionSDK shouldn't
 * require usage of Solana provider.
 *
 * However, we use Anchor's Provider as ReadonlyProvider because it is
 * incompatible with TransactionEnvelope.
 */

export const providerToAnchorProvider = (
  provider: ProviderLike
): AnchorProvider => {
  return new AnchorProvider(provider.connection, provider.wallet, {
    commitment: "confirmed",
  });
};

export const anchorProviderToSerumProvider = (
  provider: AnchorProvider
): SerumProvider => {
  return new SerumProvider(provider.connection, provider.wallet, provider.opts);
};
