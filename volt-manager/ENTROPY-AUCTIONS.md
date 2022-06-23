## Entropy/Mango volt Usage

**To print volt state**

```ts-node volt.ts -i printVoltDetails --volt JPmAHJBocDi1539s2wfqiGzVTZd4quYJgx5dg6Ysq2k```

outputs

````-------------------------
 ID: JPmAHJBocDi1539s2wfqiGzVTZd4quYJgx5dg6Ysq2k
-------------------------
Volt #03: Crab Strategy
Short Crab (-BTC^2-PERP, +BTC-PERP)

-------------------------
 HIGH LEVEL STATS
-------------------------
Total Value (minus pending deposits) (USDC):  564820.10797995028822 , ($):  563506.9012288969038
deposit pool:  0

-------------------------
 EPOCH INFO
-------------------------
Round #:  7
pending deposits USDC:  219753.149464 , ($):  219242.2233914962
pending withdrawals (USDC):  3569 , ($):  3560.702075

-------------------------
 POSITION STATS
-------------------------
EntropyAccount VKH3Tf7yAgxU5JKkuU7HLmrYCvnGM2LKsPL9bvgRHq3
Owner: 3A9M3rMmAg6SZmNgMuZ1sinriFaTdS9Fmj6c54w1vDG4
Equity: 564819.6709
Token: Net Balance / Base In Orders / Quote In Orders
USDC: 560865.4824 / 0.0000 / 0.0000
Perps:
Market: Base Pos / Quote Pos / Unsettled Funding / Health
BTC^2-PERP: -175.3127 / 291404.1893 / -77.0983 / 2884574702.8696
BTC-PERP: 13.4628 / -545899.3654 / -112.0575 / -51329608008.7374
BTC_1D_IV-PERP: 0.0000 / 0.0000 / 0.0000 / 0.0000

-------------------------
 STATE MACHINE
-------------------------

Generic State:
, instantTransfersEnabled:  false
, deposits and withdrawals off?:  false
----------------------------

 Entropy State:
, rebalance ready?:  false
, done rebalancing?:  false
, done rebalancing target perp?:  false
, have taken perf fees?:  false
, have resolved deposits?:  false```
````

#### State Management

1. **initialize**

```
ts-node volt.ts -i initializeEntropy --underlying-asset-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v  --entropy-program-id FcfzrnurPFXwxbx332wScnD5P86DwhpLpBbQsnr6LcH5   --entropy-group EAhqxJge6VCXH5KaPEmDzz4DoKGfHgCotmpC8xGvBju2    --target-perp-market HTrVoLyfjS3WbvTdSemAHdtHYv4MYPg3WdXuqxKDGNsu    --spot-perp-market 9GE4Q4RR6jTXZSGMf9GK4purKxSPVgRCVM7WLqxi8k8i  --target-leverage-ratio -0.5  --target-leverage-lenience 0.15  --exit-early-ratio 1.0    --capacity 1000   --individual-capacity  1000 --pda-str testCrabVolt1
```

```
Initialize spot open orders
ts-node volt.ts -i initSpotOpenOrdersEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2

```

2. **deposit**

```
ts-node volt.ts -i deposit --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2 --amount 1
```

3. **start round**

```
ts-node volt.ts -i startRoundEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```

🔥🔥🔥🔥**END AUCTION HERE**🔥🔥🔥🔥

## wait 7 days....

🔥🔥🔥🔥**START AUCTION HERE**🔥🔥🔥🔥

3. **take performance fees**

```
ts-node volt.ts -i takePerformanceFeesEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```

4. **setup rebalance**

```
ts-node volt.ts -i setupRebalanceEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```

5. **rebalance entropy**

NOTE: run this until finished. will require at least once for no hedging and at least twice if hedging is on.

```
ts-node volt.ts -i rebalanceEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```

- 🔥🔥 **if basis volt**, must run the below command until finished.
  ```
  ts-node volt.ts -i rebalanceSpotEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
  ```

6. **end round**

```
ts-node volt.ts -i endRoundEntropy --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```

7. **take pending withdrawal fees**

```
ts-node volt.ts -i takePendingWithdrawalFees --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2
```
