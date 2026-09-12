import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class UniversalAuditCenterScreen extends StatelessWidget {
  const UniversalAuditCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auditLogs = [
      {
        'actor': 'Prachi (Admin)',
        'action': 'PRODUCT_ORDER_DISPATCHED',
        'target': 'Order #ord_771',
        'details': 'Courier: Delhivery, Tracking: DLV987654321',
        'time': '12 mins ago',
        'requestId': 'req_901283',
      },
      {
        'actor': 'AI Copilot Engine',
        'action': 'WHATSAPP_DRAFT_GENERATED',
        'target': 'Lead #lead_44',
        'details': 'Drafted follow-up quote message. Pending human approval.',
        'time': '35 mins ago',
        'requestId': 'req_901244',
      },
      {
        'actor': 'Accountant',
        'action': 'FINANCIAL_PERIOD_LOCKED',
        'target': 'Period Q2-2026',
        'details': 'Locked financial period for tax filing compliance.',
        'time': '2 hours ago',
        'requestId': 'req_901102',
      },
      {
        'actor': 'System Security Engine',
        'action': 'MARKETPLACE_RISK_EVALUATED',
        'target': 'Org #org_jodhpur_1',
        'details': 'Score: 5.0 (LOW_RISK). Settlement released.',
        'time': '5 hours ago',
        'requestId': 'req_900891',
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
              'Universal Audit Center',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.0 Platform-Wide Financial, AI, Team & Security Audit Trail',
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
        itemCount: auditLogs.length,
        itemBuilder: (context, index) {
          final log = auditLogs[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        log['action'].toString(),
                        style: AppTextStyles.sectionHeader.copyWith(fontSize: 12, color: AppColors.deepPlum),
                      ),
                      Text(
                        log['time'].toString(),
                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Actor: ${log['actor']} | Target: ${log['target']}', style: AppTextStyles.bodySecondary.copyWith(fontWeight: FontWeight.bold, fontSize: 11)),
                  const SizedBox(height: 4),
                  Text(log['details'].toString(), style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('Request ID: ${log['requestId']}', style: const TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.black87)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
