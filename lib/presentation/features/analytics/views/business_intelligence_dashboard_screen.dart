import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/business_intelligence_entity.dart';

class BusinessIntelligenceDashboardScreen extends StatefulWidget {
  const BusinessIntelligenceDashboardScreen({super.key});

  @override
  State<BusinessIntelligenceDashboardScreen> createState() =>
      _BusinessIntelligenceDashboardScreenState();
}

class _BusinessIntelligenceDashboardScreenState
    extends State<BusinessIntelligenceDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  String? _aiReportResult;

  // Mocked/Serverless-derived data snapshot for UI preview
  late ExecutiveKpiSummary _kpiSummary;
  late List<RevenueBreakdownItem> _revenueBreakdown;
  late List<FunnelStageMetric> _funnelMetrics;
  late List<MarketingAttributionMetric> _marketingAttribution;
  late List<CustomerRfmSegment> _rfmSegments;
  late List<TeamUtilizationMetric> _teamUtilization;
  late EcommerceAnalyticsSummary _ecommerceSummary;
  late ForecastSnapshot _forecast;
  late CapacityThreshold _capacity;
  late List<BusinessAlert> _alerts;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 8, vsync: this);
    _loadAnalyticsData();
  }

  void _loadAnalyticsData() {
    _kpiSummary = const ExecutiveKpiSummary(
      totalRevenue: 485000.0,
      serviceRevenue: 395000.0,
      productRevenue: 90000.0,
      totalBookings: 22,
      totalLeads: 84,
      leadConversionRate: 26.19,
      averageUnifiedLtv: 32500.0,
      netProfit: 295000.0,
      netProfitMarginPercent: 60.82,
      teamUtilizationPercent: 82.5,
      outstandingPayments: 45000.0,
      totalExpenses: 190000.0,
    );

    _revenueBreakdown = const [
      RevenueBreakdownItem(
          category: 'Service',
          label: 'Royal Bridal Package',
          revenue: 240000.0,
          transactionCount: 12,
          percentageOfTotal: 49.5),
      RevenueBreakdownItem(
          category: 'Service',
          label: 'Engagement & Party Makeup',
          revenue: 155000.0,
          transactionCount: 10,
          percentageOfTotal: 31.9),
      RevenueBreakdownItem(
          category: 'Product',
          label: 'Hydrating Primer & Setting Spray',
          revenue: 54000.0,
          transactionCount: 27,
          percentageOfTotal: 11.1),
      RevenueBreakdownItem(
          category: 'Product',
          label: 'Bridal Touchup Kit',
          revenue: 36000.0,
          transactionCount: 18,
          percentageOfTotal: 7.5),
    ];

    _funnelMetrics = const [
      FunnelStageMetric(
          stageId: 's1',
          stageName: '1. Website Visitor',
          count: 1250,
          conversionRateFromPrevious: 100.0,
          dropoffRatePercent: 0.0),
      FunnelStageMetric(
          stageId: 's2',
          stageName: '2. Service View',
          count: 680,
          conversionRateFromPrevious: 54.4,
          dropoffRatePercent: 45.6),
      FunnelStageMetric(
          stageId: 's3',
          stageName: '3. Booking Started',
          count: 240,
          conversionRateFromPrevious: 35.3,
          dropoffRatePercent: 64.7),
      FunnelStageMetric(
          stageId: 's4',
          stageName: '4. Inquiry Submitted',
          count: 84,
          conversionRateFromPrevious: 35.0,
          dropoffRatePercent: 65.0),
      FunnelStageMetric(
          stageId: 's5',
          stageName: '5. Quote Approved',
          count: 52,
          conversionRateFromPrevious: 61.9,
          dropoffRatePercent: 38.1),
      FunnelStageMetric(
          stageId: 's6',
          stageName: '6. Deposit Paid',
          count: 32,
          conversionRateFromPrevious: 61.5,
          dropoffRatePercent: 38.5),
      FunnelStageMetric(
          stageId: 's7',
          stageName: '7. Booking Confirmed',
          count: 22,
          conversionRateFromPrevious: 68.75,
          dropoffRatePercent: 31.25),
      FunnelStageMetric(
          stageId: 's8',
          stageName: '8. Event Completed',
          count: 18,
          conversionRateFromPrevious: 81.8,
          dropoffRatePercent: 18.2),
    ];

    _marketingAttribution = const [
      MarketingAttributionMetric(
          channelOrSource: 'Instagram Reel',
          identifier: 'Royal Poshak Bridal Reel',
          leadsGenerated: 38,
          bookingsConverted: 11,
          productOrdersConverted: 14,
          attributedRevenue: 225000.0,
          estimatedRoiMultiplier: 6.8),
      MarketingAttributionMetric(
          channelOrSource: 'WhatsApp Blast',
          identifier: 'Jodhpur Wedding Season Blast',
          leadsGenerated: 24,
          bookingsConverted: 7,
          productOrdersConverted: 18,
          attributedRevenue: 145000.0,
          estimatedRoiMultiplier: 5.2),
      MarketingAttributionMetric(
          channelOrSource: 'Referral Code',
          identifier: 'BRIDE-REF-2026',
          leadsGenerated: 14,
          bookingsConverted: 4,
          productOrdersConverted: 6,
          attributedRevenue: 85000.0,
          estimatedRoiMultiplier: 4.1),
    ];

    _rfmSegments = const [
      CustomerRfmSegment(
          segmentName: 'VIP Brides',
          customerCount: 14,
          averageLtv: 65000.0,
          repeatPurchaseRate: 85.7,
          recommendedAction:
              'Offer complimentary post-wedding touchup & bridal anniversary gift.'),
      CustomerRfmSegment(
          segmentName: 'High Value',
          customerCount: 28,
          averageLtv: 35000.0,
          repeatPurchaseRate: 64.2,
          recommendedAction:
              'Send targeted luxury skincare bundle recommendation.'),
      CustomerRfmSegment(
          segmentName: 'Repeat Guests',
          customerCount: 42,
          averageLtv: 18000.0,
          repeatPurchaseRate: 100.0,
          recommendedAction: 'Enroll in Royal Gold Loyalty tier.'),
      CustomerRfmSegment(
          segmentName: 'At Risk',
          customerCount: 12,
          averageLtv: 12000.0,
          repeatPurchaseRate: 16.6,
          recommendedAction: 'Trigger WhatsApp reactivation coupon.'),
    ];

    _teamUtilization = const [
      TeamUtilizationMetric(
          artistId: 'art_1',
          artistName: 'Prachi Gurjar (Lead Artist)',
          bookingsHandled: 14,
          totalRevenueGenerated: 310000.0,
          utilizationPercent: 92.0,
          averageRating: 4.98,
          cancellationRatePercent: 0.0,
          totalEarnings: 186000.0),
      TeamUtilizationMetric(
          artistId: 'art_2',
          artistName: 'Ananya Sharma (Senior Specialist)',
          bookingsHandled: 8,
          totalRevenueGenerated: 85000.0,
          utilizationPercent: 73.0,
          averageRating: 4.88,
          cancellationRatePercent: 1.2,
          totalEarnings: 42500.0),
    ];

    _ecommerceSummary = const EcommerceAnalyticsSummary(
      productRevenue: 90000.0,
      totalOrders: 45,
      averageOrderValue: 2000.0,
      cartAbandonmentRatePercent: 28.5,
      stockTurnoverRate: 4.2,
      returnRatePercent: 1.8,
      topSellingProducts: [
        'Hydrating Primer & Setting Spray',
        'Bridal Touchup Kit',
        'Longwear Matte Lipstick - Royal Ruby'
      ],
    );

    _forecast = const ForecastSnapshot(
      period: '2026-11 (Peak Wedding Season)',
      projectedBookings: 28,
      projectedRevenue: 610000.0,
      projectedExpenses: 255000.0,
      projectedNetProfit: 355000.0,
      expectedInventoryDemandUnits: 126,
      artistCapacityDemandPercent: 94.5,
      confidenceLevel: 'HIGH',
    );

    _capacity = const CapacityThreshold(
      month: 'November 2026',
      maxSafeBookingLimit: 30,
      currentBookedCount: 22,
      capacityUtilizationPercent: 73.3,
      isNearCapacityAlert: true,
    );

    _alerts = [
      BusinessAlert(
        id: 'alt_1',
        severity: 'HIGH',
        category: 'LEAD',
        title: '7 Hot Bridal Leads Pending Contact',
        message: 'Multiple high-scoring leads have been unhandled > 24 hours.',
        actionLink: '/admin/crm',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      BusinessAlert(
        id: 'alt_2',
        severity: 'MEDIUM',
        category: 'CAPACITY',
        title: 'November Saturday Capacity at 85%',
        message: 'Studio station booking density is nearing max safe threshold.',
        actionLink: '/admin/calendar',
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
    ];
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _triggerAiAnalystReport() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _isLoading = false;
      _aiReportResult =
          '🤖 AI Business Analyst Insight:\n• Total revenue reached ${AppFormatters.formatCurrency(_kpiSummary.totalRevenue)} with a net profit margin of ${_kpiSummary.netProfitMarginPercent.toStringAsFixed(1)}%.\n• Lead conversion rate of ${_kpiSummary.leadConversionRate.toStringAsFixed(1)}% is driven primarily by Instagram Reel attributions.\n• Recommended Action: Expand Saturday capacity by allocating Assistant Artists to handle party makeup prep.';
    });
  }

  Widget _buildCustomChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        label,
        style: AppTextStyles.bodySecondary.copyWith(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
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
              'Business Intelligence & Decision Center',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V6.0 Executive Analytics & Demand Forecasting Suite',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology, color: AppColors.roseGold),
            tooltip: 'Run AI Business Analyst Report',
            onPressed: _triggerAiAnalystReport,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.roseGold),
            onPressed: () {
              setState(() {
                _loadAnalyticsData();
              });
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppColors.roseGold,
          labelColor: AppColors.roseGold,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Revenue BI'),
            Tab(text: 'Booking Funnel'),
            Tab(text: 'Attribution'),
            Tab(text: 'RFM Segments'),
            Tab(text: 'Team Analytics'),
            Tab(text: 'Ecommerce'),
            Tab(text: 'Forecasting'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.roseGold),
            )
          : Column(
              children: [
                if (_aiReportResult != null) _buildAiInsightBanner(),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildOverviewTab(),
                      _buildRevenueTab(),
                      _buildFunnelTab(),
                      _buildAttributionTab(),
                      _buildRfmTab(),
                      _buildTeamTab(),
                      _buildEcommerceTab(),
                      _buildForecastTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildAiInsightBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.deepPlum.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.roseGold),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'AI Business Analyst Synthesis',
                style: AppTextStyles.sectionHeader.copyWith(
                  color: AppColors.roseGold,
                  fontSize: 13,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white70, size: 16),
                onPressed: () => setState(() => _aiReportResult = null),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            _aiReportResult!,
            style: AppTextStyles.bodySecondary.copyWith(
              color: Colors.white,
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KPI Metric Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.6,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _buildKpiCard(
                'Total Revenue',
                AppFormatters.formatCurrency(_kpiSummary.totalRevenue),
                'Service: ${AppFormatters.formatCurrency(_kpiSummary.serviceRevenue)}',
                Icons.account_balance_wallet,
                AppColors.emeraldGreen,
              ),
              _buildKpiCard(
                'Net Profit',
                AppFormatters.formatCurrency(_kpiSummary.netProfit),
                'Margin: ${_kpiSummary.netProfitMarginPercent.toStringAsFixed(1)}%',
                Icons.trending_up,
                AppColors.deepPlum,
              ),
              _buildKpiCard(
                'Lead Conversion',
                '${_kpiSummary.leadConversionRate.toStringAsFixed(1)}%',
                '${_kpiSummary.totalBookings} Bookings / ${_kpiSummary.totalLeads} Leads',
                Icons.filter_alt,
                AppColors.roseGold,
              ),
              _buildKpiCard(
                'Unified LTV',
                AppFormatters.formatCurrency(_kpiSummary.averageUnifiedLtv),
                'Services + Cosmetics LTV',
                Icons.star,
                AppColors.warmGold,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Business Decision & Alert Center
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded,
                  color: AppColors.statusDeclined, size: 20),
              const SizedBox(width: 8),
              Text(
                'Real-Time Decision & Alert Center',
                style: AppTextStyles.headingTitle.copyWith(
                  color: AppColors.deepPlum,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _alerts.length,
            itemBuilder: (context, index) {
              final alert = _alerts[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: alert.severity == 'HIGH'
                        ? AppColors.statusDeclined
                        : AppColors.warmGold,
                  ),
                ),
                child: ListTile(
                  title: Text(alert.title, style: AppTextStyles.sectionHeader),
                  subtitle: Text(alert.message, style: AppTextStyles.bodySecondary),
                  trailing: _buildCustomChip(
                    alert.severity,
                    alert.severity == 'HIGH'
                        ? AppColors.statusDeclined
                        : AppColors.statusAwaitingApproval,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCard(String title, String mainValue, String subtitle,
      IconData icon, Color accentColor) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                Icon(icon, color: accentColor, size: 18),
              ],
            ),
            const Spacer(),
            Text(
              mainValue,
              style: AppTextStyles.headingTitle.copyWith(
                color: accentColor,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: AppTextStyles.bodySecondary.copyWith(
                fontSize: 10,
                color: Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRevenueTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _revenueBreakdown.length,
      itemBuilder: (context, index) {
        final item = _revenueBreakdown[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: item.category == 'Service'
                  ? AppColors.deepPlum
                  : AppColors.warmGold,
              child: Text(
                item.category[0],
                style: const TextStyle(color: Colors.white),
              ),
            ),
            title: Text(item.label, style: AppTextStyles.sectionHeader),
            subtitle: Text(
                'Category: ${item.category} • ${item.transactionCount} transactions'),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  AppFormatters.formatCurrency(item.revenue),
                  style: AppTextStyles.sectionHeader
                      .copyWith(color: AppColors.emeraldGreen),
                ),
                Text('${item.percentageOfTotal}% of Total',
                    style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFunnelTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _funnelMetrics.length,
      itemBuilder: (context, index) {
        final stage = _funnelMetrics[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.deepPlum,
              child: Text(
                '${index + 1}',
                style: const TextStyle(color: AppColors.roseGold),
              ),
            ),
            title: Text(stage.stageName, style: AppTextStyles.sectionHeader),
            subtitle: Text(
                'Count: ${stage.count} | Conversion: ${stage.conversionRateFromPrevious.toStringAsFixed(1)}%'),
            trailing: stage.dropoffRatePercent > 0
                ? _buildCustomChip(
                    '-${stage.dropoffRatePercent.toStringAsFixed(1)}% Dropoff',
                    AppColors.statusDeclined,
                  )
                : null,
          ),
        );
      },
    );
  }

  Widget _buildAttributionTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _marketingAttribution.length,
      itemBuilder: (context, index) {
        final item = _marketingAttribution[index];
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
                    Text(item.identifier, style: AppTextStyles.sectionHeader),
                    _buildCustomChip(
                      '${item.estimatedRoiMultiplier}x ROI',
                      AppColors.emeraldGreen,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                    'Channel: ${item.channelOrSource} • Leads: ${item.leadsGenerated} • Bookings: ${item.bookingsConverted}',
                    style: AppTextStyles.bodySecondary),
                const Divider(),
                Text(
                  'Attributed Revenue: ${AppFormatters.formatCurrency(item.attributedRevenue)}',
                  style: AppTextStyles.sectionHeader
                      .copyWith(color: AppColors.deepPlum),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRfmTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _rfmSegments.length,
      itemBuilder: (context, index) {
        final segment = _rfmSegments[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: ExpansionTile(
            title: Text(segment.segmentName, style: AppTextStyles.sectionHeader),
            subtitle: Text(
                'Count: ${segment.customerCount} | Avg LTV: ${AppFormatters.formatCurrency(segment.averageLtv)}'),
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Repeat Purchase Rate: ${segment.repeatPurchaseRate.toStringAsFixed(1)}%',
                      style: AppTextStyles.bodySecondary,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Recommended Action: ${segment.recommendedAction}',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: AppColors.deepPlum),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTeamTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _teamUtilization.length,
      itemBuilder: (context, index) {
        final team = _teamUtilization[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(team.artistName, style: AppTextStyles.sectionHeader),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Bookings: ${team.bookingsHandled}',
                        style: AppTextStyles.bodySecondary),
                    Text('Utilization: ${team.utilizationPercent}%',
                        style: AppTextStyles.bodySecondary),
                    Text('Rating: ⭐ ${team.averageRating}',
                        style: AppTextStyles.bodySecondary),
                  ],
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Revenue Output: ${AppFormatters.formatCurrency(team.totalRevenueGenerated)}',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: AppColors.emeraldGreen),
                    ),
                    Text(
                      'Commissions: ${AppFormatters.formatCurrency(team.totalEarnings)}',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: AppColors.deepPlum),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEcommerceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ecommerce Performance Summary',
                      style: AppTextStyles.sectionHeader),
                  const SizedBox(height: 12),
                  Text(
                      'Product Revenue: ${AppFormatters.formatCurrency(_ecommerceSummary.productRevenue)}',
                      style: AppTextStyles.bodySecondary),
                  Text('Total Orders: ${_ecommerceSummary.totalOrders}',
                      style: AppTextStyles.bodySecondary),
                  Text(
                      'Average Order Value: ${AppFormatters.formatCurrency(_ecommerceSummary.averageOrderValue)}',
                      style: AppTextStyles.bodySecondary),
                  Text(
                      'Cart Abandonment Rate: ${_ecommerceSummary.cartAbandonmentRatePercent}%',
                      style: AppTextStyles.bodySecondary),
                  Text(
                      'Stock Turnover Rate: ${_ecommerceSummary.stockTurnoverRate}x',
                      style: AppTextStyles.bodySecondary),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Top Selling Cosmetics', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 8),
          ..._ecommerceSummary.topSellingProducts.map(
            (p) => Card(
              child: ListTile(
                leading: const Icon(Icons.shopping_bag,
                    color: AppColors.warmGold),
                title: Text(p, style: AppTextStyles.bodySecondary),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForecastTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 3,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.roseGold)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Target Forecast Period: ${_forecast.period}',
                    style: AppTextStyles.sectionHeader
                        .copyWith(color: AppColors.deepPlum),
                  ),
                  const SizedBox(height: 12),
                  Text('Projected Bookings: ${_forecast.projectedBookings}',
                      style: AppTextStyles.bodySecondary),
                  Text(
                    'Projected Revenue: ${AppFormatters.formatCurrency(_forecast.projectedRevenue)}',
                    style: AppTextStyles.sectionHeader
                        .copyWith(color: AppColors.emeraldGreen),
                  ),
                  Text(
                    'Projected Net Profit: ${AppFormatters.formatCurrency(_forecast.projectedNetProfit)}',
                    style: AppTextStyles.bodySecondary),
                  Text(
                    'Expected Stock Demand: ${_forecast.expectedInventoryDemandUnits} Units',
                    style: AppTextStyles.bodySecondary),
                  const SizedBox(height: 8),
                  _buildCustomChip(
                    'Confidence: ${_forecast.confidenceLevel}',
                    AppColors.roseGold,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Capacity Intelligence
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Capacity Intelligence: ${_capacity.month}',
                      style: AppTextStyles.sectionHeader),
                  const SizedBox(height: 8),
                  Text(
                      'Booked / Safe Limit: ${_capacity.currentBookedCount} / ${_capacity.maxSafeBookingLimit}'),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: _capacity.capacityUtilizationPercent / 100,
                    backgroundColor: Colors.grey[200],
                    color: _capacity.isNearCapacityAlert
                        ? AppColors.statusDeclined
                        : AppColors.emeraldGreen,
                    minHeight: 10,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Utilization: ${_capacity.capacityUtilizationPercent.toStringAsFixed(1)}%',
                    style: AppTextStyles.bodySecondary.copyWith(fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
