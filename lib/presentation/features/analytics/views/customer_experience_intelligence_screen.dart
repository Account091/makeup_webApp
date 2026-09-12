import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class CustomerExperienceIntelligenceScreen extends StatelessWidget {
  const CustomerExperienceIntelligenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final componentRatings = {
      'Makeup Finish': 4.95,
      'Hairstyling': 4.88,
      'Poshak Draping': 4.92,
      'Communication & Courtesy': 4.90,
      'Punctuality': 4.96,
    };

    final riskPredictions = [
      {
        'name': 'Priya Sharma',
        'repeatProb': '95.0%',
        'label': 'HIGH_VALUE_LOYAL',
        'color': AppColors.emeraldGreen,
        'action': 'Assign Royal VIP concierge perks & priority booking lock.',
      },
      {
        'name': 'Ananya Rathore',
        'repeatProb': '85.0%',
        'label': 'LIKELY_REPEAT',
        'color': Colors.blue.shade700,
        'action': 'Send seasonal bridal engagement offer via WhatsApp.',
      },
      {
        'name': 'Kavita Mehta',
        'repeatProb': '42.0%',
        'label': 'AT_RISK',
        'color': Colors.orange.shade800,
        'action': 'Offer 10% returning customer discount coupon.',
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
              'Customer Experience Intelligence',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.2 CSAT, NPS Analytics & Churn Prediction Model',
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
            // CSAT & NPS Overview Row
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.deepPlum,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text('CSI Overall Score', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        const SizedBox(height: 6),
                        Text(
                          '4.93 / 5.0',
                          style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 22),
                        ),
                        const SizedBox(height: 4),
                        const Text('142 Verified Reviews', style: TextStyle(color: Colors.white60, fontSize: 9)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.emeraldGreen,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text('Net Promoter Score', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        const SizedBox(height: 6),
                        Text(
                          '+88 NPS',
                          style: AppTextStyles.headingTitle.copyWith(color: Colors.white, fontSize: 22),
                        ),
                        const SizedBox(height: 4),
                        const Text('128 Promoters | 3 Detractors', style: TextStyle(color: Colors.white70, fontSize: 9)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            Text('Granular Service Ratings Breakdown', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: componentRatings.entries.map((e) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Expanded(child: Text(e.key, style: AppTextStyles.bodyPrimary.copyWith(fontSize: 12))),
                          Icon(Icons.star, color: Colors.amber.shade700, size: 16),
                          const SizedBox(width: 4),
                          Text('${e.value} / 5.0', style: AppTextStyles.sectionHeader.copyWith(fontSize: 12, color: AppColors.deepPlum)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            const SizedBox(height: 24),
            Text('Predictive Churn & Repeat Booking Scoring', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: riskPredictions.length,
              itemBuilder: (context, index) {
                final p = riskPredictions[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: (p['color'] as Color).withValues(alpha: 0.2),
                      child: Icon(Icons.psychology, color: p['color'] as Color),
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(p['name'].toString(), style: AppTextStyles.sectionHeader.copyWith(fontSize: 13)),
                        Text('Repeat Prob: ${p['repeatProb']}', style: TextStyle(fontWeight: FontWeight.bold, color: p['color'] as Color, fontSize: 11)),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Chip(
                          backgroundColor: (p['color'] as Color).withValues(alpha: 0.15),
                          label: Text(p['label'].toString(), style: TextStyle(color: p['color'] as Color, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                        Text('AI Action: ${p['action']}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
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
