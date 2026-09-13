import 'package:flutter/material.dart';

class ArtistPayoutScreen extends StatefulWidget {
  final String artistId;

  const ArtistPayoutScreen({
    super.key,
    this.artistId = 'artist-101',
  });

  @override
  State<ArtistPayoutScreen> createState() => _ArtistPayoutScreenState();
}

class _ArtistPayoutScreenState extends State<ArtistPayoutScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _summary = {
    'availableTotal': 15840.0,
    'holdsTotal': 0.0,
    'processingTotal': 0.0,
    'paidTotal': 36080.0,
  };

  final List<Map<String, dynamic>> _settlements = [
    {
      'settlementId': 'stl-jaipur-001',
      'period': 'Sep 1 – Sep 7',
      'grossEarnings': 43000.0,
      'holds': 0.0,
      'eligibleAmount': 36080.0,
      'status': 'PAID',
      'payoutReference': 'UTR9876543210',
      'paidAt': '2026-09-08',
    },
    {
      'settlementId': 'stl-jaipur-002',
      'period': 'Sep 8 – Sep 14',
      'grossEarnings': 18000.0,
      'holds': 0.0,
      'eligibleAmount': 15840.0,
      'status': 'READY',
      'payoutReference': 'Pending Transfer',
      'paidAt': '—',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          'Artist Settlements (${widget.artistId})',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
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
            // Available Balance Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF065F46).withValues(alpha: 0.8),
                    const Color(0xFF1E293B),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Available for Next Payout',
                    style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₹${(_summary['availableTotal'] as double).toStringAsFixed(0)}',
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Bank Profile: HDFC Bank (•••• 9410) • VERIFIED',
                    style: TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Summary Metric Grid
            Row(
              children: [
                Expanded(
                  child: _buildSmallMetricCard(
                    'Paid Out',
                    '₹${(_summary['paidTotal'] as double).toStringAsFixed(0)}',
                    const Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSmallMetricCard(
                    'Processing',
                    '₹${(_summary['processingTotal'] as double).toStringAsFixed(0)}',
                    Colors.indigo,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSmallMetricCard(
                    'On Hold',
                    '₹${(_summary['holdsTotal'] as double).toStringAsFixed(0)}',
                    Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'Settlement Batches',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _settlements.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = _settlements[index];
                final status = item['status'] as String;

                Color statusColor = Colors.grey;
                if (status == 'PAID') statusColor = const Color(0xFF10B981);
                if (status == 'READY') statusColor = Colors.amber;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item['settlementId'].toString(),
                            style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
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
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Period: ${item['period']}',
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                          Text(
                            'Net: ₹${(item['eligibleAmount'] as double).toStringAsFixed(0)}',
                            style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const Divider(color: Color(0xFF334155), height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Ref: ${item['payoutReference']}',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                          Text(
                            item['paidAt'].toString(),
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
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

  Widget _buildSmallMetricCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
