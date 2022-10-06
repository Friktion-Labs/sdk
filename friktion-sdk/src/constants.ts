import type { Idl } from "@friktion-labs/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import { InertiaIDLJsonRaw } from "./idls/inertia";
import { SimpleSwapIDLJsonRaw } from "./idls/simpleSwap";
import { SoloptionsIDLJsonRaw } from "./idls/soloptions";
import { SpreadsIDLJsonRaw } from "./idls/spreads";
import { VoltIDLJsonRaw } from "./idls/volt";

export enum VoltStrategy {
  ShortCalls,
  ShortPuts,
  ShortCrab,
  LongBasis,
  ProtectionAndPuts,
}

export type VoltNumber = 1 | 2 | 3 | 4 | 5;
export type OptionsProtocol = "Inertia" | "Soloptions" | "Spreads";

export type PerpProtocol = "Entropy" | "Mango";

export const GLOBAL_VOLT_ADMIN = new PublicKey(
  "DxMJgeSVoe1cWo1NPExiAsmn83N3bADvkT86dSP1k7WE"
);

export const FRIKTION_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";

export const VoltTypeValues = {
  ShortOptions: {
    shortOptions: {},
  },
  Entropy: {
    entropy: {},
  },
  PrincipalProtection: {
    principalProtection: {},
  },
};

export enum VoltType {
  ShortOptions = 0,
  Entropy = 1,
  PrincipalProtection = 2,
}

export const WRAPPED_SOL_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const SOL_NORM_FACTOR = Math.pow(10, 9);

// program ids

export const FRIKTION_PROGRAM_ID = new PublicKey(
  "VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp"
);

export const SIMPLE_SWAP_PROGRAM_ID = new PublicKey(
  "SwpWEbAhitpix22gbX28zah7g8JiA1FRwVdPe4XohQb"
);

export const ENTROPY_PROGRAM_ID = new PublicKey(
  "FcfzrnurPFXwxbx332wScnD5P86DwhpLpBbQsnr6LcH5"
);

export const MANGO_PROGRAM_ID = new PublicKey(
  "mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68"
);

export const DAO_EXAMPLES_PROGRAM_ID = new PublicKey(
  "DAo2pDtpiBFDu4TTiv2WggP6PfQ6FnKqwSRYxpMjyuV2"
);

export const METAPLEX_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
// mint authorities

export const MM_TOKEN_MINT_AUTHORITY = new PublicKey(
  "EMbCLCqkv4qXxhLtbCcByNZhW4YTgH33hS2Y5zqHqcRr"
);

// fee wallets

export const JUP_FEE_OWNER = new PublicKey(
  "GE8NJKn3M6cWVytXomdqvqeUWKHBCwBqgSHPRRLNjGNc"
);

export const VOLT_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const SOLOPTIONS_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const INERTIA_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const SPREADS_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const DEFAULT_WITHDRAWAL_FEE_BPS = 10;
export const DEFAULT_PERFORMANCE_FEE_BPS = 1000;
export const DEFAULT_AUM_FEE_BPS = 0;

export const SOLOPTIONS_MINT_FEE_BPS = 0;
export const SOLOPTIONS_EXERCISE_FEE_BPS = 0;

export const INERTIA_MINT_FEE_BPS = 0;
export const INERTIA_EXERCISE_FEE_BPS = 0;
export const INERTIA_PX_NORM_FACTOR = 10000;

export const SPREADS_MINT_FEE_BPS = 0;
export const SPREADS_EXERCISE_FEE_BPS = 0;
export const SPREADS_PX_NORM_FACTOR = 10000;

export const GLOBAL_MM_TOKEN_MINT = new PublicKey(
  "mmmFXxpwDfkPFVKt1Js8fU6DvjEMXU8tprvaTpmn8sM"
);

const mainnetNetworkId: "mainnet-beta" | "devnet" =
  Math.random() > -1 ? "mainnet-beta" : "devnet";

export const USE_SDK_NET_TO_GET_CONSTANTS_MAINNET = {
  id: mainnetNetworkId,
  SERUM_DEX_PROGRAM_ID: new PublicKey(
    "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
  ),
  COINGECKO_IDS: {
    BTC: "bitcoin",
    SOL: "solana",
    ETH: "ethereum",
    mSOL: "msol",
    FTT: "ftx-token",
    SRM: "serum",
    USDC: "usd-coin",
    tsUSDC: "usd-coin",
    PAI: "usd-coin",
    UXD: "usd-coin",
    MNGO: "mango-markets",
    scnSOL: "socean-staked-sol",
    SBR: "saber",
    LUNA: "terra-luna",
    UST: "terrausd",
    RAY: "raydium",
    STEP: "step-finance",
    stSOL: "lido-staked-sol",
    AVAX: "avalanche-2",
    SAMO: "samoyedcoin",
    NEAR: "near",
  },
  REFERRAL_SRM_OR_MSRM_ACCOUNT: SystemProgram.programId,
  MM_TOKEN_MINT: GLOBAL_MM_TOKEN_MINT,
  ENTROPY_PERP_MARKET_NAMES: {
    HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu: "BTC^2-PERP",
    "9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i": "BTC-PERP",
    GkRz4Gpz9WSvJYZ2Qso37oHGvXubzp6PuBMAeFggbLq9: "BTC-1D-IV",

    // mango
    "2TgaaVoHgnSeEtXvWTx13zQeTf4hYWAMEiMQdcG6EwHi": "SOL-PERP",
    DtEcjPLyD4YtTBB4q8xwFZ9q49W89xZCZtJyrGebi5t8: "BTC-PERP",
  },
  // from https://github.com/Friktion-Labs/entropy-client/blob/main/src/ids.json
  ENTROPY_GROUP: new PublicKey("EAhqxJge6VCXH5KaPEmDzz4DoKGfHgCotmpC8xGvBju2"),
  MANGO_GROUP: new PublicKey("98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"),
  mints: {
    USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    USDT: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    UST: new PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
    BTC: new PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"),
    SOL: new PublicKey("So11111111111111111111111111111111111111112"),
    mSOL: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
    ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    FTT: new PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
    SAMO: new PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    NEAR: new PublicKey("BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z"),
    SRM: new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),
    MNGO: new PublicKey("MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"),
    scnSOL: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
    stSOL: new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
    SBR: new PublicKey("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1"),
    LUNA: new PublicKey("F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W"),
    RAY: new PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
    TUSDCV2: new PublicKey("Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip"),
    PAI: new PublicKey("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),
    UXD: new PublicKey("7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"),
    STEP: new PublicKey("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT"),
    AVAX: new PublicKey("KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE"),
  },
  SERUM_REFERRER_IDS: {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: new PublicKey(
      "4gQT3fvf45bQhvRW1CDKdovVkuyEMggLg4fwXoHtLFqY"
    ),
    "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i": new PublicKey(
      "C5AoVeHhxLmBiFpGMsGFHMYT83QL8aGyWkiER9LK4f1t"
    ),
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": new PublicKey(
      "FkGtQZ3FGe3s4W1mGLqEuAraNcF3vaYUbFa8Fyt3nptx"
    ),
    So11111111111111111111111111111111111111112: new PublicKey(
      "5byrk6XpxfiCsWPdVhQR9csGUBdmiCwLZCWM5AY7kbq2"
    ),
    mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: new PublicKey(
      "AhmdRPM9tDMaQoP2jN48QPfBANnSLt6EdfoTKRJPT3sJ"
    ),
    "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk": new PublicKey(
      "HZHEmjnrARHFA2ZuynqAXFDTJQfHU8qN2xTUSuQ1S8wd"
    ),
    AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3: new PublicKey(
      "9eY4qZoMsV5AoL4dFxwA4HWneJk8EGvVB54tEtSfikN9"
    ),
    EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv: new PublicKey(
      "7eiWUQ4EkE3BzKC3MFdn23ydK56Bd5rUCYQZpud9kyhZ"
    ),
    BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z: new PublicKey(
      "BSgb8vw2sEo3wpnQ8jMwrjTceWXSDwBxgtsK7CfR6xaX"
    ),
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": new PublicKey(
      "izwhTAj2xfCgr9X6UBRme39UcNvncp7omnCCwUCmQ9J"
    ),
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": new PublicKey(
      "8WRpe8WfiCFmrWTjN7yv551i4YNxGpgv6qiYS7CjLpDH"
    ),
    SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: new PublicKey(
      "FhrcvL91UwgVpbMmpmyx3GTPUsuofWpjRGBdpV34ern2"
    ),
    MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: new PublicKey(
      "82jKzqE9KHxyWoMGhT1z2yMAtoVFPZbg4WiDHMFUusHj"
    ),
    "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": new PublicKey(
      "GhLoKzR2QiUcbeviNMXejGTVAYZfvG1KuQZbejo9i4Ws"
    ),
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": new PublicKey(
      "9NefScLAzaequJNi335QQrvcJUZw4ZGwABbp7Nso3Rgu"
    ),
    Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1: new PublicKey(
      "6bqTT9V5DFDB1Ktdns4w9CnwCHYQtEURg27vTmb6eQXx"
    ),
    F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W: new PublicKey(
      "Dks8aJUr8SRd3v6eHEgFg7VcYbrwDmb373d3wYmhD23b"
    ),
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": new PublicKey(
      "GaSnvbsoq6kEth7dbE9M1P4h6f2GpE1SrEz75z1MD7QA"
    ),
    Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip: new PublicKey(
      "BRbrPkQFjtePRAAF4KoauWmKooG56H7jwx5bUknuMCh9"
    ),
    Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS: new PublicKey(
      "CnmDnku17xVpVtmpek5MMmFmAddAdUcMiBTKhDx2DymP"
    ),
    "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT": new PublicKey(
      "FMdXSvc8HL7HZDeRuLEbu3Gx8J9D5pecWtGXcrQZ6gkT"
    ),
    StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT: new PublicKey(
      "2nRHbu47Wt9jVJtcLxdmhn1YWbC1gzAuPKSuycyL4GGa"
    ),
  },

  JUP_PLATFORM_FEE_ACCOUNTS: {
    feeBps: 10,
    feeAccounts: new Map([
      [
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        new PublicKey("FqvQQFa8aNuR8XokTBU6pxBRbXSiY6qyp4yTAVN7F55e"),
      ],
      [
        "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
        new PublicKey("8L45vsUWJtpTKcoFea7xwSeBksTNqveAuTdb55DL133T"),
      ],
      [
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
        new PublicKey("5TVNjYfy8A3r72hvgzgXJpZjCempQARR27K9buGPa3Vg"),
      ],
      [
        "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT",
        new PublicKey("BxL8NYKjgA44AxbLwgyunXcZLJDDsrnCjkguXfmykYYM"),
      ],
      [
        "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        new PublicKey("FMgT8z1Z3XMiptLXduWMrpRsFXn4KzGaj1tHPgrc1NNE"),
      ],
      [
        "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
        new PublicKey("EMtkqX7F4bWitoRg7WuPQX4S8Ce98sYyhdjPqSpVnnM5"),
      ],
      [
        "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
        new PublicKey("8TV9bKtdaQxcY1FAmMqB6tSMZ9eBapnWAs4nAzP8AkuZ"),
      ],
      [
        "Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip",
        new PublicKey("FVUPENb7BXnA9BZJwTEipZQqLcZ7PUHz5pp9W9Ph4Yff"),
      ],
      [
        "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
        new PublicKey("FEGxgTCebsarToZbRPTNd2srVVsw8vgZRs3Yh3zhaoJ4"),
      ],
      [
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        new PublicKey("3iQEkAF45iwS5UjkUdqFG9m8K8M98BvihN2JR8mhFQQ8"),
      ],
      [
        "EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv",
        new PublicKey("AJDmwEuvdM8tniwUriJ1t55rKDVtZ3YgCkz3LdUDt8gE"),
      ],
      [
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        new PublicKey("Bj3K2kd9Z6W5To1FPZNxjtSBG2ddu4i5KvvwFZnp2pRh"),
      ],
      [
        "F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W",
        new PublicKey("BUbbWbkp5ecEbAbEXYGzw8H7SccBcLQBqwEFC5g29rNV"),
      ],
      [
        "KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE",
        new PublicKey("1bgxpJ1wzPik22phrKtWpCwZUuS2s7YTSyT6qshq9NX"),
      ],
      [
        "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
        new PublicKey("2WVzAqr2o78wrKWG7YeXW3RJGZRZWGNAEfz4xjGUPnJE"),
      ],
      [
        "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        new PublicKey("HdqBarqKTf1GkjUBAhDiw4ujZvwR6YVNFMnpXgPSbHJE"),
      ],
      [
        "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
        new PublicKey("63UWybkSPzXGS4mcbsyzWRNMBFN5zaAk8KZAjXcw2aYU"),
      ],
      [
        "So11111111111111111111111111111111111111112",
        new PublicKey("A7MPmmWKqykquNEfsHUcCUB9ysVLfwMgoDH2z4oBjQog"),
      ],
      [
        "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
        new PublicKey("Hm5zGps1eHRHfrKuQkcwPgXGmeZkZTKLyTvteiPucWUY"),
      ],
      [
        "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",
        new PublicKey("6XGLmdevQ5NYM1iwGPmKC7ZSKU2CA9ywSEE1yUAWNwxp"),
      ],
      [
        "BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z",
        new PublicKey("5UCW44c43tus4sZxg8497nCnKZUa352QACew8nyU8Vzq"),
      ],
    ]),
  },
};

export type NetworkSpecificConstants = Omit<
  Omit<
    Omit<typeof USE_SDK_NET_TO_GET_CONSTANTS_MAINNET, "SERUM_REFERRER_IDS">,
    "ENTROPY_PERP_MARKET_NAMES"
  >,
  "COINGECKO_IDS"
> & {
  ENTROPY_PERP_MARKET_NAMES: Record<string, string>;
  SERUM_REFERRER_IDS: Record<string, PublicKey>;
  COINGECKO_IDS: Record<string, string>;
};

export const USE_SDK_NET_TO_GET_CONSTANTS_DEVNET: NetworkSpecificConstants = {
  id: "devnet",
  SERUM_DEX_PROGRAM_ID: new PublicKey(
    "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY"
  ),
  COINGECKO_IDS: {
    BTC: "bitcoin",
    SOL: "solana",
    ETH: "ethereum",
    mSOL: "msol",
    FTT: "ftx-token",
    SRM: "serum",
    USDC: "usd-coin",
    tsUSDC: "usd-coin",
    PAI: "usd-coin",
    UXD: "usd-coin",
    MNGO: "mango-markets",
    scnSOL: "socean-staked-sol",
    SBR: "saber",
    LUNA: "terra-luna",
    UST: "terrausd",
    RAY: "raydium",
    STEP: "step-finance",
    stSOL: "lido-staked-sol",
    AVAX: "avalanche-2",
    SAMO: "samoyedcoin",
    NEAR: "near",
  },
  REFERRAL_SRM_OR_MSRM_ACCOUNT: SystemProgram.programId,
  MM_TOKEN_MINT: new PublicKey("E1rQjxeh1jD5gbKAfmq7VHhdNaom4p1pdccJt43t13nz"),
  ENTROPY_PERP_MARKET_NAMES: {},
  ENTROPY_GROUP: new PublicKey("EAhqxJge6VCXH5KaPEmDzz4DoKGfHgCotmpC8xGvBju2"),
  MANGO_GROUP: new PublicKey("98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"),
  mints: {
    USDC: new PublicKey("E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF"),
    USDT: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    UST: new PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
    BTC: new PublicKey("C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6"),
    SOL: new PublicKey("So11111111111111111111111111111111111111112"),
    mSOL: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
    ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    FTT: new PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
    SAMO: new PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    NEAR: new PublicKey("BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z"),
    SRM: new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),
    MNGO: new PublicKey("MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"),
    scnSOL: new PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
    stSOL: new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
    SBR: new PublicKey("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1"),
    LUNA: new PublicKey("F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W"),
    RAY: new PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
    TUSDCV2: new PublicKey("Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip"),
    PAI: new PublicKey("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),
    UXD: new PublicKey("7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"),
    STEP: new PublicKey("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT"),
    AVAX: new PublicKey("KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE"),
  },
  SERUM_REFERRER_IDS: {
    E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF: new PublicKey(
      "3NPL7oyimvdCwdpTUXZjjB665dBtMAZC67guBaKnwnrJ"
    ),
    C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6: new PublicKey(
      "FqL9eRHtMzXLBHaQ5Us97m8MsWLd11BE5ApsxGi18mQu"
    ),
    So11111111111111111111111111111111111111112: new PublicKey(
      "5byrk6XpxfiCsWPdVhQR9csGUBdmiCwLZCWM5AY7kbq2"
    ),
    // THIS IS OLD NOW
    mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: new PublicKey(
      "DRzNhinWFjmspx1vy8e7ryDqPGU6AYV93XXUzC6jxoKB"
    ),
  },
  JUP_PLATFORM_FEE_ACCOUNTS: {
    feeBps: 10,
    feeAccounts: new Map([]),
  },
};

export const DEVNET_WHITELIST_TOKEN = new PublicKey(
  "fAXSS4EgZYo8dreUSf341p9eP4bB6emYv6BKE5zshnD"
);

export const OPTIONS_PROGRAM_IDS = {
  Soloptions: new PublicKey("in9BCveNxQX9rAGaZdrzDD5HGpVczfEoxzXLv3hzjgA"),
  Inertia: new PublicKey("iNeq88RkcvbwfnWAsqw5rQvJTbuKEA15PaMe7YAcTx3"),
  Spreads: new PublicKey("SpRdUab7oXPf1oYRM6YXRGfAEMKASFfFtxafDiAgrRR"),
};

export const SERUM_PROGRAM_IDS = {
  Devnet: new PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY"),
  Mainnet: new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"),
};

export const DEVNET_USDC_MINT = new PublicKey(
  "E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF"
);

export const FRIKTION_IDLS: Record<string, Idl> = {
  Volt: VoltIDLJsonRaw as unknown as Idl,
};

export const OTHER_IDLS: Record<string, Idl> = {
  Soloptions: SoloptionsIDLJsonRaw as unknown as Idl,
  [OPTIONS_PROGRAM_IDS.Soloptions.toString()]:
    SoloptionsIDLJsonRaw as unknown as Idl,
  Inertia: InertiaIDLJsonRaw as unknown as Idl,
  [OPTIONS_PROGRAM_IDS.Inertia.toString()]: InertiaIDLJsonRaw as unknown as Idl,
  [SIMPLE_SWAP_PROGRAM_ID.toString()]: SimpleSwapIDLJsonRaw as unknown as Idl,
  SimpleSwap: SimpleSwapIDLJsonRaw as unknown as Idl,
  Spreads: SpreadsIDLJsonRaw as unknown as Idl,
  [OPTIONS_PROGRAM_IDS.Spreads.toString()]: SpreadsIDLJsonRaw as unknown as Idl,
};

export enum RuntimeEnvironment {
  Test,
  Production,
}

export const NUM_WEEKS_PER_YEAR = 52;
export const NUM_SECONDS_PER_YEAR = 60 * 60 * 24 * 365;
