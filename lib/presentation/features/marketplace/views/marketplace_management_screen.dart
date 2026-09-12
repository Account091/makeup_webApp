import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/marketplace_chat_entity.dart';
import '../../../../domain/entities/marketplace_settlement_entity.dart';
import '../../../../domain/entities/organization_entity.dart';

class MarketplaceManagementScreen extends StatefulWidget {
  const MarketplaceManagementScreen({super.key});

  @override
  State<MarketplaceManagementScreen> createState() =>
      _MarketplaceManagementScreenState();
}

class _MarketplaceManagementScreenState extends State<MarketplaceManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  late List<OrganizationEntity> _organizations;
  late List<MarketplaceSettlementEntity> _settlements;
  late List<MarketplaceConversation> _conversations;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadMarketplaceData();
  }

  void _loadMarketplaceData() {
    _organizations = [
      const OrganizationEntity(
        organizationId: 'org_raj_studio',
        name: 'Rajputana Heritage Bridal Studio',
        ownerId: 'user_owner_1',
        type: 'STUDIO',
        verificationStatus: 'VERIFIED',
        city: 'Jodhpur',
        rating: 4.96,
        reviewCount: 48,
        commissionRatePercent: 10.0,
      ),
      const OrganizationEntity(
        organizationId: 'org_ananya_makeup',
        name: 'Ananya Sharma Makeup Artistry',
        ownerId: 'user_owner_2',
        type: 'INDIVIDUAL_ARTIST',
        verificationStatus: 'VERIFIED',
        city: 'Jaipur',
        rating: 4.88,
        reviewCount: 32,
        commissionRatePercent: 10.0,
      ),
      const OrganizationEntity(
        organizationId: 'org_royal_draping',
        name: 'Royal Poshak Draping Specialists',
        ownerId: 'user_owner_3',
        type: 'SPECIALIST',
        verificationStatus: 'PENDING',
        city: 'Udaipur',
        rating: 4.90,
        reviewCount: 14,
        commissionRatePercent: 12.0,
      ),
    ];

    _settlements = [
      MarketplaceSettlementEntity(
        settlementId: 'stl_101',
        orgId: 'org_raj_studio',
        artistId: 'art_prachig',
        grossRevenue: 150000.0,
        platformCommission: 15000.0,
        processingFee: 3000.0,
        netPayout: 132000.0,
        status: 'PAID',
        period: '2026-09-W1',
        createdAt: DateTime.now().subtract(const Duration(days: 4)),
      ),
      MarketplaceSettlementEntity(
        settlementId: 'stl_102',
        orgId: 'org_ananya_makeup',
        artistId: 'art_ananya',
        grossRevenue: 85000.0,
        platformCommission: 8500.0,
        processingFee: 1700.0,
        netPayout: 74800.0,
        status: 'DUE',
        period: '2026-09-W2',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];

    _conversations = [
      MarketplaceConversation(
        conversationId: 'conv_1',
        customerId: 'cust_301',
        customerName: 'Meera Shekhawat',
        orgId: 'org_raj_studio',
        artistId: 'art_prachig',
        artistName: 'Prachi Gurjar (Lead)',
        lastMessage: 'Is the November 20th royalposhak bridal slot available in Jodhpur?',
        lastMessageTime: DateTime.now().subtract(const Duration(hours: 2)),
        bookingInquiryId: 'inq_801',
      ),
    ];
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _verifyOrganization(String orgId, String newStatus) {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(milliseconds: 400), () {
      setState(() {
        _isLoading = false;
        _organizations = _organizations.map((org) {
          if (org.organizationId == orgId) {
            return OrganizationEntity(
              organizationId: org.organizationId,
              name: org.name,
              ownerId: org.ownerId,
              type: org.type,
              verificationStatus: newStatus,
              city: org.city,
              rating: org.rating,
              reviewCount: org.reviewCount,
              commissionRatePercent: org.commissionRatePercent,
            );
          }
          return org;
        }).toList();
      });
    });
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
              'Beauty Marketplace Console',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V8.0 Multi-Tenant Organization & Trust Engine',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.roseGold,
          labelColor: AppColors.roseGold,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Verifications'),
            Tab(text: 'Commission Split'),
            Tab(text: 'Settlements'),
            Tab(text: 'Moderation Chat'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.roseGold),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildVerificationTab(),
                _buildCommissionTab(),
                _buildSettlementsTab(),
                _buildChatTab(),
              ],
            ),
    );
  }

  Widget _buildVerificationTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _organizations.length,
      itemBuilder: (context, index) {
        final org = _organizations[index];
        final isVerified = org.verificationStatus == 'VERIFIED';
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(org.name, style: AppTextStyles.sectionHeader),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isVerified
                            ? AppColors.emeraldGreen.withValues(alpha: 0.15)
                            : AppColors.statusAwaitingApproval.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        org.verificationStatus,
                        style: TextStyle(
                          color: isVerified
                              ? AppColors.emeraldGreen
                              : AppColors.statusAwaitingApproval,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                    'Type: ${org.type} • City: ${org.city} • Rating: ⭐ ${org.rating} (${org.reviewCount} reviews)',
                    style: AppTextStyles.bodySecondary),
                Text('Commission Split Rate: ${org.commissionRatePercent}%',
                    style: AppTextStyles.bodySecondary),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (!isVerified) ...[
                      TextButton(
                        onPressed: () => _verifyOrganization(org.organizationId, 'VERIFIED'),
                        child: const Text('APPROVE VERIFICATION', style: TextStyle(color: AppColors.emeraldGreen, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => _verifyOrganization(org.organizationId, 'REJECTED'),
                        child: const Text('REJECT', style: TextStyle(color: AppColors.statusDeclined)),
                      ),
                    ] else ...[
                      TextButton(
                        onPressed: () => _verifyOrganization(org.organizationId, 'SUSPENDED'),
                        child: const Text('SUSPEND TENANT', style: TextStyle(color: AppColors.statusDeclined)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCommissionTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Marketplace Split Model (Server Authoritative)', style: AppTextStyles.sectionHeader),
                  const SizedBox(height: 12),
                  const ListTile(
                    leading: Icon(Icons.pie_chart, color: AppColors.roseGold),
                    title: Text('Platform Commission Rate'),
                    subtitle: Text('10.0% of Gross Booking Value'),
                  ),
                  const ListTile(
                    leading: Icon(Icons.credit_card, color: AppColors.statusDepositPending),
                    title: Text('Gateway Processing Fee'),
                    subtitle: Text('2.0% Payment Processor Fee'),
                  ),
                  const ListTile(
                    leading: Icon(Icons.storefront, color: AppColors.emeraldGreen),
                    title: Text('Artist Net Settlement Share'),
                    subtitle: Text('88.0% Net Payout to Studio/Artist'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettlementsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _settlements.length,
      itemBuilder: (context, index) {
        final stl = _settlements[index];
        final isPaid = stl.status == 'PAID';
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Settlement #${stl.settlementId} (${stl.period})', style: AppTextStyles.sectionHeader),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isPaid ? AppColors.emeraldGreen.withValues(alpha: 0.15) : AppColors.statusAwaitingApproval.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        stl.status,
                        style: TextStyle(color: isPaid ? AppColors.emeraldGreen : AppColors.statusAwaitingApproval, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text('Gross Revenue: ${AppFormatters.formatCurrency(stl.grossRevenue)}', style: AppTextStyles.bodySecondary),
                Text('Platform Commission (10%): -${AppFormatters.formatCurrency(stl.platformCommission)}', style: AppTextStyles.bodySecondary.copyWith(color: AppColors.deepPlum)),
                Text('Gateway Fee (2%): -${AppFormatters.formatCurrency(stl.processingFee)}', style: AppTextStyles.bodySecondary.copyWith(color: AppColors.mutedGray)),
                const Divider(),
                Text(
                  'Artist Net Payout: ${AppFormatters.formatCurrency(stl.netPayout)}',
                  style: AppTextStyles.sectionHeader.copyWith(color: AppColors.emeraldGreen),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildChatTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _conversations.length,
      itemBuilder: (context, index) {
        final conv = _conversations[index];
        return Card(
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: AppColors.deepPlum,
              child: Icon(Icons.chat, color: AppColors.roseGold, size: 20),
            ),
            title: Text('${conv.customerName} ↔ ${conv.artistName}'),
            subtitle: Text(conv.lastMessage, maxLines: 2, overflow: TextOverflow.ellipsis),
            trailing: const Text('Active', style: TextStyle(color: AppColors.emeraldGreen, fontSize: 11)),
          ),
        );
      },
    );
  }
}
