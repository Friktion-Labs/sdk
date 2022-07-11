import { BN } from "@project-serum/anchor";
import type { Middleware } from "@project-serum/serum";
import {
  Logger,
  MarketProxyBuilder,
  OpenOrdersPda,
  ReferralFees,
} from "@project-serum/serum";
import type {
  Connection,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import { VoltSDK } from "./VoltSDK";

/**
 * Create a MarketProxy
 *
 * @param program - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */

export const marketLoaderFunction = (
  sdk: VoltSDK,
  whitelistTokenAccountKey: PublicKey
) => {
  return async (serumMarketKey: PublicKey) => {
    const optionMarketKey = sdk.voltVault.optionMarket;
    const [marketKey] = await VoltSDK.findSerumMarketAddress(
      sdk.voltKey,
      sdk.sdk.net.MM_TOKEN_MINT,
      optionMarketKey
    );

    if (marketKey.toString() !== serumMarketKey.toString())
      throw new Error(
        "serum market should equal the PDA based on current option"
      );

    const [auctionMetadataKey] = await VoltSDK.findAuctionMetadataAddress(
      sdk.voltKey
    );

    const { marketAuthorityBump } = await sdk.getMarketAndAuthorityInfo(
      optionMarketKey
    );

    return new MarketProxyBuilder()
      .middleware(
        new OpenOrdersPda({
          proxyProgramId: sdk.sdk.programs.Volt.programId,
          dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
        })
      )
      .middleware(new ReferralFees())
      .middleware(
        new Validation(
          auctionMetadataKey,
          optionMarketKey,
          whitelistTokenAccountKey,
          marketAuthorityBump
        )
      )
      .middleware(new Logger())
      .load({
        connection: sdk.sdk.readonlyProvider.connection,
        market: marketKey,
        dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
        proxyProgramId: sdk.sdk.programs.Volt.programId,
        options: { commitment: "recent" },
      });
  };
};

/**
 * Create a MarketProxy
 *
 * @param middlewareProgram - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
export const marketLoader = async (
  sdk: VoltSDK,
  serumMarketKey: PublicKey,
  whitelistTokenAccountKey: PublicKey
) => {
  return await marketLoaderFunction(
    sdk,
    whitelistTokenAccountKey
  )(serumMarketKey);
};

export const getVaultOwnerAndNonce = async (
  marketPublicKey: PublicKey,
  dexProgramId: PublicKey
) => {
  const nonce = new BN(0);
  while (nonce.toNumber() < 255) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        dexProgramId
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
  throw new Error("Unable to find nonce");
};

// b"open-orders"
export const openOrdersSeed = Buffer.from([
  111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
]);

export class Validation implements Middleware {
  auctionMetadataKey: PublicKey;
  optionMarketKey: PublicKey;
  whitelistKey: PublicKey;
  marketAuthorityBump: number;

  constructor(
    auctionMetadataKey: PublicKey,
    optionMarketKey: PublicKey,
    whitelistKey: PublicKey,
    marketAuthorityBump: number
  ) {
    this.auctionMetadataKey = auctionMetadataKey;
    this.optionMarketKey = optionMarketKey;
    this.marketAuthorityBump = marketAuthorityBump;
    this.whitelistKey = whitelistKey;
  }

  initOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([0]), ix.data]);
    this.addPdaKeys(ix);
  }
  newOrderV3(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([1]), ix.data]);
    this.addPdaKeys(ix);
  }
  cancelOrderV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([2]), ix.data]);
  }
  cancelOrderByClientIdV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([3]), ix.data]);
  }
  settleFunds(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([4]), ix.data]);
  }
  closeOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([5]), ix.data]);
  }
  prune(ix: TransactionInstruction) {
    // prepend a discriminator and the marketAuthorityBump
    const bumpBuffer = new BN(this.marketAuthorityBump).toArrayLike(
      Buffer,
      "le",
      1
    );
    ix.data = Buffer.concat([Buffer.from([6]), bumpBuffer, ix.data]);
    // prepend the optionMarket key

    this.addPdaKeys(ix);
  }

  consumeEvents(_ix: TransactionInstruction) {
    throw new Error("Not implemented");
  }
  consumeEventsPermissioned(_ix: TransactionInstruction) {
    throw new Error("Not implemented");
  }

  addPdaKeys(ix: TransactionInstruction) {
    ix.keys = [
      { pubkey: this.whitelistKey, isWritable: false, isSigner: false },
      { pubkey: this.optionMarketKey, isWritable: false, isSigner: false },
      { pubkey: this.auctionMetadataKey, isWritable: false, isSigner: false },
      ...ix.keys,
    ];
    return ix;
  }
}

export const getMarketAndAuthorityInfo = async (
  sdk: VoltSDK,
  optionMarketKey: PublicKey
) => {
  return await sdk.getMarketAndAuthorityInfo(optionMarketKey);
};

export const createFirstSetOfAccounts = async ({
  connection,
  userKey,
  dexProgramId,
}: {
  connection: Connection;
  userKey: PublicKey;
  dexProgramId: PublicKey;
}): Promise<{
  instructions: TransactionInstruction[];
  eventQueue: Keypair;
  bids: Keypair;
  asks: Keypair;
  signers: Signer[];
}> => {
  const eventQueue = new Keypair();
  const bids = new Keypair();
  const asks = new Keypair();

  const instructions: TransactionInstruction[] = [
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: eventQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: bids.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: userKey,
      newAccountPubkey: asks.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
  ];

  const signers = [eventQueue, bids, asks];

  return { instructions, eventQueue, bids, asks, signers };
};
