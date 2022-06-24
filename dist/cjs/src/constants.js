"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeEnvironment = exports.OTHER_IDLS = exports.FRIKTION_IDLS = exports.DEVNET_USDC_MINT = exports.SERUM_PROGRAM_IDS = exports.OPTIONS_PROGRAM_IDS = exports.DEVNET_WHITELIST_TOKEN = exports.USE_SDK_NET_TO_GET_CONSTANTS_DEVNET = exports.USE_SDK_NET_TO_GET_CONSTANTS_MAINNET = exports.GLOBAL_MM_TOKEN_MINT = exports.SPREADS_PX_NORM_FACTOR = exports.SPREADS_EXERCISE_FEE_BPS = exports.SPREADS_MINT_FEE_BPS = exports.INERTIA_PX_NORM_FACTOR = exports.INERTIA_EXERCISE_FEE_BPS = exports.INERTIA_MINT_FEE_BPS = exports.SOLOPTIONS_EXERCISE_FEE_BPS = exports.SOLOPTIONS_MINT_FEE_BPS = exports.PERFORMANCE_FEE_BPS = exports.WITHDRAWAL_FEE_BPS = exports.SPREADS_FEE_OWNER = exports.INERTIA_FEE_OWNER = exports.SOLOPTIONS_FEE_OWNER = exports.REFERRAL_AUTHORITY = exports.MM_TOKEN_MINT_AUTHORITY = exports.DAO_EXAMPLES_PROGRAM_ID = exports.MANGO_PROGRAM_ID = exports.ENTROPY_PROGRAM_ID = exports.SIMPLE_SWAP_PROGRAM_ID = exports.FRIKTION_PROGRAM_ID = exports.SOL_NORM_FACTOR = exports.WRAPPED_SOL_ADDRESS = exports.VoltType = exports.FRIKTION_SNAPSHOT_URL = exports.VoltStrategy = void 0;
var web3_js_1 = require("@solana/web3.js");
var inertia_1 = require("./idls/inertia");
var simpleSwap_1 = require("./idls/simpleSwap");
var soloptions_1 = require("./idls/soloptions");
var spreads_1 = require("./idls/spreads");
var volt_1 = require("./idls/volt");
var VoltStrategy;
(function (VoltStrategy) {
    VoltStrategy[VoltStrategy["ShortCalls"] = 0] = "ShortCalls";
    VoltStrategy[VoltStrategy["ShortPuts"] = 1] = "ShortPuts";
    VoltStrategy[VoltStrategy["ShortCrab"] = 2] = "ShortCrab";
    VoltStrategy[VoltStrategy["LongBasis"] = 3] = "LongBasis";
})(VoltStrategy = exports.VoltStrategy || (exports.VoltStrategy = {}));
exports.FRIKTION_SNAPSHOT_URL = "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";
var VoltType;
(function (VoltType) {
    VoltType[VoltType["ShortOptions"] = 0] = "ShortOptions";
    VoltType[VoltType["Entropy"] = 1] = "Entropy";
})(VoltType = exports.VoltType || (exports.VoltType = {}));
exports.WRAPPED_SOL_ADDRESS = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
exports.SOL_NORM_FACTOR = Math.pow(10, 9);
// program ids
exports.FRIKTION_PROGRAM_ID = new web3_js_1.PublicKey("VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp");
exports.SIMPLE_SWAP_PROGRAM_ID = new web3_js_1.PublicKey("SwpWEbAhitpix22gbX28zah7g8JiA1FRwVdPe4XohQb");
exports.ENTROPY_PROGRAM_ID = new web3_js_1.PublicKey("FcfzrnurPFXwxbx332wScnD5P86DwhpLpBbQsnr6LcH5");
exports.MANGO_PROGRAM_ID = new web3_js_1.PublicKey("mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68");
exports.DAO_EXAMPLES_PROGRAM_ID = new web3_js_1.PublicKey("DAo2pDtpiBFDu4TTiv2WggP6PfQ6FnKqwSRYxpMjyuV2");
// mint authorities
exports.MM_TOKEN_MINT_AUTHORITY = new web3_js_1.PublicKey("EMbCLCqkv4qXxhLtbCcByNZhW4YTgH33hS2Y5zqHqcRr");
// fee wallets
exports.REFERRAL_AUTHORITY = new web3_js_1.PublicKey("3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ");
exports.SOLOPTIONS_FEE_OWNER = new web3_js_1.PublicKey("3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ");
exports.INERTIA_FEE_OWNER = new web3_js_1.PublicKey("3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ");
exports.SPREADS_FEE_OWNER = new web3_js_1.PublicKey("3KjJiWBfaw96qGhysq6Fc9FTxdPgPTNY6shM7Bwfp8EJ");
exports.WITHDRAWAL_FEE_BPS = 10;
exports.PERFORMANCE_FEE_BPS = 1000;
exports.SOLOPTIONS_MINT_FEE_BPS = 0;
exports.SOLOPTIONS_EXERCISE_FEE_BPS = 0;
exports.INERTIA_MINT_FEE_BPS = 0;
exports.INERTIA_EXERCISE_FEE_BPS = 0;
exports.INERTIA_PX_NORM_FACTOR = 10000;
exports.SPREADS_MINT_FEE_BPS = 0;
exports.SPREADS_EXERCISE_FEE_BPS = 0;
exports.SPREADS_PX_NORM_FACTOR = 10000;
exports.GLOBAL_MM_TOKEN_MINT = new web3_js_1.PublicKey("mmmFXxpwDfkPFVKt1Js8fU6DvjEMXU8tprvaTpmn8sM");
var mainnetNetworkId = Math.random() > -1 ? "mainnet-beta" : "devnet";
exports.USE_SDK_NET_TO_GET_CONSTANTS_MAINNET = {
    id: mainnetNetworkId,
    SERUM_DEX_PROGRAM_ID: new web3_js_1.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"),
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
    },
    REFERRAL_SRM_OR_MSRM_ACCOUNT: web3_js_1.SystemProgram.programId,
    MM_TOKEN_MINT: exports.GLOBAL_MM_TOKEN_MINT,
    ENTROPY_PERP_MARKET_NAMES: {
        HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu: "BTC^2-PERP",
        "9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i": "BTC-PERP",
        GkRz4Gpz9WSvJYZ2Qso37oHGvXubzp6PuBMAeFggbLq9: "BTC-1D-IV",
        // mango
        "2TgaaVoHgnSeEtXvWTx13zQeTf4hYWAMEiMQdcG6EwHi": "SOL-PERP",
        DtEcjPLyD4YtTBB4q8xwFZ9q49W89xZCZtJyrGebi5t8: "BTC-PERP",
    },
    // from https://github.com/Friktion-Labs/entropy-client/blob/main/src/ids.json
    ENTROPY_GROUP: new web3_js_1.PublicKey("EAhqxJge6VCXH5KaPEmDzz4DoKGfHgCotmpC8xGvBju2"),
    MANGO_GROUP: new web3_js_1.PublicKey("98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"),
    mints: {
        USDC: new web3_js_1.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        UST: new web3_js_1.PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
        BTC: new web3_js_1.PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"),
        SOL: new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"),
        mSOL: new web3_js_1.PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
        ETH: new web3_js_1.PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
        FTT: new web3_js_1.PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
        SAMO: new web3_js_1.PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
        SRM: new web3_js_1.PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),
        MNGO: new web3_js_1.PublicKey("MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"),
        scnSOL: new web3_js_1.PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
        stSOL: new web3_js_1.PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
        SBR: new web3_js_1.PublicKey("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1"),
        LUNA: new web3_js_1.PublicKey("F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W"),
        RAY: new web3_js_1.PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
        TUSDCV2: new web3_js_1.PublicKey("Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip"),
        PAI: new web3_js_1.PublicKey("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),
        UXD: new web3_js_1.PublicKey("7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"),
        STEP: new web3_js_1.PublicKey("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT"),
        AVAX: new web3_js_1.PublicKey("KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE"),
    },
    SERUM_REFERRER_IDS: {
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: new web3_js_1.PublicKey("4gQT3fvf45bQhvRW1CDKdovVkuyEMggLg4fwXoHtLFqY"),
        "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i": new web3_js_1.PublicKey("C5AoVeHhxLmBiFpGMsGFHMYT83QL8aGyWkiER9LK4f1t"),
        "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": new web3_js_1.PublicKey("FkGtQZ3FGe3s4W1mGLqEuAraNcF3vaYUbFa8Fyt3nptx"),
        So11111111111111111111111111111111111111112: new web3_js_1.PublicKey("5byrk6XpxfiCsWPdVhQR9csGUBdmiCwLZCWM5AY7kbq2"),
        mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: new web3_js_1.PublicKey("AhmdRPM9tDMaQoP2jN48QPfBANnSLt6EdfoTKRJPT3sJ"),
        "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk": new web3_js_1.PublicKey("HZHEmjnrARHFA2ZuynqAXFDTJQfHU8qN2xTUSuQ1S8wd"),
        AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3: new web3_js_1.PublicKey("9eY4qZoMsV5AoL4dFxwA4HWneJk8EGvVB54tEtSfikN9"),
        EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv: new web3_js_1.PublicKey("7eiWUQ4EkE3BzKC3MFdn23ydK56Bd5rUCYQZpud9kyhZ"),
        "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": new web3_js_1.PublicKey("izwhTAj2xfCgr9X6UBRme39UcNvncp7omnCCwUCmQ9J"),
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": new web3_js_1.PublicKey("8WRpe8WfiCFmrWTjN7yv551i4YNxGpgv6qiYS7CjLpDH"),
        SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: new web3_js_1.PublicKey("FhrcvL91UwgVpbMmpmyx3GTPUsuofWpjRGBdpV34ern2"),
        MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: new web3_js_1.PublicKey("82jKzqE9KHxyWoMGhT1z2yMAtoVFPZbg4WiDHMFUusHj"),
        "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": new web3_js_1.PublicKey("GhLoKzR2QiUcbeviNMXejGTVAYZfvG1KuQZbejo9i4Ws"),
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": new web3_js_1.PublicKey("9NefScLAzaequJNi335QQrvcJUZw4ZGwABbp7Nso3Rgu"),
        Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1: new web3_js_1.PublicKey("6bqTT9V5DFDB1Ktdns4w9CnwCHYQtEURg27vTmb6eQXx"),
        F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W: new web3_js_1.PublicKey("Dks8aJUr8SRd3v6eHEgFg7VcYbrwDmb373d3wYmhD23b"),
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": new web3_js_1.PublicKey("GaSnvbsoq6kEth7dbE9M1P4h6f2GpE1SrEz75z1MD7QA"),
        Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip: new web3_js_1.PublicKey("BRbrPkQFjtePRAAF4KoauWmKooG56H7jwx5bUknuMCh9"),
        Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS: new web3_js_1.PublicKey("CnmDnku17xVpVtmpek5MMmFmAddAdUcMiBTKhDx2DymP"),
        "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT": new web3_js_1.PublicKey("FMdXSvc8HL7HZDeRuLEbu3Gx8J9D5pecWtGXcrQZ6gkT"),
        StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT: new web3_js_1.PublicKey("2nRHbu47Wt9jVJtcLxdmhn1YWbC1gzAuPKSuycyL4GGa"),
    },
};
exports.USE_SDK_NET_TO_GET_CONSTANTS_DEVNET = {
    id: "devnet",
    SERUM_DEX_PROGRAM_ID: new web3_js_1.PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY"),
    COINGECKO_IDS: {},
    REFERRAL_SRM_OR_MSRM_ACCOUNT: web3_js_1.SystemProgram.programId,
    MM_TOKEN_MINT: exports.GLOBAL_MM_TOKEN_MINT,
    ENTROPY_PERP_MARKET_NAMES: {},
    ENTROPY_GROUP: new web3_js_1.PublicKey("EAhqxJge6VCXH5KaPEmDzz4DoKGfHgCotmpC8xGvBju2"),
    MANGO_GROUP: new web3_js_1.PublicKey("98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"),
    mints: {
        USDC: new web3_js_1.PublicKey("E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF"),
        UST: new web3_js_1.PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"),
        BTC: new web3_js_1.PublicKey("C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6"),
        SOL: new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"),
        mSOL: new web3_js_1.PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),
        ETH: new web3_js_1.PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
        FTT: new web3_js_1.PublicKey("EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv"),
        SAMO: new web3_js_1.PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
        SRM: new web3_js_1.PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),
        MNGO: new web3_js_1.PublicKey("MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"),
        scnSOL: new web3_js_1.PublicKey("5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"),
        stSOL: new web3_js_1.PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
        SBR: new web3_js_1.PublicKey("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1"),
        LUNA: new web3_js_1.PublicKey("F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W"),
        RAY: new web3_js_1.PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
        TUSDCV2: new web3_js_1.PublicKey("Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip"),
        PAI: new web3_js_1.PublicKey("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),
        UXD: new web3_js_1.PublicKey("7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"),
        STEP: new web3_js_1.PublicKey("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT"),
        AVAX: new web3_js_1.PublicKey("KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE"),
    },
    SERUM_REFERRER_IDS: {
        E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF: new web3_js_1.PublicKey("3NPL7oyimvdCwdpTUXZjjB665dBtMAZC67guBaKnwnrJ"),
        C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6: new web3_js_1.PublicKey("FqL9eRHtMzXLBHaQ5Us97m8MsWLd11BE5ApsxGi18mQu"),
        So11111111111111111111111111111111111111112: new web3_js_1.PublicKey("5byrk6XpxfiCsWPdVhQR9csGUBdmiCwLZCWM5AY7kbq2"),
        // THIS IS OLD NOW
        mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: new web3_js_1.PublicKey("DRzNhinWFjmspx1vy8e7ryDqPGU6AYV93XXUzC6jxoKB"),
    },
};
exports.DEVNET_WHITELIST_TOKEN = new web3_js_1.PublicKey("fAXSS4EgZYo8dreUSf341p9eP4bB6emYv6BKE5zshnD");
exports.OPTIONS_PROGRAM_IDS = {
    Soloptions: new web3_js_1.PublicKey("in9BCveNxQX9rAGaZdrzDD5HGpVczfEoxzXLv3hzjgA"),
    Inertia: new web3_js_1.PublicKey("iNeq88RkcvbwfnWAsqw5rQvJTbuKEA15PaMe7YAcTx3"),
    Spreads: new web3_js_1.PublicKey("SpRdUab7oXPf1oYRM6YXRGfAEMKASFfFtxafDiAgrRR"),
};
exports.SERUM_PROGRAM_IDS = {
    Devnet: new web3_js_1.PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY"),
    Mainnet: new web3_js_1.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"),
};
exports.DEVNET_USDC_MINT = new web3_js_1.PublicKey("E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF");
exports.FRIKTION_IDLS = {
    Volt: volt_1.VoltIDLJsonRaw,
};
exports.OTHER_IDLS = (_a = {
        Soloptions: soloptions_1.SoloptionsIDLJsonRaw
    },
    _a[exports.OPTIONS_PROGRAM_IDS.Soloptions.toString()] = soloptions_1.SoloptionsIDLJsonRaw,
    _a.Inertia = inertia_1.InertiaIDLJsonRaw,
    _a[exports.OPTIONS_PROGRAM_IDS.Inertia.toString()] = inertia_1.InertiaIDLJsonRaw,
    _a[exports.SIMPLE_SWAP_PROGRAM_ID.toString()] = simpleSwap_1.SimpleSwapIDLJsonRaw,
    _a.SimpleSwap = simpleSwap_1.SimpleSwapIDLJsonRaw,
    _a.Spreads = spreads_1.SpreadsIDLJsonRaw,
    _a[exports.OPTIONS_PROGRAM_IDS.Spreads.toString()] = spreads_1.SpreadsIDLJsonRaw,
    _a);
var RuntimeEnvironment;
(function (RuntimeEnvironment) {
    RuntimeEnvironment[RuntimeEnvironment["Test"] = 0] = "Test";
    RuntimeEnvironment[RuntimeEnvironment["Production"] = 1] = "Production";
})(RuntimeEnvironment = exports.RuntimeEnvironment || (exports.RuntimeEnvironment = {}));
