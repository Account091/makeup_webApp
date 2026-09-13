import React from "react";
import DestinationWeddingCommandCenter from "../../components/destination-ops/DestinationWeddingCommandCenter";
import { calculateDestinationOpsData } from "../../lib/destination-ops/destination-wedding-engine";

export const metadata = {
  title: "Destination Wedding Operations | Makeovers by Prachi Admin",
  description: "Executive Destination Wedding Command Center, Multi-Function Itineraries, Logistics & AI Copilot.",
};

export default function DestinationOpsPage() {
  const destData = calculateDestinationOpsData();
  return <DestinationWeddingCommandCenter initialData={destData} />;
}
