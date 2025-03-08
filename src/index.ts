import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchFlightLocations, searchFlights } from "./flights.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "travel",
  version: "1.0.0",
});

server.tool(
  "search-flights",
  "search for flights",
  {
    from: z.string().describe("The departure city"),
    to: z.string().describe("The arrival city"),
  },
  async ({ from, to }) => {
    const fromLocationIds = await searchFlightLocations(from);
    const toLocationIds = await searchFlightLocations(to);
    const bestFromLocationId = fromLocationIds?.[0]?.id ?? "";
    // console.error("BEST FROM LOCATION ID", bestFromLocationId);
    const bestToLocationId = toLocationIds?.[0]?.id ?? "";
    // console.error("BEST TO LOCATION ID", bestToLocationId);
    const flights =
      (await searchFlights(bestFromLocationId, bestToLocationId)) ?? [];
    // print each flight with a new line
    const flightsTable = flights.join("\n");
    // console.error("FLIGHTS TABLE", flightsTable);
    return {
      content: [
        {
          type: "text",
          text: flightsTable,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
