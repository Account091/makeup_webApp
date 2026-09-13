import React from "react";
import MarketplaceRankingSettingsScreen from "../../../components/marketplace/MarketplaceRankingSettingsScreen";

export const metadata = {
  title: "Marketplace Ranking Rules | Platform Admin",
  description: "Configure deterministic ranking parameters, Bayesian rating smoothing, and view simulation results.",
};

export default function MarketplaceRankingAdminPage() {
  return <MarketplaceRankingSettingsScreen />;
}
