import {
  MarketingIntelligenceData,
  MarketingSummaryKPIs,
  ChannelPerformanceMetric,
  CampaignPerformanceMetric,
  CouponAttributionMetric,
  ReferralAttributionMetric,
  ServiceChannelMatrixRow,
  LocationMarketingMetric,
} from "./marketing-types";
import { calculateContentAttribution, calculateAttributionQuality } from "./marketing-attribution-engine";
import { generateMarketingAlerts } from "./marketing-alert-engine";

export function calculateMarketingIntelligenceData(): MarketingIntelligenceData {
  const dataAsOf = new Date().toISOString();

  // 1. Channel Performance Metrics
  const channels: ChannelPerformanceMetric[] = [
    {
      channelId: "instagram",
      channelName: "Instagram",
      impressionsOrViews: 145000,
      clicks: 4200,
      leads: 142,
      qualifiedLeads: 86,
      bookings: 31,
      revenue: 410000,
      conversionRate: 21.8,
      cost: 45000,
      roi: 8.11,
    },
    {
      channelId: "referral",
      channelName: "Customer Referral",
      impressionsOrViews: 8500,
      clicks: 1200,
      leads: 58,
      qualifiedLeads: 48,
      bookings: 24,
      revenue: 380000,
      conversionRate: 41.3,
      cost: 18000,
      roi: 20.11,
    },
    {
      channelId: "organic_google",
      channelName: "Organic Search (Google)",
      impressionsOrViews: 48000,
      clicks: 3100,
      leads: 76,
      qualifiedLeads: 42,
      bookings: 18,
      revenue: 270000,
      conversionRate: 23.6,
      cost: 0,
      roi: 0,
    },
    {
      channelId: "whatsapp_direct",
      channelName: "WhatsApp Direct",
      impressionsOrViews: 19500,
      clicks: 2800,
      leads: 64,
      qualifiedLeads: 40,
      bookings: 16,
      revenue: 220000,
      conversionRate: 25.0,
      cost: 8000,
      roi: 26.5,
    },
    {
      channelId: "youtube",
      channelName: "YouTube Shorts & Videos",
      impressionsOrViews: 92000,
      clicks: 1900,
      leads: 38,
      qualifiedLeads: 20,
      bookings: 8,
      revenue: 145000,
      conversionRate: 21.0,
      cost: 15000,
      roi: 8.67,
    },
  ];

  // Top-line aggregation
  const totalLeads = channels.reduce((acc, c) => acc + c.leads, 0);
  const totalQualifiedLeads = channels.reduce((acc, c) => acc + c.qualifiedLeads, 0);
  const totalBookings = channels.reduce((acc, c) => acc + c.bookings, 0);
  const totalAttributedRevenue = channels.reduce((acc, c) => acc + c.revenue, 0);
  const totalSpend = channels.reduce((acc, c) => acc + c.cost, 0);

  const overallRoas = totalSpend > 0 ? Number((totalAttributedRevenue / totalSpend).toFixed(2)) : 0;
  const overallCac = totalBookings > 0 ? Math.round(totalSpend / totalBookings) : 0;
  const overallConversionRate = totalLeads > 0 ? Number(((totalBookings / totalLeads) * 100).toFixed(1)) : 0;

  const summary: MarketingSummaryKPIs = {
    marketingLeads: totalLeads,
    qualifiedLeads: totalQualifiedLeads,
    bookings: totalBookings,
    revenueAttributed: totalAttributedRevenue,
    marketingSpend: totalSpend,
    roas: overallRoas,
    cac: overallCac,
    conversionRate: overallConversionRate,
    previousPeriodComparison: {
      marketingLeadsChange: 14.5,
      bookingsChange: 18.2,
      revenueChange: 22.0,
      roasChange: 8.4,
      cacChange: -6.2,
    },
  };

  // 2. Campaign Metrics
  const campaigns: CampaignPerformanceMetric[] = [
    {
      campaignId: "cmp_bridal_2026",
      name: "Royal Bridal Season 2026",
      status: "ACTIVE",
      platform: "Instagram Ads",
      reach: 85000,
      clicks: 2900,
      leads: 88,
      bookings: 22,
      revenue: 330000,
      spend: 30000,
      cac: 1364,
      roas: 11.0,
      conversionRate: 25.0,
    },
    {
      campaignId: "cmp_destination_jaipur",
      name: "Destination Bridal Jaipur",
      status: "ACTIVE",
      platform: "Google Search & Reels",
      reach: 42000,
      clicks: 1400,
      leads: 45,
      bookings: 9,
      revenue: 245000,
      spend: 20000,
      cac: 2222,
      roas: 12.25,
      conversionRate: 20.0,
    },
    {
      campaignId: "cmp_party_glam",
      name: "Festive & Party Glam Offer",
      status: "PAUSED",
      platform: "WhatsApp & Instagram",
      reach: 28000,
      clicks: 850,
      leads: 32,
      bookings: 6,
      revenue: 75000,
      spend: 8000,
      cac: 1333,
      roas: 9.38,
      conversionRate: 18.75,
    },
  ];

  // 3. Coupons & Referrals
  const coupons: CouponAttributionMetric[] = [
    {
      code: "BRIDAL10",
      couponsIssued: 50,
      couponsUsed: 14,
      discountValueTotal: 28000,
      bookingsGenerated: 14,
      revenueGenerated: 280000,
      averageDiscount: 2000,
      profitabilityImpact: 90.0,
    },
    {
      code: "PARTYGLAM",
      couponsIssued: 80,
      couponsUsed: 22,
      discountValueTotal: 18700,
      bookingsGenerated: 22,
      revenueGenerated: 187000,
      averageDiscount: 850,
      profitabilityImpact: 90.0,
    },
  ];

  const referrals: ReferralAttributionMetric = {
    referralCodesActive: 142,
    referralsCreated: 58,
    qualifiedReferrals: 48,
    bookingsGenerated: 24,
    revenueGenerated: 380000,
    rewardValueTotal: 18000,
    conversionRate: 41.3,
    referralCac: 750,
    referralRoi: 21.11,
  };

  // 4. Service x Channel Matrix
  const serviceChannelMatrix: ServiceChannelMatrixRow[] = [
    {
      serviceName: "Royal Bridal Makeup",
      instagramLeads: 88,
      referralLeads: 32,
      organicLeads: 24,
      whatsappLeads: 28,
      topChannel: "Instagram",
    },
    {
      serviceName: "Engagement & Sagan Look",
      instagramLeads: 32,
      referralLeads: 14,
      organicLeads: 28,
      whatsappLeads: 18,
      topChannel: "Organic Search",
    },
    {
      serviceName: "Party Glam Makeup",
      instagramLeads: 22,
      referralLeads: 12,
      organicLeads: 24,
      whatsappLeads: 18,
      topChannel: "Organic Search",
    },
  ];

  // 5. Location Marketing
  const locationMarketing: LocationMarketingMetric[] = [
    {
      city: "Jaipur",
      leads: 124,
      bookings: 38,
      revenue: 520000,
      cac: 1184,
      conversionRate: 30.6,
      topService: "Royal Bridal Makeup",
      topChannel: "Instagram",
    },
    {
      city: "Jodhpur",
      leads: 98,
      bookings: 28,
      revenue: 380000,
      cac: 1285,
      conversionRate: 28.5,
      topService: "Bridal Trial & Package",
      topChannel: "Referral",
    },
    {
      city: "Udaipur Destination",
      leads: 46,
      bookings: 14,
      revenue: 350000,
      cac: 2142,
      conversionRate: 30.4,
      topService: "Destination Royal Bridal",
      topChannel: "Instagram",
    },
  ];

  const contentAttribution = calculateContentAttribution();
  const attributionQuality = calculateAttributionQuality(totalBookings);
  const alerts = generateMarketingAlerts({
    roas: overallRoas,
    cac: overallCac,
    coverage: attributionQuality.attributionCoveragePercent,
  });

  return {
    dataAsOf,
    summary,
    channels,
    contentAttribution,
    campaigns,
    coupons,
    referrals,
    serviceChannelMatrix,
    locationMarketing,
    attributionQuality,
    alerts,
  };
}
