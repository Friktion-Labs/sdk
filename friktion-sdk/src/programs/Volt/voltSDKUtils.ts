import type { Connection, PublicKey } from "@solana/web3.js";

import { VoltType } from "../../constants";
import { ConnectedEntropyVoltSDK } from "./ConnectedEntropyVoltSDK";
import { ConnectedShortOptionsVoltSDK } from "./ConnectedShortOptionsVoltSDK";
import type { EntropyVoltSDK } from "./EntropyVoltSDK";
import { ConnectedPrincipalProtectionVoltSDK } from "./Principal/ConnectedPrincipalProtectionVoltSDK";
import type { PrincipalProtectionVoltSDK } from "./Principal/PrincipalProtectionVoltSDK";
import type { ShortOptionsVoltSDK } from "./ShortOptionsVoltSDK";
import type { VoltSDK } from "./VoltSDK";

export const toConnectedSDK = (
  voltSdk: VoltSDK,
  connection: Connection,
  wallet: PublicKey,
  daoAuthority?: PublicKey | undefined
):
  | ConnectedEntropyVoltSDK
  | ConnectedShortOptionsVoltSDK
  | ConnectedPrincipalProtectionVoltSDK => {
  if (voltSdk.voltType() === VoltType.ShortOptions) {
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
  } else if (voltSdk.voltType() === VoltType.PrincipalProtection) {
    return toConnectedPrincipalProtectionSDK(
      voltSdk as PrincipalProtectionVoltSDK,
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

export const toConnectedPrincipalProtectionSDK = (
  voltSdk: PrincipalProtectionVoltSDK,
  connection: Connection,
  wallet: PublicKey,
  daoAuthority?: PublicKey | undefined
): ConnectedPrincipalProtectionVoltSDK => {
  return new ConnectedPrincipalProtectionVoltSDK(
    voltSdk,
    connection,
    wallet,
    daoAuthority
  );
};
