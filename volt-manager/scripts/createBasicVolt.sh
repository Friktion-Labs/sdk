SEED=$(ts-node scripts/genPublicKey.ts)
echo "seed = $SEED"
source ./set_anchor_vars.sh
ts-node volt.ts -i initialize --seed $SEED \
                --expiration-interval 2592000 --upper-bound-otm-strike-factor 20 \
                --transfer-window 600 --option-market-seed $1 \
                --underlying-serum-market $2