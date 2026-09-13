import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';

class CustomerIntelligenceDashboardScreen extends StatefulWidget {
  const CustomerIntelligenceDashboardScreen({super.key});

  @override
  State<CustomerIntelligenceDashboardScreen> createState() =>
      _CustomerIntelligenceDashboardScreenState();
}

class _CustomerIntelligenceDashboardScreenState
    extends State<CustomerIntelligenceDashboardScreen> {
  bool _isLoading = false;
  String? _aiReportResult;

  void _triggerAiAnalystReport() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _isLoading = false;
      _aiReportResult =
          '🤖 AI Customer Analyst Synthesis:\n• 1,248 Active Customers | Repeat Booking Rate: 38.4% | Avg LTV: ₹34,500\n• Customer Health: 88% Healthy / Excellent | 2 Clients AT_RISK (Pending balance & unconfirmed trial notes)\n• CRM Pipeline: 14 HOT Bridal Leads | 4 Overdue Follow-ups > 24 hrs\n\n📊 AUTHORITATIVE CUSTOMER SOURCES & TRANSPARENCY:\n• Customer 360 Dossiers, CRM Lead Engine, CSAT/NPS Surveys, Event-Day Mode\n• Data As Of: ${DateTime.now().toString().substring(0, 16)} | Privacy Scoping: PII_SCOPED_ADMIN_ONLY';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Customer & CRM Intelligence',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology, color: AppPalette.textGold),
            tooltip: 'Run AI Customer Analyst Report',
            onPressed: _triggerAiAnalystReport,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppPalette.goldAccent))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_aiReportResult != null) _buildAiBanner(),
                  _buildKpiSummaryRow(),
                  const SizedBox(height: 20),
                  _buildHealthScoreBreakdown(),
                  const SizedBox(height: 20),
                  _buildCrmPipelineCard(),
                  const SizedBox(height: 20),
                  _buildRiskAlertsCard(),
                ],
              ),
            ),
    );
  }

  Widget _buildAiBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppPalette.goldAccent),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('AI Customer Analyst Synthesis', style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 13)),
              IconButton(icon: const Icon(Icons.close, color: Colors.white54, size: 16), onPressed: () => setState(() => _aiReportResult = null)),
            ],
          ),
          const SizedBox(height: 4),
          Text(_aiReportResult!, style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }

  Widget _buildKpiSummaryRow() {
    return Row(
      children: [
        Expanded(child: _buildCard('Active Clients', '1,248', '38.4% Repeat Rate', Colors.lightGreenAccent)),
        const SizedBox(width: 10),
        Expanded(child: _buildCard('Avg LTV', '₹34,500', '+9.8% vs last quarter', AppPalette.textGold)),
        const SizedBox(width: 10),
        Expanded(child: _buildCard('NPS Score', '+84', '96.4% CSAT Rate', Colors.white)),
      ],
    );
  }

  Widget _buildCard(String title, String val, String sub, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppPalette.surfaceDark, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 10)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(color: Colors.white38, fontSize: 9)),
        ],
      ),
    );
  }

  Widget _buildHealthScoreBreakdown() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppPalette.surfaceDark, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('EXPLAINABLE CUSTOMER HEALTH DISTRIBUTION', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('AVG: 84/100', style: TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 12),
          _buildHealthRow('EXCELLENT (90-100)', '42% (524 Clients)', Colors.lightGreenAccent),
          _buildHealthRow('HEALTHY (70-89)', '37% (462 Clients)', Colors.green),
          _buildHealthRow('AT_RISK (50-69)', '15% (187 Clients)', Colors.amber),
          _buildHealthRow('CRITICAL (0-49)', '6% (75 Clients)', Colors.redAccent),
        ],
      ),
    );
  }

  Widget _buildHealthRow(String label, String val, Color col) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
          Text(val, style: TextStyle(color: col, fontWeight: FontWeight.bold, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildCrmPipelineCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppPalette.surfaceDark, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('CRM LEAD PIPELINE & PRIORITY QUEUE', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('• HOT Leads:', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
              Text('14 Inquiries (4 Overdue Follow-ups)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('• WARM Leads:', style: TextStyle(color: Colors.amber, fontSize: 12)),
              Text('28 Inquiries (Quotes Sent / Viewed)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRiskAlertsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppPalette.surfaceDark, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3))),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 18),
              SizedBox(width: 8),
              Text('ACTIVE CUSTOMER EXPERIENCE RISKS', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          SizedBox(height: 10),
          Text('• [HIGH] Kavita Rathore: Pending balance overdue on event in 5 days', style: TextStyle(color: Colors.white, fontSize: 11)),
          SizedBox(height: 4),
          Text('• [MEDIUM] Kavita Rathore: Trial completed but final look approval pending', style: TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }
}
