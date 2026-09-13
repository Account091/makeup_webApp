import React from "react";
import LocationIntelligenceDashboard from "../../components/locations/LocationIntelligenceDashboard";
import { calculateLocationIntelligenceData } from "../../lib/locations/location-kpi-engine";

export const metadata = {
  title: "Multi-City & Destination Intelligence | Makeovers by Prachi Admin",
  description: "Executive Location Intelligence, Regional Pricing, Destination Quote Engine, and AI Location Analyst.",
};

export default function LocationIntelligencePage() {
  const locData = calculateLocationIntelligenceData();
  return <LocationIntelligenceDashboard initialData={locData} />;
}
