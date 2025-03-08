import { searchFlightLocations, searchFlights } from "./flights.js";

async function testAPI() {
  try {
    // Test searchFlightLocations
    console.log("Testing searchFlightLocations for 'New Delhi'...");
    const fromLocationIds = await searchFlightLocations("New Delhi");
    console.log("Locations found:", fromLocationIds);

    const toLocationIds = await searchFlightLocations("Mumbai");
    console.log("Locations found:", toLocationIds);

    const bestFromLocationId = fromLocationIds?.[0]?.id ?? "";
    console.log("Best from location ID:", bestFromLocationId);
    const bestToLocationId = toLocationIds?.[0]?.id ?? "";
    console.log("Best to location ID:", bestToLocationId);
    const flights = await searchFlights(bestFromLocationId, bestToLocationId);
    console.log("Flights found:", flights);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAPI();
