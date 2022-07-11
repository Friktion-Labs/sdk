# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** The minor version will be incremented upon a breaking change and the patch version will be incremented for features.

## [0.0.5] - 2022-06-22

### Features

- Full suite of CPI examples and tests for all deposit/withdraw related instructions
- move all testing logic into a more generic structure. introduce shared cookie trait for volts
- Introduce "friktion common" rust crate for all future shared features. Moved account validation trait to there. Removed dependency on vipers
- introduce bypass code to end epoch early for DOV volts

### Fixes

- updated volt ABI to accurately reflect existing program instructions
- add --skip-lint default to anchor build to avoid need to useless /// CHECK comments
- removed majority of logs from volt program. Kept only those that output information about deposits or rebalancing details.

### Breaking

- rebalance_enter now requires 400 CUs
- renamed daoexamples program to cpi_examples
- updated to anchor 0.25.0, solana 1.10.29
- require dao_authority is a signer in (deposit, deposit with claim, withdraw, withdraw with claim) instructions
- rename ClaimPending anchor context to ClaimPendingDeposit, instruction claim_pending to claim_pending_deposit
- flip order of token accounts in withdraw
- delete open_orders_bump and open_orders_init_bump from set_next_option arguments list
- add init_extra_accounts instructions (necessary to call after initialize now) for DOV and Entropy volts, necessary to avoid stack violations in anchor-generated try_accounts() method
- delete unnecssary bump parameters from Inertia protocol new_contract instruction.

## [0.0.4] - 2022-06-22

### Features

- operations: jun10 auction files (#222)
- program: add option for custom withdrawal & performance pee per volt. refactor fee logic to use fee-utils crate
- docs: new README with docs for env setup, testing, architecture.
- docs + sdk: examples for deposit/withdraw in examples/instruction directory
- docs: new integration docs @ https://docs.friktion.fi/integration/overview

### Fixes

- sdk: refactor of sdk, upgrading @solana/spl-token to 0.2.0. adding option market helpers.
- program: box cpi content in certain instructions to save space
- program: make entropy cache field mutable in move assetes to lending, working again
- program: compiling on opt-level=z now, to minimize binary. 2.4KB vs 2.7KB space allocated
- program: upgrade solana version to 1.9.28

## [0.0.3] - 2022-06-09

### Features

- program: add option for custom withdrawal & performance pee per volt. refactor fee logic to use fee-utils crate

### Fixes

- program: reduce stack usage of rebalance_spot. Still very close to exceeding the 4kb limit.
- ts: revert @saberhq dependencies to 1.12.53
- ts: add protocol-specific fields to option market struct

## [0.0.2] - 2022-06-05

### Fixes

- ts: correct depositMint to underlyingAssetMint when calcing tvl being lent into mango. important to recall v0 volts don't store depositMint on extra volt data correctly.
- ts: added ANCHOR_WALLET export to volt manager CI, preventing error when running volt-manager/volt.ts
- program: switch setup rebalance entropy to use 400k CUs in rust tests, passes CI now

### Breaking

- ts: change repo of @friktion-labs/friktion-sdk package to point to Friktion-Labs/sdk

## [0.0.1] - 2022-06-05

### Features

- program: add Spreads program (call and put options spreads)
- ts: Spreads SDK
- program: move oracle, fees logic to separate crates (oracle-utils and fee-utils)

### Fixes

- program: remove token authority checks on underlying/vault token accounts in deposit/withdraw ixs
- program: change inertia and spreads admin check to use authority not admin key (repetitively)
- ts: remove most of saberhq dependencies from anchor testing infra

### Breaking

- program: switch opt-level to Z. some instructions now require compute budget request instructions at the beginning of their transaction
- ts: instructions that require > 200k CUs are now documented at top of ConnectedVoltSDK.ts
- program: upgrade solana version to 1.9.13
