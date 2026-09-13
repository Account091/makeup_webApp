import 'package:flutter/material.dart';

class LocationIntelligenceDashboardScreen extends StatefulWidget {
  const LocationIntelligenceDashboardScreen({super.key});

  @override
  State<LocationIntelligenceDashboardScreen> createState() =>
      _LocationIntelligenceDashboardScreenState();
}

class _LocationIntelligenceDashboardScreenState
    extends State<LocationIntelligenceDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Multi-City & Destination Intelligence'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'Ask AI Location Analyst',
            onPressed: _showAiAnalystSheet,
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
                    'Active Hubs',
                    '4 Locations',
                    'Jodhpur, Jaipur, Udaipur, Dest',
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Regional Revenue',
                    '₹12,75,000',
                    'Top: Jodhpur Flagship',
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
                    'Destination Weddings',
                    '11 Bookings',
                    'Avg Quote ₹35K',
                    Colors.purple,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Destination Revenue',
                    '₹3,85,000',
                    'Margin 51.9%',
                    Colors.amber.shade900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Location Performance Breakdown
            const Text(
              'City & Market Performance',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildLocationTile('Jodhpur (Flagship Studio)', '31 Bookings • ₹4.20L Revenue', '69.5% Margin', Colors.blue),
            _buildLocationTile('Jaipur (Pink City Hub)', '14 Bookings • ₹2.75L Revenue', '60.7% Margin', Colors.purple),
            _buildLocationTile('Udaipur (Lake City Hub)', '9 Bookings • ₹1.95L Revenue', '60.0% Margin', Colors.green),
            _buildLocationTile('Destination Weddings', '11 Bookings • ₹3.85L Revenue', '51.9% Margin', Colors.amber.shade900),

            const SizedBox(height: 24),

            // Multi-City SEO & Policy Status
            const Text(
              'Multi-City SEO & Service Availability',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildSeoTile('/jodhpur', 'Jodhpur Flagship Studio', 'Physical Studio Hub', Colors.green),
            _buildSeoTile('/jaipur', 'Jaipur Royal Bridal Services', 'On-Location Service', Colors.blue),
            _buildSeoTile('/udaipur', 'Udaipur Lake City Weddings', 'On-Location Service', Colors.purple),
            _buildSeoTile('/destination-weddings', 'Destination Wedding Travel Team', 'Full Travel Package', Colors.teal),
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

  Widget _buildLocationTile(String name, String details, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.2),
          child: Icon(Icons.location_city, color: color),
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

  Widget _buildSeoTile(String route, String title, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.travel_explore, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Route: $route'),
        trailing: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
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
              const Text('✨ AI Location Analyst', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Ask natural-language questions about city revenue, margins, and destination quotes.'),
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
