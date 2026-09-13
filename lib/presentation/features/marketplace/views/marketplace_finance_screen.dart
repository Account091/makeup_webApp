import 'package:flutter/material.dart';

class MarketplaceFinanceScreen extends StatefulWidget {
  const MarketplaceFinanceScreen({super.key});

  @override
  State<MarketplaceFinanceScreen> createState() => _MarketplaceFinanceScreenState();
}

class _MarketplaceFinanceScreenState extends State<MarketplaceFinanceScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _summary = {
    'totalGMV': 450000.0,
    'totalPlatformCommission': 45000.0,
    'totalGatewayFees': 9000.0,
    'totalArtistEarnings': 396000.0,
    'eligibleSettlementAmount': 125000.0,
    'completedSettlementsAmount': 271000.0,
    'pendingDisputesCount': 0,
    'discrepancyCount': 0,
  };

  final List<Map<String, dynamic>> _settlementCandidates = [
    {
      'candidateId': 'cand-001',
      'organizationId': 'org-jaipur-royal-glam',
      'artistId': 'artist-101',
      'bookingId': 'bk-jaipur-001',
      'netArtistEarnings': 20240.0,
      'currency': 'INR',
      'eligible': true,
      'rejectionReason': null,
    },
    {
      'candidateId': 'cand-002',
      'organizationId': 'org-jaipur-royal-glam',
      'artistId': 'artist-101',
      'bookingId': 'bk-jaipur-002',
      'netArtistEarnings': 15840.0,
      'currency': 'INR',
      'eligible': true,
      'rejectionReason': null,
    },
    {
      'candidateId': 'cand-003',
      'organizationId': 'org-jodhpur-luxe',
      'artistId': 'artist-103',
      'bookingId': 'bk-jodhpur-005',
      'netArtistEarnings': 800.0,
      'currency': 'INR',
      'eligible': false,
      'rejectionReason': 'MINIMUM_THRESHOLD_NOT_MET (₹800 < ₹1,000)',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Marketplace Financial Admin',
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
            // KPI Summary Grid
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Total GMV',
                    '₹${(_summary['totalGMV'] as double).toStringAsFixed(0)}',
                    Icons.payments,
                    const Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Platform Revenue',
                    '₹${(_summary['totalPlatformCommission'] as double).toStringAsFixed(0)}',
                    Icons.account_balance_wallet,
                    const Color(0xFFF43F5E),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Artist Earnings',
                    '₹${(_summary['totalArtistEarnings'] as double).toStringAsFixed(0)}',
                    Icons.people_alt,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Eligible Payouts',
                    '₹${(_summary['eligibleSettlementAmount'] as double).toStringAsFixed(0)}',
                    Icons.check_circle_outline,
                    Colors.amber,
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
                          'Commission Reconciliation Engine',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Zero discrepancy across booking ledger, gateway fees & payouts.',
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
                      'VERIFIED 100%',
                      style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Settlement Candidates Section
            const Text(
              'Settlement Queue Candidates',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _settlementCandidates.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = _settlementCandidates[index];
                final isEligible = item['eligible'] as bool;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isEligible
                          ? Colors.amber.withValues(alpha: 0.4)
                          : Colors.red.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${item['candidateId']} (${item['bookingId']})',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Org: ${item['organizationId']} | Artist: ${item['artistId']}',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                          if (!isEligible) ...[
                            const SizedBox(height: 4),
                            Text(
                              item['rejectionReason'].toString(),
                              style: TextStyle(color: Colors.red.shade300, fontSize: 11, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${(item['netArtistEarnings'] as double).toStringAsFixed(0)}',
                            style: TextStyle(
                              color: isEligible ? Colors.amber : Colors.grey,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: isEligible
                                  ? Colors.amber.withValues(alpha: 0.15)
                                  : Colors.red.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isEligible ? 'ELIGIBLE' : 'HOLD',
                              style: TextStyle(
                                color: isEligible ? Colors.amber : Colors.red,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
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
