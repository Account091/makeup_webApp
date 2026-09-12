import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/bridal_trial_entity.dart';

class BridalTrialScreen extends StatefulWidget {
  const BridalTrialScreen({super.key});

  @override
  State<BridalTrialScreen> createState() => _BridalTrialScreenState();
}

class _BridalTrialScreenState extends State<BridalTrialScreen> {
  late List<BridalTrialSession> _trials;

  @override
  void initState() {
    super.initState();
    _loadSampleTrials();
  }

  void _loadSampleTrials() {
    _trials = [
      BridalTrialSession(
        trialId: 'trial_901',
        customerId: 'cust_priya',
        customerName: 'Priya Sharma',
        trialType: 'IN_PERSON_TRIAL',
        scheduledAt: DateTime.now().subtract(const Duration(days: 2)),
        status: 'LOOK_APPROVED',
        productsUsed: const ['Huda Beauty Primer', 'Estee Lauder Foundation NC35', 'Anastasia Beverly Hills Palette'],
        lookTitle: 'Royal Rajputi Soft Glam Dewy Look',
        feedbackNotes: 'Customer approved lip shade and dewy finish. Requested extra hair pins.',
        isLookApproved: true,
      ),
      BridalTrialSession(
        trialId: 'trial_902',
        customerId: 'cust_ananya',
        customerName: 'Ananya Rathore',
        trialType: 'PAID_BRIDAL_TRIAL',
        scheduledAt: DateTime.now().add(const Duration(days: 3)),
        status: 'SCHEDULED',
        productsUsed: const ['Mac Studio Fix', 'Charlotte Tilbury Glow'],
        lookTitle: 'Matte Rajputi Bridal Transformation',
        feedbackNotes: 'Pre-wedding consultation trial.',
        isLookApproved: false,
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
              'Bridal Trial & Consultation Engine',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.0 Trial Makeup Sessions & Approved Look Linking',
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
            Text('Scheduled & Completed Trials (${_trials.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _trials.length,
              itemBuilder: (context, index) {
                final t = _trials[index];
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
                            Text(
                              t.customerName,
                              style: AppTextStyles.sectionHeader.copyWith(fontSize: 16),
                            ),
                            Chip(
                              backgroundColor: t.isLookApproved ? AppColors.emeraldGreen : Colors.amber.shade700,
                              label: Text(
                                t.status.replaceAll('_', ' '),
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        Text('Type: ${t.trialType.replaceAll('_', ' ')}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 12)),
                        const SizedBox(height: 8),
                        if (t.lookTitle != null)
                          Text('Look Title: ${t.lookTitle}', style: AppTextStyles.bodyPrimary.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Products Used: ${t.productsUsed.join(", ")}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.champagne,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Feedback: ${t.feedbackNotes ?? "N/A"}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
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
