import * as anchor from "@friktion-labs/anchor";
import {
  FriktionEpochInfoWithKey,
  FriktionSDK,
  marketLoader,
  NetworkName,
  ShortOptionsVoltSDK,
  VoltSnapshot,
} from "@friktion-labs/friktion-sdk";
import { sendInsListUntilSuccess, sleep } from "@friktion-labs/friktion-utils";
import { AnchorProvider } from "@project-serum/anchor";
import { MarketProxy, OpenOrders } from "@project-serum/serum";
import { Order } from "@project-serum/serum/lib/market";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import colors from "colors";
import {getOrCreateAssociatedTokenAccounts} from "@friktion-labs/friktion-utils";

export const createSettleIx = async (
  providerMut: AnchorProvider,
  marketProxy: MarketProxy,
  serumReferrerIds: Record<string, PublicKey>,
  openOrdersKey: PublicKey
): Promise<TransactionInstruction> => {
  const market = marketProxy.market;

  // const baseAccount = await getAssociatedTokenAddress(
  //   market.baseMintAddress,
  //   providerMut.wallet.publicKey
  // );
  // const quoteAccount = await getAssociatedTokenAddress(
  //   market.quoteMintAddress,
  //   providerMut.wallet.publicKey
  // );

  const [baseAccount, quoteAccount] = await getOrCreateAssociatedTokenAccounts(
    providerMut,
    {
      accountParams: [
        {
          mint: market.baseMintAddress,
          owner: providerMut.wallet.publicKey,
        },
        {
          mint: market.quoteMintAddress,
          owner: providerMut.wallet.publicKey,
        },
      ],
    }
  );

  const settleIx = await marketProxy.instruction.settleFunds(
    openOrdersKey,
    providerMut.wallet.publicKey,
    baseAccount,
    quoteAccount,
    serumReferrerIds[market.quoteMintAddress.toString()]
  );

  return settleIx;
};


export const doCancelAndSettleAllOrders = async () => {
  const CLUSTER: NetworkName = "mainnet-beta";
  const PROVIDER_URL = "https://ssc-dao.genesysgo.net";
  // const PROVIDER_URL = "https://api.mainnet-beta.solana.com";
  // const PROVIDER_URL = "https://solana-api.projectserum.com";
  const provider = new anchor.AnchorProvider(
    new Connection(PROVIDER_URL),
    anchor.Wallet.local(),
    {}
  );
  const connection = provider.connection;
  const friktionSdk = new FriktionSDK({
    provider: provider,
    network: CLUSTER,
  });

  const currentVolts: VoltSnapshot[] = (await friktionSdk.getSnapshot())[
    "allMainnetVolts"
  ];

  const dovVolts: VoltSnapshot[] = currentVolts.filter(
    (volt) => volt["voltType"] === 1 || volt["voltType"] === 2
  );

  const numEpochsBack = 3;

  await Promise.all(
    dovVolts.map(async (dovSnapshot) => {
      // if (dovSnapshot["globalId"] !== "mainnet_income_call_eth") return;
      const dovSdk = await friktionSdk.loadShortOptionsVoltSDKByKey(
        new PublicKey(dovSnapshot["voltVaultId"])
      );
      console.log(colors.blue(dovSnapshot["globalId"].toString()));
      const results = await Promise.allSettled(
        [...Array(dovSdk.voltVault.roundNumber.toNumber() + 1).keys()]
          .filter((roundNumber) => {
            return (
              roundNumber >
              dovSdk.voltVault.roundNumber.toNumber() - numEpochsBack
            );
          })
          .map(async (roundNumber) => {
            console.log(
              "loading round number = ",
              roundNumber,
              " for volt = ",
              dovSdk.voltKey.toString()
            );
            let epochInfo: FriktionEpochInfoWithKey;
            try {
              epochInfo = await dovSdk.getEpochInfoByNumber(
                new BN(roundNumber)
              );
            } catch (err) {
              return;
            }

            const optionMarketKey = epochInfo.optionKey;
            const { serumMarketKey } = await dovSdk.getMarketAndAuthorityInfo(
              optionMarketKey
            );
            const whitelistTokenAccountKey = await getAssociatedTokenAddress(
              dovSdk.voltVault.whitelistTokenMint,
              provider.wallet.publicKey
            );
            // console.log("loading serum market proxy");
            let marketProxy: MarketProxy;
            try {
              marketProxy = await marketLoader(
                dovSdk,
                optionMarketKey,
                serumMarketKey,
                whitelistTokenAccountKey
              );
            } catch (err) {
              console.log("failed to load serum market = ", serumMarketKey);
              return;
            }

            const [openOrdersAddress] =
              await ShortOptionsVoltSDK.findPermissionedOpenOrdersKey(
                friktionSdk.programs.Volt.programId,
                provider.wallet.publicKey,
                marketProxy.market.address,
                marketProxy.dexProgramId
              );
            let openOrders: OpenOrders;
            try {
              openOrders = await OpenOrders.load(
                friktionSdk.readonlyProvider.connection,
                openOrdersAddress,
                friktionSdk.net.SERUM_DEX_PROGRAM_ID
              );
            } catch (err) {
              console.log("failed to retrieve open orders");
              return;
            }

            const allOpenOrders: Order[] =
              await marketProxy.market.loadOrdersForOwner(
                connection,
                openOrdersAddress
              );

            console.log(
              "open orders = ",
              openOrders.address.toString(),
              ", list of orders = ",
              allOpenOrders
            );

            const results = await Promise.all(
              allOpenOrders.map(async (o) => {
                const cancelIx = marketProxy.instruction.cancelOrder(
                  provider.wallet.publicKey,
                  o
                );
                console.log("sending cancel order instruction");
                const txid = await sendInsListUntilSuccess(provider, [
                  cancelIx,
                ]);
              })
            );

            await sleep(15000);

            openOrders = await OpenOrders.load(
              friktionSdk.readonlyProvider.connection,
              openOrdersAddress,
              friktionSdk.net.SERUM_DEX_PROGRAM_ID
            );

            if (
              openOrders.quoteTokenTotal.gtn(0) ||
              openOrders.baseTokenTotal.gtn(0)
            ) {
              console.log("settling funds...");
              console.log(
                "open orders = ",
                openOrders.address.toString(),
                "\nclaiming quote = ",
                openOrders.quoteTokenFree,
                openOrders.quoteTokenTotal,
                "\n, serum market = ",
                serumMarketKey.toString()
              );
              console.log(
                "claiming base = ",
                openOrders.baseTokenFree,
                openOrders.baseTokenTotal
              );

              const settleIx = await createSettleIx(
                provider,
                marketProxy,
                friktionSdk.net.SERUM_REFERRER_IDS,
                openOrders.address
              );
              await sendInsListUntilSuccess(provider, [settleIx]);
            } else {
              console.log("skipping settle funds");
            }
          })
      );
      // console.log("results = ", results);
    })
  );
};

(async () => {
  await doCancelAndSettleAllOrders();
})();
