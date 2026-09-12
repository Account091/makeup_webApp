import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class NotificationCenterScreen extends StatelessWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        'title': 'New Deposit Payment Received',
        'body': '₹5,000 paid via Razorpay for Booking #bk_rajputi_99 (Priya Sharma).',
        'category': 'PAYMENT',
        'time': '10 mins ago',
        'isUnread': true,
      },
      {
        'title': 'WhatsApp Inquiry Delivered',
        'body': 'Automated response & quote link sent to Ananya Rathore (+91 98290 88776).',
        'category': 'WHATSAPP',
        'time': '45 mins ago',
        'isUnread': true,
      },
      {
        'title': 'Inventory Alert: Airbrush Primer Low Stock',
        'body': 'Huda Beauty Primer stock count dropped to 2 units.',
        'category': 'ECOMMERCE',
        'time': '2 hours ago',
        'isUnread': false,
      },
      {
        'title': 'New Product Order Placed',
        'body': 'Order #ord_771 placed for ₹3,450 (Royal Matte Foundation & Lipstick).',
        'category': 'ORDERS',
        'time': '4 hours ago',
        'isUnread': false,
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
              'Unified Notification Inbox',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.0 Aggregated System & Customer Notifications',
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
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final n = notifications[index];
          final isUnread = n['isUnread'] as bool;
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            color: isUnread ? Colors.white : Colors.grey.shade100,
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.softRose,
                child: Icon(
                  n['category'] == 'PAYMENT'
                      ? Icons.payment
                      : n['category'] == 'WHATSAPP'
                          ? Icons.chat
                          : Icons.notifications,
                  color: AppColors.deepPlum,
                  size: 20,
                ),
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      n['title'].toString(),
                      style: AppTextStyles.sectionHeader.copyWith(
                        fontSize: 13,
                        fontWeight: isUnread ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                  Text(n['time'].toString(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(n['body'].toString(), style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
              ),
            ),
          );
        },
      ),
    );
  }
}
