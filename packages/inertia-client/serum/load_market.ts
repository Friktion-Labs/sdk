import { Provider } from "@project-serum/anchor";
import { Market } from "@project-serum/serum/lib/market";
import { PublicKey } from "@solana/web3.js";

// TODO(sbb): Serum market ID should be included in contract
export const loadMarketForOption = async (
  provider: Provider,
  marketPublicKey: PublicKey,
  serumDex: PublicKey
) => {
  return await Market.load(
    provider.connection,
    marketPublicKey,
    undefined,
    serumDex
  );
};
