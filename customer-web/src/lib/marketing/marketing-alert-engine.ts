import { MarketingAlertRecord } from "./marketing-types";

export function generateMarketingAlerts(params: {
  roas: number;
  cac: number;
  coverage: number;
}): MarketingAlertRecord[] {
  const alerts: MarketingAlertRecord[] = [];
  const now = new Date().toISOString();

  if (params.roas < 6.0) {
    alerts.push({
      id: "alert_roas_drop_01",
      type: "ROAS_DROP",
      title: "ROAS Warning Threshold",
      description: `Current ROAS of ${params.roas}x is below the targeted threshold of 8.0x.`,
      severity: "HIGH",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  if (params.cac > 2000) {
    alerts.push({
      id: "alert_cac_spike_01",
      type: "CAC_SPIKE",
      title: "Customer Acquisition Cost Spike",
      description: `Average CAC has reached ₹${params.cac}, elevated by destination campaign spending.`,
      severity: "MEDIUM",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  if (params.coverage < 70.0) {
    alerts.push({
      id: "alert_attr_coverage_01",
      type: "ATTRIBUTION_COVERAGE_DROP",
      title: "Attribution Coverage Drop",
      description: `Attribution coverage is at ${params.coverage}%, indicating un-tracked direct/organic bookings.`,
      severity: "MEDIUM",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  // Always include baseline marketing operational alerts
  alerts.push({
    id: "alert_budget_01",
    type: "CAMPAIGN_BUDGET_RISK",
    title: "Destination Jaipur Campaign 80% Budget Reached",
    description: "Campaign 'Destination Bridal Jaipur' has utilized ₹20,000 of allocated ₹25,000 budget.",
    severity: "LOW",
    status: "ACTIVE",
    detectedAt: now,
  });

  return alerts;
}
