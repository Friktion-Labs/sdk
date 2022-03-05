// Keep this to only general utils

import { Provider as AnchorProvider } from "@project-serum/anchor";
import type { Provider as SerumProvider } from "@project-serum/common";
import type {
  Provider as SolanaContribProvider,
  Wallet as SolanaContribWallet,
} from "@saberhq/solana-contrib";
import { SolanaProvider } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

export interface AnchorWallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export type ProviderLike =
  | SerumProvider
  | SolanaContribProvider
  | AnchorProvider
  | {
      connection: Connection;
      wallet: AnchorWallet | SolanaContribWallet;
    };

/**
 * There are lots of different Provider derivatives. FriktionSDK shouldn't
 * require usage of Solana provider.
 *
 * However, we use Anchor's Provider as ReadonlyProvider because it is
 * incompatible with TransactionEnvelope.
 */
export const providerToContribProvider = (
  provider: ProviderLike
): SolanaProvider => {
  return SolanaProvider.load({
    connection: provider.connection,
    sendConnection: provider.connection,
    wallet: provider.wallet,
    opts: {
      commitment: "confirmed",
    },
  });
};

export const providerToAnchorProvider = (
  provider: ProviderLike
): AnchorProvider => {
  return new AnchorProvider(provider.connection, provider.wallet, {
    commitment: "confirmed",
  });
};
