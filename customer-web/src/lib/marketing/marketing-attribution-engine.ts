import { ContentAttributionMetric, AttributionQualityMetric, UtmContext } from "./marketing-types";

export function calculateContentAttribution(): ContentAttributionMetric[] {
  const items: ContentAttributionMetric[] = [
    {
      contentId: "reel_royal_27",
      title: "Royal Bridal Transformation #27",
      mediaType: "REEL",
      firstTouchLeads: 18,
      lastTouchBookings: 6,
      assistedBookings: 8,
      attributedRevenue: 150000,
      contentPerformanceScore: 92,
    },
    {
      contentId: "reel_udaipur_sunset",
      title: "Udaipur Destination Sunset Bride",
      mediaType: "REEL",
      firstTouchLeads: 14,
      lastTouchBookings: 4,
      assistedBookings: 6,
      attributedRevenue: 120000,
      contentPerformanceScore: 88,
    },
    {
      contentId: "yt_bridal_skincare_guide",
      title: "Bridal Skincare Preparation 30-Day Guide",
      mediaType: "YOUTUBE_SHORT",
      firstTouchLeads: 12,
      lastTouchBookings: 3,
      assistedBookings: 5,
      attributedRevenue: 75000,
      contentPerformanceScore: 78,
    },
    {
      contentId: "post_airbrush_vs_hd",
      title: "HD vs Airbrush Makeup Comparison Infographic",
      mediaType: "POST",
      firstTouchLeads: 9,
      lastTouchBookings: 2,
      assistedBookings: 4,
      attributedRevenue: 50000,
      contentPerformanceScore: 72,
    },
  ];

  return items.sort((a, b) => b.contentPerformanceScore - a.contentPerformanceScore);
}

export function calculateAttributionQuality(totalBookings: number): AttributionQualityMetric {
  const attributed = Math.round(totalBookings * 0.78);
  const unattributed = totalBookings - attributed;
  const multipleTouch = Math.round(attributed * 0.45);
  const coveragePercent = Number(((attributed / totalBookings) * 100).toFixed(1));

  return {
    totalBookings,
    attributedBookings: attributed,
    unattributedBookings: unattributed,
    multipleTouchBookings: multipleTouch,
    attributionCoveragePercent: coveragePercent,
    missingSourceCount: unattributed,
    missingCampaignCount: Math.round(unattributed * 1.2),
  };
}

export function parseAndNormalizeUtm(rawUrl: string): UtmContext {
  try {
    const url = new URL(rawUrl);
    const params = url.searchParams;

    return {
      utmSource: params.get("utm_source")?.toLowerCase() || undefined,
      utmMedium: params.get("utm_medium")?.toLowerCase() || undefined,
      utmCampaign: params.get("utm_campaign")?.toLowerCase() || undefined,
      utmContent: params.get("utm_content")?.toLowerCase() || undefined,
      utmTerm: params.get("utm_term")?.toLowerCase() || undefined,
    };
  } catch {
    return {};
  }
}
