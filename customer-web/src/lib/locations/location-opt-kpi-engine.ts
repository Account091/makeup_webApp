import {
  LocationOptimizationData,
  LocationTravelEfficiencyRecord,
  LocationServiceMixRow,
  LocationChannelMatrixRow,
  LocationBenchmarkRow,
  ExpansionCandidateSignal,
  LocationOptSummaryKPIs,
} from "./location-opt-types";
import { calculateLocationScores, calculateLocationGrowthScores } from "./location-score-engine";
import { generateLocationOpportunities, generateLocationOptRisks } from "./location-opportunity-engine";

export function getTravelEfficiencyRecords(): LocationTravelEfficiencyRecord[] {
  return [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      travelBookingsCount: 8,
      travelHoursTotal: 16,
      travelCostTotal: 18000,
      revenueTotal: 780000,
      travelRatioPercent: 2.3,
      efficiencyStatus: "HIGHLY_EFFICIENT",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      travelBookingsCount: 18,
      travelHoursTotal: 64,
      travelCostTotal: 65000,
      revenueTotal: 960000,
      travelRatioPercent: 6.8,
      efficiencyStatus: "HIGHLY_EFFICIENT",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      travelBookingsCount: 22,
      travelHoursTotal: 110,
      travelCostTotal: 106000,
      revenueTotal: 720000,
      travelRatioPercent: 14.7,
      efficiencyStatus: "ACCEPTABLE",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      travelBookingsCount: 14,
      travelHoursTotal: 140,
      travelCostTotal: 220000,
      revenueTotal: 1630000,
      travelRatioPercent: 13.5,
      efficiencyStatus: "ACCEPTABLE",
    },
  ];
}

export function getServiceMixRows(): LocationServiceMixRow[] {
  return [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      bridalPercent: 52,
      engagementPercent: 24,
      partyPercent: 18,
      otherPercent: 6,
      topServiceCategory: "Bridal Signature Makeover",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      bridalPercent: 48,
      engagementPercent: 28,
      partyPercent: 16,
      otherPercent: 8,
      topServiceCategory: "Royal Bridal Package",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      bridalPercent: 60,
      engagementPercent: 20,
      partyPercent: 12,
      otherPercent: 8,
      topServiceCategory: "Palace Destination Bridal",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      bridalPercent: 75,
      engagementPercent: 15,
      partyPercent: 8,
      otherPercent: 2,
      topServiceCategory: "Multi-Day Luxury Destination Suite",
    },
  ];
}

export function getChannelMatrixRows(): LocationChannelMatrixRow[] {
  return [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      instagramSharePercent: 42,
      referralSharePercent: 36,
      organicSharePercent: 14,
      whatsappSharePercent: 8,
      topChannel: "Instagram Direct",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      instagramSharePercent: 48,
      referralSharePercent: 24,
      organicSharePercent: 16,
      whatsappSharePercent: 12,
      topChannel: "Instagram Campaign",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      instagramSharePercent: 32,
      referralSharePercent: 41,
      organicSharePercent: 18,
      whatsappSharePercent: 9,
      topChannel: "Word of Mouth / Referral",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      instagramSharePercent: 55,
      referralSharePercent: 28,
      organicSharePercent: 10,
      whatsappSharePercent: 7,
      topChannel: "Instagram Luxury Showcase",
    },
  ];
}

export function getBenchmarkRows(): LocationBenchmarkRow[] {
  return [
    {
      metricLabel: "Average Booking Value",
      jodhpurValue: "₹38,500",
      jaipurValue: "₹45,200",
      udaipurValue: "₹51,000",
      destinationValue: "₹1,16,400",
    },
    {
      metricLabel: "Lead Conversion Rate",
      jodhpurValue: "34.2%",
      jaipurValue: "29.8%",
      udaipurValue: "27.5%",
      destinationValue: "22.0%",
    },
    {
      metricLabel: "Contribution Margin",
      jodhpurValue: "68.5%",
      jaipurValue: "62.4%",
      udaipurValue: "58.0%",
      destinationValue: "64.2%",
    },
    {
      metricLabel: "Capacity Utilization",
      jodhpurValue: "71.0%",
      jaipurValue: "89.0%",
      udaipurValue: "63.0%",
      destinationValue: "82.0%",
    },
    {
      metricLabel: "Customer NPS / Rating",
      jodhpurValue: "4.92 / 5.0",
      jaipurValue: "4.88 / 5.0",
      udaipurValue: "4.85 / 5.0",
      destinationValue: "4.95 / 5.0",
    },
  ];
}

export function getExpansionCandidateSignals(): ExpansionCandidateSignal[] {
  return [
    {
      candidateCity: "Ahmedabad",
      inquiriesCount: 17,
      qualifiedLeadsCount: 12,
      confirmedBookingsCount: 5,
      destinationInterestLevel: "HIGH",
      recommendation: "Strong candidate for outstation pop-up or destination partnership.",
    },
    {
      candidateCity: "Delhi NCR",
      inquiriesCount: 14,
      qualifiedLeadsCount: 9,
      confirmedBookingsCount: 4,
      destinationInterestLevel: "HIGH",
      recommendation: "High budget wedding demand. Target digital ad campaign for destination Rajasthan weddings.",
    },
    {
      candidateCity: "Jaisalmer",
      inquiriesCount: 9,
      qualifiedLeadsCount: 6,
      confirmedBookingsCount: 3,
      destinationInterestLevel: "MEDIUM",
      recommendation: "Combine travel logistics with Udaipur/Jodhpur team on desert wedding dates.",
    },
  ];
}

export function calculateLocationOptimizationData(): LocationOptimizationData {
  const scores = calculateLocationScores();
  const growth = calculateLocationGrowthScores();
  const travelEfficiency = getTravelEfficiencyRecords();
  const serviceMix = getServiceMixRows();
  const channelMatrix = getChannelMatrixRows();
  const benchmarks = getBenchmarkRows();
  const opportunities = generateLocationOpportunities();
  const risks = generateLocationOptRisks();
  const expansionSignals = getExpansionCandidateSignals();

  const totalScore = scores.reduce((sum, s) => sum + s.overallScore, 0);
  const avgScore = Math.round((totalScore / scores.length) * 10) / 10;

  const summary: LocationOptSummaryKPIs = {
    averageLocationScore: avgScore,
    topPerformingCity: "Jodhpur Flagship (Score: 88)",
    highestMarginCity: "Jodhpur (68.5% Margin)",
    highestGrowthCity: "Jaipur Market (+32.0% Revenue)",
    activeOpportunitiesCount: opportunities.length,
    activeRisksCount: risks.length,
  };

  return {
    dataAsOf: new Date().toISOString(),
    summary,
    scores,
    growth,
    travelEfficiency,
    serviceMix,
    channelMatrix,
    benchmarks,
    opportunities,
    risks,
    expansionSignals,
  };
}
