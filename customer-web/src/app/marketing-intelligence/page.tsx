import React from "react";
import MarketingIntelligenceDashboard from "../../components/marketing/MarketingIntelligenceDashboard";
import { calculateMarketingIntelligenceData } from "../../lib/marketing/marketing-kpi-engine";

export const metadata = {
  title: "Marketing & Attribution Intelligence | Makeovers by Prachi Admin",
  description: "Executive Marketing Intelligence, Attribution Engine, Channel CAC/ROAS, and AI Campaign Planner.",
};

export default function MarketingIntelligencePage() {
  const mData = calculateMarketingIntelligenceData();
  return <MarketingIntelligenceDashboard initialData={mData} />;
}
