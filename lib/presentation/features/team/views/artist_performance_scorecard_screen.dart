import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/artist_performance_entity.dart';

class ArtistPerformanceScorecardScreen extends StatefulWidget {
  const ArtistPerformanceScorecardScreen({super.key});

  @override
  State<ArtistPerformanceScorecardScreen> createState() => _ArtistPerformanceScorecardScreenState();
}

class _ArtistPerformanceScorecardScreenState extends State<ArtistPerformanceScorecardScreen> {
  late List<ArtistPerformanceScorecard> _scorecards;

  @override
  void initState() {
    super.initState();
    _loadSampleScorecards();
  }

  void _loadSampleScorecards() {
    _scorecards = [
      const ArtistPerformanceScorecard(
        artistId: 'art_101',
        artistName: 'Prachi (Head Artist)',
        averageRating: 4.98,
        checklistCompletionPercent: 100.0,
        punctualityPercent: 99.5,
        totalAppointmentsCompleted: 120,
        clientRetentionPercent: 95.4,
        performanceGrade: 'PLATINUM',
      ),
      const ArtistPerformanceScorecard(
        artistId: 'art_102',
        artistName: 'Ritu (Senior Hair Artist)',
        averageRating: 4.90,
        checklistCompletionPercent: 98.5,
        punctualityPercent: 97.8,
        totalAppointmentsCompleted: 85,
        clientRetentionPercent: 90.2,
        performanceGrade: 'GOLD',
      ),
      const ArtistPerformanceScorecard(
        artistId: 'art_103',
        artistName: 'Anita (Draping Specialist)',
        averageRating: 4.92,
        checklistCompletionPercent: 99.0,
        punctualityPercent: 98.2,
        totalAppointmentsCompleted: 92,
        clientRetentionPercent: 91.5,
        performanceGrade: 'GOLD',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Artist Performance Scorecard',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.2 Staff Quality, Punctuality & SOP Checklist Leaderboard',
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
            Text('Artist Leaderboard (${_scorecards.length} Staff Members)', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _scorecards.length,
              itemBuilder: (context, index) {
                final sc = _scorecards[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(sc.artistName, style: AppTextStyles.sectionHeader.copyWith(fontSize: 15)),
                            Chip(
                              backgroundColor: sc.performanceGrade == 'PLATINUM' ? AppColors.roseGold : AppColors.deepPlum,
                              label: Text(sc.performanceGrade, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.star, color: Colors.amber.shade700, size: 16),
                            const SizedBox(width: 4),
                            Text('Rating: ${sc.averageRating} / 5.0', style: AppTextStyles.bodyPrimary.copyWith(fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(width: 16),
                            Text('Completed: ${sc.totalAppointmentsCompleted} Events', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('SOP Checklist: ${sc.checklistCompletionPercent}%', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                            Text('Punctuality: ${sc.punctualityPercent}%', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                            Text('Retention: ${sc.clientRetentionPercent}%', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                          ],
                        ),
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
