import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram, PublicKey, Keypair } from "@solana/web3.js";
import {
  BN,
  Program,
  Provider,
  web3,
  AnchorProvider,
} from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getVaultOwnerAndNonce } from "@friktion-labs/friktion-sdk";

const getProgramAddresses = async (
  program: Program,
  optionContract: PublicKey,
  serumDex: PublicKey
) => {
  const [serumMarket, serumMarketBump] = await PublicKey.findProgramAddress(
    [optionContract.toBuffer(), Buffer.from("serumMarket")],
    program.programId
  );
  const [requestQueue, requestQueueBump] = await PublicKey.findProgramAddress(
    [optionContract.toBuffer(), Buffer.from("requestQueue")],
    program.programId
  );
  return { requestQueue, requestQueueBump, serumMarket, serumMarketBump };
};

interface InitializeMarketParams {
  // Public key of the option contract. Used as base currency in Serum
  optionContract: PublicKey;
  // Mint address for option tokens
  optionMint: PublicKey;
  // The limit below which the quote currency is considered negligible
  quoteCurrencyDustLimit: BN;
  // Not sure yet
  quoteCurrencyLotSize: BN;
  // Mint for quote currency (USDC, USDT, etc)
  quoteCurrencyMint: PublicKey;
  // Public key for the Serum contract
  serumProgram: PublicKey;

  // Optional fields
  // Address for the program account for the market's event queue
  eventQueue?: PublicKey;
  // Address for the program account for the market's bids
  bids?: PublicKey;
  // Address for the program account for the market's asks
  asks?: PublicKey;
}

export const initializeMarket = async (
  program: Program,
  provider: AnchorProvider,
  params: InitializeMarketParams
) => {
  // console.log(`HERE IS ${Market.getLayout(params.serumProgram).span}`);
  const { requestQueue, requestQueueBump, serumMarket, serumMarketBump } =
    await getProgramAddresses(
      program,
      params.optionContract,
      params.serumProgram
    );
  const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
    serumMarket,
    params.serumProgram
  );

  const baseVault = await getAssociatedTokenAddress(
    params.optionMint,
    vaultOwner as PublicKey,
    true
  );
  const quoteVault = await getAssociatedTokenAddress(
    params.quoteCurrencyMint,
    vaultOwner as PublicKey,
    true
  );

  let { eventQueue, asks, bids } = params;
  const wallet = provider.wallet;

  // Create the optional accounts
  const instructions = [];
  const signers = [];
  if (!eventQueue) {
    const eventQueueKeys = new Keypair();
    eventQueue = eventQueueKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: eventQueue,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          262144 + 12
        ),
      space: 262144 + 12,
      programId: params.serumProgram,
    });
    instructions.push(ix);
    signers.push(eventQueueKeys);
  }

  if (!bids) {
    const bidsKeys = new Keypair();
    bids = bidsKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: bids,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          65536 + 12
        ),
      space: 65536 + 12,
      programId: params.serumProgram,
    });
    instructions.push(ix);
    signers.push(bidsKeys);
  }

  if (!asks) {
    const asksKeys = new Keypair();
    asks = asksKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: asks,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          65536 + 12
        ),
      space: 65536 + 12,
      programId: params.serumProgram,
    });
    instructions.push(ix);
    signers.push(asksKeys);
  }
  const accounts = {
    payer: wallet.publicKey,
    contract: params.optionContract,
    serumMarket: serumMarket,
    dexProgram: params.serumProgram,
    quoteMint: params.quoteCurrencyMint,
    optionMint: params.optionMint,
    requestQueue: requestQueue,
    eventQueue: eventQueue,
    bids: bids,
    asks: asks,
    optionVault: baseVault,
    quoteVault: quoteVault,
    serumMarketAuthority: serumMarket,
    vaultSigner: vaultOwner,
    rent: web3.SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  };
  // Object.keys(accounts).forEach((key) => {
  //   // @ts-ignore
  //   console.log(`KEY: ${key}: ACCOUNT: ${accounts[key].toBase58()}`);
  // });

  const baseLotSize = new BN(1);
  // @ts-ignore
  const tx = await program.rpc.createSerumMarket(
    vaultSignerNonce,
    baseLotSize,
    params.quoteCurrencyLotSize,
    params.quoteCurrencyDustLimit,
    {
      accounts: {
        payer: wallet.publicKey,
        contract: params.optionContract,
        serumMarket: serumMarket,
        dexProgram: params.serumProgram,
        quoteMint: params.quoteCurrencyMint,
        optionMint: params.optionMint,
        requestQueue: requestQueue,
        eventQueue: eventQueue,
        bids: bids,
        asks: asks,
        optionVault: baseVault,
        quoteVault: quoteVault,
        serumMarketAuthority: serumMarket,
        vaultSigner: vaultOwner as PublicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers: signers,
      instructions: instructions,
    }
  );

  return {
    ...params,
    tx,
    serumMarket,
    eventQueue,
    bids,
    asks,
    quoteVault,
  };
};
