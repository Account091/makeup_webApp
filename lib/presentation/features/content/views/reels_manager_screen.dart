import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../common/widgets/custom_button.dart';

class ReelsManagerScreen extends StatefulWidget {
  const ReelsManagerScreen({super.key});

  @override
  State<ReelsManagerScreen> createState() => _ReelsManagerScreenState();
}

class _ReelsManagerScreenState extends State<ReelsManagerScreen> {
  final List<Map<String, dynamic>> _reels = [
    {
      'id': 'reel_01',
      'platform': 'Instagram',
      'title': 'Royal Rajasthani Bridal Look',
      'url': 'https://www.instagram.com/reel/C3abc123',
      'category': 'Bridal',
      'published': true,
      'likes': 1420,
      'comments': 86,
    },
    {
      'id': 'reel_02',
      'platform': 'YouTube',
      'title': 'Pre-Wedding Dewy Makeup Tutorial',
      'url': 'https://www.youtube.com/shorts/xyz789',
      'category': 'Engagement',
      'published': true,
      'likes': 980,
      'comments': 42,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Reels & Video Content Manager',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 18),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text('Social Reel Feed',
                        style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
                    CustomButton(
                      label: '+ Add Reel',
                      onPressed: _showAddReelModal,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final width = constraints.maxWidth;
                    final int cols = width > 760 ? 2 : 1;
                    final double cardWidth = cols == 1
                        ? width
                        : (width - (cols - 1) * 16) / cols;

                    return Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      children: _reels.asMap().entries.map((entry) => SizedBox(
                        width: cardWidth,
                        child: _buildReelCard(context, entry.value, entry.key),
                      )).toList(),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReelCard(
      BuildContext context, Map<String, dynamic> reel, int index) {
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
                backgroundColor: reel['platform'] == 'Instagram'
                    ? Colors.purple.withValues(alpha: 0.15)
                    : Colors.red.withValues(alpha: 0.15),
                label: Text(
                  reel['platform'],
                  style: TextStyle(
                    color: reel['platform'] == 'Instagram'
                        ? Colors.purple
                        : Colors.red,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              Switch(
                value: reel['published'],
                activeThumbColor: AppColors.roseGold,
                onChanged: (val) {
                  setState(() => _reels[index]['published'] = val);
                },
              ),
            ],
          ),
          Text(reel['title'], style: AppTextStyles.sectionHeader),
          const SizedBox(height: 4),
          Text(reel['url'],
              style: AppTextStyles.bodySecondary
                  .copyWith(color: Colors.blue, fontSize: 11)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.favorite, size: 16, color: Colors.redAccent),
              const SizedBox(width: 4),
              Text('${reel['likes']} website likes',
                  style: AppTextStyles.bodySecondary),
              const SizedBox(width: 16),
              const Icon(Icons.comment, size: 16, color: AppColors.mutedGray),
              const SizedBox(width: 4),
              Text('${reel['comments']} comments',
                  style: AppTextStyles.bodySecondary),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddReelModal() {
    final urlController = TextEditingController();
    final titleController = TextEditingController();
    String platform = 'Instagram';
    String category = 'Bridal';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add New Reel / Video Link',
                style: AppTextStyles.headingTitle),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: platform,
              items: ['Instagram', 'YouTube']
                  .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                  .toList(),
              onChanged: (v) => platform = v!,
              decoration: const InputDecoration(
                  labelText: 'Social Platform', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlController,
              decoration: const InputDecoration(
                labelText: 'Paste Reel / Video URL',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Video Title',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: category,
              items: ['Bridal', 'Engagement', 'Party', 'Rajasthani']
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => category = v!,
              decoration: const InputDecoration(
                  labelText: 'Category', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: CustomButton(
                label: 'Save & Publish Reel',
                onPressed: () {
                  if (urlController.text.isNotEmpty) {
                    setState(() {
                      _reels.add({
                        'id': 'reel_${DateTime.now().millisecondsSinceEpoch}',
                        'platform': platform,
                        'title': titleController.text.isNotEmpty
                            ? titleController.text
                            : 'New Video Showcase',
                        'url': urlController.text,
                        'category': category,
                        'published': true,
                        'likes': 0,
                        'comments': 0,
                      });
                    });
                    Navigator.pop(context);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
