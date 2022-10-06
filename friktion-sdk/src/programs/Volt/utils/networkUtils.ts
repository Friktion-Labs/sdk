import { sleep } from "@friktion-labs/friktion-utils";
import Decimal from "decimal.js";
import { FriktionSnapshot } from "../../..";
import { FRIKTION_SNAPSHOT_URL } from "../../../constants";
import fetch from "isomorphic-unfetch";

export const getFriktionSnapshot = async (): Promise<FriktionSnapshot> => {
  const response = await fetch(FRIKTION_SNAPSHOT_URL);
  const snapshot: FriktionSnapshot =
    (await response.json()) as FriktionSnapshot;
  return snapshot;
};

export const getCoingeckoPrice = async (
  id: string,
  totalRetries: number = 5,
  retrySleepTime: number = 2500
): Promise<Decimal> => {
  const coingeckoPath = `/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
  // const coingeckoUrl = `https://api.coingecko.com${coingeckoPath}`;
  const coingeckoUrl = `https://pro-api.coingecko.com${coingeckoPath}&x_cg_pro_api_key=CG-2p6zESq7oQGkvTiYBk4GJbiS`;
  // const coingeckoUrl = `https://coingecko.friktion.workers.dev${coingeckoPath}`;

  let attemptedRetries = 0;
  while (true && attemptedRetries < totalRetries) {
    const response = await fetch(coingeckoUrl);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (response.status === 200) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const data = await response.json();
      if (data && typeof data === "object") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        for (const [key, value] of Object.entries(data)) {
          if (
            // eslint-disable-next-line no-prototype-builtins
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, no-prototype-builtins
            !(
              value &&
              typeof value === "object" &&
              // eslint-disable-next-line no-prototype-builtins
              value.hasOwnProperty("usd")
            )
          ) {
            throw new Error("Missing usd in " + key);
          }
        }
        return new Decimal(
          (data as Record<string, { usd: number }>)[
            id
          ]?.usd.toString() as string
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        throw new Error("received undefined response = " + response.toString());
      }
    } else {
      console.error("status != 200, === ", response.status.toString());
      await sleep(
        retrySleepTime * (attemptedRetries + 1) * (attemptedRetries + 1)
      );
    }
    attemptedRetries += 1;
  }
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  throw new Error("retries failed");
};
