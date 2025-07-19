import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import UserAgent from "user-agents";

const itemDataSchema = {
  timestamp: z
    .string()
    .describe("ISO timestamp when the data was last updated"),
  score: z
    .number()
    .describe(
      "Fear & Greed score from 0-100 (0=extreme fear, 100=extreme greed)"
    ),
  rating: z
    .enum(["extreme fear", "fear", "neutral", "greed", "extreme greed"])
    .describe(
      "Textual rating based on the score: 0-25=extreme fear, 26-45=fear, 46-55=neutral, 56-75=greed, 76-100=extreme greed"
    ),
};

const fearGreedSchema = z.object({
  fear_and_greed: z
    .object({
      ...itemDataSchema,
      previous_close: z.number().describe("Previous day's closing score"),
      previous_1_week: z.number().describe("Score from 1 week ago"),
      previous_1_month: z.number().describe("Score from 1 month ago"),
      previous_1_year: z.number().describe("Score from 1 year ago"),
    })
    .describe("Main composite Fear & Greed Index with historical comparisons"),
  fear_and_greed_historical: z
    .object(itemDataSchema)
    .describe("Historical Fear & Greed Index data"),
  market_momentum_sp500: z
    .object(itemDataSchema)
    .describe(
      "S&P 500 momentum indicator - measures stock prices vs 125-day moving average"
    ),
  market_momentum_sp125: z
    .object(itemDataSchema)
    .describe("S&P 500 125-day moving average momentum"),
  stock_price_strength: z
    .object(itemDataSchema)
    .describe("Stock price strength - ratio of NYSE 52-week highs vs lows"),
  stock_price_breadth: z
    .object(itemDataSchema)
    .describe("Stock price breadth - McClellan Volume Summation Index"),
  put_call_options: z
    .object(itemDataSchema)
    .describe(
      "Put/Call options ratio - 5-day average (higher ratio indicates fear)"
    ),
  market_volatility_vix: z
    .object(itemDataSchema)
    .describe(
      "Market volatility - VIX fear index (higher values indicate fear)"
    ),
  market_volatility_vix_50: z
    .object(itemDataSchema)
    .describe("VIX 50-day moving average volatility"),
  junk_bond_demand: z
    .object(itemDataSchema)
    .describe(
      "Junk bond demand - yield spread between junk and investment-grade bonds"
    ),
  safe_haven_demand: z
    .object(itemDataSchema)
    .describe(
      "Safe haven demand - difference between 20-day stock and bond returns"
    ),
});

type FearGreedData = z.infer<typeof fearGreedSchema>;

async function fetchFearGreedData(): Promise<FearGreedData> {
  try {
    const userAgent = new UserAgent();

    const response = await fetch(
      "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
      {
        headers: {
          "User-Agent": userAgent.toString(),
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          Referer: "https://www.cnn.com/",
          Origin: "https://www.cnn.com",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    let result = {};

    Object.keys(responseData).forEach((k) => {
      const { data, ...rest } = responseData[k];
      result = {
        ...(result || {}),
        [k]: {
          ...rest,
          timestamp:
            typeof rest.timestamp === "number"
              ? new Date(rest.timestamp).toISOString()
              : rest.timestamp,
        },
      };
    });
    return fearGreedSchema.parse(result);
  } catch (error) {
    throw new Error(
      `Failed to fetch Fear and Greed data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function createServer(): McpServer {
  const server = new McpServer({
    name: "fear-greed-index",
    version: process.env.VERSION || "0.0.1",
  });

  server.registerTool(
    "get_fear_greed_index",
    {
      description:
        "Get US stock market Fear & Greed Index data. Returns comprehensive market sentiment analysis including the main composite index and 7 individual indicators (market momentum, stock price strength/breadth, options sentiment, volatility, safe haven demand, junk bond demand). Each indicator includes score (0-100), rating, and timestamp. See schema for detailed field descriptions.",
      inputSchema: {},
      outputSchema: {
        data: fearGreedSchema,
      },
    },
    async () => {
      try {
        const data = await fetchFearGreedData();

        return {
          isError: false,
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
            },
          ],
          structuredContent: {
            data,
          },
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching Fear and Greed Index: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  return server;
}

export { createServer };
