import { PublicKey } from "@solana/web3.js";
import {
  SoloptionsContractWithKey,
  SoloptionsProgram,
} from "@friktion-labs/friktion-sdk/programs/soloptionsTypes";
import { getAllContracts } from "../../soloptions-client";
import * as anchor from "@project-serum/anchor";

const { SERUM_DEX_ID = "5dKskCnLbJ2VNsPLt5duYU8DGfcqX5UAnmNQynQWnXvP" } =
  process.env;

export const initAnchor = () => {
  const program: SoloptionsProgram = anchor.workspace.Soloptions;
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);
  return { provider, program };
};

export const getContractByPublicKey = async (
  program: SoloptionsProgram,
  publicKey: string
): Promise<SoloptionsContractWithKey> => {
  const pubKey = new PublicKey(publicKey);
  const contract = await getAllContracts(program).then((contracts) =>
    contracts.find((c) => c.key.equals(pubKey))
  );
  if (!contract) {
    throw new Error("Invalid contract publickey");
  }
  return contract;
};

export const getSerumDex = () => {
  return new PublicKey(SERUM_DEX_ID);
};
