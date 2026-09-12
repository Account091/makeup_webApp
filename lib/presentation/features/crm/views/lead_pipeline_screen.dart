import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/lead_entity.dart';

class LeadPipelineScreen extends StatefulWidget {
  const LeadPipelineScreen({super.key});

  @override
  State<LeadPipelineScreen> createState() => _LeadPipelineScreenState();
}

class _LeadPipelineScreenState extends State<LeadPipelineScreen> {
  // Sample data representation for demonstration
  final List<LeadEntity> _leads = [
    LeadEntity(
      id: 'lead_01',
      customerId: 'cust_01',
      bookingId: 'bk_101',
      customerName: 'Priya Sharma',
      customerPhone: '+919876543210',
      status: LeadPipelineStatus.awaitingDeposit,
      serviceType: 'Bridal Makeup',
      eventDate: '2026-11-20',
      venueCity: 'Jodhpur',
      estimatedValue: 20500,
      leadScore: 85,
      classification: LeadClassification.hot,
      scoreFactors: const [
        'Peak Season Target (+25)',
        'Bridal Package (+20)',
        'Quote Viewed (+20)',
        'Payment Link Opened (+20)',
      ],
      createdAt: DateTime.now().subtract(const Duration(hours: 18)),
    ),
    LeadEntity(
      id: 'lead_02',
      customerId: 'cust_02',
      bookingId: 'bk_102',
      customerName: 'Ananya Rathore',
      customerPhone: '+919876543211',
      status: LeadPipelineStatus.quoteSent,
      serviceType: 'Engagement & Party',
      eventDate: '2026-12-05',
      venueCity: 'Jaipur (Outstation)',
      estimatedValue: 35000,
      leadScore: 65,
      classification: LeadClassification.warm,
      scoreFactors: const [
        'Outstation Package (+20)',
        'Quote Sent (+20)',
        'Fast Inquiry Response (+15)',
      ],
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    LeadEntity(
      id: 'lead_03',
      customerId: 'cust_03',
      bookingId: 'bk_103',
      customerName: 'Meera Kanwar',
      customerPhone: '+919876543212',
      status: LeadPipelineStatus.confirmed,
      serviceType: 'Royal Luxury Bridal',
      eventDate: '2026-11-15',
      venueCity: 'Jodhpur',
      estimatedValue: 45000,
      leadScore: 95,
      classification: LeadClassification.hot,
      scoreFactors: const [
        'Deposit Confirmed (+30)',
        'Bridal VIP (+20)',
        'Peak Season (+25)',
      ],
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Lead Pipeline & Intelligence',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_alt_outlined, color: AppPalette.textGold),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPipelineMetricsOverview(),
            const SizedBox(height: 24),
            const Text(
              'ACTIVE LEADS FUNNEL',
              style: TextStyle(
                color: AppPalette.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _leads.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _buildLeadCard(_leads[index]);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPipelineMetricsOverview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetricItem('Total Leads', '142', AppPalette.textPrimary),
          _buildMetricItem('Hot Leads', '28 🔥', Colors.orangeAccent),
          _buildMetricItem('Conversion Rate', '64.2%', AppPalette.textGold),
          _buildMetricItem('Est. Pipeline', '₹8.4L', Colors.lightGreenAccent),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, String value, Color valueColor) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: valueColor, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
      ],
    );
  }

  Widget _buildLeadCard(LeadEntity lead) {
    Color badgeColor;
    String badgeText;
    switch (lead.classification) {
      case LeadClassification.hot:
        badgeColor = Colors.deepOrangeAccent;
        badgeText = '🔥 HOT (${lead.leadScore})';
        break;
      case LeadClassification.warm:
        badgeColor = Colors.amber;
        badgeText = '🟡 WARM (${lead.leadScore})';
        break;
      case LeadClassification.cold:
        badgeColor = Colors.blueAccent;
        badgeText = '🔵 COLD (${lead.leadScore})';
        break;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                lead.customerName,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: badgeColor),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(color: badgeColor, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${lead.serviceType} • ${lead.eventDate} (${lead.venueCity})',
            style: const TextStyle(color: AppPalette.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Est. Quote: ₹${lead.estimatedValue.toStringAsFixed(0)}',
                style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
              ),
              Text(
                'Status: ${_formatStatus(lead.status)}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          const Divider(color: Colors.white12, height: 24),
          const Text(
            'SCORING FACTORS:',
            style: TextStyle(color: AppPalette.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: lead.scoreFactors.map((factor) {
              return Chip(
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
                backgroundColor: Colors.white.withValues(alpha: 0.05),
                label: Text(factor, style: const TextStyle(color: Colors.white70, fontSize: 10)),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  String _formatStatus(LeadPipelineStatus status) {
    switch (status) {
      case LeadPipelineStatus.awaitingDeposit:
        return 'Awaiting Deposit';
      case LeadPipelineStatus.quoteSent:
        return 'Quote Sent';
      case LeadPipelineStatus.confirmed:
        return 'Confirmed';
      default:
        return status.name;
    }
  }
}
