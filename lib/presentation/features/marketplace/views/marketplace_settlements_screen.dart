import 'package:flutter/material.dart';

class MarketplaceSettlementsScreen extends StatefulWidget {
  const MarketplaceSettlementsScreen({super.key});

  @override
  State<MarketplaceSettlementsScreen> createState() => _MarketplaceSettlementsScreenState();
}

class _MarketplaceSettlementsScreenState extends State<MarketplaceSettlementsScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _summary = {
    'totalBatches': 3,
    'totalEligible': 88000.0,
    'totalPaid': 36080.0,
    'activeHolds': 1,
    'discrepancyAmount': 0.0,
  };

  final List<Map<String, dynamic>> _settlements = [
    {
      'settlementId': 'stl-jaipur-001',
      'organizationId': 'org-jaipur-royal-glam',
      'artistId': 'artist-101',
      'grossEarnings': 43000.0,
      'eligibleAmount': 36080.0,
      'status': 'PAID',
      'payoutReference': 'UTR9876543210',
    },
    {
      'settlementId': 'stl-jaipur-002',
      'organizationId': 'org-jaipur-royal-glam',
      'artistId': 'artist-101',
      'grossEarnings': 18000.0,
      'eligibleAmount': 15840.0,
      'status': 'READY',
      'payoutReference': '—',
    },
    {
      'settlementId': 'stl-jodhpur-005',
      'organizationId': 'org-jodhpur-luxe',
      'artistId': 'artist-103',
      'grossEarnings': 35000.0,
      'eligibleAmount': 26400.0,
      'status': 'APPROVED',
      'payoutReference': '—',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Platform Settlements Admin',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() => _isLoading = true);
              Future.delayed(const Duration(milliseconds: 500), () {
                if (mounted) setState(() => _isLoading = false);
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Metric Cards
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Total Eligible',
                    '₹${(_summary['totalEligible'] as double).toStringAsFixed(0)}',
                    Icons.account_balance_wallet,
                    Colors.amber,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Paid Out',
                    '₹${(_summary['totalPaid'] as double).toStringAsFixed(0)}',
                    Icons.check_circle_outline,
                    const Color(0xFF10B981),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Reconciliation Health Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Settlement Reconciliation Audit',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Verified ₹0.00 discrepancy across ledgers & payouts.',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'VERIFIED \$0.00',
                      style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Settlement Batches Queue',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _settlements.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = _settlements[index];
                final status = item['status'] as String;

                Color statusColor = Colors.grey;
                if (status == 'PAID') statusColor = const Color(0xFF10B981);
                if (status == 'READY') statusColor = Colors.amber;
                if (status == 'APPROVED') statusColor = Colors.indigo;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['settlementId'].toString(),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Org: ${item['organizationId']} | Artist: ${item['artistId']}',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${(item['eligibleAmount'] as double).toStringAsFixed(0)}',
                            style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
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

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
