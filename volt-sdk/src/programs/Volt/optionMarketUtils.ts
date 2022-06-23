import type { AnchorProvider } from "@project-serum/anchor";
import { getMint } from "@solana/spl-token";
import Decimal from "decimal.js";

import type { GenericOptionsContractWithKey } from "./voltTypes";

// export const getExerciseIxForOptionMarket = (
//   optionMarket: GenericOptionsContractWithKey,
//   sdk: FriktionSDK
// ): TransactionInstruction => {
//   const protocol = optionMarket.protocol;
//   const rawContractWithKey = {
//     key: optionMarket.key,
//     ...optionMarket.rawContract,
//   };

//   if (protocol === "Inertia") {
//     return new InertiaSDK(rawContractWithKey as InertiaContractWithKey, {
//       provider: sdk.readonlyProvider,
//     });
//   } else if (protocol === "Soloptions") {
//     return sdk.loadSoloptionsSDK(
//       rawContractWithKey as SoloptionsContractWithKey
//     );
//   } else if (protocol === "Spreads") {
//     return new SpreadsSDK(rawContractWithKey as SpreadsContractWithKey, {
//       provider: sdk.readonlyProvider,
//     }).exercise();
//   }
// };

export const getStrikeFromOptionsContract = async (
  provider: AnchorProvider,
  optionMarket: GenericOptionsContractWithKey,
  isCall: boolean
): Promise<Decimal> => {
  const underlyingFactor = new Decimal(10).pow(
    (await getMint(provider.connection, optionMarket.underlyingAssetMint))
      .decimals
  );
  const quoteFactor = new Decimal(10).pow(
    (await getMint(provider.connection, optionMarket.quoteAssetMint)).decimals
  );
  return isCall
    ? new Decimal(optionMarket.quoteAmountPerContract.toString())
        .div(quoteFactor)
        .div(
          new Decimal(optionMarket.underlyingAmountPerContract.toString()).div(
            underlyingFactor
          )
        )
    : new Decimal(optionMarket.underlyingAmountPerContract.toString())
        .div(underlyingFactor)
        .div(
          new Decimal(optionMarket.quoteAmountPerContract.toString()).div(
            quoteFactor
          )
        );
};
