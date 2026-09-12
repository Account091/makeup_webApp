import '../../domain/entities/marketplace_settlement_entity.dart';

class MarketplaceSettlementModel extends MarketplaceSettlementEntity {
  const MarketplaceSettlementModel({
    required super.settlementId,
    required super.orgId,
    required super.artistId,
    required super.grossRevenue,
    required super.platformCommission,
    required super.processingFee,
    required super.netPayout,
    required super.status,
    required super.period,
    required super.createdAt,
  });

  factory MarketplaceSettlementModel.fromJson(Map<String, dynamic> json) {
    return MarketplaceSettlementModel(
      settlementId: json['settlementId'] as String? ?? '',
      orgId: json['orgId'] as String? ?? '',
      artistId: json['artistId'] as String? ?? '',
      grossRevenue: (json['grossRevenue'] as num?)?.toDouble() ?? 0.0,
      platformCommission: (json['platformCommission'] as num?)?.toDouble() ?? 0.0,
      processingFee: (json['processingFee'] as num?)?.toDouble() ?? 0.0,
      netPayout: (json['netPayout'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'DUE',
      period: json['period'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'settlementId': settlementId,
      'orgId': orgId,
      'artistId': artistId,
      'grossRevenue': grossRevenue,
      'platformCommission': platformCommission,
      'processingFee': processingFee,
      'netPayout': netPayout,
      'status': status,
      'period': period,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
