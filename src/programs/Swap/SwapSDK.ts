import type { ProviderLike } from "@friktion-labs/friktion-utils";
import { providerToAnchorProvider } from "@friktion-labs/friktion-utils";
import type { AnchorProvider, Idl } from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import {
  GLOBAL_MM_TOKEN_MINT,
  OTHER_IDLS,
  SIMPLE_SWAP_PROGRAM_ID,
} from "../../constants";
import type { FriktionSDK } from "../../FriktionSDK";
import type { NetworkName } from "../../helperTypes";
import type {
  SimpleSwapIXAccounts,
  SimpleSwapOrder,
  SimpleSwapProgram,
  SimpleSwapUserOrdersWithKey,
} from "./swapTypes";

export const DefaultSwapSDKOpts = {
  network: "mainnet-beta",
};
export type SwapSDKOpts = {
  provider: ProviderLike;
  network?: NetworkName;
};
export class SwapSDK {
  readonly swapOrder: SimpleSwapOrder;
  readonly swapOrderKey: PublicKey;
  readonly program: SimpleSwapProgram;
  readonly readonlyProvider: AnchorProvider;
  readonly network: NetworkName;

  constructor(
    swapOrder: SimpleSwapOrder,
    swapOrderKey: PublicKey,
    opts: SwapSDKOpts
  ) {
    const defaultedOpts = Object.assign({}, opts, DefaultSwapSDKOpts);
    this.readonlyProvider = providerToAnchorProvider(defaultedOpts.provider);

    this.network = !opts.network
      ? "mainnet-beta"
      : opts.network === "testnet" || opts.network === "localnet"
      ? "mainnet-beta"
      : opts.network;

    const SimpleSwap = new Program(
      OTHER_IDLS.SimpleSwap as Idl,
      SIMPLE_SWAP_PROGRAM_ID,
      this.readonlyProvider
    );

    this.program = SimpleSwap as unknown as SimpleSwapProgram;
    this.swapOrder = swapOrder;
    this.swapOrderKey = swapOrderKey;
  }

  async getUserOrdersByKey(
    key: PublicKey
  ): Promise<SimpleSwapUserOrdersWithKey> {
    const acct = await this.program.account.userOrders.fetch(key);
    const ret = {
      ...acct,
      key: key,
    };
    return ret;
  }

  static async findSwapOrderAddress(
    user: PublicKey,
    orderId: BN,
    swapProgramId: PublicKey = SIMPLE_SWAP_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [
        textEncoder.encode("swapOrder"),
        user.toBuffer(),
        orderId.toBuffer("le", 8),
      ],
      swapProgramId
    );
  }

  static async findGivePoolAddress(
    swapOrderKey: PublicKey,
    swapProgramId: PublicKey = SIMPLE_SWAP_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("givePool"), swapOrderKey.toBuffer()],
      swapProgramId
    );
  }

  static async findReceivePoolAddress(
    swapOrderKey: PublicKey,
    swapProgramId: PublicKey = SIMPLE_SWAP_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("receivePool"), swapOrderKey.toBuffer()],
      swapProgramId
    );
  }

  static async findUserOrdersAddress(
    user: PublicKey,
    swapProgramId: PublicKey = SIMPLE_SWAP_PROGRAM_ID
  ): Promise<[PublicKey, number]> {
    const textEncoder = new TextEncoder();
    return await PublicKey.findProgramAddress(
      [textEncoder.encode("userOrders"), user.toBuffer()],
      swapProgramId
    );
  }

  static async create(
    sdk: FriktionSDK,
    user: PublicKey,
    giveMint: PublicKey,
    receiveMint: PublicKey,
    creatorGivePool: PublicKey,
    giveSize: BN,
    receiveSize: BN,
    expiry: number,
    counterparty?: PublicKey,
    whitelistTokenMint?: PublicKey
  ): Promise<{
    instruction: TransactionInstruction;
    swapOrderKey: PublicKey;
  }> {
    let orderId: BN;
    const [userOrdersKey] = await SwapSDK.findUserOrdersAddress(user);
    try {
      const userOrders: SimpleSwapUserOrdersWithKey =
        await sdk.loadUserOrdersByKey(userOrdersKey);
      orderId = new BN(userOrders.currOrderId);
    } catch (err) {
      console.log(err);
      orderId = new BN(0);
    }

    console.log("order id = ", orderId.toString());
    const [swapOrderKey] = await SwapSDK.findSwapOrderAddress(user, orderId);
    const [givePoolKey] = await SwapSDK.findGivePoolAddress(swapOrderKey);
    const [receivePoolKey] = await SwapSDK.findReceivePoolAddress(swapOrderKey);

    const accounts: SimpleSwapIXAccounts["create"] = {
      payer: user,
      authority: user,
      userOrders: userOrdersKey,
      swapOrder: swapOrderKey,
      givePool: givePoolKey,
      receivePool: receivePoolKey,
      giveMint,
      receiveMint,
      creatorGivePool: creatorGivePool,
      counterparty: counterparty ?? SystemProgram.programId,
      whitelistTokenMint: whitelistTokenMint ?? GLOBAL_MM_TOKEN_MINT,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };
    const instruction = (await sdk.programs.SimpleSwap.methods
      .create?.(
        giveSize,
        receiveSize,
        new BN(expiry),
        counterparty !== undefined,
        whitelistTokenMint !== undefined
      )
      .accounts(accounts)
      .instruction()) as TransactionInstruction;

    Object.entries(accounts).forEach((e) =>
      console.log(e[0].toString(), " = ", e[1]?.toString())
    );

    return {
      instruction,
      swapOrderKey,
    };
  }

  exec(
    user: PublicKey,
    giveTokenAccount: PublicKey,
    receiveTokenAccount: PublicKey,
    whitelistTokenAccount?: PublicKey
  ): TransactionInstruction {
    if (whitelistTokenAccount === undefined) {
      if (this.swapOrder.isWhitelisted) {
        throw new Error(
          "whitelist token account must be given if swap order is whitelisted"
        );
      }

      whitelistTokenAccount = SystemProgram.programId;
    }
    const execAccounts: SimpleSwapIXAccounts["exec"] = {
      authority: user,
      swapOrder: this.swapOrderKey,
      givePool: this.swapOrder.givePool,
      receivePool: this.swapOrder.receivePool,

      counterpartyReceivePool: receiveTokenAccount,
      counterpartyGivePool: giveTokenAccount,
      whitelistTokenAccount: whitelistTokenAccount,

      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };

    return this.program.instruction.exec({
      accounts: execAccounts,
    });
  }

  claim(
    user: PublicKey,
    giveTokenAccount: PublicKey,
    receiveTokenAccount: PublicKey
  ): TransactionInstruction {
    const claimAccounts: SimpleSwapIXAccounts["claim"] = {
      givePool: this.swapOrder.givePool,
      receivePool: this.swapOrder.receivePool,
      authority: user,
      swapOrder: this.swapOrderKey,
      creatorGivePool: giveTokenAccount,
      creatorReceivePool: receiveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };

    return this.program.instruction.claim({
      accounts: claimAccounts,
    });
  }

  cancel(user: PublicKey, giveTokenAccount: PublicKey): TransactionInstruction {
    const cancelAccounts: SimpleSwapIXAccounts["cancel"] = {
      givePool: this.swapOrder.givePool,
      receivePool: this.swapOrder.receivePool,
      authority: user,
      swapOrder: this.swapOrderKey,
      creatorGivePool: giveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };

    return this.program.instruction.cancel({
      accounts: cancelAccounts,
    });
  }
}
