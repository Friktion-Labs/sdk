# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** The minor version will be incremented upon a breaking change and the patch version will be incremented for features.

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
