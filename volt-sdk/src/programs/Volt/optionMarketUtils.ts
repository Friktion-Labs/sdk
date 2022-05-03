import type { AnchorProvider } from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import Decimal from "decimal.js";

import { anchorProviderToSerumProvider } from "../../miscUtils";
import type { OptionMarketWithKey } from "./voltTypes";

export const getStrikeFromOptionMarket = async (
  provider: AnchorProvider,
  optionMarket: OptionMarketWithKey,
  isCall: boolean
) => {
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
        optionMarket.underlyingAssetMint
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
