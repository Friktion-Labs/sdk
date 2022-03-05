import * as anchor from "@project-serum/anchor";
import { ProgramAccount } from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import { VoltVault, VoltVaultWithKey } from "./types";
import * as VoltIDLJsonRaw from "./volt.json";

const cli = new Command();

cli
  .version("1.0.0")
  .description("CLI tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-m, --match <string>",
    "set of characters to match volt address against"
  )
  .parse(process.argv);

(async () => {
    const PROVIDER_URL = "https://api.devnet.solana.com";
//   const PROVIDER_URL = "https://solana-api.projectserum.com";
  const provider = new anchor.Provider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  const connection = provider.connection;
const friktionProgram = new anchor.Program(
    VoltIDLJsonRaw as any,
    new PublicKey("VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp"),
    provider
);
let voltVaults: VoltVaultWithKey[];
  const user = (provider.wallet as anchor.Wallet).payer;
  if (!cli.match) voltVaults = ((await friktionProgram?.account?.voltVault?.all()) as unknown as ProgramAccount<VoltVault>[])
                            .map(
                                (acct) => ({
                                    ...acct.account,
                                    voltKey: acct.publicKey,
                                  })
                            );
  else {
      const temp = (await friktionProgram.account.voltVault?.fetch(new PublicKey(cli.match as string))) as VoltVault;
      voltVaults = [
        {
            ...temp,
            voltKey: new PublicKey(cli.match)
        }
    ]
}


  console.log("match = ", cli.match);
  for (const vv of voltVaults) {
    if (cli.match !== undefined && !vv.voltKey.toString().includes(cli.match)) {
      // console.log("skipping since does not match");
      continue;
    }

    console.log("volt: ", vv.voltKey.toString());

    console.log(
        "General Info\n --------------",
        "\n, underlying asset mint: ", vv.underlyingAssetMint.toString(),
        "\n, quote asset mint: ", vv.quoteAssetMint.toString()
      )

    const underlyingToken = new Token(
      provider.connection,
      vv.underlyingAssetMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const vaultToken = new Token(
      provider.connection,
      vv.vaultMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const quoteToken = new Token(
      provider.connection,
      vv.quoteAssetMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const optionToken = new Token(
      provider.connection,
      vv.optionMint,
      TOKEN_PROGRAM_ID,
      user
    );

    const writerToken = new Token(
      provider.connection,
      vv.writerTokenMint,
      TOKEN_PROGRAM_ID,
      user
    );


  }
})()