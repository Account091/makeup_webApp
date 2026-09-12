import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/social_content_entity.dart';

class ContentAttributionScreen extends StatelessWidget {
  ContentAttributionScreen({super.key});


  final List<SocialContentEntity> _sampleContent = [

    SocialContentEntity(
      id: 'cnt_01',
      title: 'Royal Rajasthani Royal Bridal Transformation',
      mediaUrl: 'https://instagram.com/reel/C8921x',
      thumbnailUrl: '',
      platform: SocialPlatform.instagramReel,
      category: 'Rajasthani Bridal',
      isHomepageHero: true,
      isFeaturedBridal: true,
      websiteViews: 4820,
      websiteLikes: 890,
      websiteComments: 142,
      websiteSaves: 310,
      leadsGenerated: 18,
      convertedRevenue: 345000.0,
      createdAt: DateTime.parse('2026-08-01'),
    ),
    SocialContentEntity(
      id: 'cnt_02',
      title: 'Traditional Poshak & Heavy Jewellery Draping',
      mediaUrl: 'https://instagram.com/reel/C9912y',
      thumbnailUrl: '',
      platform: SocialPlatform.instagramReel,
      category: 'Poshak',
      isTrending: true,
      websiteViews: 3100,
      websiteLikes: 540,
      websiteComments: 88,
      websiteSaves: 210,
      leadsGenerated: 12,
      convertedRevenue: 180000.0,
      createdAt: DateTime.parse('2026-08-10'),
    ),
    SocialContentEntity(
      id: 'cnt_03',
      title: 'Airbrush Soft Glam Engagement Look',
      mediaUrl: 'https://youtube.com/shorts/Yt812z',
      thumbnailUrl: '',
      platform: SocialPlatform.youtubeShorts,
      category: 'Engagement',
      websiteViews: 1950,
      websiteLikes: 320,
      websiteComments: 45,
      websiteSaves: 95,
      leadsGenerated: 6,
      convertedRevenue: 90000.0,
      createdAt: DateTime.parse('2026-08-20'),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Content-to-Revenue Attribution',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildAttributionOverviewCard(),
            const SizedBox(height: 24),
            const Text(
              'CONTENT ATTRIBUTION RANKING',
              style: TextStyle(
                color: AppPalette.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _sampleContent.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _buildAttributionTile(_sampleContent[index]);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttributionOverviewCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStat('Attributed Revenue', '₹6.15L', Colors.lightGreenAccent),
          _buildStat('Leads Generated', '36 Inquiries', AppPalette.textGold),
          _buildStat('Top Performer', 'Rajasthani Reel', Colors.white),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
      ],
    );
  }

  Widget _buildAttributionTile(SocialContentEntity content) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  content.title,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppPalette.goldAccent.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  content.category.toUpperCase(),
                  style: const TextStyle(color: AppPalette.textGold, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.remove_red_eye_outlined, size: 14, color: AppPalette.textSecondary),
                  const SizedBox(width: 4),
                  Text('${content.websiteViews} views', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                  const SizedBox(width: 12),
                  const Icon(Icons.favorite_border, size: 14, color: AppPalette.textSecondary),
                  const SizedBox(width: 4),
                  Text('${content.websiteLikes}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                ],
              ),
              Text(
                'Attributed: ₹${content.convertedRevenue.toStringAsFixed(0)}',
                style: const TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '🎯 Generated ${content.leadsGenerated} Direct Inquiries',
                  style: const TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.w600),
                ),
                const Text(
                  '1st-Party Verified',
                  style: TextStyle(color: Colors.white38, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
