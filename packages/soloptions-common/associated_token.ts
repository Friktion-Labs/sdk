import {
  PublicKey,
  Signer,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress as getAssociatedTokenAddressSpl,
} from "@solana/spl-token";
import { AnchorProvider } from "@project-serum/anchor";
import { getTokenAccount, Provider } from "@project-serum/common";
import { getAccount } from "@solana/spl-token";

export const getAssociatedTokenAddress = async (
  mint: PublicKey,
  owner: PublicKey,
  allowOffCurve?: boolean
) => await getAssociatedTokenAddressSpl(mint, owner, allowOffCurve);

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
    addresses.push(address);
    try {
      await getAccount(provider.connection, address);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.match(/Failed to find token account/)
      ) {
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
    await provider.sendAndConfirm(tx, signers);
  }

  return addresses;
};
