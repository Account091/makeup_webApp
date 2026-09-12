import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';

class LoyaltyProgramScreen extends StatefulWidget {
  const LoyaltyProgramScreen({super.key});

  @override
  State<LoyaltyProgramScreen> createState() => _LoyaltyProgramScreenState();
}

class _LoyaltyProgramScreenState extends State<LoyaltyProgramScreen> {
  final int _pointsBalance = 2450;
  final int _lifetimeEarned = 6800;
  final String _currentTier = 'SILVER'; // BRONZE | SILVER | GOLD | ROYAL
  final double _serviceRevenue = 25000.0;
  final double _productRevenue = 7500.0;

  final List<Map<String, dynamic>> _loyaltyTransactions = [
    {
      'type': 'PURCHASE_REWARD',
      'points': '+340',
      'title': 'Order #ord_2026_901 Reward',
      'date': '2026-09-12',
      'hash': 'sha256_loy_901',
    },
    {
      'type': 'REVIEW_REWARD',
      'points': '+100',
      'title': 'Verified Product Review Bonus',
      'date': '2026-09-10',
      'hash': 'sha256_loy_rev',
    },
    {
      'type': 'REDEMPTION',
      'points': '-250',
      'title': 'Redeemed ₹250 Discount Voucher',
      'date': '2026-09-05',
      'hash': 'sha256_loy_red',
    },
    {
      'type': 'PURCHASE_REWARD',
      'points': '+2,500',
      'title': 'Royal Bridal Service Booking',
      'date': '2026-08-20',
      'hash': 'sha256_loy_bridal',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final unifiedLtv = _serviceRevenue + _productRevenue;

    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Loyalty Wallet & Customer 360 LTV',
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
            // 1. Loyalty Tier & Points Card
            _buildLoyaltyCard(),
            const SizedBox(height: 20),

            // 2. Unified Customer 360 LTV Card
            _buildUnifiedLtvCard(unifiedLtv),
            const SizedBox(height: 24),

            // 3. Loyalty Tier Threshold Progression
            const Text('LOYALTY TIER BENCHMARKS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            _buildTierProgressTile('BRONZE', '0 – 4,999 Points', '1x Points Multiplier', _currentTier == 'BRONZE'),
            const SizedBox(height: 8),
            _buildTierProgressTile('SILVER 🥈', '5,000 – 14,999 Points', '1.25x Points + Free Shipping', _currentTier == 'SILVER'),
            const SizedBox(height: 8),
            _buildTierProgressTile('GOLD 🥇', '15,000 – 29,999 Points', '1.5x Points + Priority Booking', _currentTier == 'GOLD'),
            const SizedBox(height: 8),
            _buildTierProgressTile('ROYAL 👑', '30,000+ Points', '2x Points + Free Bridal Consultation Refill', _currentTier == 'ROYAL'),
            const SizedBox(height: 24),

            // 4. Append-Only Points Ledger
            const Text('POINTS LEDGER (APPEND-ONLY)', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _loyaltyTransactions.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final txn = _loyaltyTransactions[index];
                final isPositive = txn['points'].toString().startsWith('+');
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppPalette.surfaceDark,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(txn['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 2),
                          Text('${txn['date']} • ${txn['hash']}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 10)),
                        ],
                      ),
                      Text(
                        txn['points'],
                        style: TextStyle(color: isPositive ? Colors.lightGreenAccent : Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 14),
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

  Widget _buildLoyaltyCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppPalette.surfaceDark, AppPalette.goldAccent.withValues(alpha: 0.2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.stars, color: AppPalette.textGold, size: 22),
                  SizedBox(width: 8),
                  Text('Makeovers Rewards Club', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppPalette.goldAccent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('$_currentTier TIER', style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available Wallet Balance', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                  const SizedBox(height: 2),
                  Text('$_pointsBalance pts', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 24)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Lifetime Earned', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                  const SizedBox(height: 2),
                  Text('$_lifetimeEarned pts', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUnifiedLtvCard(double unifiedLtv) {
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
              const Text('UNIFIED CUSTOMER 360 LTV', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              Text('Total LTV: ₹${unifiedLtv.toStringAsFixed(0)}', style: const TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('• Bridal Service Revenue:', style: TextStyle(color: Colors.white70, fontSize: 12)),
              Text('₹${_serviceRevenue.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('• Cosmetics Store Purchases:', style: TextStyle(color: Colors.white70, fontSize: 12)),
              Text('₹${_productRevenue.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTierProgressTile(String tierName, String range, String perk, bool isActive) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isActive ? AppPalette.goldAccent.withValues(alpha: 0.15) : AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isActive ? AppPalette.goldAccent : Colors.white10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(tierName, style: TextStyle(color: isActive ? AppPalette.textGold : Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              Text('$range • $perk', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
            ],
          ),
          if (isActive) const Icon(Icons.check_circle, color: AppPalette.textGold, size: 18),
        ],
      ),
    );
  }
}
