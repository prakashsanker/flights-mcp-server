export const USER_AGENT = "travel-app/1.0";
export const BASE_URL = "https://booking-com15.p.rapidapi.com";
export async function makeBookingComRequest(url) {
    const API_KEY = process.env.BOOKING_COM_API_KEY || "";
    const headers = {
        "User-Agent": USER_AGENT,
        "x-rapidapi-key": API_KEY,
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
