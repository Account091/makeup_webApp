import 'package:flutter/material.dart';

class ArtistEarningsScreen extends StatefulWidget {
  final String organizationId;

  const ArtistEarningsScreen({
    super.key,
    this.organizationId = 'org-jaipur-royal-glam',
  });

  @override
  State<ArtistEarningsScreen> createState() => _ArtistEarningsScreenState();
}

class _ArtistEarningsScreenState extends State<ArtistEarningsScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _metrics = {
    'totalGrossSales': 78000.0,
    'totalNetEarnings': 62480.0,
    'totalPlatformFees': 7100.0,
    'totalGatewayFees': 1420.0,
    'availableBalance': 15840.0,
    'settledBalance': 20240.0,
    'pendingBalance': 26400.0,
  };

  final List<Map<String, dynamic>> _ledger = [
    {
      'transactionId': 'earn-tx-001',
      'bookingId': 'bk-jaipur-001',
      'grossAmount': 25000.0,
      'netBase': 23000.0,
      'platformFee': 2300.0,
      'gatewayFee': 460.0,
      'netEarnings': 20240.0,
      'status': 'SETTLED',
      'date': '2026-09-10',
    },
    {
      'transactionId': 'earn-tx-002',
      'bookingId': 'bk-jaipur-002',
      'grossAmount': 18000.0,
      'netBase': 18000.0,
      'platformFee': 1800.0,
      'gatewayFee': 360.0,
      'netEarnings': 15840.0,
      'status': 'ELIGIBLE_FOR_SETTLEMENT',
      'date': '2026-09-12',
    },
    {
      'transactionId': 'earn-tx-003',
      'bookingId': 'bk-jaipur-003',
      'grossAmount': 35000.0,
      'netBase': 30000.0,
      'platformFee': 3000.0,
      'gatewayFee': 600.0,
      'netEarnings': 26400.0,
      'status': 'PENDING_EVENT_COMPLETION',
      'date': '2026-09-13',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final available = _metrics['availableBalance'] as double;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          'Earnings & Commission Ledger (${widget.organizationId})',
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
            // Available Balance & Request Payout Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF881337).withValues(alpha: 0.8),
                    const Color(0xFF1E293B),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Available for Settlement',
                    style: TextStyle(color: Color(0xFFF43F5E), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₹${available.toStringAsFixed(0)}',
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: available >= 1000 ? () {} : null,
                      icon: const Icon(Icons.north_east),
                      label: Text('Request Payout (₹${available.toStringAsFixed(0)})'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF43F5E),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Summary Metrics
            Row(
              children: [
                Expanded(
                  child: _buildSmallMetricCard(
                    'Net Earnings',
                    '₹${(_metrics['totalNetEarnings'] as double).toStringAsFixed(0)}',
                    const Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSmallMetricCard(
                    'Platform Fee',
                    '₹${(_metrics['totalPlatformFees'] as double).toStringAsFixed(0)}',
                    const Color(0xFFF43F5E),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSmallMetricCard(
                    'Gateway Fee',
                    '₹${(_metrics['totalGatewayFees'] as double).toStringAsFixed(0)}',
                    Colors.amber,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'Earnings Ledger Transactions',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _ledger.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final tx = _ledger[index];
                final status = tx['status'] as String;

                Color statusColor = Colors.grey;
                if (status == 'SETTLED') statusColor = const Color(0xFF10B981);
                if (status == 'ELIGIBLE_FOR_SETTLEMENT') statusColor = Colors.amber;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            tx['transactionId'].toString(),
                            style: const TextStyle(color: Color(0xFFF43F5E), fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              status.replaceAll('_', ' '),
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
                            'Gross Booking: ₹${(tx['grossAmount'] as double).toStringAsFixed(0)}',
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                          Text(
                            'Net: ₹${(tx['netEarnings'] as double).toStringAsFixed(0)}',
                            style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const Divider(color: Color(0xFF334155), height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Platform (10%): -₹${(tx['platformFee'] as double).toStringAsFixed(0)} | PG (2%): -₹${(tx['gatewayFee'] as double).toStringAsFixed(0)}',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                          Text(
                            tx['date'].toString(),
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
