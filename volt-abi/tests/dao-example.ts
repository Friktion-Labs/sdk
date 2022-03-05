import { FriktionSDK, VoltSDK } from "../../volt-sdk/src";
import * as anchor from "@project-serum/anchor";
import { Market, MarketProxy } from "@project-serum/serum";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import assert from "assert";
import { createTokenAccounts } from "./tokenAccountUtils";
import {TextEncoder} from "util";
import {DaoExamplesProgram} from "../../volt-sdk/src/programs/Volt/daoExampleTypes";

export const FRIKTION_PROGRAM_ID = new PublicKey(
    "VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp"
  );
  
export const DAO_EXAMPLES_PROGRAM_ID = new PublicKey(
  "DAo2pDtpiBFDu4TTiv2WggP6PfQ6FnKqwSRYxpMjyuV2"
);

anchor.setProvider(anchor.Provider.env());
const program = anchor.workspace.Daoexamples as anchor.Program;
const anchorProvider = program.provider;
const walletPayer = (program.provider.wallet as anchor.Wallet).payer;

(async() => {
    const volt = new PublicKey('CdZ1Mgo3927bsYdKK5rnzGtwek3NLWdvoTSSm2TJjdqW');
    const friktionSdk = new FriktionSDK({
      provider: anchorProvider,
      network: "mainnet-beta",
    });  
    const unconnectedVoltSdk = await friktionSdk.loadVoltByKey(volt)

    
    const textEncoder = new TextEncoder();
    const [daoProgramAuthorityKey, daoProgramAuthorityBump] =
      await PublicKey.findProgramAddress(
        [textEncoder.encode("daoProgramAuthority")],
        DAO_EXAMPLES_PROGRAM_ID
      );

    // token accounts owned by daoProgramAuthorityKey. the given values are just a placeholder
    const daoExampleVaultTokenAccount = new PublicKey("CdZ1Mgo3927bsYdKK5rnzGtwek3NLWdvoTSSm2TJjdqW");
    const daoExampleUnderlyingTokenAccount = new PublicKey("CdZ1Mgo3927bsYdKK5rnzGtwek3NLWdvoTSSm2TJjdqW");

    const {
      extraVoltKey,
      roundInfoKey,
      roundUnderlyingTokensKey,
      roundVoltTokensKey,
      pendingDepositInfoKey,
    } = await VoltSDK.findUsefulAddresses(
      unconnectedVoltSdk.voltKey,
      unconnectedVoltSdk.voltVault,
      daoProgramAuthorityKey,
      unconnectedVoltSdk.sdk.programs.Volt.programId
    );

    const depositAmount = new anchor.BN(1);

    const depositDaoExampleAccountsStruct: Parameters<
      DaoExamplesProgram["instruction"]["depositDaoExample"]["accounts"]
    >[0] = {
      authority: daoProgramAuthorityKey,
      payer: walletPayer.publicKey,
      voltVault: unconnectedVoltSdk.voltKey,
      extraVoltData: extraVoltKey,

      vaultAuthority: unconnectedVoltSdk.voltVault.vaultAuthority,

      vaultMint: unconnectedVoltSdk.voltVault.vaultMint,

      depositPool: unconnectedVoltSdk.voltVault.depositPool,
      writerTokenPool: unconnectedVoltSdk.voltVault.writerTokenPool,

      underlyingTokenSource: daoExampleUnderlyingTokenAccount,
      vaultTokenDestination: daoExampleVaultTokenAccount,

      roundInfo: roundInfoKey,
      roundVoltTokens: roundVoltTokensKey,
      roundUnderlyingTokens: roundUnderlyingTokensKey,

      pendingDepositInfo: pendingDepositInfoKey,

      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      voltProgramId: FRIKTION_PROGRAM_ID,
    };

    await program.rpc.depositDaoExample(
      depositAmount,
      daoProgramAuthorityBump,
      {
        accounts: depositDaoExampleAccountsStruct,
      }
    );

} )()
