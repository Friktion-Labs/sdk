import * as anchor from "@project-serum/anchor";
import { Market } from "@project-serum/serum";
import {
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { makeAndSendTx } from "../../friktion-utils";
import { ConnectedVoltSDK, FriktionSDK, VoltSDK } from "../../src";
import { initSerumMarket } from "./serum";
import { GenericOptionsContractWithKey } from "../../src/programs/Volt/voltTypes";
import BN from "bn.js";

export const sendInsCatching = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction
) => {
  try {
    await sendIns(provider, ins);
  } catch (err) {
    console.log("error but fuck it");
  }
};

export const sendIns = async (
  provider: anchor.AnchorProvider,
  ins: TransactionInstruction
) => {
  const tx = new Transaction();

  tx.add(ins as any);

  await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    []
  );
};
export const sendInsListCatching = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  signers?: Signer[]
): Promise<boolean> => {
  try {
    await sendInsList(provider, insList, signers);
    return true;
  } catch (err) {
    console.log("error but fuck it");
    return false;
  }
};

export const sendInsList = async (
  provider: anchor.AnchorProvider,
  insList: TransactionInstruction[],
  signers?: Signer[]
) => {
  console.log("sending ix batch...");
  const tx = new Transaction();

  for (var ix of insList) {
    tx.add(ix);
  }

  await makeAndSendTx(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tx,
    signers ?? []
  );
};

export const initSerumMarketForVolt = async (
  voltSdk: ConnectedVoltSDK
): Promise<void> => {
  const optionMarket = await voltSdk.getOptionsContractByKey(
    voltSdk.voltVault.optionMarket
  );

  const { serumMarketKey, instructions, signers } = await initSerumMarket(
    voltSdk,
    voltSdk.sdk.readonlyProvider,
    optionMarket
  );
  console.log(
    "volt = " +
      voltSdk.voltKey.toString() +
      ", serum market = " +
      serumMarketKey.toString()
  );

  try {
    await Market.load(
      voltSdk.sdk.readonlyProvider.connection,
      serumMarketKey,
      {},
      voltSdk.sdk.net.SERUM_DEX_PROGRAM_ID
    );
  } catch (err) {
    console.log(err);
    await sendInsListCatching(
      voltSdk.sdk.readonlyProvider,
      instructions,
      signers
    );
  }
};

export const initializeVoltWithoutOptionMarketSeed = async (
  provider: anchor.AnchorProvider,
  friktionSdk: FriktionSDK,
  quoteAssetMint: PublicKey,
  underlyingAssetMint: PublicKey,
  permissionedMarketPremiumMint: PublicKey,
  underlyingAmountPerContract: anchor.BN,
  expirationInterval: anchor.BN,
  seed: PublicKey,
  capacity: anchor.BN,
  individualCapacity: anchor.BN,
  permissionlessAuctions: boolean
) => {
  const { instruction, voltKey } =
    await VoltSDK.initializeVoltWithoutOptionMarketSeed({
      sdk: friktionSdk,
      adminKey: provider.wallet.publicKey,
      quoteAssetMint: quoteAssetMint,
      underlyingAssetMint: underlyingAssetMint,
      permissionedMarketPremiumMint: permissionedMarketPremiumMint,
      underlyingAmountPerContract: underlyingAmountPerContract,
      expirationInterval,
      serumProgramId: friktionSdk.net.SERUM_DEX_PROGRAM_ID,
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
  optionMarket: GenericOptionsContractWithKey,
  permissionedMarketPremiumMint: PublicKey,
  expirationInterval: BN,
  seed: PublicKey,
  capacity: anchor.BN,
  individualCapacity: anchor.BN,
  permissionlessAuctions: boolean
) => {
  const { instruction, voltKey } = await VoltSDK.initializeVolt({
    sdk: friktionSdk,
    adminKey: provider.wallet.publicKey,
    optionMarket: optionMarket,
    permissionedMarketPremiumMint: permissionedMarketPremiumMint,
    serumProgramId: friktionSdk.net.SERUM_DEX_PROGRAM_ID,
    seed: seed,
    expirationInterval,
    capacity: capacity,
    individualCapacity: individualCapacity,
    permissionlessAuctions: permissionlessAuctions,
  });

  await sendIns(provider, instruction);

  return voltKey;
};
