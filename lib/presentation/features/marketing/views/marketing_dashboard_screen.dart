import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/coupon_entity.dart';
import '../../../../domain/entities/campaign_entity.dart';

class MarketingDashboardScreen extends StatefulWidget {
  const MarketingDashboardScreen({super.key});

  @override
  State<MarketingDashboardScreen> createState() => _MarketingDashboardScreenState();
}

class _MarketingDashboardScreenState extends State<MarketingDashboardScreen> {
  final List<CouponEntity> _coupons = [
    CouponEntity(
      code: 'ROYAL10',
      description: '10% OFF on all Luxury Bridal Packages',
      discountType: DiscountType.percentage,
      discountValue: 10.0,
      minBookingValue: 20000.0,
      maxDiscountAmount: 3000.0,
      validFrom: DateTime.now().subtract(const Duration(days: 10)),
      validUntil: DateTime.now().add(const Duration(days: 60)),
      usageLimit: 50,
      usedCount: 18,
      isActive: true,
    ),
    CouponEntity(
      code: 'JODHPUR5000',
      description: 'Flat ₹5,000 OFF for Outstation Destination Weddings',
      discountType: DiscountType.fixed,
      discountValue: 5000.0,
      minBookingValue: 40000.0,
      validFrom: DateTime.now().subtract(const Duration(days: 5)),
      validUntil: DateTime.now().add(const Duration(days: 45)),
      usageLimit: 20,
      usedCount: 7,
      isActive: true,
    ),
  ];

  final List<CampaignEntity> _campaigns = [
    CampaignEntity(
      id: 'cmp_01',
      name: 'Royal Wedding Season 2026',
      bannerUrl: '',
      description: 'Exclusive bridal packages and complimentary trial sessions for winter weddings.',
      startDate: DateTime.now().subtract(const Duration(days: 15)),
      endDate: DateTime.now().add(const Duration(days: 75)),
      targetAudience: 'Bridal & Outstation',
      couponCode: 'ROYAL10',
      status: CampaignStatus.active,
      impressions: 12400,
      clicks: 850,
      conversions: 24,
      revenueGenerated: 492000.0,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppPalette.backgroundDark,
        appBar: AppBar(
          title: const Text(
            'Marketing, Coupons & Referrals',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            tabs: [
              Tab(text: 'Coupons'),
              Tab(text: 'Campaigns'),
              Tab(text: 'Referrals'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildCouponsTab(),
            _buildCampaignsTab(),
            _buildReferralsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildCouponsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ACTIVE COUPONS',
                style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              ElevatedButton.icon(
                onPressed: _showCreateCouponDialog,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Create Coupon', style: TextStyle(fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _coupons.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) => _buildCouponCard(_coupons[index]),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponCard(CouponEntity coupon) {
    final isPercentage = coupon.discountType == DiscountType.percentage;
    final discountStr = isPercentage ? '${coupon.discountValue.toStringAsFixed(0)}% OFF' : '₹${coupon.discountValue.toStringAsFixed(0)} OFF';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppPalette.goldAccent.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppPalette.goldAccent),
                ),
                child: Text(
                  coupon.code,
                  style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
              Text(
                discountStr,
                style: const TextStyle(color: Colors.lightGreenAccent, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(coupon.description, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Min spend: ₹${coupon.minBookingValue.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
              Text('Redemptions: ${coupon.usedCount} / ${coupon.usageLimit}', style: const TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCampaignsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SEASONAL CAMPAIGN PERFORMANCE',
            style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _campaigns.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final campaign = _campaigns[index];
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
                        Text(campaign.name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('ACTIVE', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(campaign.description, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                    const Divider(color: Colors.white12, height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildCampaignStat('Impressions', '${campaign.impressions}'),
                        _buildCampaignStat('Bookings', '${campaign.conversions}'),
                        _buildCampaignStat('Revenue', '₹${(campaign.revenueGenerated / 1000).toStringAsFixed(1)}K'),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCampaignStat(String label, String val) {
    return Column(
      children: [
        Text(val, style: const TextStyle(color: AppPalette.textGold, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 10)),
      ],
    );
  }

  Widget _buildReferralsTab() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.3)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('👑 BRIDAL REFERRAL PROGRAM', style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 14)),
                SizedBox(height: 6),
                Text(
                  'Existing brides earn ₹1,000 cash credit for every successful bridal booking referred using their unique referral link.',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('TOP REFERRERS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          _buildReferrerTile('Priya Sharma', 'Code: PRIYA1000', '4 Successful Referrals', '₹4,000 Reward Paid'),
          _buildReferrerTile('Ananya Rathore', 'Code: ANANYA1000', '2 Successful Referrals', '₹2,000 Reward Pending'),
        ],
      ),
    );
  }

  Widget _buildReferrerTile(String name, String code, String count, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
              Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              Text('$code • $count', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
            ],
          ),
          Text(status, style: const TextStyle(color: AppPalette.textGold, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _showCreateCouponDialog() {
    final codeController = TextEditingController(text: 'FESTIVE2026');
    final descController = TextEditingController(text: 'Festive Season Special Offer');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Create New Authoritative Coupon'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Coupon Code')),
            TextField(controller: descController, decoration: const InputDecoration(labelText: 'Description')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Coupon published to Firestore.')));
            },
            child: const Text('Publish Coupon'),
          ),
        ],
      ),
    );
  }
}
