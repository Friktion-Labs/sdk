import { BN } from "@project-serum/anchor";

export const MINT_FEE_RATE_NUMERATOR = new BN(0);
export const EXERCISE_FEE_RATE_NUMERATOR = new BN(0);
export const FEE_RATE_DENOMINATOR = new BN(10_000);

// TODO(cqsd): test
export const calculate_mint_fee = (amount: BN) =>
  amount.mul(MINT_FEE_RATE_NUMERATOR).div(FEE_RATE_DENOMINATOR);

export const calculate_exercise_fee = (amount: BN) =>
  amount.mul(EXERCISE_FEE_RATE_NUMERATOR).div(FEE_RATE_DENOMINATOR);
