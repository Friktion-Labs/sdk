# External Volt Information & Helpers

## Overview

- volt-sdk: typescript api wrapping Friktion instructions
- volt-abi: rust crate providing contexts and instruction hooks for CPI calls (anchor)
- simple-manager: basic CLI tool for interacting with volts

## (Other) Development Resources
- https://app.friktion.fi/mainnet-registry.json - JSON registry up-to-date with latest information. Useful for on-chain data. Feel free to hotlink it. This registry will be maintained through to at least December 2022
- https://github.com/Friktion-Labs/mainnet-tvl-snapshots - Historical TVL snapshots per asset, coingecko price, and deposit breakdowns. Useful for creating time-series data without needing to query the chain
- https://github.com/Friktion-Labs/external - Public Friktion SDK, published to https://www.npmjs.com/package/@friktion-labs/friktion-sdk

## MAINNET VOLTS

volt:  Ef2CD9yhQE7BvReQXct68uuYFW8GLKj62u2YPfmua3JY
mint:  SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt

volt:  A2jbvwftkAzU5hLUmBePdfqZQsop7jydZirLS5NsRVtx
mint:  2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk

volt:  AkiyRN63QjUqa39tJ1wNhZv6NRdn17AVEvZj4VqCVFX
mint:  So11111111111111111111111111111111111111112

volt:  9q5kEMkY28NXjxovpr1ssLLCAHgmyYzNmgAksp6voeJ8
mint:  7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj

volt:  9RcdLHX8rkfjo4ze2uyvhfQGjX6wAZtbvmBf3aK6wqrG
mint:  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So

volt:  2evPXRLaTZj92DM93sdryeszwqoC9C6DoWa1TKHn1AzU
mint:  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

volt:  CzFUVBXaAxWRQ3JeJwsZHqDQUxBbUJLZtdoBQ3KPtsuB
mint:  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

volt:  8qjBanq5cxc3FzsaEznKfpsbPwfMVoB6AxLXY7pe3fEX
mint:  AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3

volt:  CdZ1Mgo3927bsYdKK5rnzGtwek3NLWdvoTSSm2TJjdqW
mint:  9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E

volt:  9SPz2yjNc9V4FmdHrkYF1GfikGbe5rfwg6VPzhQJpPyt
mint:  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

volt:  CbPemKEEe7Y7YgBmYtFaZiECrVTP5sGrYzrrrviSewKY
mint:  So11111111111111111111111111111111111111112

volt:  3ZYabzsHY2XGuVBBbAgrxitPhmHSKLDCKqEp3vpX9Jb1
mint:  5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm

volt:  DxSADpEUR8xULRdWwb37pN8mjPHHC5D8aRnyUAvVSYHa
mint:  MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac

## License

The code in this repository original code. 

Code in this repository only contains code derived from permissively licensed open source software (such as those licensed under MIT or Apache-2.0).

Contract to facilitate deposit/withdraw vaults + any instructions required to execute relevant strategy. **Volt 1 is covered calls.**

## Management Pipeline

Initialize -> Start Round -> Set Next Option -> Rebalance Prepare -> Rebalance Enter -> Rebalance Settle -> Rebalance Swap Premium -> End Round -> Start Round -> repeat...

**All Token Transfers**

Deposit: user sends underlying / base asset (SOL). receives volt tokens. if not in transfer window, then does nothing but increments info in "round" account.

Rebalance Prepare: send SOL, receive writer token + option token

Rebalance Enter: send option token, receive quote asset (USDC)

Rebalance Settle: redeem writer token for one of (base asset = SOL), (quote asset = USDC)

Rebalance Swap Premium: send quote asset (USDC), receive base asset (SOL). we use this instruction to ensure all volt-managed assets are in base asset before starting next round

End Round: transfers underlying from "round" token account to deposit pool. mints volt tokens to "round" token account" proportional to number of pending deposits.

Claim Pending: redeems volt tokens from earlier round user deposited .

**Claim Pending** is a separate instruction used to redeem pending deposits (not required in pipeline)'

Claim Pending Withdrawal: redeems underlying tokens from earlier round user withdrew.

**Claim Pending Withdrawal** is a separate instruction used to redeem pending withdrawals (not required in pipeline)'

## User Interaction Instruction Set

### Deposit

deposits base asset tokens into volt and receives vault tokens. deposits remain pending until next round if they were made outside of the transfer window

**IF** in transfer window

##### Details:

Take as input X, where X is the # of underlying tokens deposit into the volt. Mint vault tokens to proportional to user ownership of the deposit pool (sushiX formula). Return error if overflow is encountered, user wallet has less than X underlying tokens, or any of the accounts don't match those set in Initialize.

**ELSE** not in transfer window

##### Details:

transfers underlying tokens to token accounts associated with the current round of investing. The volt tokens will later be minted proportionally in end_round and transferred to the user in ClaimPending.

### Withdraw

withdraws underlying tokens from volt and burns vault tokens

##### Details:

Take as input Y, where Y is the # of vault tokens to redeem from the volt for a proportional number of underlying tokens. Transfer underlying tokens equal to `(# withdrawn vault tokens) / (# total supply of vault tokens) * (# total deposited underlying)` to the user. Burn Y vault tokens. Return error if overflow is encountered, `user_vault_tokens` has less than Y underlying tokens, or any of the accounts don't match those set in Initialize.

### ClaimPending

Checks if there exists a pending deposit for given user. If yes, and the volt tokens have been minted for that round, transfer user's share of volt tokens to their wallet.

## Rebalancing State Instruction Set

### Initialize

Initializes state for a volt. Can only be called once on a given address.

##### Details:

Create a new mint for the vault token. Create pools for the underlying, quote, option, and writer tokens. Set account addresses and strategy metadata (e.g ul per contract, quote per contract, expiry) on VoltVault. Initialize state variables for FSM to correct values.

### StartRound

Starts a new round of rebalancing. called immediately after Initialize or EndRound

##### Details:

opens transfer window. resets booleans guarding each stage of rebalancing (e.g prepare_is_finished). opens up SetNextOption (post transfer window)

### SetNextOption

Sets the option to be traded (e.g minted and sold for covered calls). Opens up RebalancePrepare

##### Details:

Requires that StartRound was called previously. Initializes pools (token accounts) for option token and writer token. Sets option metadata on VoltVault

### RebalancePrepare

Mints options. stores option tokens and writer tokens in token account PDAs. Opens up RebalanceEnter.

##### Details:

require that SetNextOption was called previously. Mint max possible # of options (option token + writer token). Calculation is `deposit_pool.amount / underlying_amount_per_contract` for calls.

### RebalanceEnter

Enters target options position (e.g sells calls for volt 1). This only sends one order, so requires multiple calls. Opens up RebalanceSettle

##### Details:

Requires that RebalancePrepare was called previously. Create a permissioned OpenOrders account if one does not exist. Cancels all existing orders. Puts a sell order at the best bid price on serum (for covered calls).

### RebalanceSettle

Redeems writer tokens for underlying and quote. opens up RebalanceSwapPremium if enough quote asset is left in the premium pool. Else, opens up EndRound

##### Details:

Requires that RebalanceEnter was called previously, and the target option market expired. Redeem all available underlying and quote tokens from the post-expiry option market pools. If **any** quote token is received, opens up RebalanceSwapPremium to convert quote to underlying before selling options. Opens up EndRound

### RebalanceSwapPremium

Swaps premium (quote) for underlying (base). Opens up EndRound.

##### Details:

Requires that RebalanceSettle was called previously, and there was leftover premium. Opens up EndRound

### EndRound

Resets booleans for later stages. Mints volt tokens for pending deposits from the round. Open up StartRound.

