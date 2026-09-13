import 'package:flutter/material.dart';

class ForecastingIntelligenceDashboardScreen extends StatefulWidget {
  const ForecastingIntelligenceDashboardScreen({super.key});

  @override
  State<ForecastingIntelligenceDashboardScreen> createState() =>
      _ForecastingIntelligenceDashboardScreenState();
}

class _ForecastingIntelligenceDashboardScreenState
    extends State<ForecastingIntelligenceDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forecasting & Capacity'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'Ask AI Forecast Analyst',
            onPressed: _showAiAnalystSheet,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Cards
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Next 30D Revenue',
                    '₹3,85,000',
                    'Range ₹3.35L - ₹4.20L',
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Bookings (30D)',
                    '18',
                    'Demand: HIGH',
                    Colors.indigo,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Capacity Util.',
                    '82.5%',
                    'Lead Master: 93.8%',
                    Colors.amber.shade900,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Net Cashflow',
                    '₹2,50,000',
                    'Inflow ₹3.85L',
                    Colors.purple,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Active Forecast Alerts
            const Text(
              'Forecast Risk & Shortfall Alerts',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildAlertCard(
              'Lead Master Artist Overload',
              'Prachi utilization projected at 93.8% for September weekends.',
              Colors.red,
            ),
            _buildAlertCard(
              'Jaipur Capacity Shortage',
              'Jaipur demand (11 bookings) exceeds available slots (8 slots).',
              Colors.orange,
            ),

            const SizedBox(height: 24),

            // Artist Capacity List
            const Text(
              'Artist Utilization & Availability',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildArtistTile('Prachi (Lead Master)', '61h Booked • 14h Demand • 12h Travel', '93.8% (Risk)', Colors.red),
            _buildArtistTile('Ananya (Hair Stylist)', '48h Booked • 16h Demand • 8h Travel', '80.0% (Optimal)', Colors.green),
            _buildArtistTile('Rahul (Draping)', '36h Booked • 18h Demand • 6h Travel', '67.5% (Optimal)', Colors.blue),

            const SizedBox(height: 24),

            // Scenario Modeling Summary
            const Text(
              '30-Day Forecast Scenarios',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildScenarioTile('Base Scenario (Target)', 'Revenue: ₹3,85,000 • 18 Bookings • 82.5% Util.', Colors.green),
            _buildScenarioTile('Conservative Scenario', 'Revenue: ₹3,10,000 • 14 Bookings • 72.0% Util.', Colors.grey),
            _buildScenarioTile('Optimistic Scenario', 'Revenue: ₹4,40,000 • 22 Bookings • 92.0% Util.', Colors.purple),
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

  Widget _buildArtistTile(String name, String details, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.2),
          child: Icon(Icons.person, color: color),
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

  Widget _buildScenarioTile(String title, String details, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.show_chart, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(details),
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
              const Text('✨ AI Forecast Analyst', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Ask natural-language questions about revenue projections, demand, and capacity.'),
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
