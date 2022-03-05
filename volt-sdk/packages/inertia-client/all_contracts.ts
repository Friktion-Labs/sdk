import {
  InertiaContractWithKey,
  InertiaProgram,
} from "../../src/programs/Inertia/inertiaTypes";
import { AssetPair } from "./types";

export const getAllContracts = async (program: InertiaProgram) => {
  const contracts = await program.account.optionsContract.all();
  return contracts.map((c) => ({
    ...c.account,
    publicKey: c.publicKey,
  })) as unknown as Array<InertiaContractWithKey>;
};

export const getActiveExpiryForPair = (
  contracts: Array<InertiaContractWithKey>,
  pair: AssetPair
) => {
  return contracts
    .filter(
      (c) =>
        c.underlyingMint.equals(pair.underlying) &&
        c.quoteMint.equals(pair.quote)
    )
    .map((c) => c.expiryTs);
};
