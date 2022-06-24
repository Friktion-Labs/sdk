import { Connection, Keypair, Signer } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { TokenAccount } from "./types";
import { createAssociatedTokenAccountInstruction } from "./token";
import { TransactionInstruction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  makeAndSendTx,
  sendSignedTransaction,
} from "@friktion-labs/friktion-utils";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export const FAUCET_PROGRAM_ID = new PublicKey(
  "4bXpkKSV8swHSnwqtzuboGPaPDeEgAn4Vt8GfarV5rZt"
);
export const getPDA = () =>
  PublicKey.findProgramAddress([Buffer.from("faucet")], FAUCET_PROGRAM_ID);

export const createAccountsAndAirdrop = async (
  connection: Connection,
  user: Keypair,
  asset: any,
  existingAccount: TokenAccount | undefined,
  amount: number
) => {
  try {
    let receivingAccountPublicKey = existingAccount?.pubKey;
    const tx = new Transaction();
    const mintPublicKey = new PublicKey(asset.mintAddress);

    if (!existingAccount) {
      const associatedAddress = await getAssociatedTokenAddress(
        asset.mintAddress,
        user.publicKey
      );
      try {
        await getAccount(connection, associatedAddress);
      } catch (err) {
        const [ix, associatedTokenPublicKey] =
          await createAssociatedTokenAccountInstruction({
            payer: user.publicKey,
            owner: user.publicKey,
            mintPublicKey,
          });
        tx.add(ix);
      }
      receivingAccountPublicKey = associatedAddress;
      // subscribeToTokenAccount(receivingAccountPublicKey);
    }

    const amountToDrop = new anchor.BN(amount).mul(
      new anchor.BN(10).pow(new anchor.BN(asset.decimals))
    );

    const airdropIx = await buildAirdropTokensIx(
      amountToDrop,
      undefined as unknown as PublicKey, // admin key, not needed
      mintPublicKey,
      receivingAccountPublicKey as PublicKey,
      new PublicKey(asset.faucetAddress)
    );
    tx.add(airdropIx);
    makeAndSendTx(connection, user, tx, []);

    return receivingAccountPublicKey;
  } catch (err) {
    console.log("problem when airdropping: error");
    console.log(err);
  }
};

export const buildAirdropTokensIx = async (
  amount: anchor.BN,
  adminPubkey: PublicKey,
  tokenMintPublicKey: PublicKey,
  destinationAccountPubkey: PublicKey,
  faucetPubkey: PublicKey
): Promise<TransactionInstruction> => {
  const pubkeyNonce = await getPDA();

  const keys = [
    { pubkey: pubkeyNonce[0], isSigner: false, isWritable: false },
    {
      pubkey: tokenMintPublicKey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: destinationAccountPubkey, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: faucetPubkey, isSigner: false, isWritable: false },
  ];

  if (adminPubkey) {
    keys.push({
      pubkey: adminPubkey,
      isSigner: true,
      isWritable: false,
    });
  }

  return new TransactionInstruction({
    programId: FAUCET_PROGRAM_ID,
    data: Buffer.from([1, ...amount.toArray("le", 8)]),
    keys,
  });
};
