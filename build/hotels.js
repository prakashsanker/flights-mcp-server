import { makeBookingComRequest } from "./booking-api-request.js";
export async function getHotels(latitude, longitude, arrivalDate, departureDate, radius = 100, adults = 2, childrenAge = [], roomQuantity = 1, priceMin, priceMax, currencyCode = "USD") {
    try {
        // Build the base URL with required parameters
        let hotelsUrl = `api/v1/hotels/searchHotelsByCoordinates?latitude=${latitude}&longitude=${longitude}&arrival_date=${arrivalDate}&departure_date=${departureDate}`;
        // Add optional parameters if provided
        hotelsUrl += `&radius=${Math.min(Math.max(radius, 50), 500)}`; // Ensure radius is between 50 and 500
        hotelsUrl += `&adults=${adults}`;
        hotelsUrl += `&roomQuantity=${roomQuantity}`;
        hotelsUrl += `&currency_code=${currencyCode}`;
        // Add children ages if any
        if (childrenAge.length > 0) {
            hotelsUrl += `&childrenAge=${childrenAge.join(",")}`;
        }
        // Add price range if provided
        if (priceMin !== undefined) {
            hotelsUrl += `&priceMin=${priceMin}`;
        }
        if (priceMax !== undefined) {
            hotelsUrl += `&priceMax=${priceMax}`;
        }
        const response = await makeBookingComRequest(hotelsUrl);
        return response?.data?.result || [];
    }
    catch (error) {
        console.error("Error searching hotels:", error);
        return [];
    }
}
export function getHotelDetails(hotel) {
    // Format price with currency
    const name = hotel.hotel_name;
    const price = `${hotel.composite_price_breakdown.gross_amount_per_night.currency} ${hotel.composite_price_breakdown.gross_amount_per_night.value.toLocaleString()}`;
    // Format review information if available
    const reviewInfo = hotel.review_score
        ? `${hotel.review_score}/10 (${hotel.review_score_word})`
        : "No reviews yet";
    // Format check-in/check-out times
    const checkinTime = hotel.checkin?.from
        ? `from ${hotel.checkin.from}`
        : "N/A";
    const checkoutTime = hotel.checkout?.until
        ? `until ${hotel.checkout.until}`
        : "N/A";
    // Build the hotel details string
    return `
📍 **${name}** (${reviewInfo})
${hotel.city}
💰 ${price} per night
🕒 Check-in ${checkinTime}, Check-out ${checkoutTime}
`;
}
