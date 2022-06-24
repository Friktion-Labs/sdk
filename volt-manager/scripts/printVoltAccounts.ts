import * as anchor from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { getAccount, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Command } from "commander";
import Decimal from "decimal.js";
import { ConnectedVoltSDK, FriktionSDK, VoltSDK, VoltType } from "../../src";
import { getBalanceOrZero } from "@friktion-labs/friktion-utils";
import { getPayer } from "../utils/helpers";
import { getMintInfo } from "@project-serum/common";
import { anchorProviderToSerumProvider } from "@friktion-labs/friktion-utils";
import { BN } from "bn.js";

const cli = new Command();

cli
  .version("1.0.0")
  .description("options tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option(
    "-m, --match <string>",
    "set of characters to match volt address against"
  )
  .option(
    "-t, --match-mint <string>",
    "set of characters to match volt address against"
  )
  .option("-s, --short", "print out less info")
  .option("--very-short", "print out even less info")
  .option("--serum-markets", "print out serum markets")
  .parse(process.argv);

const options = cli.opts();
(async () => {
  const user = getPayer();

  const PROVIDER_URL =
    "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
  // const PROVIDER_URL = "https://ssc-dao.genesysgo.net/";
  // const PROVIDER_URL = "https://api.devnet.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  let voltVaults: VoltSDK[];
  const friktionSdk = new FriktionSDK({
    provider: provider,
    // network: "devnet",
    network: "mainnet-beta",
  });
  if (options.match) {
    voltVaults = [
      await friktionSdk.loadVoltAndExtraDataByKey(
        new PublicKey(options.match as string)
      ),
    ];
  } else voltVaults = await friktionSdk.getAllVoltVaultsWithExtraVoltData();

  console.log("match = ", options.match);
  for (const vv of voltVaults) {
    if (
      options.match !== undefined &&
      !vv.voltKey.toString().includes(options.match)
    ) {
      // console.log("skipping since does not match");
      continue;
    }

    if (
      options.matchMint !== undefined &&
      !vv.voltVault.underlyingAssetMint.toString().includes(options.matchMint)
    ) {
      // console.log("skipping since does not match");
      continue;
    }

    // if (
    //   vv.voltVault.quoteAssetMint.toString() ===
    //   vv.sdk.net.mints.USDC.toString()
    // )
    //   continue;

    console.log("volt: ", vv.voltKey.toString());
    console.log("admin = ", vv.voltVault.adminKey.toString());

    const extraVoltKey = await VoltSDK.findExtraVoltDataAddress(vv.voltKey);
    console.log("extra volt key: ", extraVoltKey.toString());
    const extraVoltData = await vv.getExtraVoltData();

    // console.log("extra volt data: ", extraVoltData);
    // console.log("extra volt data key: ", extraVoltData.key.toString());

    console.log("whitelist: ", extraVoltData.whitelist.toString());

    // const whitelist = await friktionSdk.getWhitelist(
    //   vv.extraVoltData.whitelist
    // );
    // for (const key of whitelist.addresses) {
    //   console.log("whitelisted address = ", key.toString());
    // }

    const { serumMarketKey, marketAuthorityBump } =
      await vv.getCurrentMarketAndAuthorityInfo();
    if (options.serumMarkets) {
      console.log(
        // "underlying serum market: \n",
        // vv.voltVault.serumSpotMarket.toString(),
        "option serum market: \n",
        serumMarketKey.toString()
      );
      continue;
    }
    console.log("volt  authority: ", vv.voltVault.vaultAuthority.toString());

    const [whitelistPda] = await VoltSDK.findWhitelistTokenAccountAddress(
      vv.voltKey,
      vv.sdk.net.MM_TOKEN_MINT,
      vv.sdk.programs.Volt.programId
    );

    console.log("whitelist pda: ", whitelistPda.toString());
    console.log("whitelist mint: ", vv.voltVault.whitelistTokenMint.toString());
    // console.log(
    //   "underlying asset mint: ",
    //   vv.voltVault.underlyingAssetMint.toString()
    // );
    // console.log("quote asset mint: ", vv.voltVault.quoteAssetMint.toString());
    // console.log(
    //   "perm market asset mint: ",
    //   vv.voltVault.permissionedMarketPremiumMint.toString()
    // );

    console.log(
      vv.sdk.net.MM_TOKEN_MINT.toString(),
      vv.sdk.net.SERUM_DEX_PROGRAM_ID.toString()
    );

    console.log(
      "raw vault type = ",
      vv.voltVault.vaultType.toString(),
      ", enum volt type = ",
      vv.voltType()
    );

    if (vv.isPremiumBased()) {
      console.log(
        "premium pool tokens: ",
        new Decimal(
          (
            await getAccount(provider.connection, vv.voltVault.premiumPool)
          ).amount.toString()
        )
          .div(
            new Decimal(10).pow(
              (await getMint(provider.connection, vv.voltVault.quoteAssetMint))
                .decimals
            )
          )
          .toString()
      );
    }

    if (options.veryShort) {
      console.log(
        "auction metadata key = ",
        (await VoltSDK.findAuctionMetadataAddress(vv.voltKey))[0].toString()
      );
      console.log(await vv.getAuctionMetadata());
      console.log(
        "deposit mint = ",
        vv.voltVault.underlyingAssetMint.toString(),
        "quote mint = ",
        vv.voltVault.quoteAssetMint.toString()
      );
      console.log(
        "round ul tokens: ",
        (
          await VoltSDK.findRoundUnderlyingTokensAddress(
            vv.voltKey,
            vv.voltVault.roundNumber,
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );
      console.log(
        "round ul for pending withdrawals tokens: ",
        (
          await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
            vv.voltKey,
            vv.voltVault.roundNumber,
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );

      console.log(
        "round ul for pending withdrawals tokens: ",
        (
          await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
            vv.voltKey,
            vv.voltVault.roundNumber.subn(1),
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );
      console.log(
        "round ul for pending withdrawals tokens: ",
        (
          await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
            vv.voltKey,
            vv.voltVault.roundNumber.subn(2),
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );
      console.log(
        "round ul for pending withdrawals tokens: ",
        (
          await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
            vv.voltKey,
            vv.voltVault.roundNumber.subn(3),
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );
      console.log(
        "deposit mint = ",
        vv.voltVault.underlyingAssetMint.toString()
      );
      // console.log(
      //   "round pnl: ",
      //   (await vv.getPnlForRound(new anchor.BN(2), true)).toString()
      // );
      // console.log(
      //   "user pnl: ",
      //   (
      //     await vv.getPnlForUserAndRound(
      //       new anchor.BN(2),
      //       new anchor.BN(100),
      //       true
      //     )
      //   ).toString()
      // );
      continue;
    }
    console.log(
      "deposit pool tokens: ",
      (
        await getAccount(provider.connection, vv.voltVault.depositPool)
      ).amount.toString()
    );

    // const optionMarket = await getSoloptionsMarketByKey(
    //   vv.sdk.programs.Soloptions,
    //   vv.voltVault.optionMarket
    // );

    // const optionUnderlyingPoolAmount = (
    //   await getAccount(provider.connection,optionMarket.underlyingAssetPool)
    // ).amount;

    // const optionQuotePoolAmount = (
    //   await getAccount(provider.connection,optionMarket.quoteAssetPool)
    // ).amount;

    // console.log("option quote pool amount: ", optionQuotePoolAmount.toString());
    // console.log(
    //   "option underlying pool amount: ",
    //   optionUnderlyingPoolAmount.toString()
    // );

    console.log(
      "underlying mint: ",
      vv.voltVault.underlyingAssetMint.toString()
    );
    console.log("quote mint: ", vv.voltVault.quoteAssetMint.toString());

    if (vv.voltType() === VoltType.ShortOptions) {
      console.log(
        "permissioned market premium mint:",
        vv.voltVault.permissionedMarketPremiumMint.toString(),

        "permissioned market pool",
        vv.voltVault.permissionedMarketPremiumPool.toString(),
        "permissioned market pool amount",
        (
          await getAccount(
            provider.connection,
            vv.voltVault.permissionedMarketPremiumPool
          )
        ).amount.toString(),
        "deposit pool: ",
        vv.voltVault.depositPool.toString()
      );

      console.log("ul open orders: ", vv.voltVault.ulOpenOrders.toString());
    }

    if (!options.veryShort) {
      console.log(
        "deposit mint = ",
        vv.voltVault.underlyingAssetMint.toString(),
        "quote mint = ",
        vv.voltVault.quoteAssetMint.toString()
      );
      console.log("quote mint ");
      let openOrders: any;
      try {
        openOrders = await OpenOrders.load(
          provider.connection,
          vv.voltVault.ulOpenOrders,
          friktionSdk.net.SERUM_DEX_PROGRAM_ID
        );
      } catch (err) {
        console.log(err);
        openOrders = {
          baseTokenTotal: "N/A",
          quoteTokenTotal: "N/A",
        };
      }

      if (!options.short) {
        // const { serumMarketKey } = await getMarketAndAuthorityInfo(
        //   vv.sdk.programs.Volt.programId,
        //   vv.voltVault.optionMarket,
        //   await Token.getAssociatedTokenAddress(
        //     ASSOCIATED_TOKEN_PROGRAM_ID,
        //     TOKEN_PROGRAM_ID,
        //     DEVNET_WHITELIST_TOKEN,
        //     vv.sdk.programs.Volt.programId
        //   ),
        //   new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")
        // );
        console.log("deposit pool = ", vv.voltVault.depositPool.toString());
        console.log(
          "General Info\n --------------",
          "\n, seed: ",
          vv.voltVault.seed.toString(),
          "\n, initialized: ",
          vv.voltVault.initialized,
          "dao program id: ",
          extraVoltData.daoProgramId.toString(),
          "isForDao: ",
          extraVoltData.isForDao,
          "dao authority: ",
          extraVoltData.daoAuthority.toString(),
          "\n, round number: ",
          vv.voltVault.roundNumber.toString(),
          "\n, vault mint:",
          vv.voltVault.vaultMint.toString(),
          "\n, vault mint supply :",
          (
            await getMintInfo(
              anchorProviderToSerumProvider(provider),
              vv.voltVault.vaultMint
            )
          ).supply.toString(),
          vv.voltVault.roundNumber.toString(),
          "Strategy Params\n --------------",
          "\n, expirationInterval: ",
          vv.voltVault.expirationInterval.toString(),
          "\n, upper bound otm strike factor: ",
          vv.voltVault.upperBoundOtmStrikeFactor.toString(),
          "\n, transfer window: ",
          vv.voltVault.transferWindow.toString(),
          "State Machine\n --------------",
          "\n, instantTransfersEnabled: ",
          vv.voltVault.instantTransfersEnabled,
          "\n, firstEverOptionWasSet: ",
          vv.voltVault.firstEverOptionWasSet,
          "\n, nextOptionSet: ",
          vv.voltVault.nextOptionWasSet,
          "\n, has started?: ",
          vv.voltVault.roundHasStarted,
          "\n, taken withdrawal fees: ",
          vv.voltVault.haveTakenWithdrawalFees,
          "\n, isSettled: ",
          vv.voltVault.currOptionWasSettled,
          "\n, mustSwapPremium: ",
          vv.voltVault.mustSwapPremiumToUnderlying,
          "\n, preparedIsFinished: ",
          vv.voltVault.prepareIsFinished,
          "\n, enterIsFinished: ",
          vv.voltVault.enterIsFinished,
          "\n, deposits and withdrawals off?: ",
          (await vv.getExtraVoltData()).turnOffDepositsAndWithdrawals,
          "Current Option Market\n --------------",
          "\n, expiry: ",
          vv.voltVault.expirationUnixTimestamp.toString(),
          "\n option market: ",
          vv.voltVault.optionMarket.toString(),
          "Pools\n --------------",
          "underlying asset mint: ",
          vv.voltVault.underlyingAssetMint.toString(),
          "quote asset mint: ",
          vv.voltVault.quoteAssetMint.toString(),
          "permissioned market premium mint:",
          vv.voltVault.permissionedMarketPremiumMint.toString(),
          "underlyingAmountPerContract: ",
          vv.voltVault.underlyingAmountPerContract.toString(),
          "quoteAmountPerContract: ",
          vv.voltVault.quoteAmountPerContract.toString(),
          "\n premium pool: ",
          vv.voltVault.premiumPool.toString(),
          "\n deposit pool: ",
          vv.voltVault.depositPool.toString(),
          "\n option pool: ",
          vv.voltVault.optionPool.toString(),
          "\n writer pool: ",
          vv.voltVault.writerTokenPool.toString(),
          "Miscellaneous\n --------------",
          "\n, ulOpenOrders: ",
          vv.voltVault.ulOpenOrders.toString(),
          "\n, ulOpenOrders base token: ",
          openOrders.baseTokenTotal.toString(),
          "\n, ulOpenOrders quote token: ",
          openOrders.quoteTokenTotal.toString(),
          "\n, voltUnderlyingPostSettle: ",
          vv.voltVault.totalUnderlyingPostSettle.toString(),
          // .div(new anchor.BN(Math.pow(10,9))).toString(),
          "\n, totalUnderlyingPreEnter: ",
          vv.voltVault.totalUnderlyingPreEnter.toString(),
          // .div(new anchor.BN(Math.pow(10,9))).toString(),
          "\n, capacity: ",
          vv.voltVault.capacity.toString(),
          "\n, individual capacity: ",
          vv.voltVault.individualCapacity.toString()
        );
      }

      console.log("epoch info: ", await vv.getCurrentEpochInfo());

      const normFactor = new Decimal(10).pow(
        (await getMint(provider.connection, vv.voltVault.underlyingAssetMint))
          .decimals
      );

      console.log("MOST RECENT ROUND");
      if (vv.voltVault.roundNumber.gtn(0)) {
        const mostRecentRound = await vv.getCurrentRound();
        console.log(
          "round ul key = ",
          (
            await VoltSDK.findRoundUnderlyingTokensAddress(
              vv.voltKey,
              vv.voltVault.roundNumber,
              vv.sdk.programs.Volt.programId
            )
          )[0].toString()
        );
        console.log(
          "volt tokens for pending withdrawals: ",
          mostRecentRound.voltTokensFromPendingWithdrawals.toString()
        );
        console.log(
          "round.numUnderlyingDeposited: ",
          mostRecentRound.underlyingFromPendingDeposits.toString()
        );
        console.log(
          "underlying in pending deposits: ",
          new Decimal(
            (
              await getAccount(
                provider.connection,
                (
                  await VoltSDK.findRoundUnderlyingTokensAddress(
                    vv.voltKey,
                    vv.voltVault.roundNumber,
                    vv.sdk.programs.Volt.programId
                  )
                )[0]
              )
            ).amount.toString()
          ).div(normFactor)
        );

        const voltTokenSupply = new Decimal(
          (
            await getMint(provider.connection, vv.voltVault.vaultMint)
          ).supply.toString()
        ).add(
          new Decimal(
            mostRecentRound.voltTokensFromPendingWithdrawals.toString()
          )
        );
        const vaultValueFromWriterTokens = new Decimal(
          (
            await getBalanceOrZero(
              provider.connection,
              vv.voltVault.writerTokenPool
            )
          ).toString()
        ).mul(new Decimal(vv.voltVault.underlyingAmountPerContract.toString()));

        // const totalVaultValueExcludingPendingDeposits = new Decimal(
        //   (
        //     await getAccount(provider.connection,vv.voltVault.depositPool)
        //   ).amount.toString()
        // ).add(new Decimal(vaultValueFromWriterTokens.toString()));

        console.log(
          "underlying in pending withdrawals: ",
          new Decimal(
            mostRecentRound.voltTokensFromPendingWithdrawals.toString()
          )
            .mul(new Decimal("974.778242").mul(normFactor))
            .div(voltTokenSupply)
            .div(normFactor)
        );

        console.log(
          "underlying redeemed from pending withdrawals: ",
          new Decimal(
            (
              await getAccount(
                provider.connection,
                (
                  await VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(
                    vv.voltKey,
                    vv.voltVault.roundNumber,
                    vv.sdk.programs.Volt.programId
                  )
                )[0]
              )
            ).amount.toString()
          ).div(normFactor)
        );
        console.log(
          "underlying at start of round: ",
          mostRecentRound.underlyingPreEnter.toString()
        );
        console.log(
          "underlying at end of round: ",
          mostRecentRound.underlyingPostSettle.toString()
        );
        console.log(
          "premium farmed: ",
          mostRecentRound.premiumFarmed.toString()
        );
      }

      try {
        console.log("token balances\n --------------");
        console.log(
          "deposit pool: ",
          new Decimal(
            (
              await getAccount(provider.connection, vv.voltVault.depositPool)
            ).amount.toString()
          ).div(normFactor),
          ", premium pool: ",
          new Decimal(
            (
              await getAccount(provider.connection, vv.voltVault.premiumPool)
            ).amount.toString()
          )
            .div(
              new Decimal(10).pow(
                (
                  await getMint(
                    provider.connection,
                    vv.voltVault.quoteAssetMint
                  )
                ).decimals
              )
            )
            .toString(),
          ", permissioned premium pool: ",
          new Decimal(
            (
              await getAccount(
                provider.connection,
                vv.voltVault.permissionedMarketPremiumPool
              )
            ).amount.toString()
          )
            .div(
              new Decimal(10).pow(
                (
                  await getMint(
                    provider.connection,
                    vv.voltVault.permissionedMarketPremiumMint
                  )
                ).decimals
              )
            )
            .toString()
        );
        console.log(
          "underlying in writer tokens: ",
          new Decimal(
            new BN(
              (
                await getAccount(
                  provider.connection,
                  vv.voltVault.writerTokenPool
                )
              ).amount.toString()
            )
              .mul(vv.voltVault.underlyingAmountPerContract)
              .toString()
          ).div(normFactor)
        );
        console.log(
          "option tokens: ",
          (
            await getAccount(provider.connection, vv.voltVault.optionPool)
          ).amount.toString()
        );
        console.log(
          "writer tokens: ",
          (
            await getAccount(provider.connection, vv.voltVault.writerTokenPool)
          ).amount.toString()
        );
        console.log("options on open orders: ");
        console.log(
          "vault token supply: ",
          (
            await getMint(provider.connection, vv.voltVault.vaultMint)
          ).supply.toString()
        );
      } catch (err) {}

      if (vv.voltType() === VoltType.Entropy) {
        const ev = await vv.getExtraVoltData();
        const csdk = new ConnectedVoltSDK(
          vv.sdk.readonlyProvider.connection,
          PublicKey.default,
          vv
        );
        console.log(
          "volt value: ",
          (await csdk.getTvlWithoutPendingInDepositToken()).toString()
        );

        console.log(
          "target leverage = ",
          (ev.targetLeverage as number).toString()
        );
        console.log(
          "target leverage ratio: ",
          (ev.targetLeverage as number).toString(),
          "\n, target leverage lenience: ",
          (ev.targetLeverageLenience as number).toString()
        );

        console.log(
          "\ntarget perp market: ",
          ev.powerPerpMarket.toString(),
          "\nspot perp market: ",
          ev.hedgingSpotPerpMarket.toString(),
          "\nentropy program: ",
          ev.entropyProgramId.toString(),
          "\nentropy group",
          ev.entropyGroup.toString(),
          "\nentropy account",
          ev.entropyAccount.toString(),
          "\nis hedging on: ",
          ev.isHedgingOn.toString(),
          "\n rebalance is ready: ",
          ev.rebalanceIsReady.toString(),
          "\ndone rebalancing target perp: ",
          ev.doneRebalancingPowerPerp.toString(),
          "\ndone rebalancing: ",
          ev.doneRebalancing.toString()
        );

        console.log(
          "done rebalancing target perp: ",
          ev.doneRebalancingPowerPerp,
          "done rebalancing: ",
          ev.doneRebalancing
        );

        const entropyMetadata = await vv.getEntropyMetadata();
        console.log("extra volt data = ", extraVoltData);

        console.log("entropy metadata = ", entropyMetadata);

        const entropyRound = await vv.getEntropyRoundByNumber(
          vv.voltVault.roundNumber
        );
        console.log("entropy round = ", entropyRound);
      }

      console.log(
        (
          await VoltSDK.findRoundVoltTokensAddress(
            vv.voltKey,
            vv.voltVault.roundNumber,
            vv.sdk.programs.Volt.programId
          )
        )[0].toString()
      );

      console.log(
        "vault token supply: ",
        (
          await getMint(provider.connection, vv.voltVault.vaultMint)
        ).supply.toString(),
        (
          await getMint(provider.connection, vv.voltVault.vaultMint)
        ).decimals.toString()
      );

      // const pastRound = await vv.getRoundByNumber(
      //   vv.voltVault.roundNumber.subn(1)
      // );

      // console.log(
      //   "past round: ",
      //   pastRound.underlyingPreEnter.toString(),
      //   pastRound.underlyingPostSettle.toString()
      // );
    }
  }
})();
