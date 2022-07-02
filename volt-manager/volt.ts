import {
  NetworkName,
  PERFORMANCE_FEE_BPS,
  SoloptionsSDK,
  VoltSDK,
  VoltType,
  WITHDRAWAL_FEE_BPS,
} from "@friktion-labs/friktion-sdk";
import {
  anchorProviderToSerumProvider,
  getBalanceOrZero,
  getNormFactorForMint,
  getOrCreateAssociatedTokenAccounts,
  sendIns,
  sendInsCatching,
  sendInsList,
  sendInsListCatching,
} from "@friktion-labs/friktion-utils";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider } from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import { Market } from "@project-serum/serum";
import { OpenOrders, Order } from "@project-serum/serum/lib/market";
import {
  createAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { Command } from "commander";
import Decimal from "decimal.js";
import * as readline from "readline";
import {
  ConnectedVoltSDK,
  // createSoloptionsMarketInstruction as createSoloptionsContractInstruction,
  FriktionSDK,
  getInertiaContractByKeyOrNull,
  InertiaSDK,
  INERTIA_FEE_OWNER,
  marketLoader,
  VoltVaultWithKey,
} from "../src";
import { createAccountsAndAirdrop } from "./utils/faucet_helpers";
import { wait } from "./utils/helpers";
import {
  initializeVolt,
  initializeVoltWithoutOptionMarketSeed,
} from "./utils/instruction_helpers";
import { sleep } from "./utils/send";
import { crankEventQueue, initSerumMarket } from "./utils/serum";
import { getAccountBalance } from "./utils/tokenHelpers";

export const MMs = {
  FfwC6Ux2sEHMSMQWgKFR9fjSvFRgy8eTDRhntjAL4KPz: "A",
  GTs2PFWZQ42bcVxsHtbaxtVn9oFdL2onsJRy8Kda9Q3j: "GS",
  "3mrFdAXXbQnGZfZRU9iMjCEbegCynT1n28NhgwjDRCUH": "LP",
  "775JwxTTk3965L8V2BeNtGD19TiYm1okvEzLUxZeq143": "F",
  BJjVRtsoTYdEz8RxdDRFw2TX1EgB52h6j66bmWEZSvvT: "Ge1",
  CN48gJiH7P6Z2kMaWH6BpKpxC1YhkVSbdv6RsoGEVWfK: "Ge2",
  GwGdN6bW8bCnKFLevTdZtmfvMrAJkZ6rxwEiC1gmT8Yw: "Q",
  GMmTqg8faaWL9siMVE9ZTXzRZ68oZ3DyxURagMSX3LvS: "CM",
  "7aHLHLq6djftEaubSUd2ewU67oVXCF82CPMnmKKnaALx": "Or1",
  EhoedNjSgMcVGW7zqen6GvuWS75DWgeF4ePqGCYyy9jK: "Pa",
  HanXbAh9AngpUuzxJVH3FoQ9mEu3qPHQ62u6JtuoR7VS: "Scn",
  Ba9MviAFk9NaZZKseqHXN4BfaMcdk2WKHwRKzJ9KuXwW: "BT",
  FbTRPQroqx8qYyngToQpxgdijYwhkEAnYUgkZzBfmLom: "Gra",
  BMZ1sgUT2GK695sABucwBMVL6HLMND5jhrc4R3DSvCyZ: "Or2",
  "3uHQgqcsFMUNj6KHoVPvjPQQWZSBM7FDkecPWmnVZL5D": "Wi",
};

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const cli = new Command();

cli
  .version("1.0.0")
  .description("options tool for interacting w/ Friktion volts")
  .usage("[options]")
  .option("-i, --instruction <string>", "instruction to run")
  .option("-v, --volt <string>", "address of volt to send instructions for")
  .option(
    "--underlying-serum-market <string>",
    "serum market the underlying asset is trading on"
  )
  .option(
    "-d, --debug",
    "activate more debug messages. Can be set by env var DEBUG.",
    false
  )
  // initialize
  .option("--seed <string>", "seed public key used to create vault PDA")
  .option(
    "--transfer-window <number>",
    "window of time deposits/withdraws can be processed (in hours)"
  )
  .option(
    "--expiration-interval <number>",
    "strictly required expiration of options this volt trades"
  )
  .option(
    "--upper-bound-otm-strike-factor <number>",
    "upper bound of OTM strike"
  )
  .option(
    "--underlying-amount-per-contract <number>",
    "required underlying amount per contract for any option this volt trades"
  )
  .option(
    "--quote-asset-mint <string>",
    "option market to use to seed initialize params"
  )
  .option("--oracle-ai <string>", "switchboard feed")
  .option("--is-call <number>", "0 means no and 1 means yes")
  .option(
    "--underlying-asset-mint <string>",
    "option market to use to seed initialize params"
  )
  .option(
    "--option-market-seed <string>",
    "option market to use to seed initialize params"
  )
  .option(
    "--capacity <string>",
    "option market to use to seed initialize params"
  )
  .option(
    "--individual-capacity <string>",
    "option market to use to seed initialize params"
  )
  // deposit/withdraw
  .option("--amount <number>", "amount to deposit/withdraw")
  // set next option
  .option("--option-market <string>", "option market to roll to")
  .option("--settle-price <number>", "price to settle option contracts at")
  .option(
    "--option-serum-market <string>",
    "serum market the option is trading on"
  )
  // rebalance prepare
  // rebalance enter
  .option("--optionsent-order-price <number>", "optionsent given order price")
  .option("--optionsent-order-size <number>", "optionsent given order size")
  // rebalance settle
  // rebalance swap premium
  // optionsent order price/size done above
  // airdrop faucet
  .option(
    "--faucet-address <string>",
    "address of faucet for underlying token of volt"
  )
  .option("--faucet-amount <number>", "number of tokens to request from faucet")
  // mint options
  .option("--amount <number>", "number of options to mint")
  // initialize permissioned serum market
  .option(
    "--whitelisted-addresses <string>",
    "comma separated list of addresses to whitelist on the newly created serum market"
  )
  .option(
    "--whitelist <string>",
    "public key of Whitelist account for relevant serum market"
  )
  .option(
    "--permissioned-market-premium-mint <string>",
    "public key of quote asset for permissioned serum market"
  )
  // transfer premium
  .option("--transfer-amount <number>", "amount to transfer out of contract")
  // create inertia market
  .option("--quote-amount-per-contract <number>", "quote amount per contract")
  .option("--expiry <number>", "expiry of option market to be created")
  .option("--new-mint <number>", "new mint for close old accounts")
  .option("--swap-permissioned", "use permissioned market premium pool to swap")
  .option("--dao-program-id <string>", "dao program ID")
  .option("--dao-authority <string>", "dao program authority")
  /// entropy options
  .option("--entropy-program-id <string>", "entropy program id")
  .option("--entropy-group <string>", "entropy group key")
  .option("--target-perp-market <string>", "target perp market")
  .option(
    "--hedging-spot-perp-market <string>",
    "spot perp market to hedge with"
  )
  .option("--hedging-spot-market <string>", "spot market to hedge with")
  .option(
    "--target-leverage-ratio <number>",
    "target leverage ratio for target perp position"
  )

  .option(
    "--target-leverage-lenience <number>",
    "lenience of realized vs. target leverage"
  )
  .option(
    "--target-hedge-lenience <number>",
    "lenience for hedge position size"
  )
  .option(
    "--exit-early-ratio <number>",
    "leverage ratio that allows early rebalancing"
  )
  .option("--should-hedge <boolean>", "should this volt hedge at all")
  .option("--hedge-with-spot <boolean>", "hedge with spot market not perps")
  .option("--target-hedge-ratio <number>", "target hedge ratio")
  .option("--rebalancing-lenience <number>", "unused currently")
  .option(
    "--required-basis <number>",
    "unused currently, will specify entry point for strategy"
  )
  .option(
    "--optionsent-bid-price <number>",
    "min bid price to hit with a sell order"
  )
  .option(
    "--optionsent-ask-price <number>",
    "max ask price to hit with a buy order"
  )
  .option("--max-quote-pos-change <number>", "max quote pos change to allow")
  .option("--trade-leg <string>", "trade leg to run")
  .option("--pda-str <number>", "string to use when generating PDA")
  // get balances for user
  .option("--user <string>", "pubkey of user keypair")

  .option(
    "--only-reset-hedge",
    "only reset hedge part of rebalancing, not target entrys"
  )
  .option(
    "--new-underlying-asset-mint <string>",
    "new underlying asset mint for the operation"
  )
  .option(
    "--target-pool <string>",
    "target token account for operation (typically reinitializing"
  )
  .option(
    "--bypass-code <number>",
    "bypass code for the operation (enables special behavior)"
  )

  // turn off deposits and withdrawals
  .option(
    "--should-be-off <boolean>",
    "boolean indicating whether to turn all ixs for deposits/withdrawals on or off"
  )
  .option(
    "--new-quote-mint <string>",
    "string representing pubkey for new quote mint for volt"
  )
  .option("--factor <number>", "decimal factor to multiply saved vars by")
  .option(
    "--new-pending-deposit-amount <number>",
    "new amount for pending deposit"
  )
  .option("--code <number>", "code for various instructions")
  .option(
    "--is-permissionless-auctions <boolean>",
    "should auctions be permissionless?"
  )
  .option("--admin <string>", "new admin key for volt")
  .option("--serum-market <string>", "serum market to interact with")
  .option(
    "--take-fees-in-underlying <boolean>",
    "should take fees in underlying?"
  )
  .option("--skip-swap", "skip swapping")

  // shouldHedge: options.shouldHedge,
  // hedgeWithSpot: options.hedgeWithSpot ?? false,
  // targetHedgeRatio: options.shouldHedge ? options.targetHedgeRatio : 0.0,
  // rebalancingLenience: options.rebalancingLenience ?? 0.025,
  // requiredBasisFromOracle: options.requiredBasis ?? 0.0,
  // .option(
  //   "--whitelisted-addresses <string>",
  //   "comma separated list of addresses to whitelist"
  // )
  .parse(process.argv);

const options = cli.opts();

// set up provider and programs
// const PROVIDER_URL = "hqttps://api.devnet.solana.com";
// const PROVIDER_URL =
//   "https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111";
// const PROVIDER_URL =
// "https://friktion.rpcpool.com/132d5fccfadee1fd0c2fce38aa14";
const PROVIDER_URL = "https://ssc-dao.genesysgo.net";
// const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
// const PROVIDER_URL = "https://solana-api.projectserum.com";
const provider = new anchor.AnchorProvider(
  new Connection(PROVIDER_URL),
  anchor.Wallet.local(),
  {}
);

const user = (provider.wallet as anchor.Wallet).payer;

const connection = provider.connection;
const CLUSTER: NetworkName = "mainnet-beta";
const friktionSdk = new FriktionSDK({
  provider: provider,
  network: CLUSTER,
});
const inertiaProgram = friktionSdk.programs.Inertia;
const soloptionsProgram = friktionSdk.programs.Soloptions;

// const optionsProtocol: OptionsProtocol = "Inertia";

// set globally useful keys. e.g dex program id, faucet program ids.
const voltType = new anchor.BN(1);
const WHITELIST_MINT_KEY = friktionSdk.net.MM_TOKEN_MINT;
const SERUM_PROGRAM_ID = friktionSdk.net.SERUM_DEX_PROGRAM_ID;
const REFERRER_QUOTE_KEY =
  friktionSdk.net.SERUM_REFERRER_IDS[friktionSdk.net.mints.USDC.toString()];

// async function ask() {
//   return new Promise((resolve) => {
//     rl.question(
//       "WARNING: You are interacting with mainnet contracts. Do you wish to continue?\n y/n\n",
//       function (answer) {
//         answer = (answer as string).trim().toLowerCase();
//         console.log("answer = '", answer, "'");
//         if (answer.includes("y") || answer.includes("yes")) {
//           console.log("stated yes");
//           return resolve;
//         } else {
//           throw new Error("answered no, exiting early...");
//         }
//         rl.close();
//         process.exit();
//       }
//     );
//   });
// }

const run = async () => {
  const instruction: string = options.instruction as string;
  let voltSdk: ConnectedVoltSDK;
  let voltVault: VoltVaultWithKey;

  if (instruction === "crankEventQueue") {
    await crankEventQueue(
      provider,
      (await Market.load(
        connection,
        new PublicKey(options.serumMarket),
        {},
        SERUM_PROGRAM_ID
      )) as any
    );
    return;
  }

  if (instruction === "printWhitelist") {
    const whitelist = await friktionSdk.getWhitelist(
      new PublicKey(options.whitelist)
    );
    Object.values(whitelist.addresses).forEach((a) =>
      console.log(a.toString())
    );
    return;
  }

  if (instruction === "createInertiaMarket") {
    const expiry = options.expiry || 0;

    if (expiry === 0) {
      throw new Error("please set expiry value for expiry");
    }

    const quoteMint = new PublicKey(options.quoteAssetMint);
    const underlyingMint = new PublicKey(options.underlyingAssetMint);

    const [inertiaMintFeeAccount, inertiaExerciseFeeAccount] =
      await getOrCreateAssociatedTokenAccounts(provider, {
        accountParams: [
          {
            mint: underlyingMint,
            owner: INERTIA_FEE_OWNER,
            payer: provider.wallet.publicKey,
          },
          {
            mint: quoteMint,
            owner: INERTIA_FEE_OWNER,
            payer: provider.wallet.publicKey,
          },
        ],
      });

    const { ix, optionsContract } = await InertiaSDK.initializeOptionsContract(
      friktionSdk,
      {
        user: provider.wallet.publicKey,
        oracleAi: new PublicKey(
          options.oracleAi ?? SystemProgram.programId.toString()
        ),
        quoteMint,
        underlyingMint,
        underlyingAmount: new anchor.BN(options.underlyingAmountPerContract),
        quoteAmount: new anchor.BN(options.quoteAmountPerContract),
        expiryTs: new anchor.BN(expiry),
        isCall: Number(options.isCall) === 0 ? false : true,
      },
      provider.wallet.publicKey
    );

    console.log("creating contract id = ", optionsContract.key.toString());
    await sendIns(provider, ix);
    return;
  } else if (instruction === "createSoloptionsContract") {
    const expiry = options.expiry || 0;

    if (expiry === 0) {
      throw new Error("please set expiry value for expiry");
    }

    const quoteMint = new PublicKey(options.quoteAssetMint);
    const underlyingMint = new PublicKey(options.underlyingAssetMint);

    const { optionsContract, ix } =
      await SoloptionsSDK.initializeOptionsContract(
        friktionSdk,
        {
          quoteMint: new PublicKey(options.quoteAssetMint),
          underlyingMint: new PublicKey(options.underlyingAssetMint),
          underlyingAmount: new BN(options.underlyingAmountPerContract),
          quoteAmount: new BN(options.quoteAmountPerContract),
          expiryTs: expiry,
        },
        provider.wallet.publicKey
      );

    console.log("contract = ", optionsContract.key.toString());
    await sendIns(provider, ix);
  }

  //// INITIALIZE VOLT ////

  if (instruction.toLowerCase().includes("initialize")) {
    if (instruction === "initializeEntropy") {
      const { instruction, voltKey } = await VoltSDK.initializeEntropyVolt({
        sdk: friktionSdk,
        adminKey: provider.wallet.publicKey,
        pdaStr: options.pdaStr as string,
        underlyingAssetMint: new PublicKey(options.underlyingAssetMint),
        whitelistTokenMintKey: WHITELIST_MINT_KEY,
        serumProgramId: new PublicKey(
          options.serumProgramId ?? SERUM_PROGRAM_ID.toString()
        ),
        entropyProgramId: new PublicKey(options.entropyProgramId),
        entropyGroupKey: new PublicKey(options.entropyGroup),
        targetPerpMarket: new PublicKey(options.targetPerpMarket),
        spotPerpMarket: new PublicKey(options.hedgingSpotPerpMarket),
        spotMarket: new PublicKey(options.hedgingSpotMarket),
        targetLeverageRatio: options.targetLeverageRatio,
        targetLeverageLenience: options.targetLeverageLenience ?? 0.025,
        targetHedgeLenience: options.shouldHedge
          ? options.targetHedgeLenience ?? 0.025
          : 0.01,
        shouldHedge: options.shouldHedge,
        hedgeWithSpot: options.hedgeWithSpot ?? false,
        targetHedgeRatio: options.shouldHedge ? options.targetHedgeRatio : 0.0,
        rebalancingLenience: options.rebalancingLenience ?? 0.025,
        requiredBasisFromOracle: options.requiredBasis ?? 0.0,
        exitEarlyRatio: options.exitEarlyRatio ?? 100.0,
        capacity: new anchor.BN(options.capacity),
        individualCapacity: new anchor.BN(options.individualCapacity),
      });

      await sendInsList(provider, [instruction]);

      console.log("initialized entropy volt key = ", voltKey.toString(), "!");
      return;
    } else if (instruction === "initializeEntropyBasis") {
      const normalizationFactor = new anchor.BN(
        new Decimal(10)
          .pow(
            (
              await getMintInfo(
                anchorProviderToSerumProvider(provider),
                new PublicKey(options.underlyingAssetMint)
              )
            ).decimals
          )
          .toString()
      );
      const { instruction, voltKey } = await VoltSDK.initializeEntropyVolt({
        sdk: friktionSdk,
        adminKey: provider.wallet.publicKey,
        pdaStr: options.pdaStr as string,
        underlyingAssetMint: new PublicKey(options.underlyingAssetMint),
        whitelistTokenMintKey: WHITELIST_MINT_KEY,
        serumProgramId: new PublicKey(
          options.serumProgramId ?? SERUM_PROGRAM_ID.toString()
        ),
        entropyProgramId: new PublicKey(options.entropyProgramId),
        entropyGroupKey: new PublicKey(options.entropyGroup),
        targetPerpMarket: new PublicKey(options.targetPerpMarket),
        spotPerpMarket: new PublicKey(options.hedgingSpotPerpMarket),
        spotMarket: new PublicKey(options.hedgingSpotMarket),
        targetLeverageRatio: options.targetLeverageRatio,
        targetLeverageLenience: options.targetLeverageLenience ?? 0.025,
        targetHedgeLenience: options.targetHedgeLenience ?? 0.025,
        shouldHedge: true,
        hedgeWithSpot: true,
        targetHedgeRatio: -1.0,
        rebalancingLenience: options.rebalancingLenience ?? 0.025,
        requiredBasisFromOracle: options.requiredBasis ?? 0.0,
        exitEarlyRatio: options.exitEarlyRatio ?? 100.0,
        capacity: new anchor.BN(options.capacity).mul(normalizationFactor),
        individualCapacity: new anchor.BN(options.individualCapacity).mul(
          normalizationFactor
        ),
      });

      await sendIns(provider, instruction);

      console.log("initialized entropy volt key = ", voltKey.toString(), "!");
      return;
    } // initialize
    else if (instruction === "initialize") {
      console.log("initializing volt vault...");

      let voltKey: PublicKey;

      if (options.optionMarketSeed) {
        const seedOptionMarket = await friktionSdk.getOptionMarketByKey(
          new PublicKey(options.optionMarketSeed)
        );
        const normalizationFactor = new BN(
          Math.pow(
            10,
            (await getMint(connection, seedOptionMarket.underlyingAssetMint))
              .decimals
          ).toString()
        );

        const voltCapacity = new anchor.BN(options.capacity).mul(
          normalizationFactor
        );

        const individualCapacity = new anchor.BN(
          options.individualCapacity
        ).mul(normalizationFactor);

        console.log(
          "capacity: ",
          voltCapacity.toString(),
          "invidual capacity: ",
          individualCapacity.toString()
        );

        voltKey = await initializeVolt(
          provider,
          friktionSdk,
          seedOptionMarket,
          new PublicKey(options.permissionedMarketPremiumMint),
          new anchor.BN(options.expirationInterval),
          new PublicKey(options.seed),
          voltCapacity,
          individualCapacity,
          options.isPermissionlessAuctions
        );
      } else {
        const quoteAssetMint = new PublicKey(options.quoteAssetMint);
        const underlyingAssetMint = new PublicKey(options.underlyingAssetMint);
        const underlyingAmountPerContract = new anchor.BN(
          options.underlyingAmountPerContract
        );

        const normalizationFactor = new BN(
          Math.pow(
            10,
            (await getMint(connection, underlyingAssetMint)).decimals
          ).toString()
        );

        const voltCapacity = new anchor.BN(options.capacity).mul(
          normalizationFactor
        );

        const individualCapacity = new anchor.BN(
          options.individualCapacity
        ).mul(normalizationFactor);

        console.log(
          "capacity: ",
          voltCapacity.toString(),
          "invidual capacity: ",
          individualCapacity.toString()
        );
        voltKey = await initializeVoltWithoutOptionMarketSeed(
          provider,
          friktionSdk,
          quoteAssetMint,
          underlyingAssetMint,
          new PublicKey(options.permissionedMarketPremiumMint),
          underlyingAmountPerContract,
          new anchor.BN(options.expirationInterval ?? 0),
          new PublicKey(options.seed),
          voltCapacity,
          individualCapacity,
          options.isPermissionlessAuctions
        );
      }

      console.log("initialized volt with key = ", voltKey.toString());
      return;
    }
  }

  //// LOAD VOLT ////

  const temp = await friktionSdk.loadVoltAndExtraDataByKey(
    new PublicKey(options.volt)
  );
  voltSdk = new ConnectedVoltSDK(
    provider.connection,
    provider.wallet.publicKey,
    temp
  );
  voltVault = { ...voltSdk.voltVault, key: voltSdk.voltKey };

  //// ENTROPY INSTRUCTIONS ////
  if (instruction.toLowerCase().includes("entropy")) {
    if (instruction == "startRoundEntropy") {
      await sendIns(provider, await voltSdk.startRoundEntropy());

      console.log("round started succesfully!");

      return;
    } else if (instruction == "takePerformanceFeesEntropy") {
      const feeAcct = await voltSdk.getFeeTokenAccount();
      const amtInFeeWalletBefore = await getBalanceOrZero(connection, feeAcct);

      await sendInsList(provider, [
        ComputeBudgetProgram.requestUnits({
          units: 400000,
          additionalFee: 0,
        }),
        // await voltSdk.cacheQuoteRootBank(),
        // await voltSdk.cacheRelevantPrices(),
        // await voltSdk.cacheRelevantPerpMarkets(),
        await voltSdk.takePerformanceFeesEntropy(),
      ]);

      await sleep(2500);

      const amtInFeeWalletAfter = await getBalanceOrZero(connection, feeAcct);

      // console.log(
      //   "observed fees taken: ",
      //   new Decimal(
      //     amtInFeeWalletAfter.sub(amtInFeeWalletBefore).toString()
      // ).div(await voltSdk.getNormalizationFactor())
      // );

      return;
    } else if (
      instruction === "rebalanceEntropy" ||
      instruction === "singleRebalanceEntropy"
    ) {
      const ix = await voltSdk.rebalanceEntropy(
        options.optionsentBidPrice
          ? new anchor.BN(options.optionsentBidPrice)
          : undefined,
        options.optionsentAskPrice
          ? new anchor.BN(options.optionsentAskPrice)
          : undefined,
        options.maxQuotePosChange
          ? new anchor.BN(options.maxQuotePosChange)
          : undefined,
        options.tradeLeg
          ? options.tradeLeg == "target"
            ? false
            : options.tradeLeg == "hedge"
            ? true
            : false
          : false
      );
      await sendInsListCatching(provider, [
        ComputeBudgetProgram.requestUnits({
          units: 400000,
          additionalFee: 0,
        }),
        // await voltSdk.cacheQuoteRootBank(),
        // await voltSdk.cacheRelevantPrices(),
        // await voltSdk.cacheRelevantPerpMarkets(),
        ix,
      ]);
      return;
    } else if (instruction === "fullRebalanceEntropy") {
      while (!voltSdk?.extraVoltData?.doneRebalancing) {
        console.log("rebalancing loop...");
        // const optionsent = new Entropyoptionsent(connection, ENTROPY_PROGRAM_ID);
        // const entropyGroup = await optionsent.getEntropyGroup(
        //   voltSdk.extraVoltData.entropyGroup
        // );
        // const cacheIx = makeCacheRootBankInstruction(
        //   ENTROPY_PROGRAM_ID,
        //   entropyGroup.publicKey,
        //   entropyGroup.entropyCache,
        //   [entropyGroup.getQuoteTokenInfo().rootBank]
        // );
        const ix = await voltSdk.rebalanceEntropy(
          options.optionsentBidPrice
            ? new anchor.BN(options.optionsentBidPrice)
            : undefined,
          options.optionsentAskPrice
            ? new anchor.BN(options.optionsentAskPrice)
            : undefined
        );
        try {
          console.log("sending rebalance enter");
          await sendInsList(provider, [
            ComputeBudgetProgram.requestUnits({
              units: 400000,
              additionalFee: 0,
            }),
            // cacheIx,
            // await voltSdk.cacheRelevantPrices(),
            // await voltSdk.cacheRelevantPerpMarkets(),
            ix,
          ]);
        } catch (err) {
          console.log(err);
          console.log("continuing...");
        }
        voltSdk = await voltSdk.refresh();
      }
      console.log("done with rebalance enter!");
      return;
    } else if (
      instruction === "rebalanceSpotEntropy" ||
      instruction === "singleRebalanceSpotEntropy"
    ) {
      console.log("rebalance spot...");
      const ix = await voltSdk.rebalanceSpotEntropy(
        options.optionsentBidPrice
          ? new anchor.BN(options.optionsentBidPrice)
          : undefined,
        options.optionsentAskPrice
          ? new anchor.BN(options.optionsentAskPrice)
          : undefined,
        options.maxQuotePosChange
          ? new anchor.BN(options.maxQuotePosChange)
          : undefined
      );
      await sendInsList(provider, [
        ComputeBudgetProgram.requestUnits({
          units: 400000,
          additionalFee: 0,
        }),
        ix,
      ]);
      return;
    } else if (instruction === "initSpotOpenOrdersEntropy") {
      const initSpotOpenOrdersIx = await voltSdk.initSpotOpenOrdersEntropy();

      await sendIns(provider, initSpotOpenOrdersIx);
      return;
    } else if (instruction === "setupRebalanceEntropy") {
      const ix = await voltSdk.setupRebalanceEntropy();
      await sendInsList(provider, [
        ComputeBudgetProgram.requestUnits({
          units: 400000,
          additionalFee: 0,
        }),
        // await voltSdk.cacheQuoteRootBank(),
        // await voltSdk.cacheRelevantPrices(),
        // await voltSdk.cacheRelevantPerpMarkets(),
        ix,
      ]);
      return;
    } else if (instruction === "depositDiscretionaryEntropy") {
      const underlyingTokenAccount = await getAssociatedTokenAddress(
        voltSdk.voltVault.underlyingAssetMint,
        user.publicKey
      );
      const ix = await voltSdk.depositDiscretionaryEntropy(
        underlyingTokenAccount,
        new BN(options.amount)
      );
      await sendInsList(provider, [ix]);
      return;
    } else if (instruction === "endRoundEntropy") {
      const ix = await voltSdk.endRoundEntropy(
        new anchor.BN(options.bypassCode ?? 0)
      );
      await sendIns(provider, ix);
      return;
    }
  } else if (instruction === "printMarket") {
    console.log("printing market...");

    const optionMarketKey = new PublicKey(
      options.optionMarket ?? voltSdk.voltVault.optionMarket
    );
    console.log("option market = ", optionMarketKey.toString());

    const optionsProtocol = await voltSdk.getOptionsProtocolForKey(
      optionMarketKey
    );
    voltSdk.printOptionsContract(optionMarketKey, optionsProtocol);

    return;
  }

  if (instruction === "initSerumMarket") {
    const optionMarket = await voltSdk.getOptionsContractByKey(
      new PublicKey(voltSdk.voltVault.optionMarket)
    );
    const { instructions, signers } = await initSerumMarket(
      voltSdk,
      provider,
      optionMarket
    );
    const tx = new Transaction();
    for (var ix of instructions) {
      tx.add(ix);
    }
    await provider.sendAndConfirm(tx, signers);
    return;
  }
  // other instructions

  const ulMint = voltSdk.voltVault.underlyingAssetMint;
  const qMint = voltSdk.voltVault.quoteAssetMint;
  const vMint = voltSdk.voltVault.vaultMint;

  try {
    await getAccount(
      connection,
      await getAssociatedTokenAddress(ulMint, user.publicKey)
    );
  } catch (err) {
    await createAssociatedTokenAccount(
      connection,
      user,
      ulMint,
      user.publicKey
    );
  }

  try {
    await getAccount(
      connection,
      await getAssociatedTokenAddress(vMint, user.publicKey)
    );
  } catch (err) {
    await createAssociatedTokenAccount(connection, user, vMint, user.publicKey);
  }

  if (voltSdk.voltVault.vaultType.toNumber() == VoltType.ShortOptions) {
    try {
      await getAccount(
        connection,
        await getAssociatedTokenAddress(qMint, user.publicKey)
      );
    } catch (err) {
      await createAssociatedTokenAccount(
        connection,
        user,
        qMint,
        user.publicKey
      );
    }
  }

  const underlyingTokenAccount = await getAssociatedTokenAddress(
    voltVault.underlyingAssetMint,
    user.publicKey
  );

  const quoteTokenAccount = await getAssociatedTokenAddress(
    voltVault.quoteAssetMint,
    user.publicKey
  );

  const vaultTokenAccount = await getAssociatedTokenAddress(
    voltVault.vaultMint,
    user.publicKey
  );

  if (instruction == "createAndAttachWhitelist") {
    const { whitelistKey, instruction } = await friktionSdk.initWhitelist(
      voltSdk.wallet
    );
    console.log("whitelist = ", whitelistKey.toString());
    await sendInsList(
      provider,
      [instruction]
        .concat(
          (options.whitelistedAddresses as string)
            .split(",")
            .map((s) => s.trim())
            .map((key) =>
              friktionSdk.addWhitelist(
                voltSdk.wallet,
                whitelistKey,
                new PublicKey(key)
              )
            )
        )
        .concat([await voltSdk.attachWhitelist(whitelistKey)])
    );
    return;
  } else if (instruction == "addWhitelist") {
    const whitelistKey = new PublicKey(options.whitelist);
    await sendInsList(
      provider,
      (options.whitelistedAddresses as string)
        .split(",")
        .map((s) => s.trim())
        .map((key) =>
          friktionSdk.addWhitelist(
            voltSdk.wallet,
            whitelistKey,
            new PublicKey(key)
          )
        )
    );
    return;
  } else if (instruction == "removeWhitelist") {
    const whitelistKey = new PublicKey(options.whitelist);
    await sendInsList(
      provider,
      (options.whitelistedAddresses as string)
        .split(",")
        .map((s) => s.trim())
        .map((key) =>
          friktionSdk.removeWhitelist(
            voltSdk.wallet,
            whitelistKey,
            new PublicKey(key)
          )
        )
    );
    return;
  } else if (instruction === "attachDao") {
    await sendIns(
      provider,
      await voltSdk.attachDao(
        new PublicKey(options.daoProgramId),
        new PublicKey(options.daoAuthority)
      )
    );
    return;
  }

  if (instruction == "changeCapacity") {
    const normalizationFactor = new Decimal(10).pow(
      (await getMint(connection, ulMint)).decimals
    );
    // const normalizationFactor = new Decimal(10).pow(9);
    await sendIns(
      provider,
      await voltSdk.changeCapacity(
        new anchor.BN(options.capacity).mul(
          new anchor.BN(normalizationFactor.toString())
        ),
        new anchor.BN(options.individualCapacity).mul(
          new anchor.BN(normalizationFactor.toString())
        )
      )
    );

    return;
  } else if (instruction == "changeAdmin") {
    if (voltSdk.voltVault.adminKey.toString() !== options.admin)
      await sendIns(
        provider,
        voltSdk.changeAdmin(new PublicKey(options.admin))
      );
    else console.log("no need to update admin!");
    return;
  } else if (instruction == "changeFees") {
    await sendIns(
      provider,
      await voltSdk.changeFees(
        new BN(PERFORMANCE_FEE_BPS),
        new BN(WITHDRAWAL_FEE_BPS),
        options.takeFeesInUnderlying
      )
    );
    return;
  } else if (instruction == "changeAuctionParams") {
    // while (
    //   (await voltSdk.getExtraVoltData()).auctionMetadata.toString() !==
    //   (await VoltSDK.findAuctionMetadataAddress(voltSdk.voltKey))[0].toString()
    // ) {
    await sendInsCatching(
      provider,
      await voltSdk.changeAuctionParams(options.isPermissionlessAuctions)
    );
    // }

    return;
  } else if (instruction == "changeDecimalsByFactor") {
    const ix = await voltSdk.changeDecimalsByFactor(
      new anchor.BN(options.factor)
    );

    await sendIns(provider, ix);
    return;
  } else if (instruction == "adjustPendingDeposit") {
    // const ix = await voltSdk.adjustPendingDeposit(
    //   new anchor.BN(options.newPendingDepositAmount),
    //   new PublicKey(options.user)
    // );
    // await sendIns(provider, ix);
    return;
  } else if (instruction == "changeQuoteMint") {
    const ix = await voltSdk.changeQuoteMint(
      new PublicKey(options.newQuoteMint)
    );
    await sendIns(provider, ix);
    return;
  } else if (instruction == "changeDecimalsByFactor") {
    const ix = await voltSdk.changeDecimalsByFactor(
      new anchor.BN(options.factor)
    );

    await sendIns(provider, ix);
    return;
  } else if (instruction == "reduceDecimalsByFactor") {
    // const ix = await voltSdk.reduceDecimalsByFactor(new anchor.BN(options.factor));

    // await sendIns(provider, ix);
    return;
  } else if (instruction == "bypassSettlement") {
    const writerTokenAccount = await getAssociatedTokenAddress(
      voltVault.writerTokenMint,
      user.publicKey
    );
    try {
      await getAccount(connection, writerTokenAccount);
    } catch (err) {
      await createAssociatedTokenAccount(
        connection,
        user,
        voltSdk.voltVault.writerTokenMint,
        user.publicKey
      );
    }
    console.log("sleeping before bypass settlement");
    await sleep(5000);
    const ix = await voltSdk.bypassSettlement(writerTokenAccount);

    await sendIns(provider, ix);
    return;
  } else if (instruction == "setStrategyParams") {
    await sendIns(
      provider,
      await voltSdk.setStrategyParams(
        new Decimal(options.targetLeverageRatio),
        new Decimal(options.targetLeverageLenience),
        new Decimal(options.targetHedgeRatio),
        new Decimal(options.targetHedgeLenience)
      )
    );
    return;
  }
  if (instruction == "turnOffDepositsAndWithdrawals") {
    await sendIns(
      provider,
      await voltSdk.turnOffDepositsAndWithdrawals(
        options.code ? new anchor.BN(options.code) : undefined
      )
    );
    return;
  } else if (instruction == "changeHedging") {
    const ix = await voltSdk.changeHedging(
      options.shouldHedge as boolean,
      options.hedgeWithSpot as boolean,
      options.targetHedgeRatio as number,
      options.targetHedgeLenience as number
    );

    ix.data.writeUInt8(options.hedgeWithSpot === true ? 1 : 0, 9);
    // ix.data.writeUInt8(0, 8);
    console.log(ix.data);

    await sendIns(provider, ix);

    return;
  } else if (instruction == "resetRebalancing") {
    const ix = await voltSdk.resetRebalancing(
      options.onlyResetHedge as boolean
    );

    console.log(ix.data);

    await sendIns(provider, ix);

    return;
  } else if (instruction == "setStrategyParams") {
    await sendIns(
      provider,
      await voltSdk.setStrategyParams(
        new Decimal(options.targetLeverageRatio),
        new Decimal(options.targetLeverageLenience),
        new Decimal(options.targetHedgeRatio),
        new Decimal(options.targetHedgeLenience)
      )
    );
    return;
  } else if (instruction == "getBalances") {
    console.log("retrieving balances for user...");
    console.log(await voltSdk.getBalancesForUser(new PublicKey(options.user)));
    return;
  } else if (instruction == "getValue") {
    console.log(
      (await voltSdk.getTvlWithoutPendingInDepositToken()).toString()
    );
    return;
  } else if (instruction === "printVoltDetails") {
    await voltSdk.printState();
    return;
  }

  // if (instruction == "transferPremium") {
  //   const normFactor = new Decimal(10).pow(
  //     (await getMint(connection, qMint)).decimals
  //   );
  //   const premiumAmount = (
  //     await getAccount(connection, voltSdk.voltVault.premiumPool)
  //   ).amount.mul(new anchor.BN(normFactor.toString()));
  //   await transferPremium(
  //     provider,
  //     voltSdk,
  //     quoteTokenAccount,
  //     options.transferAmount
  //       ? new anchor.BN(
  //           new Decimal(options.transferAmount)
  //             .mul(new Decimal(normFactor.toString()))
  //             .toString()
  //         )
  //       : premiumAmount
  //   );

  //   return;
  if (instruction == "transferDeposit") {
    const normFactor = new anchor.BN(
      new Decimal(10)
        .pow((await getMint(connection, ulMint)).decimals)
        .toString()
    );
    // const underlyingAmount = (
    //   await getAccount(connection, voltSdk.voltVault.depositPool)
    // ).amount.mul(normFactor);
    if (!options.transferAmount) {
      throw new Error("must give transfer amount in options");
    }

    const targetTokenAccount = await getAccount(
      provider.connection,
      new PublicKey(options.targetPool)
    );
    await sendIns(
      provider,
      voltSdk.transferDeposit(
        new PublicKey(options.targetPool),
        await getAssociatedTokenAddress(
          targetTokenAccount.mint,
          voltSdk.wallet
        ),
        new anchor.BN(
          new Decimal(options.transferAmount as string)
            .mul(new Decimal(normFactor.toString()))
            .toFixed(0)
        )
      )
    );

    return;
  } else if (instruction === "moveAssetsToMangoLending") {
    if (!options.amount) {
      throw new Error("Must give transfer amount in CLI opts!");
    }

    const targetTokenAccount = await getAccount(
      provider.connection,
      new PublicKey(options.targetPool)
    );

    const normFactor = getNormFactorForMint(provider, targetTokenAccount.mint);

    await sendIns(
      provider,
      await voltSdk.moveAssetsToLendingAccount(
        new PublicKey(options.targetPool),
        new anchor.BN(
          new Decimal(options.amount as string)
            .mul(new Decimal(normFactor.toString()))
            .toFixed(0)
        ),
        options.entropyGroup ? new PublicKey(options.entropyGroup) : undefined,
        options.entropyProgramId
          ? new PublicKey(options.entropyProgramId)
          : undefined
      )
    );

    return;
  } else if (instruction === "withdrawAssetsFromMangoLending") {
    if (!options.amount) {
      console.log(
        "did not give withdraw amount in CLI opts, will withdraw maximum possible!"
      );
    }

    const targetTokenAccount = await getAccount(
      provider.connection,
      new PublicKey(options.targetPool)
    );

    const { entropyGroup, entropyAccount, entropyCache } =
      await voltSdk.getEntropyLendingObjects();
    const tokenIndex = entropyGroup.getTokenIndex(targetTokenAccount.mint);
    const deposits = entropyAccount.getNativeDeposit(
      entropyCache.rootBankCache[tokenIndex],
      tokenIndex
    );
    console.log("deposits = ", deposits.toString());
    const normFactor = getNormFactorForMint(provider, targetTokenAccount.mint);
    await sendIns(
      provider,
      await voltSdk.withdrawAssetsFromLendingAccount(
        new PublicKey(options.targetPool),
        !options.amount
          ? new anchor.BN(deposits.toFixed(0))
          : new BN(
              new Decimal(options.amount as string)
                .mul(new Decimal(normFactor.toString()))
                .toFixed(0)
            )
      )
    );

    return;
  }
  // else if (instruction == "transferDepositInside") {
  //   const normFactor = new anchor.BN(
  //     new Decimal(10)
  //       .pow((await getMint(connection, ulMint)).decimals)
  //       .toString()
  //   );
  //   const underlyingAmount = (
  //     await getAccount(connection, underlyingTokenAccount)
  //   ).amount.mul(normFactor);
  //   await transferDepositInside(
  //     provider,
  //     voltSdk,
  //     underlyingTokenAccount,
  //     options.transferAmount
  //       ? new anchor.BN(
  //           new Decimal(options.transferAmount)
  //             .mul(new Decimal(normFactor.toString()))
  //             .toString()
  //         )
  //       : underlyingAmount
  //   );

  //   return;
  // }
  if (instruction == "startRound") {
    console.log("starting round for volt = ", voltVault.key.toString());

    console.log("prev round # = ", voltVault.roundNumber.toString());

    await sendIns(provider, await voltSdk.startRound());

    await wait(2500);

    voltVault = { ...voltSdk.voltVault, key: voltSdk.voltKey };

    console.log("round started succesfully!");
    console.log(
      "new round # = ",
      (
        await (
          await friktionSdk.loadVoltAndExtraDataByKey(voltVault.key)
        ).voltVault
      ).roundNumber.toString()
    );

    return;
  } else if (instruction == "endRound") {
    console.log("ending round # = ", voltVault.roundNumber.toString(), "...");

    await sendIns(provider, await voltSdk.endRound());

    const { roundUnderlyingTokensKey } = await VoltSDK.findRoundAddresses(
      voltVault.key,
      voltVault.roundNumber,
      voltSdk.sdk.programs.Volt.programId
    );

    console.log(
      "leftover pending (deposi)ts = ",
      (await getAccountBalance(connection, roundUnderlyingTokensKey)).toString()
    );

    console.log("succesfully ended round");

    return;
  } else if (instruction == "takePendingWithdrawalFees") {
    console.log("taking withdrawal fees...");

    await sendIns(provider, await voltSdk.takePendingWithdrawalFees());

    console.log("succesfully took withdrawal fees");

    return;
  } else if (instruction == "claimPending") {
    console.log("claiming vault tokens from previous pending deposit");

    console.log(
      "vault tokens before = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    await sendIns(provider, await voltSdk.claimPending(vaultTokenAccount));

    console.log(
      "vault tokens after = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    console.log("succesfully claimed pending!");
    return;
  } else if (instruction == "claimPendingWithdrawal") {
    console.log("claiming vault tokens from previous pending deposit");

    console.log(
      "underlying tokens before = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    await sendIns(
      provider,
      await voltSdk.claimPendingWithdrawal(underlyingTokenAccount)
    );

    console.log(
      "underlying tokens after = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log("succesfully claimed pending withdrawal!");
    return;
  } else if (instruction == "deposit") {
    const depositAmount = options.amount;
    console.log("depositing ", depositAmount, " underlying tokens");

    console.log(
      "pre-deposit vault token balance = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    console.log(
      "pre-deposit underlying balance = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    const coefficient = Math.pow(
      10,
      (await getMint(connection, ulMint)).decimals
    );

    let depositAmountCurr = new Decimal(options.amount);

    await sendIns(
      provider,
      await voltSdk.deposit(
        depositAmountCurr,
        underlyingTokenAccount,
        vaultTokenAccount
      )
    );

    await wait(2500);

    console.log(
      "post-deposit underlying balance = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log(
      "post-deposit vault token balance = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    return;
  } else if (instruction == "withdraw") {
    console.log(
      "pre-withdraw underlying balance = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log(
      "pre-withdraw vault token balance = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    const voltTokenSupply = (await getMint(connection, vMint)).supply;
    console.log("volt token supply = ", voltTokenSupply.toString());

    await sendIns(
      provider,
      await voltSdk.withdrawHumanAmount(
        new Decimal(options.amount),
        vaultTokenAccount,
        underlyingTokenAccount
      )
    );

    await wait(2500);

    console.log(
      "post-withdraw underlying balance = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log(
      "post-withdraw vault token balance = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );

    return;
  } else if (instruction == "airdropUnderlying") {
    console.log(
      "underlying token account = ",
      underlyingTokenAccount.toString()
    );
    console.log(
      "underlying tokens before = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );
    await airdropGeneric(
      connection,
      user,
      ulMint,
      underlyingTokenAccount,
      options.faucetAddress,
      options.faucetAmount
    );

    await wait(1500);

    console.log(
      "underlying tokens after = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );
    return;
  } else if (instruction == "airdropQuote") {
    console.log("quote token account = ", quoteTokenAccount.toString());
    console.log(
      "quote tokens before = ",
      (await getAccount(connection, quoteTokenAccount)).amount.toString()
    );
    await airdropGeneric(
      connection,
      user,
      qMint,
      quoteTokenAccount,
      options.faucetAddress,
      options.faucetAmount
    );

    await wait(1500);

    console.log(
      "quote tokens after = ",
      (await getAccount(connection, quoteTokenAccount)).amount.toString()
    );

    return;
  } else if (instruction == "printAssets") {
    console.log("printing assets...");
    console.log(
      "underlying tokens = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );
    console.log(
      "vault tokens = ",
      (await getAccount(connection, vaultTokenAccount)).amount.toString()
    );
    console.log(
      "quote tokens = ",
      (await getAccount(connection, quoteTokenAccount)).amount.toString()
    );

    return;
  }

  if (voltSdk.voltType() === VoltType.Entropy) {
    throw new Error(
      "invalid instruction '" + instruction + "' for entropy volt"
    );
  }

  if (instruction == "settlePermissionedMarketPremiumFunds") {
    console.log("settling permissioned market funds");
    await sendIns(
      provider,
      await voltSdk.settlePermissionedMarketPremiumFunds()
    );

    return;
  }

  const optionMarketKey =
    instruction == "setNextOption" || instruction == "wholeShebang"
      ? new PublicKey(options.optionMarket)
      : voltVault.optionMarket;

  // const value: OptionsProtocol = "Soloptions";

  console.log("option market = ", optionMarketKey.toString());
  const optionMarket = await voltSdk.getOptionsContractByKey(
    optionMarketKey
    // value
  );

  const { serumMarketKey, marketAuthority, marketAuthorityBump } =
    await voltSdk.getMarketAndAuthorityInfo(optionMarket.key);

  console.log("option serum market key = ", serumMarketKey.toString());

  const whitelistTokenAccountKey = await getAssociatedTokenAddress(
    WHITELIST_MINT_KEY,
    user.publicKey
  );

  if (instruction == "printOptionSerumMarket") {
    return;
  }

  if (instruction == "resetOptionMarket") {
    await sendIns(provider, await voltSdk.resetOptionMarket());
  }

  if (instruction == "setNextOption") {
    console.log("setting next option market...");

    // if (voltSdk.voltVault.nextOptionWasSet)
    //   console.log(
    //     "skipping setting next option since was already set, creating serum market instead"
    //   );
    // else
    await sendIns(provider, await voltSdk.setNextOption(optionMarketKey));

    // const { serumMarketKey, instructions, signers } = await initSerumMarket(
    //   voltSdk,
    //   provider,
    //   optionMarket
    // );

    // try {
    //   const tx = new Transaction();
    //   for (var ix of instructions) {
    //     tx.add(ix);
    //   }
    //   await provider.sendAndConfirm(tx, signers);
    // } catch (err) {
    //   console.log(err);
    // }

    // await wait(2500);

    return;
  } else if (instruction === "wholeShebang") {
    console.log("whole shebang");

    console.log(voltSdk.voltVault);
    if (
      voltSdk.voltVault.roundHasStarted &&
      !voltSdk.voltVault.currOptionWasSettled &&
      !voltSdk.voltVault.haveTakenWithdrawalFees
    ) {
      console.log("sending settle through startround...");
      await sendInsList(provider, [
        await voltSdk.rebalanceSettle(),
        await voltSdk.endRound(),
        await voltSdk.takePendingWithdrawalFees(),
      ]);
    }

    if (!voltSdk.voltVault.roundHasStarted) {
      await sendIns(provider, await voltSdk.startRound());
    }

    console.log(
      "option market = ",
      optionMarket,
      ", ",
      optionMarket.key.toString()
    );
    const { serumMarketKey, instructions, signers } = await initSerumMarket(
      voltSdk,
      provider,
      optionMarket
    );
    try {
      await Market.load(connection, serumMarketKey, {}, SERUM_PROGRAM_ID);
      console.log("serum market already initialized!");
    } catch (err) {
      console.log("initializing serum market...");
      try {
        const tx = new Transaction();
        for (var ix of instructions) {
          tx.add(ix);
        }
        await provider.sendAndConfirm(tx, signers);
      } catch (err) {
        console.log(err);
      }
    }

    await wait(5000);

    console.log("sending setnextOption and rebalancePrepare...");
    // await sendInsList(provider, [
    //   await voltSdk.setNextOption(
    //     optionMarket.key,
    //     serumMarketKey,
    //     WHITELIST_MINT_KEY,
    //     SERUM_PROGRAM_ID
    //   ),
    //   await voltSdk.rebalancePrepare(),
    // ]);
    return;
  }

  let spotMarket: Market | undefined;
  try {
    const underlyingSerumMarket = new PublicKey(options.underlyingSerumMarket);
    spotMarket = await Market.load(
      provider.connection,
      underlyingSerumMarket,
      {},
      SERUM_PROGRAM_ID
    );
  } catch (err) {
    console.log(err);
    console.log(
      "failed to load serum market (non-fatal error), make sure this wasn't required for this instruction!"
    );
  }

  if (instruction == "inertiaSettleCrank") {
    const contract = await getInertiaContractByKeyOrNull(
      inertiaProgram,
      voltVault.optionMarket
    );

    if (contract === null) throw new Error("contract does not exist");
    const inertiaSDK = new InertiaSDK(contract, {
      provider: provider,
      network: CLUSTER,
    });
    const settlePrice = options.settlePrice as string;
    await sendIns(
      provider,
      await inertiaSDK.settle(
        {
          user: provider.wallet.publicKey,
          settlePrice: new BN(settlePrice),
        },
        new BN(options.bypassCode)
      )
    );

    console.log("done!");
    return;
  } else if (instruction === "inertiaRevertSettle") {
    const contract = await getInertiaContractByKeyOrNull(
      inertiaProgram,
      voltVault.optionMarket
    );
    if (contract === null) throw new Error("contract does not exist");
    const inertiaSDK = new InertiaSDK(contract, {
      provider: provider,
      network: CLUSTER,
    });
    await sendIns(
      provider,
      await inertiaSDK.revertSettle({
        user: (provider as AnchorProvider).wallet.publicKey,
      })
    );

    console.log("done!");
    return;
  } else if (instruction === "reclaimFundsFromExerciseAdmin") {
    const contract = await getInertiaContractByKeyOrNull(
      inertiaProgram,
      voltVault.optionMarket
    );
    if (contract === null) throw new Error("contract does not exist");
    const inertiaSDK = new InertiaSDK(contract, {
      provider: provider,
      network: CLUSTER,
    });
    // await sendIns(
    //   provider,
    //   await inertiaSDK.reclaimFundsFromExerciseAdmin(
    //     provider.wallet.publicKey,
    //     new anchor.BN(options.amount)
    //   )
    // );
    return;
  }
  // else if (instruction === "reinitializeUnderlyingMintInertia") {
  //   const contract = await getContractByKey(
  //     inertiaProgram,
  //     voltVault.optionMarket
  //   );
  //   const inertiaSDK = new InertiaSDK(contract, {
  //     provider: provider,
  //     network: CLUSTER,
  //   });
  //   console.log("target pool = ", options.targetPool.toString());
  //   await sendIns(
  //     provider,
  //     await inertiaSDK.reinitializeUnderlyingMint(
  //       provider.wallet.publicKey,
  //       new PublicKey(options.targetPool),
  //       new PublicKey(options.newUnderlyingAssetMint)
  //     )
  //   );
  //   return;
  // }
  if (instruction === "reinitializeMint") {
    console.log("target pool = ", options.targetPool.toString());
    const targetTokenAccount = await getAccount(
      provider.connection,
      new PublicKey(options.targetPool)
    );

    return;
  } else if (instruction == "rebalanceSwapPremium") {
    console.log("settle permissioned market premium funds");

    // if (!options.swapPermissioned)
    //   await sendIns(
    //     provider,
    //     await voltSdk.settlePermissionedMarketPremiumFunds()
    //   );

    // console.log("sending transaction for rebalanceSwapPremium...");

    // console.log(
    //   "underlying tokens before = ",
    //   (
    //     await getAccount(connection, underlyingTokenAccount)
    //   ).amount.toString()
    // );

    if (voltSdk.isCall()) {
      if (spotMarket === undefined)
        throw new Error("spot market must be defined");

      const swapPremiumOrder = await getBestAsk(spotMarket, connection);

      console.log(
        "swap premium best offer: ",
        swapPremiumOrder?.price?.toString()
      );

      if (!swapPremiumOrder && !options.skipSwap) {
        console.log(
          "no best offer found on market = ",
          spotMarket.address.toString()
        );
        return;
      }

      await sendIns(
        provider,
        await voltSdk.rebalanceSwapPremium(
          spotMarket.address,
          new BN(
            spotMarket
              .priceNumberToLots(swapPremiumOrder?.price ?? 0)
              .toString()
          ),
          new anchor.BN(1),
          options.swapPermissioned ? true : false
        )
      );

      await wait(1000);

      await crankEventQueue(provider, spotMarket as any);

      await wait(1000);
      console.log("sending transaction for settleSwapPremiumFunds...");

      await sendIns(
        provider,
        await voltSdk.settleSwapPremiumFunds(spotMarket.address)
      );

      await wait(2500);

      console.log(
        "underlying tokens after = ",
        (await getAccount(connection, underlyingTokenAccount)).amount.toString()
      );
    } else {
      if (spotMarket === undefined)
        throw new Error("spot market must be defined");

      await sendIns(
        provider,
        await voltSdk.rebalanceSwapPremium(
          spotMarket.address,
          new anchor.BN(0),
          // this only matters if no offer on OB
          new anchor.BN(1),
          options.swapPermissioned ? true : false
        )
      );
    }

    return;
  } else if (instruction == "settleSwapPremiumFunds") {
    if (spotMarket === undefined)
      throw new Error("spot market must be defined");

    console.log("cranking spot market event queue");

    await crankEventQueue(provider, spotMarket as any);

    await wait(1000);

    console.log("settling swap premium funds");
    // const referrer =
    //   friktionSdk.net.SERUM_REFERRER_IDS[voltVault.quoteAssetMint.toString()];

    await sendIns(
      provider,
      await voltSdk.settleSwapPremiumFunds(spotMarket.address)
    );

    return;
  }

  if (instruction == "rebalancePrepare") {
    console.log("minting options...");
    console.log(
      "options in vault before = ",
      (await getAccount(connection, voltVault.optionPool)).amount.toString()
    );

    await sendIns(provider, await voltSdk.rebalancePrepare());

    await wait(2500);

    console.log(
      "options in vault after = ",
      (await getAccount(connection, voltVault.optionPool)).amount.toString()
    );
    return;
  }

  const marketProxy = await marketLoader(
    voltSdk,
    serumMarketKey,
    whitelistTokenAccountKey
  );

  const market = marketProxy.market;

  if (instruction == "printBook") {
    const bids = await market.loadBids(connection);
    console.log("bids: ", bids.getL2(10));

    const asks = await market.loadAsks(connection);
    console.log("asks: ", asks.getL2(10));

    const mmsList = Object.values(MMs);

    const mmsKeyList = Object.keys(MMs);
    const results = await Promise.all(
      Object.keys(MMs).map((ownerKey) => {
        return VoltSDK.findPermissionedOpenOrdersKey(
          friktionSdk.programs.Volt.programId,
          new PublicKey(ownerKey),
          serumMarketKey,
          friktionSdk.net.SERUM_DEX_PROGRAM_ID
        );
      })
    );

    const newMmForPermAddy = {} as Record<string, string>;
    const addyToMmKey: Record<string, string> = {};
    results.forEach((obj, idx) => {
      newMmForPermAddy[obj.openOrdersKey.toString()] = mmsList[idx];
      addyToMmKey[obj.openOrdersKey.toString()] = mmsKeyList[idx];
    });
    const newBids: Order[] = [];
    for (const order of bids) {
      newBids.push(order);
    }

    newBids.reverse().forEach(async (order) => {
      const openOrders = await OpenOrders.load(
        connection,
        order.openOrdersAddress,
        friktionSdk.net.SERUM_DEX_PROGRAM_ID
      );

      console.log("open orders owner: ", openOrders.owner.toString());
      console.log(
        "mm key: ",
        addyToMmKey[order.openOrdersAddress.toString()],
        "mm: ",
        newMmForPermAddy[order.openOrdersAddress.toString()],
        ", px: ",
        order.price,
        ", size: ",
        order.size
      );
    });
  } else if (instruction == "printBidsContinuous") {
    const voltVaults = await friktionSdk.getAllVoltVaults();
    while (true) {
      console.log("starting loop!");
      for (const thisVv of voltVaults) {
        const {
          serumMarketKey: thisMarketKey,
          marketAuthority,
          marketAuthorityBump: thisMarketAuthorityBump,
        } = await voltSdk.getMarketAndAuthorityInfo(
          thisVv.voltVault.optionMarket
        );
        const thisMarketProxy = await marketLoader(
          voltSdk,
          serumMarketKey,
          whitelistTokenAccountKey
        );

        const thisMarket = thisMarketProxy.market;

        const thisBids = await thisMarket.loadBids(connection);
        console.log(
          "volt = ",
          thisVv.voltKey.toString(),
          "\nbids: ",
          thisBids.getL2(10)
        );
        await sleep(1000);
      }
      await sleep(10000);
    }
  } else if (instruction == "rebalanceEnter") {
    console.log("selling options for premium...");

    const bids = await market.loadBids(connection);
    console.log("bids: ", bids.getL2(10));

    const top_bid = Array.from(bids)[0];

    if (top_bid === undefined) {
      throw new Error("top bid was undefined");
      return;
    }

    const order_price = top_bid.price;
    const order_size = 1;

    console.log(
      "underlying tokens before = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log(
      "options in vault before = ",
      (await getAccount(connection, voltVault.optionPool)).amount.toString()
    );
    console.log("sending rebalanceEnter");

    // @ts-ignore
    const enterOrder = await getBestBid(marketProxy.market, connection);

    console.log("rebalance enter best bid: ", enterOrder.price.toString());

    if (!enterOrder) {
      console.log(
        "no best bid found on market = ",
        marketProxy.market.address.toString()
      );
      return;
    }

    // try {
    //   console.log("auction metadata = ", await voltSdk.getAuctionMetadata());
    // } catch (err) {
    //   await sendIns(provider, await voltSdk.changeAuctionParams(false));
    // }

    if (
      voltSdk.extraVoltData?.auctionMetadata.toString() !==
      (await VoltSDK.findAuctionMetadataAddress(voltSdk.voltKey))[0].toString()
    ) {
      await sendIns(provider, await voltSdk.changeAuctionParams(false));
    }
    await sleep(5000);

    await sendIns(
      provider,
      await voltSdk.rebalanceEnter(
        new BN(
          marketProxy.market.priceNumberToLots(enterOrder.price).toString()
        ),
        new anchor.BN(order_size)
      )
    );

    await wait(1000);

    console.log("cranking event queue...");

    await crankEventQueue(provider, market as any);

    await wait(1000);

    console.log("settling enter funds");

    await wait(2500);

    console.log(
      "underlying tokens after = ",
      (await getAccount(connection, underlyingTokenAccount)).amount.toString()
    );

    console.log(
      "options in vault after = ",
      (await getAccount(connection, voltVault.optionPool)).amount.toString()
    );

    return;
  } else if (instruction == "rebalanceSettle") {
    console.log(
      "# underlying before: ",
      (await getAccount(connection, voltVault.depositPool)).amount.toString()
    );

    console.log(
      "# writer tokens before: ",
      (
        await getAccount(connection, voltVault.writerTokenPool)
      ).amount.toString()
    );

    await sendIns(provider, await voltSdk.rebalanceSettle());

    console.log(
      "# underlying after: ",
      (await getAccount(connection, voltVault.depositPool)).amount.toString()
    );

    console.log(
      "# writer tokens after: ",
      (
        await getAccount(connection, voltVault.writerTokenPool)
      ).amount.toString()
    );
  } else if (instruction == "settleEnterFunds") {
    await crankEventQueue(provider, market as any);

    console.log("settling rebalance enter funds");
    const referrer =
      friktionSdk.net.SERUM_REFERRER_IDS[voltVault.quoteAssetMint.toString()];
    await sendIns(provider, await voltSdk.settleEnterFunds());

    return;
  }
  // else if (instruction == "closeOpenOrdersPls") {
  //   await closeOpenOrdersPls(spotMarket.address);

  //   return;
  // }
};

const airdropGeneric = async (
  connection: Connection,
  user: Keypair,
  mint: PublicKey,
  tokenAccount: PublicKey,
  faucetAddress: PublicKey,
  amount: number
) => {
  await createAccountsAndAirdrop(
    connection,
    user,
    {
      faucetAddress: new PublicKey(faucetAddress),
      mintAddress: mint,
      decimals: (await getMint(connection, mint)).decimals,
    },
    {
      amount: new BN(
        (await getAccount(connection, tokenAccount)).amount.toString()
      ).toNumber(),
      mint: mint,
      // public key for the specific token account (NOT the wallet)
      pubKey: tokenAccount,
    },
    amount
  );
};

(async () => {
  try {
    const text = await run();
    console.log(text);
  } catch (e) {
    console.log(e);
    // Deal with the fact the chain failed
  }
})();

const getBestBid = async (
  market: Market,
  connection: Connection
): Promise<Order> => {
  const bestBid = Array.from(await market.loadBids(connection)).at(-1) as Order;
  return bestBid;
};

const getBestAsk = async (
  market: Market,
  connection: Connection
): Promise<Order> => {
  const bestAsk = Array.from(await market.loadAsks(connection)).at(0) as Order;
  return bestAsk;
};

const getBBO = async (
  market: Market,
  connection: Connection
): Promise<{
  bestBid: Order;
  bestAsk: Order;
}> => {
  const bids = await market.loadBids(connection);
  const asks = await market.loadAsks(connection);

  const num_to_show = 1;
  const top_bids = Array.from(bids)
    .slice()
    .reverse()
    .reverse()
    .slice(-num_to_show);
  const top_asks = Array.from(asks).slice(0, num_to_show);

  const bestBid = top_bids[0];
  const bestAsk = top_asks[0];
  return {
    bestBid,
    bestAsk,
  };
};

const getPriceFromMarket = async (market: Market, connection: Connection) => {
  // Fetching orderbooks
  const bids = await market.loadBids(connection);
  const asks = await market.loadAsks(connection);

  const num_to_show = 5;
  const top_bids = Array.from(bids)
    .slice()
    .reverse()
    .reverse()
    .slice(-num_to_show);
  const top_asks = Array.from(asks).slice(0, num_to_show);

  const bid_px =
    top_bids
      .map((o) => {
        return o.price * o.size;
      })
      .reduce((prev, curr) => {
        return prev + curr;
      }) / top_bids.map((o) => o.size).reduce((p, c) => p + c);
  const ask_px =
    top_asks
      .map((o) => {
        return o.price * o.size;
      })
      .reduce((prev, curr) => {
        return prev + curr;
      }) / top_asks.map((o) => o.size).reduce((p, c) => p + c);
  return (bid_px + ask_px) / 2.0;
};
