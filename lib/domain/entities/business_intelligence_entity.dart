class ExecutiveKpiSummary {
  final double totalRevenue;
  final double serviceRevenue;
  final double productRevenue;
  final int totalBookings;
  final int totalLeads;
  final double leadConversionRate;
  final double averageUnifiedLtv;
  final double netProfit;
  final double netProfitMarginPercent;
  final double teamUtilizationPercent;
  final double outstandingPayments;
  final double totalExpenses;

  const ExecutiveKpiSummary({
    required this.totalRevenue,
    required this.serviceRevenue,
    required this.productRevenue,
    required this.totalBookings,
    required this.totalLeads,
    required this.leadConversionRate,
    required this.averageUnifiedLtv,
    required this.netProfit,
    required this.netProfitMarginPercent,
    required this.teamUtilizationPercent,
    required this.outstandingPayments,
    required this.totalExpenses,
  });
}

class RevenueBreakdownItem {
  final String category; // Service, Package, Artist, Location, Campaign, Product
  final String label;
  final double revenue;
  final int transactionCount;
  final double percentageOfTotal;

  const RevenueBreakdownItem({
    required this.category,
    required this.label,
    required this.revenue,
    required this.transactionCount,
    required this.percentageOfTotal,
  });
}

class FunnelStageMetric {
  final String stageId;
  final String stageName;
  final int count;
  final double conversionRateFromPrevious;
  final double dropoffRatePercent;

  const FunnelStageMetric({
    required this.stageId,
    required this.stageName,
    required this.count,
    required this.conversionRateFromPrevious,
    required this.dropoffRatePercent,
  });
}

class MarketingAttributionMetric {
  final String channelOrSource; // e.g. "Instagram Reel", "Coupon", "Referral", "WhatsApp"
  final String identifier;
  final int leadsGenerated;
  final int bookingsConverted;
  final int productOrdersConverted;
  final double attributedRevenue;
  final double estimatedRoiMultiplier;

  const MarketingAttributionMetric({
    required this.channelOrSource,
    required this.identifier,
    required this.leadsGenerated,
    required this.bookingsConverted,
    required this.productOrdersConverted,
    required this.attributedRevenue,
    required this.estimatedRoiMultiplier,
  });
}

class CustomerRfmSegment {
  final String segmentName; // VIP, High Value, Repeat, New, At Risk, Inactive
  final int customerCount;
  final double averageLtv;
  final double repeatPurchaseRate;
  final String recommendedAction;

  const CustomerRfmSegment({
    required this.segmentName,
    required this.customerCount,
    required this.averageLtv,
    required this.repeatPurchaseRate,
    required this.recommendedAction,
  });
}

class TeamUtilizationMetric {
  final String artistId;
  final String artistName;
  final int bookingsHandled;
  final double totalRevenueGenerated;
  final double utilizationPercent;
  final double averageRating;
  final double cancellationRatePercent;
  final double totalEarnings;

  const TeamUtilizationMetric({
    required this.artistId,
    required this.artistName,
    required this.bookingsHandled,
    required this.totalRevenueGenerated,
    required this.utilizationPercent,
    required this.averageRating,
    required this.cancellationRatePercent,
    required this.totalEarnings,
  });
}

class EcommerceAnalyticsSummary {
  final double productRevenue;
  final int totalOrders;
  final double averageOrderValue;
  final double cartAbandonmentRatePercent;
  final double stockTurnoverRate;
  final double returnRatePercent;
  final List<String> topSellingProducts;

  const EcommerceAnalyticsSummary({
    required this.productRevenue,
    required this.totalOrders,
    required this.averageOrderValue,
    required this.cartAbandonmentRatePercent,
    required this.stockTurnoverRate,
    required this.returnRatePercent,
    required this.topSellingProducts,
  });
}

class ForecastSnapshot {
  final String period; // e.g., "2026-10"
  final int projectedBookings;
  final double projectedRevenue;
  final double projectedExpenses;
  final double projectedNetProfit;
  final int expectedInventoryDemandUnits;
  final double artistCapacityDemandPercent;
  final String confidenceLevel; // HIGH, MEDIUM, LOW

  const ForecastSnapshot({
    required this.period,
    required this.projectedBookings,
    required this.projectedRevenue,
    required this.projectedExpenses,
    required this.projectedNetProfit,
    required this.expectedInventoryDemandUnits,
    required this.artistCapacityDemandPercent,
    required this.confidenceLevel,
  });
}

class CapacityThreshold {
  final String month;
  final int maxSafeBookingLimit;
  final int currentBookedCount;
  final double capacityUtilizationPercent;
  final bool isNearCapacityAlert;

  const CapacityThreshold({
    required this.month,
    required this.maxSafeBookingLimit,
    required this.currentBookedCount,
    required this.capacityUtilizationPercent,
    required this.isNearCapacityAlert,
  });
}

class BusinessAlert {
  final String id;
  final String severity; // HIGH, MEDIUM, INFO
  final String category; // LEAD, STOCK, CAPACITY, CAMPAIGN, FINANCE
  final String title;
  final String message;
  final String actionLink;
  final DateTime createdAt;

  const BusinessAlert({
    required this.id,
    required this.severity,
    required this.category,
    required this.title,
    required this.message,
    required this.actionLink,
    required this.createdAt,
  });
}
