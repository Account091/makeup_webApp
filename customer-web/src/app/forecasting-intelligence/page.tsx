import React from "react";
import ForecastingIntelligenceDashboard from "../../components/forecasting/ForecastingIntelligenceDashboard";
import { calculateForecastingIntelligenceData } from "../../lib/forecasting/forecasting-kpi-engine";

export const metadata = {
  title: "Forecasting & Capacity Intelligence | Makeovers by Prachi Admin",
  description: "Executive Forecasting Intelligence, Time-Series Revenue, Capacity Analytics, and AI Forecast Analyst.",
};

export default function ForecastingIntelligencePage() {
  const fData = calculateForecastingIntelligenceData();
  return <ForecastingIntelligenceDashboard initialData={fData} />;
}
