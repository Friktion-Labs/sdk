import type { AnchorProvider } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import type { PublicKey, Signer } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

import { sendInsList } from "./instructionHelpers";

interface AccountParams {
  mint: PublicKey;
  owner: PublicKey;
  payer?: PublicKey;
}

export const getOrCreateAssociatedTokenAccounts = async (
  provider: AnchorProvider,
  {
    accountParams,
    signers,
  }: {
    accountParams: AccountParams[];
    signers?: Signer[];
  }
): Promise<PublicKey[]> => {
  // - make the full list of addresses,
  // - make CreateTokenAccount instructions for the ones that don't exist yet,
  // - create whatever's necessary in one shot,
  // - return the list of addresses
  const addresses: PublicKey[] = [];
  const tx = new Transaction();

  for (const { mint, owner, payer } of accountParams) {
    const address = await getAssociatedTokenAddress(mint, owner);
    if (
      addresses.length > 0 &&
      addresses
        .map((p) => p.toString() === address.toString())
        .reduce((a, b) => a || b)
    )
      continue;
    addresses.push(address);

    try {
      await getAccount(provider.connection, address);
    } catch (e) {
      if (e instanceof TokenAccountNotFoundError) {
        console.log("address not found, creating ", address.toString());
        tx.add(
          createAssociatedTokenAccountInstruction(
            payer || owner,
            address,
            owner,
            mint
          )
        );
      } else {
        throw e;
      }
    }
  }
  if (tx.instructions.length) {
    await sendInsList(provider, tx.instructions, signers);
  }

  return addresses;
};
