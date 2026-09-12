import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/system_health_entity.dart';

class SystemHealthScreen extends StatefulWidget {
  const SystemHealthScreen({super.key});

  @override
  State<SystemHealthScreen> createState() => _SystemHealthScreenState();
}

class _SystemHealthScreenState extends State<SystemHealthScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final bool _isLoading = false;

  late SystemHealthStatus _healthStatus;
  late List<SystemTraceLog> _traceLogs;
  late List<RiskAssessment> _riskAssessments;
  late List<PrivacyRequest> _privacyRequests;

  final _searchTraceController = TextEditingController(text: 'req_88401');

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadHealthData();
  }

  void _loadHealthData() {
    _healthStatus = SystemHealthStatus(
      overallStatus: 'HEALTHY',
      healthScorePercent: 99.8,
      componentStatuses: const {
        'Firestore BaaS': 'HEALTHY',
        'Cloud Functions Engine': 'HEALTHY',
        'Payment Gateways': 'HEALTHY',
        'Meta WhatsApp Cloud API': 'HEALTHY',
        'Next.js Customer Web': 'HEALTHY',
        'FCM Push Notifications': 'HEALTHY',
        'Cloud Storage': 'HEALTHY',
        'AI Assistant Gateway': 'HEALTHY',
        'Multi-Tenant Marketplace': 'HEALTHY',
      },
      activeAlertsCount: 0,
      timestamp: DateTime.now(),
    );

    _traceLogs = [
      SystemTraceLog(
        requestId: 'req_88401',
        actorId: 'user_cust_77',
        action: 'approveBooking -> calculateDestinationQuote',
        statusCode: 200,
        latencyMs: 142,
        serviceLogs: const [
          '[Next.js] Triggered destination quote calculation',
          '[Cloud Functions] Validated outstation travel buffer',
          '[Firestore] Authoritative document saved (dest_wed_101)',
          '[FCM] Push notification sent to admin_inquiries',
        ],
        timestamp: DateTime.now().subtract(const Duration(minutes: 12)),
      ),
    ];

    _riskAssessments = [
      RiskAssessment(
        assessmentId: 'risk_901',
        orgId: 'org_raj_studio',
        transactionId: 'txn_99401',
        riskScore: 8.5,
        riskFactors: const ['AUTHENTICATED_TENANT_OWNER'],
        verdict: 'LOW_RISK',
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
      ),
    ];

    _privacyRequests = [
      PrivacyRequest(
        requestId: 'prv_101',
        customerId: 'cust_882',
        customerEmail: 'meera.s@gmail.com',
        requestType: 'DATA_EXPORT',
        status: 'COMPLETED',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchTraceController.dispose();
    super.dispose();
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'HEALTHY':
      case 'LOW_RISK':
      case 'COMPLETED':
        return AppColors.emeraldGreen;
      case 'DEGRADED':
      case 'FLAGGED':
      case 'PROCESSING':
      case 'PENDING':
        return AppColors.statusAwaitingApproval;
      case 'CRITICAL':
      case 'BLOCKED':
        return AppColors.statusDeclined;
      default:
        return AppColors.mutedGray;
    }
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
              'Production Reliability & System Health',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V9.0 Observability, Request Tracing & Fraud Engine',
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
            Tab(text: 'Subsystems'),
            Tab(text: 'Request Tracing'),
            Tab(text: 'Fraud & Risk'),
            Tab(text: 'Privacy Center'),
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
                _buildSubsystemsTab(),
                _buildTracingTab(),
                _buildRiskTab(),
                _buildPrivacyTab(),
              ],
            ),
    );
  }

  Widget _buildSubsystemsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Overall Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.emeraldGreen.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.emeraldGreen),
            ),
            child: Row(
              children: [
                const Icon(Icons.health_and_safety, color: AppColors.emeraldGreen, size: 36),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Overall System Status: ${_healthStatus.overallStatus}',
                      style: AppTextStyles.headingTitle.copyWith(color: AppColors.emeraldGreen, fontSize: 18),
                    ),
                    Text(
                      'Platform Uptime & Health Index: ${_healthStatus.healthScorePercent}%',
                      style: AppTextStyles.bodySecondary,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text('Subsystem Microservice Monitors (9 Components)', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: _healthStatus.componentStatuses.entries.map((entry) {
              final statusColor = _getStatusColor(entry.value);
              return Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          entry.key,
                          style: AppTextStyles.bodySecondary.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          entry.value,
                          style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTracingTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Distributed Request Trace Inspector', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 8),
          TextField(
            controller: _searchTraceController,
            decoration: const InputDecoration(
              labelText: 'Search Request Trace ID (e.g. req_88401)',
              suffixIcon: Icon(Icons.search, color: AppColors.roseGold),
            ),
          ),
          const SizedBox(height: 16),
          ..._traceLogs.map(
            (trace) => Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.roseGold),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Trace ID: ${trace.requestId}', style: AppTextStyles.sectionHeader.copyWith(color: AppColors.deepPlum)),
                        Chip(
                          label: Text('${trace.statusCode} OK'),
                          backgroundColor: AppColors.emeraldGreen.withValues(alpha: 0.15),
                          labelStyle: const TextStyle(color: AppColors.emeraldGreen, fontSize: 10),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('Action: ${trace.action}', style: AppTextStyles.bodySecondary),
                    Text('Actor ID: ${trace.actorId} • Latency: ${trace.latencyMs} ms', style: AppTextStyles.bodySecondary),
                    const Divider(),
                    Text('End-to-End Service Spans:', style: AppTextStyles.sectionHeader.copyWith(fontSize: 12)),
                    const SizedBox(height: 6),
                    ...trace.serviceLogs.map(
                      (log) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Row(
                          children: [
                            const Icon(Icons.subdirectory_arrow_right, size: 14, color: AppColors.roseGold),
                            const SizedBox(width: 6),
                            Expanded(child: Text(log, style: AppTextStyles.bodySecondary.copyWith(fontSize: 11))),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _riskAssessments.length,
      itemBuilder: (context, index) {
        final risk = _riskAssessments[index];
        final color = _getStatusColor(risk.verdict);
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
                    Text('Assessment #${risk.assessmentId}', style: AppTextStyles.sectionHeader),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(risk.verdict, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text('Tenant Org: ${risk.orgId} • Txn ID: ${risk.transactionId}', style: AppTextStyles.bodySecondary),
                Text('Automated Risk Score: ${risk.riskScore} / 100', style: AppTextStyles.bodySecondary),
                const Divider(),
                Text('Risk Factor Audit: ${risk.riskFactors.join(", ")}', style: AppTextStyles.bodySecondary.copyWith(color: AppColors.deepPlum)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPrivacyTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _privacyRequests.length,
      itemBuilder: (context, index) {
        final req = _privacyRequests[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.privacy_tip, color: AppColors.deepPlum),
            title: Text('${req.requestType} (${req.customerEmail})'),
            subtitle: Text('Request ID: ${req.requestId}'),
            trailing: Text(req.status, style: const TextStyle(color: AppColors.emeraldGreen, fontWeight: FontWeight.bold)),
          ),
        );
      },
    );
  }
}
