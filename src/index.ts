#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchFlightLocations, searchFlights } from "./flights.js";
import { getHotels, getHotelDetails } from "./hotels.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "travel",
  version: "1.0.0",
});

server.tool("today", "get today's date", async () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  return {
    content: [
      {
        type: "text",
        text: formattedDate,
      },
    ],
  };
});

server.tool(
  "search-flights",
  "search for flights",
  {
    from: z.string().describe("The departure city"),
    to: z.string().describe("The arrival city"),
    departDate: z.string().describe("The departure date, required"),
    returnDate: z.string().describe("The return date, optional") || null,
    cabinClass:
      z
        .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
        .describe("The cabin class of the flight, optional") || null,
    sort:
      z
        .enum(["BEST", "CHEAPEST", "FASTEST"])
        .describe("The sort order of the flights, optional") || null,
  },
  async ({ from, to, departDate, returnDate, cabinClass, sort }) => {
    const fromLocationIds = await searchFlightLocations(from);
    const toLocationIds = await searchFlightLocations(to);
    const bestFromLocationId = fromLocationIds?.[0]?.id ?? "";
    const bestToLocationId = toLocationIds?.[0]?.id ?? "";
    const flights =
      (await searchFlights(
        bestFromLocationId,
        bestToLocationId,
        sort,
        cabinClass,
        departDate,
        returnDate
      )) ?? [];

    // Deduplicate flights based on specific criteria
    const flightMap = new Map();
    flights.forEach((flight) => {
      // Extract a unique key from the flight string
      // This example assumes flights have a format like "AA 123 from X to Y..."
      const match = flight.match(/^([A-Z0-9]+\s+[0-9]+)/);
      const key = match ? match[1] : flight;

      if (!flightMap.has(key)) {
        flightMap.set(key, flight);
      }
    });

    const uniqueFlights = Array.from(flightMap.values());

    // print each flight with a new line
    const flightsTable = uniqueFlights.join("\n");
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

server.tool(
  "search-hotels-by-coordinates",
  "search for hotels by geographic coordinates",
  {
    latitude: z.number().describe("Latitude of the location"),
    longitude: z.number().describe("Longitude of the location"),
    arrivalDate: z.string().describe("Check-in date in YYYY-MM-DD format"),
    departureDate: z.string().describe("Check-out date in YYYY-MM-DD format"),
    radius: z
      .number()
      .optional()
      .describe("Search radius in km (50-500, default: 100)"),
    adults: z.number().optional().describe("Number of adults (default: 2)"),
    childrenAge: z
      .array(z.number())
      .optional()
      .describe("Ages of children, if any"),
    roomQuantity: z
      .number()
      .optional()
      .describe("Number of rooms (default: 1)"),
    priceMin: z.number().optional().describe("Minimum price per night"),
    priceMax: z.number().optional().describe("Maximum price per night"),
    currencyCode: z
      .string()
      .optional()
      .describe("Currency code (default: USD)"),
  },
  async ({
    latitude,
    longitude,
    arrivalDate,
    departureDate,
    radius,
    adults,
    childrenAge,
    roomQuantity,
    priceMin,
    priceMax,
    currencyCode,
  }) => {
    const hotels = await getHotels(
      latitude,
      longitude,
      arrivalDate,
      departureDate,
      radius,
      adults,
      childrenAge,
      roomQuantity,
      priceMin,
      priceMax,
      currencyCode
    );

    console.error("hotels", hotels);

    if (!hotels.length) {
      return {
        content: [
          {
            type: "text",
            text: "No hotels found for the given criteria.",
          },
        ],
      };
    }

    // Format each hotel's details
    const hotelDetails = hotels.map((hotel: any) => getHotelDetails(hotel));
    const hotelsTable = hotelDetails.join("\n");
    console.error("hotelsTable", hotelsTable);

    return {
      content: [
        {
          type: "text",
          text: hotelsTable,
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
