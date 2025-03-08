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
    const bestToLocationId = toLocationIds?.[0]?.id ?? "";

    const flights =
      (await searchFlights(bestFromLocationId, bestToLocationId)) ?? [];
    // print each flight with a new line
    const flightsTable = flights.join("\n");
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
