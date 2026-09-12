import 'package:equatable/equatable.dart';

enum SocialPlatform { instagramReel, instagramPost, youtubeShorts, youtubeVideo, gallery, beforeAfter, poshakLook }
enum ContentPublishState { draft, scheduled, published, archived }

class SocialContentEntity extends Equatable {
  final String id;
  final String title;
  final String mediaUrl;
  final String thumbnailUrl;
  final SocialPlatform platform;
  final String category; // e.g. "Rajasthani Bridal", "Poshak", "Draping"
  final bool isHomepageHero;
  final bool isFeaturedBridal;
  final bool isTrending;
  final ContentPublishState publishState;
  final DateTime? scheduledAt;

  // 1st-Party Website Engagement
  final int websiteViews;
  final int websiteLikes;
  final int websiteComments;
  final int websiteSaves;

  // Content-to-Revenue Attribution
  final int leadsGenerated;
  final double convertedRevenue;

  final DateTime createdAt;

  const SocialContentEntity({
    required this.id,
    required this.title,
    required this.mediaUrl,
    required this.thumbnailUrl,
    required this.platform,
    required this.category,
    this.isHomepageHero = false,
    this.isFeaturedBridal = false,
    this.isTrending = false,
    this.publishState = ContentPublishState.published,
    this.scheduledAt,
    this.websiteViews = 0,
    this.websiteLikes = 0,
    this.websiteComments = 0,
    this.websiteSaves = 0,
    this.leadsGenerated = 0,
    this.convertedRevenue = 0.0,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        mediaUrl,
        thumbnailUrl,
        platform,
        category,
        isHomepageHero,
        isFeaturedBridal,
        isTrending,
        publishState,
        scheduledAt,
        websiteViews,
        websiteLikes,
        websiteComments,
        websiteSaves,
        leadsGenerated,
        convertedRevenue,
        createdAt,
      ];
}
