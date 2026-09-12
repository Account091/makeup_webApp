import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class EventMediaCaptureScreen extends StatelessWidget {
  const EventMediaCaptureScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final mediaAssets = [
      {
        'title': 'Priya Sharma - Royal Bridal Look Shot 1',
        'tag': 'PORTFOLIO',
        'consentStatus': 'VERIFIED (Website & Instagram Allowed)',
        'time': '1 hour ago',
        'isConsentVerified': true,
      },
      {
        'title': 'Priya Sharma - Before & After Airbrush Base',
        'tag': 'BEFORE_AFTER',
        'consentStatus': 'VERIFIED (Before/After Consent Granted)',
        'time': '2 hours ago',
        'isConsentVerified': true,
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Event-Day Media Capture & Consent',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.1 Booking Asset Upload & Multi-Tier Consent Enforcement',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.lightBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user, color: AppColors.emeraldGreen, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Media Consent Status: ACTIVE', style: AppTextStyles.sectionHeader.copyWith(fontSize: 13, color: AppColors.emeraldGreen)),
                        const SizedBox(height: 2),
                        Text('Customer granted: Website ✅ | Instagram ✅ | Ads ✅ | Before/After ✅', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Text('Uploaded Booking Media (${mediaAssets.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: mediaAssets.length,
              itemBuilder: (context, index) {
                final m = mediaAssets[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.softRose,
                      child: Icon(Icons.photo_camera, color: AppColors.deepPlum),
                    ),
                    title: Text(m['title'].toString(), style: AppTextStyles.sectionHeader.copyWith(fontSize: 12)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Tag: ${m['tag']}', style: AppTextStyles.bodySecondary.copyWith(fontWeight: FontWeight.bold, fontSize: 10)),
                        Text('Consent: ${m['consentStatus']}', style: const TextStyle(fontSize: 10, color: AppColors.emeraldGreen)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
