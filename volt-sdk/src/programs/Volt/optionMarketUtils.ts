import type { AnchorProvider } from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import Decimal from "decimal.js";

import { anchorProviderToSerumProvider } from "../../miscUtils";
import type { OptionMarketWithKey } from "./voltTypes";

// export const getExerciseIxForOptionMarket = (
//   optionMarket: OptionMarketWithKey,
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

export const getStrikeFromOptionMarket = async (
  provider: AnchorProvider,
  optionMarket: OptionMarketWithKey,
  isCall: boolean
): Promise<Decimal> => {
  const underlyingFactor = new Decimal(10).pow(
    (
      await getMintInfo(
        anchorProviderToSerumProvider(provider),
        optionMarket.underlyingAssetMint
      )
    ).decimals
  );
  const quoteFactor = new Decimal(10).pow(
    (
      await getMintInfo(
        anchorProviderToSerumProvider(provider),
        optionMarket.quoteAssetMint
      )
    ).decimals
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
