import type * as anchor from "@project-serum/anchor";
import type {
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

import type { FriktionSDK, OptionMarketWithKey } from "../../src";
import { VoltSDK } from "../../src";
import { makeAndSendTx } from "./sendTransactionHelpers";

export const sendInsCatching = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction,
  timeout?: number
): Promise<boolean> => {
  try {
    await sendIns(provider, ins, timeout);
    return true;
  } catch (err) {
    console.log("error but fuck it");
    return false;
  }
};

export const sendIns = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction,
  timeout?: number
) => {
  const tx = new Transaction();

  tx.add(ins);

  await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    [],
    timeout
  );
};

export const sendInsListCatching = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  signers?: Signer[]
) => {
  try {
    await sendInsList(provider, insList, signers);
  } catch (err) {
    console.log("error but fuck it");
  }
};

export const sendInsList = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  signers?: Signer[]
) => {
  const tx = new Transaction();

  for (const ix of insList) {
    tx.add(ix);
  }

  await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    signers ?? []
  );
};

export const initializeVoltWithoutOptionMarketSeed = async (
  provider: anchor.AnchorProvider,
  friktionSdk: FriktionSDK,
  quoteAssetMint: PublicKey,
  underlyingAssetMint: PublicKey,
  permissionedMarketPremiumMint: PublicKey,
  underlyingAmountPerContract: anchor.BN,
  // whitelistMintKey: PublicKey,
  vaultType: anchor.BN,
  transferTimeWindow: anchor.BN,
  expirationInterval: anchor.BN,
  upperBoundOtmStrikeFactor: anchor.BN,
  seed: PublicKey,
  capacity: anchor.BN,
  individualCapacity: anchor.BN,
  permissionlessAuctions: boolean
) => {
  const { instruction, voltKey } =
    await VoltSDK.initializeVoltWithoutOptionMarketSeed({
      sdk: friktionSdk,
      user: provider.wallet.publicKey,
      quoteAssetMint: quoteAssetMint,
      underlyingAssetMint: underlyingAssetMint,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,
      underlyingAmountPerContract: underlyingAmountPerContract,
      serumProgramId: friktionSdk.net.SERUM_DEX_PROGRAM_ID,
      transferTimeWindow: transferTimeWindow,
      expirationInterval: expirationInterval,
      upperBoundOtmStrikeFactor: upperBoundOtmStrikeFactor,
      seed: seed,
      capacity: capacity,
      individualCapacity: individualCapacity,
      permissionlessAuctions: permissionlessAuctions,
    });

  await sendIns(provider, instruction);

  return voltKey;
};

export const initializeVolt = async (
  provider: anchor.AnchorProvider,
  friktionSdk: FriktionSDK,
  optionMarket: OptionMarketWithKey,
  permissionedMarketPremiumMint: PublicKey,
  vaultType: anchor.BN,
  transferTimeWindow: anchor.BN,
  expirationInterval: anchor.BN,
  upperBoundOtmStrikeFactor: anchor.BN,
  seed: PublicKey,
  capacity: anchor.BN,
  individualCapacity: anchor.BN,
  permissionlessAuctions: boolean
) => {
  const { instruction, voltKey } = await VoltSDK.initializeVolt({
    sdk: friktionSdk,
    user: provider.wallet.publicKey,
    optionMarket: optionMarket,
    permissionedMarketPremiumMint: permissionedMarketPremiumMint,
    serumProgramId: friktionSdk.net.SERUM_DEX_PROGRAM_ID,
    transferTimeWindow: transferTimeWindow,
    expirationInterval: expirationInterval,
    upperBoundOtmStrikeFactor: upperBoundOtmStrikeFactor,
    seed: seed,
    capacity: capacity,
    individualCapacity: individualCapacity,
    permissionlessAuctions: permissionlessAuctions,
  });

  await sendIns(provider, instruction);

  return voltKey;
};
