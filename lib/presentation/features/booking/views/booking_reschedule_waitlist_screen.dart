import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class BookingRescheduleWaitlistScreen extends StatelessWidget {
  const BookingRescheduleWaitlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final rescheduleRequests = [
      {
        'customerName': 'Ananya Rathore',
        'currentDate': '2026-11-20',
        'requestedDate': '2026-11-22',
        'status': 'PENDING_ADMIN_APPROVAL',
        'reason': 'Wedding venue dates postponed by family elders.',
      },
    ];

    final waitlist = [
      {
        'customerName': 'Meera Rajput',
        'targetDate': '2026-11-20',
        'phone': '+91 98290 55443',
        'status': 'WAITING',
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
              'Reschedule & Waitlist Engine',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.1 Self-Service Reschedule Requests & Date Waitlists',
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
            Text('Pending Reschedule Requests (${rescheduleRequests.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: rescheduleRequests.length,
              itemBuilder: (context, index) {
                final r = rescheduleRequests[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.softRose,
                      child: Icon(Icons.edit_calendar, color: AppColors.deepPlum),
                    ),
                    title: Text('${r['customerName']} (${r['currentDate']} -> ${r['requestedDate']})', style: AppTextStyles.sectionHeader.copyWith(fontSize: 13)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Reason: ${r['reason']}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                      ],
                    ),
                    trailing: Chip(
                      backgroundColor: Colors.orange,
                      label: Text(r['status'].toString(), style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
            Text('Date Waitlist Subscriptions (${waitlist.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: waitlist.length,
              itemBuilder: (context, index) {
                final w = waitlist[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.softRose,
                      child: Icon(Icons.hourglass_empty, color: AppColors.deepPlum),
                    ),
                    title: Text('${w['customerName']} - ${w['targetDate']}', style: AppTextStyles.sectionHeader.copyWith(fontSize: 13)),
                    subtitle: Text('Phone: ${w['phone']}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                    trailing: Chip(
                      backgroundColor: AppColors.emeraldGreen,
                      label: Text(w['status'].toString(), style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
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
