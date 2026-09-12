import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/social_content_entity.dart';

class SocialContentModel extends SocialContentEntity {
  const SocialContentModel({
    required super.id,
    required super.title,
    required super.mediaUrl,
    required super.thumbnailUrl,
    required super.platform,
    required super.category,
    super.isHomepageHero,
    super.isFeaturedBridal,
    super.isTrending,
    super.publishState,
    super.scheduledAt,
    super.websiteViews,
    super.websiteLikes,
    super.websiteComments,
    super.websiteSaves,
    super.leadsGenerated,
    super.convertedRevenue,
    required super.createdAt,
  });

  factory SocialContentModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    SocialPlatform parsePlatform(String? val) {
      switch (val) {
        case 'INSTAGRAM_POST':
          return SocialPlatform.instagramPost;
        case 'YOUTUBE_SHORTS':
          return SocialPlatform.youtubeShorts;
        case 'YOUTUBE_VIDEO':
          return SocialPlatform.youtubeVideo;
        case 'GALLERY':
          return SocialPlatform.gallery;
        case 'BEFORE_AFTER':
          return SocialPlatform.beforeAfter;
        case 'POSHAK_LOOK':
          return SocialPlatform.poshakLook;
        default:
          return SocialPlatform.instagramReel;
      }
    }

    ContentPublishState parseState(String? val) {
      switch (val) {
        case 'DRAFT':
          return ContentPublishState.draft;
        case 'SCHEDULED':
          return ContentPublishState.scheduled;
        case 'ARCHIVED':
          return ContentPublishState.archived;
        default:
          return ContentPublishState.published;
      }
    }

    final engagement = data['engagementMetrics'] as Map<String, dynamic>? ?? {};
    final attribution = data['attributionMetrics'] as Map<String, dynamic>? ?? {};

    return SocialContentModel(
      id: doc.id,
      title: data['title'] ?? 'Luxury Look',
      mediaUrl: data['mediaUrl'] ?? '',
      thumbnailUrl: data['thumbnailUrl'] ?? '',
      platform: parsePlatform(data['platform']),
      category: data['category'] ?? 'Bridal',
      isHomepageHero: data['isHomepageHero'] ?? false,
      isFeaturedBridal: data['isFeaturedBridal'] ?? false,
      isTrending: data['isTrending'] ?? false,
      publishState: parseState(data['publishState']),
      scheduledAt: (data['scheduledAt'] as Timestamp?)?.toDate(),
      websiteViews: (engagement['websiteViews'] as num?)?.toInt() ?? 0,
      websiteLikes: (engagement['websiteLikes'] as num?)?.toInt() ?? 0,
      websiteComments: (engagement['websiteComments'] as num?)?.toInt() ?? 0,
      websiteSaves: (engagement['websiteSaves'] as num?)?.toInt() ?? 0,
      leadsGenerated: (attribution['leadsGenerated'] as num?)?.toInt() ?? 0,
      convertedRevenue: (attribution['convertedRevenue'] as num?)?.toDouble() ?? 0.0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'mediaUrl': mediaUrl,
      'thumbnailUrl': thumbnailUrl,
      'platform': platform.name.toUpperCase(),
      'category': category,
      'isHomepageHero': isHomepageHero,
      'isFeaturedBridal': isFeaturedBridal,
      'isTrending': isTrending,
      'publishState': publishState.name.toUpperCase(),
      'scheduledAt': scheduledAt != null ? Timestamp.fromDate(scheduledAt!) : null,
      'engagementMetrics': {
        'websiteViews': websiteViews,
        'websiteLikes': websiteLikes,
        'websiteComments': websiteComments,
        'websiteSaves': websiteSaves,
      },
      'attributionMetrics': {
        'leadsGenerated': leadsGenerated,
        'convertedRevenue': convertedRevenue,
      },
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
