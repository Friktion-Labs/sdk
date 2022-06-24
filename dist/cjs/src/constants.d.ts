import type { Idl } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
export declare enum VoltStrategy {
    ShortCalls = 0,
    ShortPuts = 1,
    ShortCrab = 2,
    LongBasis = 3
}
export declare type OptionsProtocol = "Inertia" | "Soloptions" | "Spreads";
export declare type PerpProtocol = "Entropy" | "Mango";
export declare const FRIKTION_SNAPSHOT_URL = "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json";
export declare enum VoltType {
    ShortOptions = 0,
    Entropy = 1
}
export declare const WRAPPED_SOL_ADDRESS: PublicKey;
export declare const SOL_NORM_FACTOR: number;
export declare const FRIKTION_PROGRAM_ID: PublicKey;
export declare const SIMPLE_SWAP_PROGRAM_ID: PublicKey;
export declare const ENTROPY_PROGRAM_ID: PublicKey;
export declare const MANGO_PROGRAM_ID: PublicKey;
export declare const DAO_EXAMPLES_PROGRAM_ID: PublicKey;
export declare const MM_TOKEN_MINT_AUTHORITY: PublicKey;
export declare const REFERRAL_AUTHORITY: PublicKey;
export declare const SOLOPTIONS_FEE_OWNER: PublicKey;
export declare const INERTIA_FEE_OWNER: PublicKey;
export declare const SPREADS_FEE_OWNER: PublicKey;
export declare const WITHDRAWAL_FEE_BPS = 10;
export declare const PERFORMANCE_FEE_BPS = 1000;
export declare const SOLOPTIONS_MINT_FEE_BPS = 0;
export declare const SOLOPTIONS_EXERCISE_FEE_BPS = 0;
export declare const INERTIA_MINT_FEE_BPS = 0;
export declare const INERTIA_EXERCISE_FEE_BPS = 0;
export declare const INERTIA_PX_NORM_FACTOR = 10000;
export declare const SPREADS_MINT_FEE_BPS = 0;
export declare const SPREADS_EXERCISE_FEE_BPS = 0;
export declare const SPREADS_PX_NORM_FACTOR = 10000;
export declare const GLOBAL_MM_TOKEN_MINT: PublicKey;
export declare const USE_SDK_NET_TO_GET_CONSTANTS_MAINNET: {
    id: "mainnet-beta" | "devnet";
    SERUM_DEX_PROGRAM_ID: PublicKey;
    COINGECKO_IDS: {
        BTC: string;
        SOL: string;
        ETH: string;
        mSOL: string;
        FTT: string;
        SRM: string;
        USDC: string;
        tsUSDC: string;
        PAI: string;
        UXD: string;
        MNGO: string;
        scnSOL: string;
        SBR: string;
        LUNA: string;
        UST: string;
        RAY: string;
        STEP: string;
        stSOL: string;
        AVAX: string;
        SAMO: string;
    };
    REFERRAL_SRM_OR_MSRM_ACCOUNT: PublicKey;
    MM_TOKEN_MINT: PublicKey;
    ENTROPY_PERP_MARKET_NAMES: {
        HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu: string;
        "9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i": string;
        GkRz4Gpz9WSvJYZ2Qso37oHGvXubzp6PuBMAeFggbLq9: string;
        "2TgaaVoHgnSeEtXvWTx13zQeTf4hYWAMEiMQdcG6EwHi": string;
        DtEcjPLyD4YtTBB4q8xwFZ9q49W89xZCZtJyrGebi5t8: string;
    };
    ENTROPY_GROUP: PublicKey;
    MANGO_GROUP: PublicKey;
    mints: {
        USDC: PublicKey;
        UST: PublicKey;
        BTC: PublicKey;
        SOL: PublicKey;
        mSOL: PublicKey;
        ETH: PublicKey;
        FTT: PublicKey;
        SAMO: PublicKey;
        SRM: PublicKey;
        MNGO: PublicKey;
        scnSOL: PublicKey;
        stSOL: PublicKey;
        SBR: PublicKey;
        LUNA: PublicKey;
        RAY: PublicKey;
        TUSDCV2: PublicKey;
        PAI: PublicKey;
        UXD: PublicKey;
        STEP: PublicKey;
        AVAX: PublicKey;
    };
    SERUM_REFERRER_IDS: {
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: PublicKey;
        "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i": PublicKey;
        "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": PublicKey;
        So11111111111111111111111111111111111111112: PublicKey;
        mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: PublicKey;
        "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk": PublicKey;
        AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3: PublicKey;
        EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv: PublicKey;
        "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": PublicKey;
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": PublicKey;
        SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: PublicKey;
        MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: PublicKey;
        "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": PublicKey;
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": PublicKey;
        Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1: PublicKey;
        F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W: PublicKey;
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": PublicKey;
        Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip: PublicKey;
        Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS: PublicKey;
        "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT": PublicKey;
        StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT: PublicKey;
    };
};
export declare type NetworkSpecificConstants = Omit<Omit<Omit<typeof USE_SDK_NET_TO_GET_CONSTANTS_MAINNET, "SERUM_REFERRER_IDS">, "ENTROPY_PERP_MARKET_NAMES">, "COINGECKO_IDS"> & {
    ENTROPY_PERP_MARKET_NAMES: Record<string, string>;
    SERUM_REFERRER_IDS: Record<string, PublicKey>;
    COINGECKO_IDS: Record<string, string>;
};
export declare const USE_SDK_NET_TO_GET_CONSTANTS_DEVNET: NetworkSpecificConstants;
export declare const DEVNET_WHITELIST_TOKEN: PublicKey;
export declare const OPTIONS_PROGRAM_IDS: {
    Soloptions: PublicKey;
    Inertia: PublicKey;
    Spreads: PublicKey;
};
export declare const SERUM_PROGRAM_IDS: {
    Devnet: PublicKey;
    Mainnet: PublicKey;
};
export declare const DEVNET_USDC_MINT: PublicKey;
export declare const FRIKTION_IDLS: Record<string, Idl>;
export declare const OTHER_IDLS: Record<string, Idl>;
export declare enum RuntimeEnvironment {
    Test = 0,
    Production = 1
}
//# sourceMappingURL=constants.d.ts.map