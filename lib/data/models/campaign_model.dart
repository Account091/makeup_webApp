import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/campaign_entity.dart';

class CampaignModel extends CampaignEntity {
  const CampaignModel({
    required super.id,
    required super.name,
    required super.bannerUrl,
    required super.description,
    required super.startDate,
    required super.endDate,
    super.targetAudience,
    super.couponCode,
    required super.status,
    super.impressions,
    super.clicks,
    super.conversions,
    super.revenueGenerated,
  });

  factory CampaignModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    CampaignStatus parseStatus(String? val) {
      switch (val) {
        case 'DRAFT':
          return CampaignStatus.draft;
        case 'SCHEDULED':
          return CampaignStatus.scheduled;
        case 'PAUSED':
          return CampaignStatus.paused;
        case 'EXPIRED':
          return CampaignStatus.expired;
        case 'ARCHIVED':
          return CampaignStatus.archived;
        default:
          return CampaignStatus.active;
      }
    }

    final metrics = data['metrics'] as Map<String, dynamic>? ?? {};

    return CampaignModel(
      id: doc.id,
      name: data['name'] ?? 'Seasonal Campaign',
      bannerUrl: data['bannerUrl'] ?? '',
      description: data['description'] ?? '',
      startDate: (data['startDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      endDate: (data['endDate'] as Timestamp?)?.toDate() ?? DateTime.now().add(const Duration(days: 30)),
      targetAudience: data['targetAudience'],
      couponCode: data['couponCode'],
      status: parseStatus(data['status']),
      impressions: (metrics['impressions'] as num?)?.toInt() ?? 0,
      clicks: (metrics['clicks'] as num?)?.toInt() ?? 0,
      conversions: (metrics['conversions'] as num?)?.toInt() ?? 0,
      revenueGenerated: (metrics['revenueGenerated'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'bannerUrl': bannerUrl,
      'description': description,
      'startDate': Timestamp.fromDate(startDate),
      'endDate': Timestamp.fromDate(endDate),
      'targetAudience': targetAudience,
      'couponCode': couponCode,
      'status': status.name.toUpperCase(),
      'metrics': {
        'impressions': impressions,
        'clicks': clicks,
        'conversions': conversions,
        'revenueGenerated': revenueGenerated,
      },
    };
  }
}
