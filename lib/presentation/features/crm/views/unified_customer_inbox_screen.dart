import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class UnifiedCustomerInboxScreen extends StatelessWidget {
  const UnifiedCustomerInboxScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final timelineEvents = [
      {
        'type': 'WHATSAPP',
        'title': 'WhatsApp Inquiry Received',
        'body': 'Hi Prachi, interested in booking for Nov 20 in Jodhpur.',
        'time': '10 mins ago',
        'icon': Icons.chat,
      },
      {
        'type': 'BOOKING',
        'title': 'Booking Inquiry #bk_rajputi_99 Created',
        'body': 'Royal Bridal Makeup - Base Price: ₹15,000.',
        'time': '25 mins ago',
        'icon': Icons.event_available,
      },
      {
        'type': 'PAYMENT',
        'title': 'Advance Deposit ₹5,000 Paid',
        'body': 'Paid via UPI. Gateway Txn ID: txn_ord_178912.',
        'time': '30 mins ago',
        'icon': Icons.payment,
      },
      {
        'type': 'SUPPORT_TICKET',
        'title': 'Support Ticket #tkt_801 Resolved',
        'body': 'Payment reconciliation confirmed by accountant.',
        'time': '1 hour ago',
        'icon': Icons.confirmation_number_outlined,
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
              'Unified Customer 360 Inbox',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'Priya Sharma (+91 98290 11223) - 360 Timeline Stream',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: timelineEvents.length,
        itemBuilder: (context, index) {
          final event = timelineEvents[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.softRose,
                child: Icon(event['icon'] as IconData, color: AppColors.deepPlum, size: 20),
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      event['title'].toString(),
                      style: AppTextStyles.sectionHeader.copyWith(fontSize: 13),
                    ),
                  ),
                  Text(event['time'].toString(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(event['body'].toString(), style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
              ),
            ),
          );
        },
      ),
    );
  }
}
