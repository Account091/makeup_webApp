import { ForecastAlertRecord } from "./forecasting-types";

export function generateForecastAlerts(params: {
  leadArtistUtilization: number;
  jaipurShortfall: number;
  cashflowNet: number;
}): ForecastAlertRecord[] {
  const alerts: ForecastAlertRecord[] = [];
  const now = new Date().toISOString();

  if (params.leadArtistUtilization > 90.0) {
    alerts.push({
      id: "alert_artist_overload_01",
      type: "ARTIST_OVERLOAD",
      title: "Lead Master Artist Overload Risk",
      description: `Prachi's projected utilization has reached ${params.leadArtistUtilization}%, leaving only 5 hours of buffer for September weekends.`,
      severity: "HIGH",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  if (params.jaipurShortfall > 0) {
    alerts.push({
      id: "alert_jaipur_capacity_01",
      type: "CITY_CAPACITY_RISK",
      title: "Jaipur Capacity Shortage Warning",
      description: `Projected demand in Jaipur (11 bookings) exceeds available slots (8 slots) by ${params.jaipurShortfall} bookings.`,
      severity: "HIGH",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  if (params.cashflowNet < 50000) {
    alerts.push({
      id: "alert_cashflow_risk_01",
      type: "CASHFLOW_RISK",
      title: "Cash-Flow Inflow Buffer Warning",
      description: "Net projected cash inflow for next 30 days is below minimum operational buffer.",
      severity: "MEDIUM",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  alerts.push({
    id: "alert_demand_spike_01",
    type: "DEMAND_SPIKE",
    title: "Upcoming Destination Bridal Demand Spike",
    description: "Peak wedding dates (Sep 25-27) exhibit VERY HIGH booking demand across Jaipur & Udaipur.",
    severity: "MEDIUM",
    status: "ACTIVE",
    detectedAt: now,
  });

  return alerts;
}
