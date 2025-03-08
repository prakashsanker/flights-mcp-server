const USER_AGENT = "travel-app/1.0";
const BASE_URL = "https://booking-com15.p.rapidapi.com";
export async function makeBookingComRequest(url) {
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
        return (await response.json());
    }
    catch (error) {
        console.error("Error making Booking.com request:", error);
        return null;
    }
}
export function getFlightDetails(flightOffer) {
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
export async function searchFlightLocations(query) {
    const url = `api/v1/flights/searchDestination?query=${query}`;
    const response = await makeBookingComRequest(url);
    return response?.data;
}
const today = new Date();
const formattedDate = today.toISOString().split("T")[0];
export async function searchFlights(fromId, toId, sort = "BEST", cabinClass = "ECONOMY", departDate = formattedDate, returnDate = formattedDate) {
    const url = `api/v1/flights/searchFlights?fromId=${fromId}&toId=${toId}&pageNo=1&adults=1&children=0%2C17&sort=${sort}&cabinClass=${cabinClass}&currency_code=USD&departDate=${departDate}&returnDate=${returnDate}`;
    const response = await makeBookingComRequest(url);
    const flightOffers = response?.data?.flightOffers ?? [];
    const flights = [];
    for (const flightOffer of flightOffers) {
        const flightDetails = getFlightDetails(flightOffer);
        flights.push(flightDetails);
    }
    // I just need to get the actual airline details
    console.log("FLIGHTS", flights);
    return flights;
}
/*

const fetch = require('node-fetch');

const url = 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=BOM.AIRPORT&toId=DEL.AIRPORT&pageNo=1&adults=1&children=0%2C17&sort=BEST&cabinClass=ECONOMY&currency_code=AED';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': 'ac20a37bd4mshbc1a76d7633b34bp1ce6aajsn21e888e1d1f7',
    'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
  }
};

try {
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
} catch (error) {
    console.error(error);
}



*/
