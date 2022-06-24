# Friktion Development Tooling

## Overview

dev tooling for [Friktion](https://app.friktion.fi)

- src: The typescript Friktion SDK! API wrapping Friktion instruction and providing access to calculations/statistics about volts.
- volt-abi: rust crate providing contexts and instruction hooks for CPI calls (anchor)
- volt-manager: CLI tool for interacting with volts

## Integration

Read the Docs [HERE](https://docs.friktion.fi/integration/overview)

## Architecture

### General

The Friktion "volt" program is a solana program written using [Anchor](https://project-serum.github.io/anchor). Friktion's primary goal is to provide investment strategies and portfolio legos to prospective users. It accepts user deposits of SPL tokens, invests the tokens in a variety of auto-compounding strategies, and returns yield to the users upon withdrawal. Each volt offers a unique trading product and risk/reward payoff, but they are intended to all be usable within the same base UI. To facilitate this, the program consists of a set of generic "template" instructions that operate over any volt type and strategy. These include deposit/withdraw functionality, administrative controls, alternative strategies any volt can fallback on (such as lending on mango), or swapping assets. Additionally, each distinct "investment strategy" has a unique set of instructions - investment strategies are kept as generic as possible while still retaining a distinct identity in order to preserve variations and usage of the implementation within future volts (e.g. volt 1 & 2, volt 3 & 4 on [Entropy](https://github.com/Friktion-Labs/Entropy))

for instruction sets referred to above, see `program/volt/ixs/*` or [read the docs](https://app.gitbook.com/o/-MkpFYknWjvdCLxgGWVu/s/-MkpFbZXX5YhImPUVLlg/~/changes/Yp4FYRnrAefzsNEMqMT0/architecture/all-volts/instructions).

For more information on how Inertia, Soloptions, and other **Supported Protocols** factor into Friktion's infrastructure, [check out the docs](https://app.gitbook.com/o/-MkpFYknWjvdCLxgGWVu/s/-MkpFbZXX5YhImPUVLlg/~/changes/Yp4FYRnrAefzsNEMqMT0/architecture/volt-01-and-02)


### Volt #1 & #2

[Technical Docs Here](https://docs.friktion.fi/architecture/volt-01-and-02)

![State machine diagram for volt 1 & 2](https://2616689365-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces/-MkpFbZXX5YhImPUVLlg/uploads/RVf0BdHjcanWkyVTWj1e/Group%2036746new.png?alt=media&token=f1a1a506-09e1-48a1-a25c-57332bd8674e)

### Volt #3 & #4

[Technical Docs Here](https://docs.friktion.fi/architecture/volt-03-and-04)

### Rebalancing & Cranking

The volts must be cranked through their rebalancing process. Read more about [how this is done here](https://docs.friktion.fi/architecture/all-volts/rebalancing)

## Environment Setup

- Install [Solana](https://docs.solana.com/cli/install-solana-cli-tools)

- Install [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html#install-rust). This should install a compatible rust version as well. It should be >= 1.61.0

- run `yarn` in `volt-sdk` and `volt-manager`

Be patient now. It may take up to 30 minutes or so, but your program is currently deployed! To see more specific CLI docs and read about how the deployment process works under the hood click [here](https://docs.solana.com/cli/deploy-a-program).

## Usage Instructions

INTEGRATION DOCS [HERE](https://docs.friktion.fi/integration/overview)
Interact with the program via the SDK (`src/`) & volt manager (`volt-manager`) , which respectively provide a typescript interface to instructions exposed by the program and a CLI tool to specify instruction arguments and handle transaction sending logic. They are closely intertwined.

A simple and commonly desired action is to view the details of the current state. This is possible via the `printVoltDetails` command in volt manager, as illustrated below in a (truncated) example.

```bash
 ~/Friktion/volt/volt-manager ╱ main *1 !1 ?1  ts-node volt.ts -i printVoltDetails --volt CMVV4kfSdJRufiTNrrhr6PsvYY8SFhNs3TVjsWS3rJvP



-------------------------

ID: CMVV4kfSdJRufiTNrrhr6PsvYY8SFhNs3TVjsWS3rJvP

-------------------------

Volt #01: Covered Call

Short (Fri, 24 Jun 2022 02:00:00 GMT $133.33333333333333333 PUT)



-------------------------

HIGH-LEVEL STATS

-------------------------

Total Value (minus pending deposits) (SAMO): 14775278.49369057 , ($): 14775278.49369057

deposit pool: 78.49369057

premium pool: 0.000012 permissioned premium pool: 996.92707



-------------------------

EPOCH INFO

-------------------------

Round #: 3

pending deposits SAMO: 224721.50630943 , ($): 224721.50630943

pending withdrawals (SAMO): 5 , ($): 5



-------------------------

POSITION STATS

-------------------------



Short ( Fri, 24 Jun 2022 02:00:00 GMT $133.33333333333333333 PUT ):

option key: Fpav5Y41VV2rbsugcxtZAyid2BF6gxkFsNFgpbDpZY97

minted options: (#) 147752 (SAMO) 14775200

serum market = CW7CwwgNwcdA5j6cX4XqxRYe9F7GYn2vRbHBjy1NdbHg

option market: Fpav5Y41VV2rbsugcxtZAyid2BF6gxkFsNFgpbDpZY97
```

**For detailed usage, see:**

- volt-manager/DOV-AUCTIONS.md (volt #1 & #2)

- volt-manager/ENTROPY-AUCTIONS.md (volt 3 & 4)


## Development Resources

- https://docs.friktion.fi/ - Primary Friktion docs (primarily non-technical)

- https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json - JSON registry up-to-date with the latest information. Useful for on-chain data. Feel accessible to hotlink it. This registry will be maintained through to at least December 2022

- https://github.com/Friktion-Labs/mainnet-tvl-snapshots - Historical TVL snapshots per asset, CoinGecko price, and deposit breakdowns. Helpful in creating time-series data without needing to query the chain

- https://github.com/Friktion-Labs/sdk - Public Friktion SDK, published to https://www.npmjs.com/package/@friktion-labs/friktion-sdk

**Test Volts:**

- SOL Call volt (#1): `51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J`

- SOL Put volt (#2): `2LCnDj16YxVDpFGNEJWcQM6YKvbzCyzvkZQNpKN94ycL`

## Glossary

For Solana-specific definitions (e.g account, transaction, instruction), click (here)[https://docs.solana.com/terminology]. Anchor-specific terminology (here)[https://book.anchor-lang.com/anchor_references/anchor_references.html]

Volt

: A Friktion neologism for "vault" - a single entity that accepts user deposits and invests them in yield-earning products.

DOV

: short for "Defi Options Vaults," a common term describing protocols offering automated options selling strategies. Friktion offers these products via Volt #1 & #2.

[Entropy](https://entropy.trade):

: Exotic perpetuals exchange operated by the Friktion team to support volt #3

[Mango](https://mango.markets):

: Spot & perpetuals order book exchange on Solana

[Volt #1](https://app.friktion.fi/income):

: Automated covered call strategy, the first volt Friktion launched. Profits relative to holding underlying during low volatility, moderately bearish scenarios.

[Volt #2](https://app.friktion.fi/stables):

: Automated protected put strategy, the second volt Friktion launched. Profits relative to holding underlying during low volatility, moderately bullish scenarios.

[Volt #3](https://app.friktion.fi/crab):

: Automated "crab" strategy using power perpetuals on [entropy](https://entropy.trade), the third volt Friktion launched. Profits in any relatively low volatility regime. As compared to volt 1 & 2, has the advantage of continuous liquidity and no directional bias.

[Volt #4](https://app.friktion.fi/basis):

: Automated basis strategy on Mango Markets. The difference between the funding rate on linear perpetual and the interest rate on borrowing the corresponding spot asset profits.

Volt #5:

: Protected moonshot, soon...

Volt #6:

: 6th volt in Friktion portfolio. Writes undercollateralized loans to reputable, KYCed parties in return for a risk premium relative to collateralized lending.

Collateral:

: assets an entity controls. For example, the "volt's collateral" refers to all assets the volt controls, typically deposits from users' wallets.

Rebalancing:

: The process of accepting new deposits, processing further withdrawals and entering/exiting an investment position depending on net inflows/outflows.

Rebalancing Period

: The period between each rebalancing of a volt.

Epoch (Round):

: a single rebalancing period. Single-word synonym for time users must wait for a deposit/withdrawal between each opportunity. Also demarcates when fees are taken by the volt.

Share Token

: SPL token that represents one share of the volt's total collateral. The $ value of a single share token can be calculated in the following way. `$ = 1 / (share token supply) \*

Volt Token

: synonym for Share Token

Pending Deposit

: A user sends some deposit tokens (e.g., SOL, BTC, USDC) to the volt to receive newly minted share tokens once the current epoch ends.

Pending Withdrawal

: A user burns some share tokens to have a claim on their share of the **volt's** collateral once the current epoch ends.

User Facing Instruction

: a Friktion volt program instruction that can be called permissionlessly from the app.friktion.fi or any other Solana cluster client.

Claim Pending Deposit

: A user-facing instruction to claim share tokens after the epoch attached to a pending deposit ended.

Claim Pending Withdrawal

: A user-facing instruction to claim deposit tokens after the epoch attached to a pending withdrawal ended.

## License

The code in this repository is original. Some parts may have been derived from other codebases, but they have only been derived from permissively open-sourced software.

Code in this repository only contains code derived from permissively licensed open source software (such as those licensed under MIT or Apache-2.0).
