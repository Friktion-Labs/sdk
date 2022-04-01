import type { Program } from "@project-serum/anchor";
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
export const marketLoaderFunction =
  (
    connection: Connection,
    middlewareProgramId: PublicKey,
    optionMarketKey: PublicKey,
    whitelistKey: PublicKey,
    marketAuthorityBump: number,
    dexProgramId: PublicKey
  ) =>
  async (marketKey: PublicKey) => {
    console.log("marketLoaderFunction");
    console.log("market key: ", marketKey.toString());
    console.log("option market key: ", optionMarketKey.toString());
    console.log("whitelist key: ", whitelistKey.toString());
    console.log("dex program key: ", dexProgramId.toString());
    return new MarketProxyBuilder()
      .middleware(
        new OpenOrdersPda({
          proxyProgramId: middlewareProgramId,
          dexProgramId: dexProgramId,
        })
      )
      .middleware(new ReferralFees())
      .middleware(
        new Validation(optionMarketKey, whitelistKey, marketAuthorityBump)
      )
      .middleware(new Logger())
      .load({
        connection: connection,
        market: marketKey,
        dexProgramId: dexProgramId,
        proxyProgramId: middlewareProgramId,
        options: { commitment: "recent" },
      });
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
  optionMarketKey: PublicKey;
  whitelistKey: PublicKey;
  marketAuthorityBump: number;

  constructor(
    optionMarketKey: PublicKey,
    whitelistKey: PublicKey,
    marketAuthorityBump: number
  ) {
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
    const bumpBuffer = new BN(this.marketAuthorityBump).toBuffer("le", 1);
    ix.data = Buffer.concat([Buffer.from([6]), bumpBuffer, ix.data]);
    // prepend the optionMarket key

    this.addPdaKeys(ix);
  }

  consumeEvents(ix: TransactionInstruction) {
    console.log(ix);
    throw new Error("Not implemented");
  }
  consumeEventsPermissioned(ix: TransactionInstruction) {
    console.log(ix);
    throw new Error("Not implemented");
  }

  addPdaKeys(ix: TransactionInstruction) {
    ix.keys = [
      { pubkey: this.whitelistKey, isWritable: false, isSigner: false },
      { pubkey: this.optionMarketKey, isWritable: false, isSigner: false },
      ...ix.keys,
    ];
    return ix;
  }
}

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
  middlewareProgram: Program,
  optionMarketKey: PublicKey,
  whitelistKey: PublicKey,
  marketAuthorityBump: number,
  dexProgramId: PublicKey,
  marketKey: PublicKey
) => {
  return new MarketProxyBuilder()
    .middleware(
      new OpenOrdersPda({
        proxyProgramId: middlewareProgram.programId,
        dexProgramId: dexProgramId,
      })
    )
    .middleware(new ReferralFees())
    .middleware(
      new Validation(optionMarketKey, whitelistKey, marketAuthorityBump)
    )
    .middleware(new Logger())
    .load({
      connection: middlewareProgram.provider.connection,
      market: marketKey,
      dexProgramId: dexProgramId,
      proxyProgramId: middlewareProgram.programId,
      options: { commitment: "recent" },
    });
};

export const getMarketAndAuthorityInfo = async (
  middlewareProgramId: PublicKey,
  optionMarketKey: PublicKey,
  whitelistKey: PublicKey,
  dexProgramId: PublicKey
) => {
  const textEncoder = new TextEncoder();
  const [serumMarketKey, _serumMarketBump] = await PublicKey.findProgramAddress(
    [
      whitelistKey.toBuffer(),
      optionMarketKey.toBuffer(),
      textEncoder.encode("serumMarket"),
    ],
    middlewareProgramId
  );
  const [marketAuthority, marketAuthorityBump] =
    await PublicKey.findProgramAddress(
      [
        textEncoder.encode("open-orders-init"),
        dexProgramId.toBuffer(),
        serumMarketKey.toBuffer(),
      ],
      middlewareProgramId
    );

  return { serumMarketKey, marketAuthority, marketAuthorityBump };
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
