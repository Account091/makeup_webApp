import 'package:equatable/equatable.dart';

enum CampaignStatus { draft, scheduled, active, paused, expired, archived }

class CampaignEntity extends Equatable {
  final String id;
  final String name;
  final String bannerUrl;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String? targetAudience; // e.g. "Bridal", "Jodhpur Outstation", "Repeat Customers"
  final String? couponCode;
  final CampaignStatus status;

  // Campaign Metrics
  final int impressions;
  final int clicks;
  final int conversions;
  final double revenueGenerated;

  const CampaignEntity({
    required this.id,
    required this.name,
    required this.bannerUrl,
    required this.description,
    required this.startDate,
    required this.endDate,
    this.targetAudience,
    this.couponCode,
    required this.status,
    this.impressions = 0,
    this.clicks = 0,
    this.conversions = 0,
    this.revenueGenerated = 0.0,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        bannerUrl,
        description,
        startDate,
        endDate,
        targetAudience,
        couponCode,
        status,
        impressions,
        clicks,
        conversions,
        revenueGenerated,
      ];
}
