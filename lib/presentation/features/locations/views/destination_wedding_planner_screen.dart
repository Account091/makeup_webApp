import 'package:flutter/material.dart';

class DestinationWeddingPlannerScreen extends StatefulWidget {
  const DestinationWeddingPlannerScreen({super.key});

  @override
  State<DestinationWeddingPlannerScreen> createState() =>
      _DestinationWeddingPlannerScreenState();
}

class _DestinationWeddingPlannerScreenState
    extends State<DestinationWeddingPlannerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Destination Wedding Planner'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'Ask AI Destination Copilot',
            onPressed: _showAiCopilotSheet,
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
                    'Active Weddings',
                    '2 Weddings',
                    'Udaipur & Jaipur',
                    Colors.purple,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Pipeline Value',
                    '₹5,60,000',
                    'Total Quotes',
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
                    'Collected Paid',
                    '₹2,64,000',
                    'Staged Deposits',
                    Colors.indigo,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Operational Risks',
                    '1 Critical',
                    'Flight confirmation',
                    Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Active Destination Weddings List
            const Text(
              'Upcoming Destination Weddings',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildWeddingCard(
              'Priya Rathore — Udaipur',
              'Taj Lake Palace • Sep 26–29 • 3 Functions',
              'Quote ₹2.40L (Paid ₹1.68L)',
              'CONFIRMED',
              Colors.green,
            ),
            _buildWeddingCard(
              'Rhea Kapoor — Jaipur',
              'Rambagh Palace • Oct 12–15 • 4 Functions',
              'Quote ₹3.20L (Paid ₹96K)',
              'PLANNING',
              Colors.blue,
            ),

            const SizedBox(height: 24),

            // Multi-Function Itinerary Breakdown
            const Text(
              'Priya Rathore — Udaipur Function Itinerary',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildFunctionTile('Mehndi', 'Sep 26 • Ready 15:30 • Poolside Lawn', 'Artist: Ananya', Colors.purple),
            _buildFunctionTile('Sangeet', 'Sep 27 • Ready 18:30 • Royal Ballroom', 'Artists: Prachi, Rahul', Colors.blue),
            _buildFunctionTile('Wedding', 'Sep 28 • Ready 14:00 • Lake Mandap', 'Artists: Prachi, Ananya, Rahul', Colors.amber.shade900),

            const SizedBox(height: 24),

            // Travel & Accommodation Summary
            const Text(
              'Logistics & Hotel Status',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildLogisticsTile('Flight Travel Itinerary', 'Jodhpur -> Udaipur (Flight) • 3 Artists', 'BOOKED', Colors.green),
            _buildLogisticsTile('Hotel Accommodation', 'Taj Lake Palace (2 Heritage Suites)', 'CONFIRMED', Colors.green),
            _buildLogisticsTile('Island Boat Transfer Sync', 'Rameshwar Ghat Loading Schedule', 'IN PROGRESS', Colors.orange),
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

  Widget _buildWeddingCard(String title, String details, String sub, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.2),
          child: Icon(Icons.castle, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('$details\n$sub'),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
        ),
      ),
    );
  }

  Widget _buildFunctionTile(String name, String details, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.event, color: color),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(details),
        trailing: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }

  Widget _buildLogisticsTile(String title, String desc, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.checklist, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(desc),
        trailing: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }

  void _showAiCopilotSheet() {
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
              const Text('✨ AI Destination Copilot', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Ask natural-language questions about destination wedding itineraries, travel risks, and logistics.'),
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
