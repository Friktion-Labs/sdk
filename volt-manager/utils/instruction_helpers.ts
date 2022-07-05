import { GenericOptionsContractWithKey } from "@friktion-labs/friktion-sdk";
import {
  sendIns,
  sendInsList,
  sendInsListCatching,
} from "@friktion-labs/friktion-utils";
import * as anchor from "@project-serum/anchor";
import { Market } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  ConnectedVoltSDK,
  FriktionSDK,
  VoltSDK,
} from "@friktion-labs/friktion-sdk";
import { initSerumMarket } from "./serum";

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
      serumProgramId: friktionSdk.net.SERUM_DEX_PROGRAM_ID,
      expirationInterval: expirationInterval,
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
  expirationInterval: anchor.BN,
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
    expirationInterval: expirationInterval,
    seed: seed,
    capacity: capacity,
    individualCapacity: individualCapacity,
    permissionlessAuctions: permissionlessAuctions,
  });

  await sendIns(provider, instruction);

  return voltKey;
};
