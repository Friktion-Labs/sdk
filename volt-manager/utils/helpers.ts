import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Signer } from "@solana/web3.js";
import { TokenAccount } from "./types";
import { getHighestAccount } from "./token";
import * as fs from "fs";
import os from "os";

const yaml = require("js-yaml");

export const wait = (delayMS: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMS));

export const getSolanaConfig = () => {
  // Read the default key file
  const HOME = os.homedir();
  const configYml = fs.readFileSync(
    `${HOME}/.config/solana/cli/config.yml`,
    "utf-8"
  );
  return yaml.load(configYml);
};

/**
 * Get the default keypair from the Solana CLI config file
 * @returns {Keypair}
 */
export const getPayer = () => {
  const solanaConfig = getSolanaConfig();
  const keyBuffer = fs.readFileSync(solanaConfig.keypair_path, "utf-8");
  return Keypair.fromSecretKey(Buffer.from(JSON.parse(keyBuffer)));
};
