import 'package:flutter/material.dart';

class MarketplaceAnalyticsScreen extends StatefulWidget {
  const MarketplaceAnalyticsScreen({super.key});

  @override
  State<MarketplaceAnalyticsScreen> createState() => _MarketplaceAnalyticsScreenState();
}

class _MarketplaceAnalyticsScreenState extends State<MarketplaceAnalyticsScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _mockKPIs = {
    'gmv': 1020000,
    'platformRevenue': 102000,
    'artistEarnings': 918000,
    'takeRate': 10.0,
    'bookings': 84,
    'activeOrgs': 16,
    'activeArtists': 42,
    'healthScore': 92.4,
    'reconciled': true,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Marketplace BI Analytics',
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
            // Financial Reconciliation Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF065F46).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF10B981)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Financial Reconciliation Verified',
                          style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Booking GMV (₹10.2L) = Platform Commission (10%) + Artist Share (90%) [\$0 Discrepancy]',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Top KPI Cards Grid
            Row(
              children: [
                Expanded(
                  child: _buildKPICard('Marketplace GMV', '₹${_mockKPIs['gmv']}', '↑ +14.2%', const Color(0xFF38BDF8)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKPICard('Platform Revenue', '₹${_mockKPIs['platformRevenue']}', 'Take Rate: 10.0%', const Color(0xFF818CF8)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildKPICard('Artist Net Share', '₹${_mockKPIs['artistEarnings']}', '90.0% Payout Share', const Color(0xFF34D399)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKPICard('Bookings Completed', '${_mockKPIs['bookings']}', '16 Orgs • 42 Artists', Colors.amber),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Health Score Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Marketplace Health Score',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        '${_mockKPIs['healthScore']}/100',
                        style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildHealthBar('Supply/Demand Balance', 0.88),
                  _buildHealthBar('Conversion Health', 0.91),
                  _buildHealthBar('Dispute & Safety Rate', 0.96),
                  _buildHealthBar('Rating & Trust Index', 0.95),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKPICard(String label, String value, String subtext, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(subtext, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildHealthBar(String label, double pct) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
              Text('${(pct * 100).toStringAsFixed(0)}%', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: pct,
            backgroundColor: const Color(0xFF0F172A),
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
          ),
        ],
      ),
    );
  }
}
