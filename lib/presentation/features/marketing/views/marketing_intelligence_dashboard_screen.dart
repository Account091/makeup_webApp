import 'package:flutter/material.dart';

class MarketingIntelligenceDashboardScreen extends StatefulWidget {
  const MarketingIntelligenceDashboardScreen({super.key});

  @override
  State<MarketingIntelligenceDashboardScreen> createState() =>
      _MarketingIntelligenceDashboardScreenState();
}

class _MarketingIntelligenceDashboardScreenState
    extends State<MarketingIntelligenceDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketing Intelligence'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'Ask AI Marketing Analyst',
            onPressed: _showAiAnalystSheet,
          ),
          IconButton(
            icon: const Icon(Icons.add_chart),
            tooltip: 'Campaign Planner',
            onPressed: () {
              Navigator.pushNamed(context, '/campaign-planner');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Summary Cards
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Marketing Leads',
                    '378',
                    '↑ 14.5%',
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Bookings',
                    '97',
                    '↑ 18.2%',
                    Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Attributed Revenue',
                    '₹14,25,000',
                    '↑ 22.0%',
                    Colors.amber.shade900,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'ROAS',
                    '10.25x',
                    'Spend ₹1.39L',
                    Colors.purple,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Active Marketing Alerts
            const Text(
              'Active Anomaly & Budget Alerts',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildAlertCard(
              'CAC Warning Threshold',
              'Destination campaign in Jaipur increased CAC to ₹2,142.',
              Colors.orange,
            ),
            _buildAlertCard(
              'Campaign Budget Alert',
              'Jaipur Bridal Campaign reached 80% of ₹25,000 budget.',
              Colors.blue,
            ),

            const SizedBox(height: 24),

            // Channel Performance List
            const Text(
              'Channel Performance',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildChannelTile('Instagram Ads & Reels', '142 Leads • 31 Bookings • ₹4.10L', 'ROAS 8.1x', Colors.purple),
            _buildChannelTile('Customer Referral', '58 Leads • 24 Bookings • ₹3.80L', 'ROAS 20.1x', Colors.green),
            _buildChannelTile('Organic Search (Google)', '76 Leads • 18 Bookings • ₹2.70L', 'Organic', Colors.blue),
            _buildChannelTile('WhatsApp Direct', '64 Leads • 16 Bookings • ₹2.20L', 'ROAS 26.5x', Colors.teal),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, String subtext, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(subtext, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildAlertCard(String title, String desc, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(desc, style: const TextStyle(fontSize: 12, color: Colors.black87)),
        ],
      ),
    );
  }

  Widget _buildChannelTile(String name, String details, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.2),
          child: Icon(Icons.campaign, color: color),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(details),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
      ),
    );
  }

  void _showAiAnalystSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
            top: 16,
            left: 16,
            right: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('✨ AI Marketing Analyst', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Ask natural-language questions about ROAS, CAC, channels, and campaigns.'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      },
    );
  }
}
