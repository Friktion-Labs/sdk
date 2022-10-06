## How to use

```bash
git clone https://github.com/Friktion-Labs/sdk
```

```bash
cd sdk
```

```bash
yarn && yarn build && cd friktion-utils && yarn build && cd ..
```

```bash
cd examples/marketmaking
```

```bash
ts-node cancelAndSettleAllOrders.ts
```

# NOTE: if you run into RPC rate limits, please contact Friktion on telegram and we will provide an endpoint

# NOTE: beginning logs should look like:
```
mainnet_income_call_near
loading round number =  0  for volt =  7P7oU1dTxXVU1Pked1DnEnr4GrrQb549zMAY4VmjChDo
loading round number =  1  for volt =  7P7oU1dTxXVU1Pked1DnEnr4GrrQb549zMAY4VmjChDo
mainnet_income_call_sol_high
loading round number =  30  for volt =  6ESYJXX4tqSTZrTRQbHodQZEwU7jd4fKWvStBpttRB4c
loading round number =  31  for volt =  6ESYJXX4tqSTZrTRQbHodQZEwU7jd4fKWvStBpttRB4c
loading round number =  32  for volt =  6ESYJXX4tqSTZrTRQbHodQZEwU7jd4fKWvStBpttRB4c
mainnet_income_call_eth
loading round number =  40  for volt =  A2jbvwftkAzU5hLUmBePdfqZQsop7jydZirLS5NsRVtx
loading round number =  41  for volt =  A2jbvwftkAzU5hLUmBePdfqZQsop7jydZirLS5NsRVtx
loading round number =  42  for volt =  A2jbvwftkAzU5hLUmBePdfqZQsop7jydZirLS5NsRVtx
```