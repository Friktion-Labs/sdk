import type { Provider } from "@project-serum/anchor";
import { getTokenAccount } from "@project-serum/common";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { PublicKey, Signer } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

export const getAssociatedTokenAddress = async (
  mint: PublicKey,
  owner: PublicKey,
  allowOffCurve?: boolean
): Promise<PublicKey> =>
  await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    owner,
    allowOffCurve
  );

interface AccountParams {
  mint: PublicKey;
  owner: PublicKey;
  payer?: PublicKey;
}

export const getOrCreateAssociatedTokenAccounts = async (
  provider: Provider,
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
    addresses.push(address);
    try {
      await getTokenAccount(provider, address);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.match(/Failed to find token account/)
      ) {
        tx.add(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            address,
            owner,
            payer || owner
          )
        );
      } else {
        throw e;
      }
    }
  }
  if (tx.instructions.length) {
    await provider.send(tx, signers);
  }

  return addresses;
};
