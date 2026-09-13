import { NextRequest, NextResponse } from "next/server";
import { CampaignPlanRequest, CampaignPlanResult } from "../../../../lib/marketing/marketing-types";

export async function POST(req: NextRequest) {
  try {
    const body: CampaignPlanRequest = await req.json().catch(() => ({}));
    const userRole = req.headers.get("x-user-role") || "ADMIN";

    if (!["OWNER", "ADMIN", "MARKETING", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized access to AI Campaign Planner" }, { status: 403 });
    }

    const city = body.targetCity || "Jaipur & Udaipur";
    const service = body.targetService || "Royal Bridal Makeup";
    const budget = body.budget || 25000;
    const platform = body.platform || "Instagram & WhatsApp";

    const planResult: CampaignPlanResult = {
      campaignObjective: `Maximize qualified bridal leads and bookings in ${city} for ${service}`,
      audienceSuggestion: `Brides-to-be (ages 22-34) interested in luxury bridal wear, destination weddings, and bridal jewelry in ${city}.`,
      creativeIdeas: [
        `Before/After HD Airbrush transformation video reel highlighting 14-hour water-resistant finish.`,
        `Behind-the-scenes video showing Prachi's bridal vanity setup at a heritage palace in ${city}.`,
        `Carousel post showcasing 5 real brides in ${city} with customer reviews and look breakdowns.`,
      ],
      suggestedCaption: `✨ Step into your royal wedding day with timeless elegance. Book your ${service} with Makeovers by Prachi in ${city}. Limited slots available for upcoming wedding season! 👑`,
      ctaText: "Claim Complimentary Bridal Consultation",
      utmStructure: {
        utmSource: platform.toLowerCase().includes("instagram") ? "instagram" : "social",
        utmMedium: "cpc_ad",
        utmCampaign: `campaign_${city.toLowerCase().replace(/\s+/g, "_")}_${service.toLowerCase().replace(/\s+/g, "_")}`,
        utmContent: "reel_transformation_v1",
      },
      suggestedKpiTargets: {
        targetLeads: Math.round(budget / 350),
        targetBookings: Math.round((budget / 350) * 0.25),
        targetRoas: 10.0,
        targetCac: Math.round(budget / Math.max(1, Math.round((budget / 350) * 0.25))),
      },
    };

    return NextResponse.json({
      success: true,
      plan: planResult,
      meta: {
        budget,
        platform,
        targetCity: city,
        status: "DRAFT_PENDING_ADMIN_APPROVAL",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate campaign plan" }, { status: 500 });
  }
}
