import {
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "../../src/programs/Soloptions/soloptionsTypes";
import { AssetPair } from "./types";
import { SoloptionsContract } from "../../src/programs/Soloptions/soloptionsTypes";
import { ProgramAccount } from "@project-serum/anchor";

export const getAllContracts = async (program: SoloptionsProgram) => {
  const contracts =
    (await program.account.optionsContract.all()) as unknown as ProgramAccount<SoloptionsContract>[];
  return contracts.map((c) => ({
    ...c.account,
    publicKey: c.publicKey,
  })) as unknown as Array<SoloptionsContractWithKey>;
};

export const getActiveExpiryForPair = (
  contracts: Array<SoloptionsContractWithKey>,
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

// export const getActiveStrikes = (
//   contracts: Array<SoloptionsContractWithKey>,
//   pair: AssetPair,
//   expiry: number
// ) => {
//   return contracts
//     .filter(
//       (c) =>
//         c.underlyingMint.equals(pair.underlying) &&
//         c.quoteMint.equals(pair.quote) &&
//         c.expiryTs.toNumber() === expiry
//     )
//     .map((c) => c.strike);
// };
