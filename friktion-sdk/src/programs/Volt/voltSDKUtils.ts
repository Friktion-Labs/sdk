import type { Connection, PublicKey } from "@solana/web3.js";

import { VoltType } from "../../constants";
import { ConnectedEntropyVoltSDK } from "./ConnectedEntropyVoltSDK";
import { ConnectedShortOptionsVoltSDK } from "./ConnectedShortOptionsVoltSDK";
import type { EntropyVoltSDK } from "./EntropyVoltSDK";
import type { ShortOptionsVoltSDK } from "./ShortOptionsVoltSDK";
import type { VoltSDK } from "./VoltSDK";

export const toConnectedSDK = (
  voltSdk: VoltSDK,
  connection: Connection,
  wallet: PublicKey,
  daoAuthority?: PublicKey | undefined
): ConnectedEntropyVoltSDK | ConnectedShortOptionsVoltSDK => {
  if (voltSdk.voltType() === VoltType.ShortOptions) {
    console.log("creating connected short options volt sdk");
    return toConnectedShortOptionsSDK(
      voltSdk as ShortOptionsVoltSDK,
      connection,
      wallet,
      daoAuthority
    );
  } else if (voltSdk.voltType() === VoltType.Entropy) {
    return toConnectedEntropySDK(
      voltSdk as EntropyVoltSDK,
      connection,
      wallet,
      daoAuthority
    );
  } else {
    throw new Error("Unknown Volt type");
  }
};

export const toConnectedEntropySDK = (
  voltSdk: EntropyVoltSDK,
  connection: Connection,
  wallet: PublicKey,
  daoAuthority?: PublicKey | undefined
): ConnectedEntropyVoltSDK => {
  return new ConnectedEntropyVoltSDK(voltSdk, connection, wallet, daoAuthority);
};

export const toConnectedShortOptionsSDK = (
  voltSdk: ShortOptionsVoltSDK,
  connection: Connection,
  wallet: PublicKey,
  daoAuthority?: PublicKey | undefined
): ConnectedShortOptionsVoltSDK => {
  return new ConnectedShortOptionsVoltSDK(
    voltSdk,
    connection,
    wallet,
    daoAuthority
  );
};
