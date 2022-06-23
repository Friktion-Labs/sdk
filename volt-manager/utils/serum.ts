import * as anchor from "@project-serum/anchor";
import { ConnectedVoltSDK } from "../../src";
import { GenericOptionsContractWithKey } from "../../src/programs/Volt/voltTypes";
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
