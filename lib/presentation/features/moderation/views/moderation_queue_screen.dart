import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class ModerationQueueScreen extends StatefulWidget {
  const ModerationQueueScreen({super.key});

  @override
  State<ModerationQueueScreen> createState() => _ModerationQueueScreenState();
}

class _ModerationQueueScreenState extends State<ModerationQueueScreen> {
  final List<Map<String, dynamic>> _comments = [
    {
      'id': 'cmt_01',
      'user': 'Sunita Rao',
      'text': 'Loved the poshak draping! Is trial makeup included in bridal package?',
      'type': 'Comment',
      'status': 'Pending',
      'date': '2026-09-11',
    },
    {
      'id': 'rev_01',
      'user': 'Radhika Jodhpur',
      'text': 'Prachi did my engagement makeup and it was absolutely stunning! 5 stars!',
      'type': 'Review (5 Stars)',
      'status': 'Pending',
      'date': '2026-09-10',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Comments & Reviews Moderation',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Moderation Queue',
                style: AppTextStyles.headingDisplay.copyWith(fontSize: 20)),
            const SizedBox(height: 4),
            Text('Review user comments and testimonials before they go live on the website.',
                style: AppTextStyles.bodySecondary),
            const SizedBox(height: 16),
            if (_comments.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text('No pending items in moderation queue.',
                      style: AppTextStyles.bodySecondary),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _comments.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = _comments[index];
                  return _buildModerationCard(context, item, index);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildModerationCard(
      BuildContext context, Map<String, dynamic> item, int index) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Chip(
                backgroundColor: AppColors.softRose.withValues(alpha: 0.5),
                label: Text(item['type'],
                    style: AppTextStyles.bodySecondary
                        .copyWith(fontWeight: FontWeight.bold)),
              ),
              Text(item['date'], style: AppTextStyles.bodySecondary),
            ],
          ),
          const SizedBox(height: 4),
          Text(item['user'], style: AppTextStyles.sectionHeader),
          const SizedBox(height: 6),
          Text('"${item['text']}"', style: AppTextStyles.bodyPrimary),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.emeraldGreen,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {
                    setState(() => _comments.removeAt(index));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Item Approved & Published!')),
                    );
                  },
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('Approve'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.statusDeclined,
                  ),
                  onPressed: () {
                    setState(() => _comments.removeAt(index));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Item Rejected/Hidden.')),
                    );
                  },
                  icon: const Icon(Icons.close, size: 16),
                  label: const Text('Reject'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
