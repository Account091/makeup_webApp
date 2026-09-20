import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../booking/views/booking_status_screen.dart';
import '../../payment/views/admin_payment_verification_screen.dart';

class NotificationCenterScreen extends StatelessWidget {
  const NotificationCenterScreen({super.key});

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
              'Unified Notification Inbox',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'Live Cloud & Real-Time FCM Alerts',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('notifications')
            .orderBy('timestamp', descending: true)
            .limit(50)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            debugPrint('[NotificationCenter] Stream notice: ${snapshot.error}');
          }

          final docs = snapshot.data?.docs ?? [];

          if (docs.isEmpty) {
            // Fallback initial notifications when collection has no documents yet
            final fallbackList = [
              {
                'title': 'New Deposit Payment Received',
                'body': '₹7,500 paid via UPI QR for Booking #BK-2026-001 (Priya Sharma).',
                'category': 'PAYMENT',
                'time': 'Just now',
                'isUnread': true,
                'bookingId': 'BK-2026-001',
              },
              {
                'title': 'Event Timing Reminder Scheduled',
                'body': 'Tomorrow Evening Makeover reminder queued for Ananya Rathore (+91 94140 67890).',
                'category': 'REMINDER',
                'time': '15 mins ago',
                'isUnread': true,
                'bookingId': 'BK-2026-002',
              },
              {
                'title': 'New Bridal Booking Inquiry',
                'body': 'Booking #BK-2026-003 received for Pre-Wedding & Engagement Glam on 28th Nov.',
                'category': 'BOOKING',
                'time': '1 hour ago',
                'isUnread': false,
                'bookingId': 'BK-2026-003',
              },
            ];

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fallbackList.length,
              itemBuilder: (context, index) {
                final n = fallbackList[index];
                return _buildCard(
                  context,
                  title: n['title'] as String,
                  body: n['body'] as String,
                  category: n['category'] as String,
                  time: n['time'] as String,
                  isUnread: n['isUnread'] as bool,
                  bookingId: n['bookingId'] as String?,
                );
              },
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final doc = docs[index];
              final data = doc.data() as Map<String, dynamic>;
              final title = data['title']?.toString() ?? 'Notification';
              final body = data['body']?.toString() ?? '';
              final category = data['category']?.toString() ?? 'GENERAL';
              final isUnread = data['isUnread'] != false;
              final bookingId = data['bookingId']?.toString();

              String timeStr = 'Recent';
              if (data['timestamp'] is Timestamp) {
                final dt = (data['timestamp'] as Timestamp).toDate();
                final diff = DateTime.now().difference(dt);
                if (diff.inMinutes < 1) {
                  timeStr = 'Just now';
                } else if (diff.inHours < 1) {
                  timeStr = '${diff.inMinutes}m ago';
                } else if (diff.inDays < 1) {
                  timeStr = '${diff.inHours}h ago';
                } else {
                  timeStr = '${diff.inDays}d ago';
                }
              }

              return Dismissible(
                key: Key(doc.id),
                direction: DismissDirection.endToStart,
                onDismissed: (_) {
                  doc.reference.delete();
                },
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  color: Colors.red.shade400,
                  child: const Icon(Icons.delete, color: Colors.white),
                ),
                child: _buildCard(
                  context,
                  title: title,
                  body: body,
                  category: category,
                  time: timeStr,
                  isUnread: isUnread,
                  bookingId: bookingId,
                  docRef: doc.reference,
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildCard(
    BuildContext context, {
    required String title,
    required String body,
    required String category,
    required String time,
    required bool isUnread,
    String? bookingId,
    DocumentReference? docRef,
  }) {
    IconData icon;
    Color iconColor;
    Color iconBg;

    switch (category.toUpperCase()) {
      case 'PAYMENT':
        icon = Icons.payments_outlined;
        iconColor = Colors.green.shade800;
        iconBg = Colors.green.shade50;
        break;
      case 'BOOKING':
        icon = Icons.event_available;
        iconColor = AppColors.deepPlum;
        iconBg = AppColors.softRose;
        break;
      case 'REMINDER':
        icon = Icons.alarm;
        iconColor = Colors.amber.shade900;
        iconBg = Colors.amber.shade50;
        break;
      case 'WHATSAPP':
        icon = Icons.chat;
        iconColor = Colors.teal.shade800;
        iconBg = Colors.teal.shade50;
        break;
      default:
        icon = Icons.notifications;
        iconColor = AppColors.deepPlum;
        iconBg = AppColors.blushPink;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: isUnread ? Colors.white : Colors.grey.shade50,
      elevation: isUnread ? 2 : 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isUnread ? AppColors.roseGold : AppColors.lightBorder,
          width: isUnread ? 1.5 : 1,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: iconBg,
          child: Icon(icon, color: iconColor, size: 22),
        ),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: AppTextStyles.sectionHeader.copyWith(
                  fontSize: 13,
                  fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                  color: isUnread ? AppColors.deepPlum : Colors.black87,
                ),
              ),
            ),
            Row(
              children: [
                if (isUnread)
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(right: 6),
                    decoration: const BoxDecoration(
                      color: AppColors.roseGold,
                      shape: BoxShape.circle,
                    ),
                  ),
                Text(
                  time,
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(
            body,
            style: AppTextStyles.bodySecondary.copyWith(
              fontSize: 12,
              height: 1.3,
            ),
          ),
        ),
        onTap: () {
          if (docRef != null && isUnread) {
            docRef.update({'isUnread': false});
          }
          if (category.toUpperCase() == 'PAYMENT') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const AdminPaymentVerificationScreen(),
              ),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const BookingStatusScreen(),
              ),
            );
          }
        },
      ),
    );
  }
}
