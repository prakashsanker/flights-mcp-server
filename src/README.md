# ✈️ Multi Context Protocol (MCP) Server

## 🌟 Overview

This is a generalized travel mcp server that allows you to ask complex travel planning questions. Try the following

- I need to be at the Google office tomorrow by 4pm. What is the latest flight I need to take?
- I would like to stay at a reasonably priced hotel 15 minutes walk from the Eiffel tower, recommend some options.

## 🔧 Supported Functions

### 🛫 `search-flights`

Searches for available flights between two airports via Booking.com's API.

### 📅 `today`

Provides the current date to the LLM, ensuring it has up-to-date temporal context.

## 🏨 `search-hotels`

Search for available hotels and accommodations.

## 🔮 Features to Come

### 🚗 `search-car-rentals`

Find car rental options at your destination.

### ⭐ `hotel-reviews`

Access reviews for hotels and accommodations.

### 🚕 `search-taxis`

Find taxi and transfer services at your destination.

## 📦 Installation

This MCP server can be used with either Claude Desktop or your own client.

### Use with Claude Desktop

In order to work with Claude Desktop, use the below `claude_desktop_config.json`

```
{
  "mcpServers": {
    "travel": {
      "command": "npx",
      "args": ["travel-mcp-server"]
    },
    "google-maps": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GOOGLE_MAPS_API_KEY",
        "mcp/google-maps"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "<YOUR_GOOGLE_MAPS_API_KEY>"
      }
    }
  }
}
```

You will need to go get a google maps API key in order to use this.

### Programmatic Use

If you want to use this programmatically, here is a code snippet.

```
class TravelClient {
  private flightsClient: Client;
  private mapsClient: Client;
  private toolDefinitions: any[] = [];

  constructor() {
    this.flightsClient = new Client(
      { name: "FlightsApp", version: "1.0.0" },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
    this.mapsClient = new Client(
      { name: "MapsApp", version: "1.0.0" },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
  }

  async initialize() {
    console.log("Initializing MCP clients...");
    try {
      const flightsTransport = new StdioClientTransport({
        command: "node",
        args: ["../../node_modules/travel-mcp-server/build/index.js"],
      });

      console.log("GOOGLE MAPS API KEY", process.env.GOOGLE_MAPS_API_KEY);
      const mapsTransport = new StdioClientTransport({
        command: process.execPath,
        args: [
          "../../node_modules/@modelcontextprotocol/server-google-maps/dist/index.js",
        ],
        env: {
          GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
        },
      });

      await Promise.all([
        this.flightsClient.connect(flightsTransport),
        this.mapsClient.connect(mapsTransport),
      ]);

      // Discover tools from both servers
      console.log("Discovering tools...");
      const [flightsTools, mapsTools] = await Promise.all([
        this.flightsClient.listTools(),
        this.mapsClient.listTools(),
      ]);

      // Combine tools from both servers
      this.toolDefinitions = [
        ...flightsTools.tools.map((tool) => ({
          name: tool.name,
          description: tool.description || `Tool: ${tool.name}`,
          input_schema: tool.inputSchema,
        })),
        ...mapsTools.tools.map((tool) => ({
          name: tool.name,
          description: tool.description || `Tool: ${tool.name}`,
          input_schema: tool.inputSchema,
        })),
      ];

      console.log(`Discovered ${this.toolDefinitions.length} tools`);
      return this;
    } catch (error) {
      console.error("Error initializing MCP clients:", error);
      throw error;
    }
  }

  async callTool(toolName: string, parameters: any) {
    const tool = this.toolDefinitions.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Determine which client to use based on the tool name
    const client = toolName.includes("maps")
      ? this.mapsClient
      : this.flightsClient;

    const toolRequest = {
      name: toolName,
      arguments: parameters,
    };

    const result = await client.callTool(toolRequest);
    return result;
  }

  async getToolDefinitions() {
    return this.toolDefinitions;
  }
}

export default TravelClient;
```
