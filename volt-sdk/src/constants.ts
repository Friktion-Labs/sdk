import type { Idl } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import { InertiaIDLJsonRaw } from "./idls/inertia";
import { SoloptionsIDLJsonRaw } from "./idls/soloptions";
import { VoltIDLJsonRaw } from "./idls/volt";

export enum VoltStrategy {
  ShortCalls,
  ShortPuts,
  ShortCrab,
  LongBasis,
}

export type OptionsProtocol = "Inertia" | "Soloptions";

export type PerpProtocol = "Entropy" | "Mango";

export const FRIKTION_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";

export enum VoltType {
  ShortOptions = 0,
  Entropy = 1,
}

// program ids

export const FRIKTION_PROGRAM_ID = new PublicKey(
  "VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp"
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

// mint authorities

export const MM_TOKEN_MINT_AUTHORITY = new PublicKey(
  "EMbCLCqkv4qXxhLtbCcByNZhW4YTgH33hS2Y5zqHqcRr"
);

// fee wallets

export const REFERRAL_AUTHORITY = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const SOLOPTIONS_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const INERTIA_FEE_OWNER = new PublicKey(
  "3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ"
);

export const INERTIA_PX_NORM_FACTOR = 10000;

export const WITHDRAWAL_FEE_BPS = 10;
export const PERFORMANCE_FEE_BPS = 1000;

export const SOLOPTIONS_MINT_FEE_BPS = 0;
export const SOLOPTIONS_EXERCISE_FEE_BPS = 0;

export const INERTIA_MINT_FEE_BPS = 0;
export const INERTIA_EXERCISE_FEE_BPS = 0;

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
  },
  REFERRAL_SRM_OR_MSRM_ACCOUNT: SystemProgram.programId,
  MM_TOKEN_MINT: GLOBAL_MM_TOKEN_MINT,
  ENTROPY_PERP_MARKET_NAMES: {
    HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu: "BTC^2-PERP",
    "9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i": "BTC-PERP",
    GkRz4Gpz9WSvJYZ2Qso37oHGvXubzp6PuBMAeFggbLq9: "BTC-1D-IV",
  },
  mints: {
    USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    UST: new PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
    BTC: new PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"),
    SOL: new PublicKey("So11111111111111111111111111111111111111112"),
    mSOL: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
    ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    FTT: new PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
    SAMO: new PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
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
  COINGECKO_IDS: {},
  REFERRAL_SRM_OR_MSRM_ACCOUNT: SystemProgram.programId,
  MM_TOKEN_MINT: GLOBAL_MM_TOKEN_MINT,
  ENTROPY_PERP_MARKET_NAMES: {},
  mints: {
    USDC: new PublicKey("E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF"),
    UST: new PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
    BTC: new PublicKey("C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6"),
    SOL: new PublicKey("So11111111111111111111111111111111111111112"),
    mSOL: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
    ETH: new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    FTT: new PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
    SAMO: new PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
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
};

export const DEVNET_WHITELIST_TOKEN = new PublicKey(
  "fAXSS4EgZYo8dreUSf341p9eP4bB6emYv6BKE5zshnD"
);

export const OPTIONS_PROGRAM_IDS = {
  Soloptions: new PublicKey("in9BCveNxQX9rAGaZdrzDD5HGpVczfEoxzXLv3hzjgA"),
  Inertia: new PublicKey("iNeq88RkcvbwfnWAsqw5rQvJTbuKEA15PaMe7YAcTx3"),
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
};
