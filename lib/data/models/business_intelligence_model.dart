import '../../domain/entities/business_intelligence_entity.dart';

class ExecutiveKpiSummaryModel extends ExecutiveKpiSummary {
  const ExecutiveKpiSummaryModel({
    required super.totalRevenue,
    required super.serviceRevenue,
    required super.productRevenue,
    required super.totalBookings,
    required super.totalLeads,
    required super.leadConversionRate,
    required super.averageUnifiedLtv,
    required super.netProfit,
    required super.netProfitMarginPercent,
    required super.teamUtilizationPercent,
    required super.outstandingPayments,
    required super.totalExpenses,
  });

  factory ExecutiveKpiSummaryModel.fromJson(Map<String, dynamic> json) {
    return ExecutiveKpiSummaryModel(
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      serviceRevenue: (json['serviceRevenue'] as num?)?.toDouble() ?? 0.0,
      productRevenue: (json['productRevenue'] as num?)?.toDouble() ?? 0.0,
      totalBookings: json['totalBookings'] as int? ?? 0,
      totalLeads: json['totalLeads'] as int? ?? 0,
      leadConversionRate: (json['leadConversionRate'] as num?)?.toDouble() ?? 0.0,
      averageUnifiedLtv: (json['averageUnifiedLtv'] as num?)?.toDouble() ?? 0.0,
      netProfit: (json['netProfit'] as num?)?.toDouble() ?? 0.0,
      netProfitMarginPercent: (json['netProfitMarginPercent'] as num?)?.toDouble() ?? 0.0,
      teamUtilizationPercent: (json['teamUtilizationPercent'] as num?)?.toDouble() ?? 0.0,
      outstandingPayments: (json['outstandingPayments'] as num?)?.toDouble() ?? 0.0,
      totalExpenses: (json['totalExpenses'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalRevenue': totalRevenue,
      'serviceRevenue': serviceRevenue,
      'productRevenue': productRevenue,
      'totalBookings': totalBookings,
      'totalLeads': totalLeads,
      'leadConversionRate': leadConversionRate,
      'averageUnifiedLtv': averageUnifiedLtv,
      'netProfit': netProfit,
      'netProfitMarginPercent': netProfitMarginPercent,
      'teamUtilizationPercent': teamUtilizationPercent,
      'outstandingPayments': outstandingPayments,
      'totalExpenses': totalExpenses,
    };
  }
}

class RevenueBreakdownItemModel extends RevenueBreakdownItem {
  const RevenueBreakdownItemModel({
    required super.category,
    required super.label,
    required super.revenue,
    required super.transactionCount,
    required super.percentageOfTotal,
  });

  factory RevenueBreakdownItemModel.fromJson(Map<String, dynamic> json) {
    return RevenueBreakdownItemModel(
      category: json['category'] as String? ?? '',
      label: json['label'] as String? ?? '',
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
      transactionCount: json['transactionCount'] as int? ?? 0,
      percentageOfTotal: (json['percentageOfTotal'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'label': label,
      'revenue': revenue,
      'transactionCount': transactionCount,
      'percentageOfTotal': percentageOfTotal,
    };
  }
}

class FunnelStageMetricModel extends FunnelStageMetric {
  const FunnelStageMetricModel({
    required super.stageId,
    required super.stageName,
    required super.count,
    required super.conversionRateFromPrevious,
    required super.dropoffRatePercent,
  });

  factory FunnelStageMetricModel.fromJson(Map<String, dynamic> json) {
    return FunnelStageMetricModel(
      stageId: json['stageId'] as String? ?? '',
      stageName: json['stageName'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      conversionRateFromPrevious: (json['conversionRateFromPrevious'] as num?)?.toDouble() ?? 0.0,
      dropoffRatePercent: (json['dropoffRatePercent'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stageId': stageId,
      'stageName': stageName,
      'count': count,
      'conversionRateFromPrevious': conversionRateFromPrevious,
      'dropoffRatePercent': dropoffRatePercent,
    };
  }
}

class MarketingAttributionMetricModel extends MarketingAttributionMetric {
  const MarketingAttributionMetricModel({
    required super.channelOrSource,
    required super.identifier,
    required super.leadsGenerated,
    required super.bookingsConverted,
    required super.productOrdersConverted,
    required super.attributedRevenue,
    required super.estimatedRoiMultiplier,
  });

  factory MarketingAttributionMetricModel.fromJson(Map<String, dynamic> json) {
    return MarketingAttributionMetricModel(
      channelOrSource: json['channelOrSource'] as String? ?? '',
      identifier: json['identifier'] as String? ?? '',
      leadsGenerated: json['leadsGenerated'] as int? ?? 0,
      bookingsConverted: json['bookingsConverted'] as int? ?? 0,
      productOrdersConverted: json['productOrdersConverted'] as int? ?? 0,
      attributedRevenue: (json['attributedRevenue'] as num?)?.toDouble() ?? 0.0,
      estimatedRoiMultiplier: (json['estimatedRoiMultiplier'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channelOrSource': channelOrSource,
      'identifier': identifier,
      'leadsGenerated': leadsGenerated,
      'bookingsConverted': bookingsConverted,
      'productOrdersConverted': productOrdersConverted,
      'attributedRevenue': attributedRevenue,
      'estimatedRoiMultiplier': estimatedRoiMultiplier,
    };
  }
}

class CustomerRfmSegmentModel extends CustomerRfmSegment {
  const CustomerRfmSegmentModel({
    required super.segmentName,
    required super.customerCount,
    required super.averageLtv,
    required super.repeatPurchaseRate,
    required super.recommendedAction,
  });

  factory CustomerRfmSegmentModel.fromJson(Map<String, dynamic> json) {
    return CustomerRfmSegmentModel(
      segmentName: json['segmentName'] as String? ?? '',
      customerCount: json['customerCount'] as int? ?? 0,
      averageLtv: (json['averageLtv'] as num?)?.toDouble() ?? 0.0,
      repeatPurchaseRate: (json['repeatPurchaseRate'] as num?)?.toDouble() ?? 0.0,
      recommendedAction: json['recommendedAction'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'segmentName': segmentName,
      'customerCount': customerCount,
      'averageLtv': averageLtv,
      'repeatPurchaseRate': repeatPurchaseRate,
      'recommendedAction': recommendedAction,
    };
  }
}

class TeamUtilizationMetricModel extends TeamUtilizationMetric {
  const TeamUtilizationMetricModel({
    required super.artistId,
    required super.artistName,
    required super.bookingsHandled,
    required super.totalRevenueGenerated,
    required super.utilizationPercent,
    required super.averageRating,
    required super.cancellationRatePercent,
    required super.totalEarnings,
  });

  factory TeamUtilizationMetricModel.fromJson(Map<String, dynamic> json) {
    return TeamUtilizationMetricModel(
      artistId: json['artistId'] as String? ?? '',
      artistName: json['artistName'] as String? ?? '',
      bookingsHandled: json['bookingsHandled'] as int? ?? 0,
      totalRevenueGenerated: (json['totalRevenueGenerated'] as num?)?.toDouble() ?? 0.0,
      utilizationPercent: (json['utilizationPercent'] as num?)?.toDouble() ?? 0.0,
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      cancellationRatePercent: (json['cancellationRatePercent'] as num?)?.toDouble() ?? 0.0,
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'artistId': artistId,
      'artistName': artistName,
      'bookingsHandled': bookingsHandled,
      'totalRevenueGenerated': totalRevenueGenerated,
      'utilizationPercent': utilizationPercent,
      'averageRating': averageRating,
      'cancellationRatePercent': cancellationRatePercent,
      'totalEarnings': totalEarnings,
    };
  }
}

class EcommerceAnalyticsSummaryModel extends EcommerceAnalyticsSummary {
  const EcommerceAnalyticsSummaryModel({
    required super.productRevenue,
    required super.totalOrders,
    required super.averageOrderValue,
    required super.cartAbandonmentRatePercent,
    required super.stockTurnoverRate,
    required super.returnRatePercent,
    required super.topSellingProducts,
  });

  factory EcommerceAnalyticsSummaryModel.fromJson(Map<String, dynamic> json) {
    return EcommerceAnalyticsSummaryModel(
      productRevenue: (json['productRevenue'] as num?)?.toDouble() ?? 0.0,
      totalOrders: json['totalOrders'] as int? ?? 0,
      averageOrderValue: (json['averageOrderValue'] as num?)?.toDouble() ?? 0.0,
      cartAbandonmentRatePercent: (json['cartAbandonmentRatePercent'] as num?)?.toDouble() ?? 0.0,
      stockTurnoverRate: (json['stockTurnoverRate'] as num?)?.toDouble() ?? 0.0,
      returnRatePercent: (json['returnRatePercent'] as num?)?.toDouble() ?? 0.0,
      topSellingProducts: (json['topSellingProducts'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productRevenue': productRevenue,
      'totalOrders': totalOrders,
      'averageOrderValue': averageOrderValue,
      'cartAbandonmentRatePercent': cartAbandonmentRatePercent,
      'stockTurnoverRate': stockTurnoverRate,
      'returnRatePercent': returnRatePercent,
      'topSellingProducts': topSellingProducts,
    };
  }
}

class ForecastSnapshotModel extends ForecastSnapshot {
  const ForecastSnapshotModel({
    required super.period,
    required super.projectedBookings,
    required super.projectedRevenue,
    required super.projectedExpenses,
    required super.projectedNetProfit,
    required super.expectedInventoryDemandUnits,
    required super.artistCapacityDemandPercent,
    required super.confidenceLevel,
  });

  factory ForecastSnapshotModel.fromJson(Map<String, dynamic> json) {
    return ForecastSnapshotModel(
      period: json['period'] as String? ?? '',
      projectedBookings: json['projectedBookings'] as int? ?? 0,
      projectedRevenue: (json['projectedRevenue'] as num?)?.toDouble() ?? 0.0,
      projectedExpenses: (json['projectedExpenses'] as num?)?.toDouble() ?? 0.0,
      projectedNetProfit: (json['projectedNetProfit'] as num?)?.toDouble() ?? 0.0,
      expectedInventoryDemandUnits: json['expectedInventoryDemandUnits'] as int? ?? 0,
      artistCapacityDemandPercent: (json['artistCapacityDemandPercent'] as num?)?.toDouble() ?? 0.0,
      confidenceLevel: json['confidenceLevel'] as String? ?? 'MEDIUM',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'period': period,
      'projectedBookings': projectedBookings,
      'projectedRevenue': projectedRevenue,
      'projectedExpenses': projectedExpenses,
      'projectedNetProfit': projectedNetProfit,
      'expectedInventoryDemandUnits': expectedInventoryDemandUnits,
      'artistCapacityDemandPercent': artistCapacityDemandPercent,
      'confidenceLevel': confidenceLevel,
    };
  }
}

class CapacityThresholdModel extends CapacityThreshold {
  const CapacityThresholdModel({
    required super.month,
    required super.maxSafeBookingLimit,
    required super.currentBookedCount,
    required super.capacityUtilizationPercent,
    required super.isNearCapacityAlert,
  });

  factory CapacityThresholdModel.fromJson(Map<String, dynamic> json) {
    return CapacityThresholdModel(
      month: json['month'] as String? ?? '',
      maxSafeBookingLimit: json['maxSafeBookingLimit'] as int? ?? 0,
      currentBookedCount: json['currentBookedCount'] as int? ?? 0,
      capacityUtilizationPercent: (json['capacityUtilizationPercent'] as num?)?.toDouble() ?? 0.0,
      isNearCapacityAlert: json['isNearCapacityAlert'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'month': month,
      'maxSafeBookingLimit': maxSafeBookingLimit,
      'currentBookedCount': currentBookedCount,
      'capacityUtilizationPercent': capacityUtilizationPercent,
      'isNearCapacityAlert': isNearCapacityAlert,
    };
  }
}

class BusinessAlertModel extends BusinessAlert {
  const BusinessAlertModel({
    required super.id,
    required super.severity,
    required super.category,
    required super.title,
    required super.message,
    required super.actionLink,
    required super.createdAt,
  });

  factory BusinessAlertModel.fromJson(Map<String, dynamic> json) {
    return BusinessAlertModel(
      id: json['id'] as String? ?? '',
      severity: json['severity'] as String? ?? 'INFO',
      category: json['category'] as String? ?? 'GENERAL',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      actionLink: json['actionLink'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'severity': severity,
      'category': category,
      'title': title,
      'message': message,
      'actionLink': actionLink,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
