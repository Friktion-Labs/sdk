/// <reference types="bn.js" />
import * as anchor from "@project-serum/anchor";
import type { Market } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import type { PerpProtocol } from "../../constants";
export declare const getProgramIdForPerpProtocol: (perpProtocol: PerpProtocol) => PublicKey;
export declare const getVaultOwnerAndNonceForSpot: (market: Market) => Promise<(anchor.web3.PublicKey | anchor.BN)[]>;
//# sourceMappingURL=utils.d.ts.map