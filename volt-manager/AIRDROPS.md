## Airdrops

1. **airdrop underlying**

```
ts-node volt.ts -i airdropUnderlying --volt <volt address> --faucet-amount <number of tokens> --faucet-address <faucet address>
```

**NOTE** the below example is for BTC on devnet

```
ts-node volt.ts -i airdropUnderlying --volt 27owJbLEmCdCf966ohVBNGsypnxRcQ5S9ZpwpkfRuLNH --faucet-amount 100000 --faucet-address 97z3NzcDxqRMyE7F73PuHEmAbA72S7eDopjhe7GTymTk
```

2. **airdrop quote**

```
ts-node volt.ts -i airdropQuote --volt <volt address> --faucet-amount <number of tokens> --faucet-address <faucet address>
```

**NOTE** the below example is for USDC on devnet

```
 ts-node volt.ts -i airdropQuote --volt 27owJbLEmCdCf966ohVBNGsypnxRcQ5S9ZpwpkfRuLNH --faucet-amount 1 --faucet-address E6wQSMPGqHn7dqEMeWcSVfjdkwd8ED5CncQ9BtMNGtUG
```

**Devnet Faucet Addresses**

- DEVNET_FAUCET_BTC='97z3NzcDxqRMyE7F73PuHEmAbA72S7eDopjhe7GTymTk'
- DEVNET_FAUCET_USDC='E6wQSMPGqHn7dqEMeWcSVfjdkwd8ED5CncQ9BtMNGtUG'
- DEVNET_FAUCET_ETH = '3je763w7dnihbMVhonR7C9u9EiKMQVaG9WvNmUvAq38s'
