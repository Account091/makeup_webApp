import { NextRequest, NextResponse } from "next/server";
import { DestinationQuoteRequest } from "../../../../lib/locations/location-types";
import { createDestinationQuote } from "../../../../lib/locations/destination-quote-engine";

export async function POST(req: NextRequest) {
  try {
    const body: DestinationQuoteRequest = await req.json().catch(() => ({}));
    
    if (!body.brideName || !body.destinationCity) {
      return NextResponse.json({ error: "Missing required brideName or destinationCity" }, { status: 400 });
    }

    const quoteResult = createDestinationQuote({
      brideName: body.brideName,
      destinationCity: body.destinationCity,
      venueAddress: body.venueAddress || "Palace Resort",
      travelMode: body.travelMode || "Flight",
      functions: body.functions || [
        {
          functionName: "Wedding",
          eventDate: new Date().toISOString().substring(0, 10),
          readyByTime: "14:00",
          venueName: body.venueAddress || "Grand Venue",
          guestCount: 2,
          serviceId: "royal-bridal",
          assignedArtistIds: ["artist_prachi"],
        },
      ],
      artistCount: body.artistCount || 2,
      requiresStay: body.requiresStay !== false,
    });

    return NextResponse.json({
      success: true,
      quote: quoteResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate destination quote" }, { status: 500 });
  }
}
