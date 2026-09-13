import { LocationOpportunityRecord, LocationOptRiskRecord } from "./location-opt-types";

export function generateLocationOpportunities(): LocationOpportunityRecord[] {
  return [
    {
      opportunityId: "opp_jaipur_capacity",
      locationId: "jaipur",
      locationName: "Jaipur Market",
      type: "HIGH_DEMAND_LOW_CAPACITY",
      title: "Jaipur Capacity Expansion Opportunity",
      description: "Jaipur exhibits 26.4% booking growth with 89% capacity utilization (only 11% headroom remaining).",
      impactScore: 92,
      recommendedAction: "Review additional artist team allocations before increasing regional ad spend.",
    },
    {
      opportunityId: "opp_udaipur_referral",
      locationId: "udaipur",
      locationName: "Udaipur Market",
      type: "HIGH_PROFIT_LOW_MARKETING",
      title: "Udaipur Referral Leverage Opportunity",
      description: "Customer referral generates 41% of Udaipur bookings. Expand referral rewards for Udaipur brides.",
      impactScore: 84,
      recommendedAction: "Launch Udaipur bridal referral campaign with 37% available capacity headroom.",
    },
  ];
}

export function generateLocationOptRisks(): LocationOptRiskRecord[] {
  return [
    {
      riskId: "risk_jaipur_cap_shortage",
      locationId: "jaipur",
      locationName: "Jaipur Market",
      type: "CAPACITY_SHORTAGE",
      title: "Jaipur Weekend Capacity Constraint",
      description: "Projected weekend demand threatens to breach maximum artist slots during October wedding dates.",
      severity: "HIGH",
      status: "ACTIVE",
    },
    {
      riskId: "risk_dest_travel_cost",
      locationId: "destination",
      locationName: "Destination Weddings",
      type: "HIGH_TRAVEL_COST",
      title: "Outstation Flight Travel Cost Pressure",
      description: "Travel ratio is 13.5% of revenue. Ensure outstation travel fees remain server-enforced.",
      severity: "MEDIUM",
      status: "ACTIVE",
    },
  ];
}
