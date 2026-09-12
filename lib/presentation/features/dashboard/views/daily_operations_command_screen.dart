import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class DailyOperationsCommandScreen extends StatelessWidget {
  const DailyOperationsCommandScreen({super.key});

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
              'Morning Operations Command',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.1 Daily Briefing Dashboard & Action Center',
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
            // Morning Greeting Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.deepPlum,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Good Morning, Prachi! ✨',
                    style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 20),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Here is your daily operational summary for today, Saturday 12 Sept 2026.',
                    style: AppTextStyles.bodySecondary.copyWith(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Text('Today\'s Operations Overview', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 12),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.8,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildBriefingCard('Active Event-Day Sessions', '3', Icons.event_seat, AppColors.deepPlum),
                _buildBriefingCard('Bridal Trials Scheduled', '1', Icons.brush, AppColors.roseGold),
                _buildBriefingCard('Pending Payments', '₹15,000', Icons.payment, Colors.orange),
                _buildBriefingCard('Open Support Tickets', '2', Icons.headset_mic, Colors.red.shade700),
              ],
            ),

            const SizedBox(height: 24),
            Text('Action Items Requiring Immediate Attention', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            Card(
              child: ListTile(
                leading: const Icon(Icons.warning, color: Colors.orange),
                title: Text('Booking #bk_rajputi_99 has pending deposit balance', style: AppTextStyles.sectionHeader.copyWith(fontSize: 12)),
                subtitle: Text('Client: Priya Sharma | Event Date: Today', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
                trailing: const Icon(Icons.chevron_right),
              ),
            ),
            Card(
              child: ListTile(
                leading: const Icon(Icons.flight_takeoff, color: AppColors.deepPlum),
                title: Text('Outstation Travel Buffer Active', style: AppTextStyles.sectionHeader.copyWith(fontSize: 12)),
                subtitle: Text('Umaid Bhawan Palace, Jodhpur (Buffer: 12 Sept - 14 Sept)', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
                trailing: const Icon(Icons.chevron_right),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBriefingCard(String label, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(value, style: AppTextStyles.headingTitle.copyWith(fontSize: 18, color: color)),
            const SizedBox(height: 2),
            Text(label, style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
          ],
        ),
      ),
    );
  }
}
