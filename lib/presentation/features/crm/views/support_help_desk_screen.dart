import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/support_ticket_entity.dart';

class SupportHelpDeskScreen extends StatefulWidget {
  const SupportHelpDeskScreen({super.key});

  @override
  State<SupportHelpDeskScreen> createState() => _SupportHelpDeskScreenState();
}

class _SupportHelpDeskScreenState extends State<SupportHelpDeskScreen> {
  late List<SupportTicket> _tickets;

  @override
  void initState() {
    super.initState();
    _loadSampleTickets();
  }

  void _loadSampleTickets() {
    _tickets = [
      SupportTicket(
        ticketId: 'tkt_801',
        customerId: 'cust_priya',
        customerName: 'Priya Sharma',
        category: 'PAYMENT',
        priority: 'HIGH',
        subject: 'Payment deducted via UPI but deposit status shows pending',
        description: 'Transferred ₹5,000 via GooglePay. Transaction reference: UPI/12345678.',
        status: 'IN_PROGRESS',
        assignedStaffName: 'Prachi (Admin)',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      SupportTicket(
        ticketId: 'tkt_802',
        customerId: 'cust_ananya',
        customerName: 'Ananya Rathore',
        category: 'BOOKING',
        priority: 'MEDIUM',
        subject: 'Request to change ready-by time from 12:00 PM to 1:30 PM',
        description: 'Varmala schedule delayed by 1 hour at venue.',
        status: 'OPEN',
        assignedStaffName: 'Unassigned',
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
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
              'Support & Help Desk Console',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.0 Omnichannel Customer Tickets & SLA Tracking',
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
            Text('Support Tickets (${_tickets.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _tickets.length,
              itemBuilder: (context, index) {
                final t = _tickets[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: t.priority == 'HIGH' ? Colors.red.shade100 : AppColors.softRose,
                      child: Icon(
                        t.priority == 'HIGH' ? Icons.priority_high : Icons.confirmation_number_outlined,
                        color: t.priority == 'HIGH' ? Colors.red : AppColors.deepPlum,
                      ),
                    ),
                    title: Text(t.subject, style: AppTextStyles.sectionHeader.copyWith(fontSize: 13)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Customer: ${t.customerName} (${t.category})', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                        Text('Assigned: ${t.assignedStaffName}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
                      ],
                    ),
                    trailing: Chip(
                      backgroundColor: t.status == 'OPEN' ? Colors.orange : AppColors.emeraldGreen,
                      label: Text(
                        t.status,
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
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
