# Volt Manager

## Description

The volt manager is a CLI tool used for all management processes associated with Friktion volts. Primarily, this involves propagating the state of a volt during an auction, hitting/lifting bids/offers on the relevant market, printing out volt and/or user info, and managing any auxiliary Friktion-managed protocols (such as creating option markets for Inertia)

Primary files:

- volt.ts
- automateDovAuctions.ts
- scripts/createBulkInertiaMarkets.ts
- scripts/printVoltAccounts.ts

## Auction Management

For DOV auctions, see DOV-AUCTIONS.md

For Entropy auctions, see ENTROPY-AUCTIONS.md

## Print volt details

```
ts-node volt.ts -i printVoltDetails --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J
```

## Pre-setup

1. install solana CLI tools
2. setup anchor
3. install node, npm, yarn, ts-node

## Setup

1. `git clone https://github.com/Friktion-Labs/volt/`
2. `cd volt-manager`
3. `yarn`
