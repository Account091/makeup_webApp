import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';

class FollowUpQueueScreen extends StatelessWidget {
  const FollowUpQueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Follow-Up Queue Today',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppPalette.surfaceDark,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.notifications_active, color: AppPalette.textGold, size: 20),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      '3 high-priority follow-ups recommended based on customer interaction activity.',
                      style: TextStyle(color: AppPalette.textSecondary, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'FOLLOW-UP TODAY',
              style: TextStyle(
                color: AppPalette.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            _buildFollowUpCard(
              customerName: 'Priya Sharma',
              service: 'Bridal Makeup • 20 Nov',
              quoteText: 'Quote: ₹20,500',
              depositStatus: 'Deposit: Pending',
              lastContact: 'Last contact: 18 hours ago',
              phone: '+919876543210',
              isHighPriority: true,
            ),
            const SizedBox(height: 12),
            _buildFollowUpCard(
              customerName: 'Ananya Rathore',
              service: 'Engagement • 05 Dec',
              quoteText: 'Quote: ₹35,000',
              depositStatus: 'Quote Sent: Expiring in 4h',
              lastContact: 'Last contact: 1 day ago',
              phone: '+919876543211',
              isHighPriority: false,
            ),
            const SizedBox(height: 12),
            _buildFollowUpCard(
              customerName: 'Neha Verma',
              service: 'Party Makeup Batch • 12 Nov',
              quoteText: 'Quote: ₹18,000',
              depositStatus: 'Deposit: Pending',
              lastContact: 'Last contact: 2 days ago',
              phone: '+919876543213',
              isHighPriority: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFollowUpCard({
    required String customerName,
    required String service,
    required String quoteText,
    required String depositStatus,
    required String lastContact,
    required String phone,
    required bool isHighPriority,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isHighPriority ? AppPalette.goldAccent : Colors.white10,
          width: isHighPriority ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                customerName,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              if (isHighPriority)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.redAccent),
                  ),
                  child: const Text(
                    'HIGH PRIORITY',
                    style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(service, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 13)),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(quoteText, style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(width: 12),
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(color: Colors.white30, shape: BoxShape.circle),
              ),
              const SizedBox(width: 12),
              Text(depositStatus, style: const TextStyle(color: Colors.amber, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 6),
          Text(lastContact, style: const TextStyle(color: Colors.white38, fontSize: 11)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.chat_bubble_outline, size: 16, color: Colors.white),
                  label: const Text('WhatsApp', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366), // WhatsApp Green
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.phone, size: 16, color: AppPalette.textGold),
                  label: const Text('Call', style: TextStyle(fontSize: 12, color: AppPalette.textGold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppPalette.goldAccent),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.calendar_today, size: 16, color: Colors.white70),
                  label: const Text('Open Booking', style: TextStyle(fontSize: 11, color: Colors.white)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white24),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
