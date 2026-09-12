class MarketplaceSettlementEntity {
  final String settlementId;
  final String orgId;
  final String artistId;
  final double grossRevenue;
  final double platformCommission;
  final double processingFee;
  final double netPayout;
  final String status; // DUE, PROCESSING, PAID
  final String period; // e.g. "2026-09-W1"
  final DateTime createdAt;

  const MarketplaceSettlementEntity({
    required this.settlementId,
    required this.orgId,
    required this.artistId,
    required this.grossRevenue,
    required this.platformCommission,
    required this.processingFee,
    required this.netPayout,
    required this.status,
    required this.period,
    required this.createdAt,
  });
}
