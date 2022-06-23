#!/bin/bash

echo "running twap bot"
source ~/.bash_profile
export ANCHOR_PROVIDER_URL='https://friktion.rpcpool.com/07afafb9df9b278fb600cadb4111'; export ANCHOR_WALLET=~/.config/solana/vaultauth.json
cd /Users/alexdai/Documents/Friktion/volt/volt-manager/importantScripts
until ts-node twapEntropyVolt.ts --volt 2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2; do
	echo "twap bot crashed with exit code $?. Respawning..." >&2
        sleep 1
done


