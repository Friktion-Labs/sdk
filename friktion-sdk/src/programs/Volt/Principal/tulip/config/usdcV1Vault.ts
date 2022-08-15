import { PublicKey } from "@solana/web3.js";

import {
  SOLEND_PROGRAM_ID,
  TULIP_LENDING_PROGRAM_ID,
  TULIP_V2_VAULTS_PROGRAM_ID,
} from "../../constants";
import type { TulipOptimizerConfig } from "../../PrincipalProtectionVoltSDK";

export const usdcv1Vault = new PublicKey(
  "3wPiV9inTGexMZjp6x5Amqwp2sRNtpSheG8Hbv2rgq8W"
);
export const usdcv1VaultPda = new PublicKey(
  "14fdy6YXbhDgnVQz4VcgSGgUcZ35eE48SKDrfqF87NUP"
);
export const usdcv1SharesMint = new PublicKey(
  "Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip"
);
export const usdcv1DepositQueue = new PublicKey(
  "36KtHLHxcGnrfEb2GLwPcbN9nHUkeoi3gd6rMQj8wwVj"
);
export const usdcv1MangoVaultSharesAccount = new PublicKey(
  "A9kM8NKf3v29F3DgRQ5Rw7TJoadFZZDfBGLRBGNzASrr"
);
export const usdcv1TulipVaultSharesAccount = new PublicKey(
  "M7akLS7xYVhp68LnMkBBCemvqkGcCycQ3qp7e3SsKR1"
);
export const usdcv1SolendVaultSharesAccount = new PublicKey(
  "UxVNZzzx3xRxKFAuGjRQgbDaa7mirSkFEAu7qiYQ1h4"
);
export const usdcv1WithdrawQueue = new PublicKey(
  "HLVcpKPkBJJJGTHTSaZcAixDppy4R65x1is3k8Q7qZpj"
);

export const usdcTokenMint = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const v2VaultsProgramId = new PublicKey(
  "TLPv2tuSVvn3fSk8RgW3yPddkp5oFivzZV3rA9hQxtX"
);

export const mangoVault = new PublicKey(
  "ZH9GWNBtwxcWeU9kHk77DSciwQnoJcSm8VVvYfmHXfe"
);
export const mangoVaultPda = new PublicKey(
  "Dhry4TVd862yzcAuxFZgiuh6juS4R6FesfRZkWG3pCe7"
);
export const mangoVaultSharesMint = new PublicKey(
  "5u6jxB7En2LF5aroeq8U5JUbnHa5WSYB5JTemh3gYaMj"
);
export const mangoVaultPlatformInformation = new PublicKey(
  "GDzbqzebKTxJaQVfxfqejkqU4HLcBmgNBwun3rADvm8J"
);
export const mangoVaultPlatformConfigDataAccount = new PublicKey(
  "EecDX1xHrjKXQWbE5WtwU7fAiEkKxAv7w196oe8jaoqY"
);
export const mangoVaultDepositQueue = new PublicKey(
  "3CnAyCjpA9mcxayed12cwJNGue7YbmyuBjpT9KN6meVT"
);
export const mangoVaultMangoAccount = new PublicKey(
  "3cZkd5eVyZhMhE8nJcR3rA7GgVQ6gCJt2qofr2GQd8ca"
);
export const mangoCache = new PublicKey(
  "EBDRoayCDDUvDgCimta45ajQeXbexv7aKqJubruqpyvu"
);
export const mangoRootBank = new PublicKey(
  "AMzanZxMirPCgGcBoH9kw4Jzi9LFMomyUCXbpzDeL2T8"
);
export const mangoNodeBank = new PublicKey(
  "BGcwkj1WudQwUUjFk78hAjwd1uAm8trh1N4CJSa51euh"
);
export const mangoGroupAccount = new PublicKey(
  "98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"
);
export const mangoTokenAccount = new PublicKey(
  "8Vw25ZackDzaJzzBBqcgcpDsCsDfRSkMGgwFQ3gbReWF"
);
export const mangoGroupSigner = new PublicKey(
  "9BVcYqEQxyccuwznvxXqDkSJFavvTyheiTYk231T1A8S"
);
export const mangoProgramId = new PublicKey(
  "mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68"
);

export const solendVault = new PublicKey(
  "85JXjDiyianDpvz8y8efkRyFsxpnSJJpmyxrJ7bncKHM"
);
export const solendVaultPda = new PublicKey(
  "963HGaUjwGqvqwwqwJZayUXvCC21AAqZU5SLw1kU4gVc"
);
export const solendVaultSharesMint = new PublicKey(
  "CS8cJicaSpphTTboMJD1UeNpU7vpkZc86vKrtqzRVnG5"
);
export const solendVaultPlatformInformation = new PublicKey(
  "GRL5rtnvzCfQRdKJXkG2A8LvDSNXkbxENEnF4SwJ3pTF"
);
export const solendVaultPlatformConfigDataAccount = new PublicKey(
  "6AzcPNmNWomkdMRgcZJPVAs4zF1jev9wqxzzzxVzDDsi"
);
export const solendVaultDepositQueue = new PublicKey(
  "2Li9Q5Vx9BEnFTGJTLWc5pVqerYGjhgyGYzSAA2WhYKQ"
);
export const solendReserveAccount = new PublicKey(
  "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw"
);
export const solendReserveLiquiditySupply = new PublicKey(
  "8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf"
);
export const solendReserveCollateralMint = new PublicKey(
  "993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk"
);
export const solendLendingMarketAccount = new PublicKey(
  "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY"
);
export const solendDerivedLendingMarketAuthority = new PublicKey(
  "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
);
export const solendReservePythPriceAccount = new PublicKey(
  "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
);
export const solendReserveSwitchboardPriceAccount = new PublicKey(
  "CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb"
);
export const solendProgramId = new PublicKey(
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"
);

export const tulipVault = new PublicKey(
  "8KLrrsnUv3DjC9Q89xSQDVdiGLZHUEUuyPedfHrtuVRr"
);
export const tulipVaultPda = new PublicKey(
  "mrT9Q45iuC2HLYxpceaQFjzcAgd6Trks7bXAGbKYpwL"
);
export const tulipVaultSharesMint = new PublicKey(
  "D2PLcwGR1wsXUPhb1BHysSVEsHVVCQ129qGpgXXaTNR1"
);
export const tulipVaultPlatformInformation = new PublicKey(
  "4QVuedVSCMLA3eQ643czUy95uQFxXKAcCMJ1ChpkVA2B"
);
export const tulipVaultPlatformConfigDataAccount = new PublicKey(
  "7XTtoiHfkYzjLDxKDMoaVYncmdBW1yLfphmisSbBrnuZ"
);
export const tulipVaultDepositQueue = new PublicKey(
  "8eDHmS15CWd8d88uckg6oKxrfwijZVudZsDgdtgGqS49"
);
export const tulipReserveAccount = new PublicKey(
  "FTkSmGsJ3ZqDSHdcnY7ejN1pWV3Ej7i88MYpZyyaqgGt"
);
export const tulipReserveLiquiditySupply = new PublicKey(
  "64QJd6MYXUjCBvCaZKaqxiKmaMkPUdNonE1KuY1YoGGb"
);
export const tulipReserveCollateralMint = new PublicKey(
  "Amig8TisuLpzun8XyGfC5HJHHGUQEscjLgoTWsCCKihg"
);
export const tulipLendingMarketAccount = new PublicKey(
  "D1cqtVThyebK9KXKGXrCEuiqaNf5L4UfM1vHgCqiJxym"
);
export const tulipDerivedLendingMarketAuthority = new PublicKey(
  "8gEGZbUfVE1poBq71VHKX9LU7ca4x8wTUyZgcbyQe51s"
);
export const tulipReservePythPriceAccount = new PublicKey(
  "ExzpbWgczTgd8J58BrnESndmzBkRVfc6PhFjSGiQXgAB"
);

const solendCollateralTokenAccount = new PublicKey(
  "6EaiG2gRVu9u7QzVmX59AWLSmiaEYvMrKWQfPMCgNxsZ"
);
const tulipCollateralTokenAccount = new PublicKey(
  "2U6kk4iTVqeypBydVPKA8mLTLAQEBfWf4KYfmkcvomPE"
);

export const TULIP_USDC_V1_CONFIG: TulipOptimizerConfig = {
  tulipAccounts: {
    underlyingMint: usdcTokenMint,
    programId: TULIP_V2_VAULTS_PROGRAM_ID,
    optimizerVault: {
      vault: usdcv1Vault,
      vaultPda: usdcv1VaultPda,
      sharesMint: usdcv1SharesMint,
      depositQueue: usdcv1DepositQueue,
      mangoVaultSharesAccount: usdcv1MangoVaultSharesAccount,
      solendVaultSharesAccount: usdcv1SolendVaultSharesAccount,
      tulipVaultSharesAccount: usdcv1TulipVaultSharesAccount,
      withdrawQueue: usdcv1WithdrawQueue,
    },
    mangoVault: {
      vault: mangoVault,
      vaultPda: mangoVaultPda,
      sharesMint: mangoVaultSharesMint,
      depositQueue: mangoVaultDepositQueue,
      platformInformation: mangoVaultPlatformInformation,
      platformConfigDataAccount: mangoVaultPlatformConfigDataAccount,
      mangoGroup: mangoGroupAccount,
      mangoAccount: mangoVaultMangoAccount,
      mangoCache,
      mangoRootBank,
      mangoNodeBank,
      mangoGroupSigner,
      tokenAccountForDeposits: mangoTokenAccount,
      programId: mangoProgramId,
    },
    solendVault: {
      vault: solendVault,
      vaultPda: solendVaultPda,
      sharesMint: solendVaultSharesMint,
      depositQueue: solendVaultDepositQueue,
      platformInformation: solendVaultPlatformInformation,
      platformConfigDataAccount: solendVaultPlatformConfigDataAccount,
      reserveAccount: solendReserveAccount,
      reserveLiquiditySupply: solendReserveLiquiditySupply,
      reserveCollateralMint: solendReserveCollateralMint,
      lendingMarketAccount: solendLendingMarketAccount,
      lendingMarketAuthority: solendDerivedLendingMarketAuthority,
      reservePythPriceAccount: solendReservePythPriceAccount,
      reserveSwitchboardPriceAccount: solendReserveSwitchboardPriceAccount,
      tokenAccountForCollateral: solendCollateralTokenAccount,
      programId: SOLEND_PROGRAM_ID,
    },
    tulipLendingVault: {
      vault: tulipVault,
      vaultPda: tulipVaultPda,
      sharesMint: tulipVaultSharesMint,
      depositQueue: tulipVaultDepositQueue,
      platformInformation: tulipVaultPlatformInformation,
      platformConfigDataAccount: tulipVaultPlatformConfigDataAccount,
      reserveAccount: tulipReserveAccount,
      reserveLiquiditySupply: tulipReserveLiquiditySupply,
      reserveCollateralMint: tulipReserveCollateralMint,
      lendingMarketAccount: tulipLendingMarketAccount,
      lendingMarketAuthority: tulipDerivedLendingMarketAuthority,
      reservePythPriceAccount: tulipReservePythPriceAccount,
      tokenAccountForCollateral: tulipCollateralTokenAccount,
      programId: TULIP_LENDING_PROGRAM_ID,
    },
  },
};
