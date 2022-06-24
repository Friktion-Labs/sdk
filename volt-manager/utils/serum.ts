import * as anchor from "@project-serum/anchor";
import { Market } from "@project-serum/serum";
import { sendIns } from "@friktion-labs/friktion-utils";
import { ConnectedVoltSDK } from "../../src";
import { GenericOptionsContractWithKey } from "@friktion-labs/friktion-sdk";
export const initSerumMarket = async (
  voltSdk: ConnectedVoltSDK,
  provider: anchor.Provider,
  optionMarket: GenericOptionsContractWithKey
) => {
  const voltVault = voltSdk.voltVault;
  const optionMarketKey = optionMarket.key;

  const { instructions, signers, serumMarketKey } =
    await voltSdk.initSerumMarket(voltVault.permissionedMarketPremiumMint);

  return {
    instructions,
    signers,
    serumMarketKey,
  };
};

export const crankEventQueue = async (
  provider: anchor.AnchorProvider,
  market: Market
) => {
  let eq = await market.loadEventQueue(provider.connection);
  while (eq.length > 0) {
    console.log("crank tx...");
    await sendIns(
      provider,
      // @ts-ignore
      market.makeConsumeEventsInstruction([eq[0].openOrders], 1)
    );
    eq = await market.loadEventQueue(provider.connection);
  }
};
