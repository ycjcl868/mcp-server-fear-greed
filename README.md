# MCP Server Fear & Greed Index

[![NPM Downloads](https://img.shields.io/npm/d18m/mcp-server-fear-greed)](https://www.npmjs.com/package/mcp-server-fear-greed)

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=mcp-server-fear-greed&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMC15JTIwbWNwLXNlcnZlci1mZWFyLWdyZWVkJTQwbGF0ZXN0JTIyJTdE)

A Model Context Protocol (MCP) server that provides access to the CNN Fear & Greed Index for the US stock market. This server fetches real-time market sentiment data and presents it in both `structuredContent` and text `content`.

![](https://github.com/user-attachments/assets/c505ffac-c837-4464-88a5-42b9bd838958)

## Features

- **Real-time Fear & Greed Index**: Get the current market sentiment score (0-100)
- **Historical Comparisons**: View previous close, week, month, and year data
- **Detailed Market Indicators**: Access individual component scores including:
  - Market Momentum (S&P 500 & S&P 125)
  - Stock Price Strength & Breadth
  - Put/Call Options Ratio
  - Market Volatility (VIX)
  - Junk Bond Demand
  - Safe Haven Demand
- **Flexible Output**: Choose between structured markdown or raw JSON format

## Requirements

- Node.js 18 or newer
- VS Code, Cursor, Windsurf, Claude Desktop or any other MCP client

## Getting Started

### Local (Stdio)

First, install the Fear & Greed MCP server with your client. A typical configuration looks like this:

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-fear-greed@latest"
      ]
    }
  }
}
```

<details><summary><b>Install in VS Code</b></summary>

You can also install the mcp-server-fear-greed MCP server using the VS Code CLI:

```bash
# For VS Code
code --add-mcp '{"name":"mcp-server-fear-greed","command":"npx","args":["mcp-server-fear-greed@latest"]}'
```

After installation, the Fear & Greed MCP server will be available for use with your GitHub Copilot agent in VS Code.
</details>

<details>
<summary><b>Install in Cursor</b></summary>

Go to `Cursor Settings` -> `MCP` -> `Add new MCP Server`. Name to your liking, `npx mcp-server-fear-greed`. You can also verify config or add command like arguments via clicking `Edit`.

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "command": "npx",
      "args": [
        "mcp-server-fear-greed@latest"
      ]
    }
  }
}
```
</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp). Use following configuration:

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "command": "npx",
      "args": [
        "mcp-server-fear-greed@latest"
      ]
    }
  }
}
```
</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user), use following configuration:

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "command": "npx",
      "args": [
        "mcp-server-fear-greed@latest"
      ]
    }
  }
}
```
</details>

### Remote (SSE / Streamable HTTP)

At the same time, use `--port $your_port` arg to start the browser mcp can be converted into SSE and Streamable HTTP Server.

```bash
# normal run remote mcp server
npx mcp-server-fear-greed --port 8089
```

You can use one of the two MCP Server remote endpoint:
- Streamable HTTP(Recommended): `http://127.0.0.1::8089/mcp`
- SSE: `http://127.0.0.1::8089/sse`

And then in MCP client config, set the `url` to the SSE endpoint:

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "url": "http://127.0.0.1::8089/sse"
    }
  }
}
```

`url` to the Streamable HTTP:

```js
{
  "mcpServers": {
    "mcp-server-fear-greed": {
      "type": "streamable-http", // If there is MCP Client support
      "url": "http://127.0.0.1::8089/mcp"
    }
  }
}
```

### In-memory call

If your MCP Client is developed based on JavaScript / TypeScript, you can directly use in-process calls to avoid requiring your users to install the command-line interface to use Fear & Greed MCP.

```js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

// type: module project usage
import { createServer } from 'mcp-server-fear-greed';
// commonjs project usage
// const { createServer } = await import('mcp-server-fear-greed')

const client = new Client(
  {
    name: 'test fear greed client',
    version: '1.0',
  },
  {
    capabilities: {},
  },
);

const server = createServer();
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await Promise.all([
  client.connect(clientTransport),
  server.connect(serverTransport),
]);

// list tools
const result = await client.listTools();
console.log(result);

// call tool
const toolResult = await client.callTool({
  name: 'get_fear_greed_index',
  arguments: {
    format: 'json'
  },
});
console.log(toolResult);
```

## API Reference

### Tool: `get_fear_greed_index`

Fetches the current Fear & Greed Index and related market indicators.

#### Parameters

- `format` (optional): Output format
  - `"structured"` (default): Returns formatted markdown with organized data
  - `"json"`: Returns raw JSON data

#### Example Usage

```javascript
// Get structured output
await client.callTool("get_fear_greed_index");

// Get JSON output
await client.callTool("get_fear_greed_index", { format: "json" });
```

#### Response Structure

The tool returns data in the following structure:

```json
{
  "fear_and_greed": {
    "score": 75,
    "rating": "greed",
    "timestamp": "2025-07-18T23:59:57+00:00",
    "previous_close": 75.31,
    "previous_1_week": 75.26,
    "previous_1_month": 54.29,
    "previous_1_year": 45.94
  },
  "fear_and_greed_historical": {
    "timestamp": 1752883197000,
    "score": 75,
    "rating": "greed"
  },
  "market_momentum_sp500": {
    "timestamp": 1752871567000,
    "score": 61.2,
    "rating": "greed"
  },
  "market_momentum_sp125": {
    "timestamp": 1752871567000,
    "score": 61.2,
    "rating": "greed"
  },
  "stock_price_strength": {
    "timestamp": 1752883197000,
    "score": 80,
    "rating": "extreme greed"
  },
  "stock_price_breadth": {
    "timestamp": 1752883197000,
    "score": 84,
    "rating": "extreme greed"
  },
  "put_call_options": {
    "timestamp": 1752871897000,
    "score": 79.6,
    "rating": "extreme greed"
  },
  "market_volatility_vix": {
    "timestamp": 1752869701000,
    "score": 50,
    "rating": "neutral"
  },
  "market_volatility_vix_50": {
    "timestamp": 1752869701000,
    "score": 50,
    "rating": "neutral"
  },
  "junk_bond_demand": {
    "timestamp": 1752877800000,
    "score": 88.8,
    "rating": "extreme greed"
  },
  "safe_haven_demand": {
    "timestamp": 1752868799000,
    "score": 81.4,
    "rating": "extreme greed"
  }
}
```

## Fear & Greed Index Ratings

The index uses the following rating scale:

- **0-25**: Extreme Fear
- **26-45**: Fear
- **46-55**: Neutral
- **56-75**: Greed
- **76-100**: Extreme Greed

### Development

Access http://127.0.0.1:6274/:

```bash
npm run dev
```

### Error Handling

The server includes comprehensive error handling:

- Network request failures are caught and reported
- Invalid API responses are handled gracefully
- Missing data fields are filled with sensible defaults
- All errors include descriptive messages
