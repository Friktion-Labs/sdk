import Decimal from "decimal.js";
import { FriktionSnapshot } from "../../..";
import { FRIKTION_SNAPSHOT_URL } from "../../../constants";

export const getFriktionSnapshot = async (): Promise<FriktionSnapshot> => {
  const nodeFetch = await import("node-fetch");

  const response = await nodeFetch.default(FRIKTION_SNAPSHOT_URL);
  const snapshot: FriktionSnapshot =
    (await response.json()) as FriktionSnapshot;
  return snapshot;
};

export const getCoingeckoPrice = async (id: string): Promise<Decimal> => {
  const nodeFetch = await import("node-fetch");

  const coingeckoPath = `/api/v3/simple/price?ids=${id}&vs_currencies=usd&`;
  const coingeckoUrl = `https://api.coingecko.com${coingeckoPath}`;

  let retries = 0;
  while (true && retries < 5) {
    const response = await nodeFetch.default(coingeckoUrl);

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
      console.error(response);
      console.error("status != 200, === ", response.status.toString());
    }
    retries += 1;
  }
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  throw new Error("retries failed");
};
