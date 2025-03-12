import { makeBookingComRequest } from "./booking-api-request.js";

export function getFlightDetails(flightOffer: any) {
  // initially assume only non-stop flights
  const segment = flightOffer.segments[0];
  const departureAirport = segment.departureAirport;
  const arrivalAirport = segment.arrivalAirport;
  const departureTime = segment.departureTime;
  const arrivalTime = segment.arrivalTime;
  const leg = segment.legs[0];
  const flightNumber = leg.flightInfo.flightNumber;
  const carrier = leg.flightInfo.carrierInfo.operatingCarrier;
  const priceBreakdown = flightOffer.priceBreakdown;
  const total = priceBreakdown.total;
  const flightTextToReturn = `${carrier} ${flightNumber} from ${departureAirport.name} to ${arrivalAirport.name} departing at ${departureTime} and arriving at ${arrivalTime}, costing ${total.units} ${total.currencyCode}`;
  return flightTextToReturn;
}

export async function searchFlightLocations(query: string) {
  const url = `api/v1/flights/searchDestination?query=${query}`;
  const response = await makeBookingComRequest<{
    data: {
      id: string;
      name: string;
    }[];
  }>(url);
  return response?.data;
}

type sort = "BEST" | "CHEAPEST" | "FASTEST";
type cabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

const today = new Date();
const formattedDate = today.toISOString().split("T")[0];

export async function searchFlights(
  fromId: string,
  toId: string,
  sort: sort = "BEST",
  cabinClass: cabinClass = "ECONOMY",
  departDate: string = formattedDate,
  returnDate: string = formattedDate
) {
  // add a try catch
  try {
    const url = `api/v1/flights/searchFlights?fromId=${fromId}&toId=${toId}&pageNo=1&adults=1&children=0%2C17&sort=${sort}&cabinClass=${cabinClass}&currency_code=USD&departDate=${departDate}&returnDate=${returnDate}`;
    const response = await makeBookingComRequest<{
      data: {
        flightOffers: Array<{
          segments: any[];
        }>;
        [key: string]: any; // allows any additional properties
      };
    }>(url);
    const flightOffers = response?.data?.flightOffers ?? [];

    const flights = [];
    for (const flightOffer of flightOffers) {
      const flightDetails = getFlightDetails(flightOffer);
      flights.push(flightDetails);
    }
    // I just need to get the actual airline details

    return flights;
  } catch (error) {
    console.error("Error searching flights:", error);
    return [];
  }
}
