import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class WhatsappDashboardScreen extends StatefulWidget {
  const WhatsappDashboardScreen({super.key});

  @override
  State<WhatsappDashboardScreen> createState() =>
      _WhatsappDashboardScreenState();
}

class _WhatsappDashboardScreenState extends State<WhatsappDashboardScreen> {
  final List<Map<String, dynamic>> _automationLogs = [
    {
      'id': 'evt_01',
      'trigger': 'New Inquiry Acknowledgment',
      'client': 'Priya Sharma (+91 98290 12345)',
      'status': 'Read',
      'time': '10 mins ago',
    },
    {
      'id': 'evt_02',
      'trigger': 'Quote & Payment Link Sent',
      'client': 'Ananya Rathore (+91 94140 67890)',
      'status': 'Delivered',
      'time': '2 hours ago',
    },
    {
      'id': 'evt_03',
      'trigger': '48-Hour Skincare Preparation Guide',
      'client': 'Kavita Mehta (+91 97850 54321)',
      'status': 'Sent',
      'time': '5 hours ago',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'WhatsApp Cloud API & Automation Engine',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('WhatsApp Automation Center',
                style: AppTextStyles.headingDisplay.copyWith(fontSize: 20)),
            const SizedBox(height: 4),
            Text(
                'Track automated message journeys, delivery statistics, and communication audit logs.',
                style: AppTextStyles.bodySecondary),
            const SizedBox(height: 16),

            // Statistics Bar
            Row(
              children: [
                Expanded(
                  child: _buildStatTile('Sent', '1,248', Colors.blue),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildStatTile('Delivered', '1,194', AppColors.emeraldGreen),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildStatTile('Read', '983', AppColors.roseGold),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Automation Trigger Rules Toggles
            Text('Configured Journey Triggers',
                style: AppTextStyles.headingTitle.copyWith(fontSize: 18)),
            const SizedBox(height: 8),
            _buildRuleToggle('Inquiry Acknowledgment', 'Send instant WhatsApp greeting on form submission', true),
            _buildRuleToggle('Quote Delivery Card', 'Send quote breakdown with [Pay Advance] button', true),
            _buildRuleToggle('Deposit Pending Reminder', 'Remind +4h & +24h before date release', true),
            _buildRuleToggle('Pre-Event 48h Skincare Prep', 'Send skincare preparation guidelines', true),
            _buildRuleToggle('24h Appointment Confirm', 'Request 1-tap appointment confirmation', true),
            const SizedBox(height: 24),

            // Audit Logs (automationEvents collection)
            Text('`automationEvents` Delivery Logs',
                style: AppTextStyles.headingTitle.copyWith(fontSize: 18)),
            const SizedBox(height: 8),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _automationLogs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final log = _automationLogs[index];
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.lightBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(log['trigger'], style: AppTextStyles.sectionHeader),
                          Text(log['client'], style: AppTextStyles.bodySecondary),
                        ],
                      ),
                      Chip(
                        backgroundColor: log['status'] == 'Read'
                            ? AppColors.roseGold.withValues(alpha: 0.15)
                            : Colors.blue.withValues(alpha: 0.15),
                        label: Text(
                          '${log['status']} • ${log['time']}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: log['status'] == 'Read'
                                ? AppColors.roseGold
                                : Colors.blue,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatTile(String label, String count, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        children: [
          Text(count,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: AppTextStyles.bodySecondary),
        ],
      ),
    );
  }

  Widget _buildRuleToggle(String title, String subtitle, bool initialVal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: SwitchListTile(
        title: Text(title, style: AppTextStyles.sectionHeader),
        subtitle: Text(subtitle, style: AppTextStyles.bodySecondary),
        value: initialVal,
        activeThumbColor: AppColors.roseGold,
        onChanged: (val) {},
      ),
    );
  }
}
