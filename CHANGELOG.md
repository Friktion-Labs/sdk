# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** The minor version will be incremented upon a breaking change and the patch version will be incremented for features.

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