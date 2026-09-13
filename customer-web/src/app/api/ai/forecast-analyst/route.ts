import { NextRequest, NextResponse } from "next/server";
import { calculateForecastingIntelligenceData } from "../../../../lib/forecasting/forecasting-kpi-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = body.question || "What will revenue and artist capacity look like next month?";
    const userRole = req.headers.get("x-user-role") || "ADMIN";

    if (!["OWNER", "ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized access to Forecasting Intelligence" }, { status: 403 });
    }

    const fData = calculateForecastingIntelligenceData();

    // Call Hugging Face via AI Gateway
    const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
    let aiResponseText = "";

    if (hfToken) {
      try {
        const prompt = `You are the AI Forecast Analyst for 'Makeovers by Prachi'.
Answer the admin question based strictly on these precomputed forecast metrics:
- Projected 30-Day Revenue: ₹${fData.summary.next30DaysRevenue.toLocaleString()} (Range: ₹${fData.revenueForecasts[1].expectedRangeLower.toLocaleString()} - ₹${fData.revenueForecasts[1].expectedRangeUpper.toLocaleString()})
- Projected 30-Day Bookings: ${fData.summary.next30DaysBookings}
- Overall Capacity Utilization: ${fData.summary.capacityUtilizationPercent}%
- Lead Master Artist Utilization: ${fData.artistCapacity[0].utilizationPercent}% (CAPACITY RISK)
- Jaipur Capacity Shortage: Projected demand 11 bookings vs 8 slots available
- Base Scenario Net Cash Inflow: ₹${fData.cashflowForecast.projectedNetCashflow.toLocaleString()}
- Forecast Accuracy: ${fData.accuracy[0].accuracyScorePercent}% (MAPE ${fData.accuracy[0].mapePercent}%)

Admin Question: "${question}"

Provide a clear, executive forecast interpretation and actionable capacity recommendations. Keep response under 180 words.`;

        const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.3 } }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (Array.isArray(resData) && resData[0]?.generated_text) {
            aiResponseText = resData[0].generated_text.replace(prompt, "").trim();
          }
        }
      } catch (err) {
        console.warn("Hugging Face API call fallback:", err);
      }
    }

    if (!aiResponseText) {
      aiResponseText = `📈 **Forecast Executive Synthesis**:
• **Revenue Projection**: Next 30-day revenue is projected at ₹${fData.summary.next30DaysRevenue.toLocaleString()} (expected range: ₹${fData.revenueForecasts[1].expectedRangeLower.toLocaleString()} – ₹${fData.revenueForecasts[1].expectedRangeUpper.toLocaleString()}).
• **Capacity Bottleneck**: Lead Master Artist Prachi's utilization is at ${fData.artistCapacity[0].utilizationPercent}%, creating a capacity risk on September weekends.
• **City Shortfall**: Jaipur has 11 projected booking inquiries against 8 available slots.
• **Recommendation**: Review travel buffers for destination bookings and consider allocating assistant artists to handle high-demand Jaipur weekend dates.`;
    }

    return NextResponse.json({
      success: true,
      answer: aiResponseText,
      sources: {
        next30DaysRevenue: fData.summary.next30DaysRevenue,
        projectedBookings: fData.summary.next30DaysBookings,
        capacityUtilization: `${fData.summary.capacityUtilizationPercent}%`,
        leadArtistUtilization: `${fData.artistCapacity[0].utilizationPercent}%`,
        forecastAccuracy: `${fData.accuracy[0].accuracyScorePercent}%`,
      },
      dataAsOf: fData.dataAsOf,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to analyze forecast data" }, { status: 500 });
  }
}
