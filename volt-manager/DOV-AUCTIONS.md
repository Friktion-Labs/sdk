# DOV Auctions

## Description

A step-by-step introduction to propagating a Friktion defi options volt through a full epoch (selling options + redeeming yield).

### Monitoring Volt

`ts-node volt.ts -i printVoltDetails --volt 8qjBanq5cxc3FzsaEznKfpsbPwfMVoB6AxLXY7pe3fEX`

```
-------------------------
 ID: 8qjBanq5cxc3FzsaEznKfpsbPwfMVoB6AxLXY7pe3fEX
-------------------------
Volt #01: Covered Call
Short (Fri, 06 May 2022 01:59:59 GMT $0.46 CALL)

-------------------------
 HIGH LEVEL STATS
-------------------------
Total Value (minus pending deposits) (FTT):  183611.50780018 , ($):  7291212.9747451478
deposit pool:  0.50780018
premium pool:  2.636682 permissioned premium pool:  18353.75556

-------------------------
 EPOCH INFO
-------------------------
Round #:  17
pending deposits FTT:  667.10990016 , ($):  26490.9341353536
pending withdrawals (FTT):  36 , ($):  1429.56

-------------------------
 POSITION STATS
-------------------------

 Short ( Fri, 06 May 2022 01:59:59 GMT $0.46 CALL ):
minted options: (#) 183611  (FTT)  183611

-------------------------
 STATE MACHINE
-------------------------

Generic State:
, instantTransfersEnabled:  false
, deposits and withdrawals off?:  false
----------------------------

Short Options State:
, firstEverOptionWasSet:  true
, nextOptionSet:  true
, has started?:  true
, taken withdrawal fees:  false
, isSettled:  false
, mustSwapPremium:  false
, preparedIsFinished:  true
, enterIsFinished:  true
```

### Auction Preparation

**Before each auction, for each volt, Friktion must:**

1. mark the oracle price for current option market (settlement on inertia)
2. settle the current option (settlement on volt)
3. end the current epoch
4. take pending withdrawal fees
5. start new epoch
6. create new option
7. set new option
8. mint new option
9. create permissioned serum market for new option

##### Marking Oracle Prices for Current Option Markets (step 1)

**Inertia** is the european cash-settled options protocol Friktion uses for most volts. Immediately after expiry, the "option_settle" instruction may be called on an Inertia option market to set the oracle price for settlement. Due to the structure of solana instruction arguments, the oracle price is accepted as a u64. Thus, when passing in a settlement price through the CLI we multiply the true settlement price by 10000. For example, if SOL settled at 95.04, our inputted price would be 95.04 \* 10000 = 950400. See below.

```
ts-node volt.ts -i inertiaSettleCrank --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J --settle-price 950400
```

If the option market has not yet expired but an extraenous early settlement is necessary, use the bypass code argument to skip the expiry check.

```
ts-node volt.ts -i inertiaSettleCrank --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J --settle-price 950400 --bypass-code 123456789
```

##### Creating Option Markets (step 6)

Creating all needed options markets in one go is preferable as it is easier to specify metadata.

**Option 1: (DEPRECATED)** create Inertia option market

`ts-node volt.ts -i createInertiaMarket --underlying-asset-mint So11111111111111111111111111111111111111112 --quote-asset-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --underlying-amount-per-contract 1000000000 --quote-amount-per-contract 175000000 --expiry 1643947200 --oracle-ai GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR --is-call 1`

Next, print the option market to verify creation

`ts-node volt.ts -i printMarket --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J --option-market EwweNTT9RoJqsiPKNTKRySdhJPSQAJKTqLWPVDsvdkiq`

**Option 2: (PREFERRED)** Bulk create Inertia option markets based on CSV file

the file must follow the format present in the MM google sheets document

`ts-node scripts/createBulkInertiaMarkets.ts --file optionMarketsFiles/optionMarketsApr15.csv`

#### Automating settlement through mint (steps 1 through 8)

`automateDovAuctions.ts` manages the lifecycle of each volt, attempting transactions in async until the correct state is detected. This prevents transaction failure from pausing the process, and/or manual error from otherwise disrupting the process.

Run the below script, and restart if an error is encountered.

1. First, we need to bring all volts to mintable state.

   ```
   ts-node automateDovAuctions.ts --dov --option-markets-file optionMarketsFiles/optionMarketsApr28.csv
   ```

   If option markets have not yet been created and time is running short, pass in the "no mint" option to bring all volts to the new epoch but not set the new option.

   ```
   ts-node automateDovAuctions.ts --dov --no-mint true
   ```

2. Once all options have been set, the final step is creating serum markets for each one.

   ```
   ts-node automateDovAuctions.ts --dov --serum-markets
   ```

   Again, if any errors are encountered restart the script and/or contact alex wlezien

**🔥NOTE:🔥** the "--dov" option is for the main set of volts on Thursday auctions. For circuits volts, pass in "--circuits".

**🔥NOTE:🔥** Entropy volts are not currently supported

#### Step-by-step State Management

Only use when necessary.

1. **initialize**

```
ts-node volt.ts -i initialize --seed FytmGAUpsk9sX3JDBjYYwpH1c3tmikNFQMTnBRCoakdj --quote-asset-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --underlying-asset-mint So11111111111111111111111111111111111111112 --capacity 10000 --individual-capacity 10000 --permissioned-market-premium-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

2. **start round**

```
ts-node volt.ts -i startRound --volt <volt address>
```

```
ts-node volt.ts -i startRound --volt C9cbz4omvmfMwbLcTyi3kLuD4JHV1C3aPXdjGJP93ys1
```

3. **deposit/withdraw**

```
ts-node volt.ts --instruction deposit --volt <volt address> --amount <number of tokens to deposit>
```

```
ts-node volt.ts -i deposit --volt CF6iNGQKc4bRzvhHSAsiYt923EFEc7GXwH4AnXSnYeiu --amount 1000
```

4. **claim pending**

```
ts-node volt.ts -i claimPending --volt 27owJbLEmCdCf966ohVBNGsypnxRcQ5S9ZpwpkfRuLNH
```

5. **set next option**

```
ts-node volt.ts --instruction setNextOption --volt <volt address> --option-market <option market address>
```

```
ts-node volt.ts -i setNextOption --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J --option-market EwweNTT9RoJqsiPKNTKRySdhJPSQAJKTqLWPVDsvdkiq
```

6. **mint options (rebalance prepare)**

```
ts-node volt.ts --instruction rebalancePrepare --volt <volt address> --option-market <option market address>
--option-serum-market <option serum market address>
```

```
ts-node volt.ts -i rebalancePrepare --volt CF6iNGQKc4bRzvhHSAsiYt923EFEc7GXwH4AnXSnYeiu --option-serum-market sSHXhaT1xzyMSe3VBgpFqSjhikFgGrg4VCshxVXhvZQ
```

7. **enter options position (rebalance enter) hits the first bid**

```
ts-node volt.ts --instruction rebalanceEnter --volt <volt address>
```

```
ts-node volt.ts -i rebalanceEnter --volt CF6iNGQKc4bRzvhHSAsiYt923EFEc7GXwH4AnXSnYeiu
```

8. **settle rebalance enter funds**

```
ts-node volt.ts --instruction settleEnterFunds --volt CF6iNGQKc4bRzvhHSAsiYt923EFEc7GXwH4AnXSnYeiu --option-serum-market sSHXhaT1xzyMSe3VBgpFqSjhikFgGrg4VCshxVXhvZQ
```

🔥🔥🔥🔥**END AUCTION HERE**🔥🔥🔥🔥

8. **run inertia settle crank**

```
ts-node volt.ts -i inertiaSettleCrank --volt 51q765gctu6VDSeiwKyvnzfMzmZita8uJjb5SNngpP2J
```

🔥🔥🔥🔥**START AUCTION HERE**🔥🔥🔥🔥

9. **settle options position (rebalance settle)**

```
ts-node volt.ts --instruction rebalanceSettle --volt <volt address>
```

10. **convert premium to underlying (rebalance swap premium)**

```
ts-node volt.ts --instruction rebalanceSwapPremium --volt <volt address>
```

11. **settle swap premium funds**

```
ts-node volt.ts --instruction settleSwapPremiumFunds --volt 27owJbLEmCdCf966ohVBNGsypnxRcQ5S9ZpwpkfRuLNH --underlying-serum-market FWiZwHeubjJib9AcbvqLTDesUSiNMUJ7RcriTCPcZYxM
```

12. **end round**

```
ts-node volt.ts --instruction endRound --volt <volt address>
```

## Interacting with serum markets via CLI

```
ts-node serumManager.ts create --baseMint C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6 --quoteMint E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF --dex-program-id DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --base-lot-size 10000 --quote-lot-size 100 --fee-rate 0 --quote-dust-threshold 100 --rpc-url https://api.devnet.solana.com
```

MAINNET EXAMPLE:

```
ts-node serumManager.ts create --baseMint 9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E --quoteMint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --dex-program-id 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin --base-lot-size 100 --quote-lot-size 10 --fee-rate 0 --quote-dust-threshold 100 --rpc-url https://api.mainnet-beta.solana.com
```

```
ts-node serumManager.ts read --market-address BJMsi7C49WL5qtS9G97pUNreRf9GSZJzBQL8QZU7Bj95 --dex-program-id 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin  --rpc-url https://api.mainnet-beta.solana.com
```

```
ts-node serumManager.ts placeOrders --market-address CupgHEbXUa8puFA7ropMVaNqcW1zh8iBzTi348rhPSAm --dex-program-id DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY  --rpc-url https://api.devnet.solana.com --midpoint 200000 --spread 100000
```

## Gotchas

### How to think about base and quote lot size

when setting lot sizes, answer the following two questions

1. what is the desired minimum ORDER SIZE increment? (e.g 0.0001 BTC is the smallest order size on mainnet serum BTC/USDC)

- if 0.0001 BTC, BASE LOT SIZE = pow(10, num decimals of BTC token) / pow(10, desired num decimals for min order size (e.g 4))

2. what is the desired minimum PRICE increment? (e.g 0.0001 BTC is the smallest order size on mainnet serum BTC/USDC)

- answer to this is the ratio of base lot size to quote lot size.
