const USER_AGENT = "travel-app/1.0";

const BASE_URL = "https://booking-com15.p.rapidapi.com";

export async function makeBookingComRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    "x-rapidapi-key": "ac20a37bd4mshbc1a76d7633b34bp1ce6aajsn21e888e1d1f7",
    "x-rapidapi-host": "booking-com15.p.rapidapi.com",
  };
  try {
    const fullUrl = `${BASE_URL}/${url}`;
    const response = await fetch(fullUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making Booking.com request:", error);
    return null;
  }
}

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

  const flightTextToReturn = `${carrier} ${flightNumber} from ${departureAirport.name} to ${arrivalAirport.name} departing at ${departureTime} and arriving at ${arrivalTime}`;
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
  // console.error("SEARCHING FLIGHTS");
  const url = `api/v1/flights/searchFlights?fromId=${fromId}&toId=${toId}&pageNo=1&adults=1&children=0%2C17&sort=${sort}&cabinClass=${cabinClass}&currency_code=USD&departDate=${departDate}&returnDate=${returnDate}`;
  const response = await makeBookingComRequest<{
    data: {
      flightOffers: Array<{
        segments: any[];
      }>;
      [key: string]: any; // allows any additional properties
    };
  }>(url);
  // console.error("RESPONSE", response);
  const flightOffers = response?.data?.flightOffers ?? [];
  // console.error("FLIGHT OFFERS", flightOffers);
  const flights = [];
  for (const flightOffer of flightOffers) {
    const flightDetails = getFlightDetails(flightOffer);
    flights.push(flightDetails);
  }
  // I just need to get the actual airline details

  return flights;
}
