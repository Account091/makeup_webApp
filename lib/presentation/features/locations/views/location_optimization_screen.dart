import 'package:flutter/material.dart';

class LocationOptimizationScreen extends StatefulWidget {
  const LocationOptimizationScreen({super.key});

  @override
  State<LocationOptimizationScreen> createState() =>
      _LocationOptimizationScreenState();
}

class _LocationOptimizationScreenState
    extends State<LocationOptimizationScreen> {
  String _selectedLocation = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Location Intelligence & Optimization'),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology_outlined),
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
            // Top Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.amber.shade900, Colors.purple.shade900],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'V7.4 Location Score Engine v1.0',
                    style: TextStyle(
                      color: Colors.amberAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Executive Regional Optimization',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Deterministic location scores (0-100), travel cost efficiency ratios, and expansion candidate signals.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Filter Selector
            Row(
              children: [
                const Text(
                  'Select Hub:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                DropdownButton<String>(
                  value: _selectedLocation,
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Hubs (Aggregate)')),
                    DropdownMenuItem(value: 'jodhpur', child: Text('Jodhpur Flagship')),
                    DropdownMenuItem(value: 'jaipur', child: Text('Jaipur Market')),
                    DropdownMenuItem(value: 'udaipur', child: Text('Udaipur Market')),
                    DropdownMenuItem(value: 'destination', child: Text('Destination Weddings')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedLocation = val;
                      });
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Top Summary KPI Cards
            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Avg Location Score',
                    '84.0 / 100',
                    'Score Version 1.0',
                    Colors.amber.shade800,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Top Performing Hub',
                    'Jodhpur (88)',
                    '68.5% Net Margin',
                    Colors.green.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Top YoY Growth',
                    'Jaipur (+32%)',
                    '89% Utilization',
                    Colors.indigo.shade700,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Top Expansion Signal',
                    'Ahmedabad',
                    '17 Inquiries Received',
                    Colors.teal.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Location Scorecard List
            const Text(
              '🏆 Location Scorecards & Factor Breakdown',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (_selectedLocation == 'all' || _selectedLocation == 'jodhpur')
              _buildScorecardTile('Jodhpur Flagship Studio', 88, 'EXCELLENT', '68.5% Margin • 71% Capacity', Colors.green),
            if (_selectedLocation == 'all' || _selectedLocation == 'jaipur')
              _buildScorecardTile('Jaipur Market Hub', 84, 'HEALTHY', '+32% Rev Growth • 89% Capacity', Colors.indigo),
            if (_selectedLocation == 'all' || _selectedLocation == 'udaipur')
              _buildScorecardTile('Udaipur Market Hub', 78, 'HEALTHY', '41% Referral Share • 14.7% Travel Ratio', Colors.amber.shade900),
            if (_selectedLocation == 'all' || _selectedLocation == 'destination')
              _buildScorecardTile('Destination Wedding Suite', 86, 'EXCELLENT', 'Avg Quote ₹1.16L • 4.95 NPS', Colors.purple),

            const SizedBox(height: 24),

            // Travel Cost Efficiency Section
            const Text(
              '🚗 Travel Expense Efficiency Ratios',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Target ratio: Travel Cost / Hub Revenue < 15%',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            _buildTravelEfficiencyTile('Jodhpur Studio', '2.3%', '8 Bookings', 'HIGHLY EFFICIENT', Colors.green),
            _buildTravelEfficiencyTile('Jaipur Market', '6.8%', '18 Bookings', 'HIGHLY EFFICIENT', Colors.green),
            _buildTravelEfficiencyTile('Udaipur Market', '14.7%', '22 Bookings', 'ACCEPTABLE', Colors.amber.shade900),
            _buildTravelEfficiencyTile('Destination Team', '13.5%', '14 Bookings', 'ACCEPTABLE', Colors.amber.shade900),

            const SizedBox(height: 24),

            // Opportunities & Risks Section
            const Text(
              '💡 Opportunities & Risk Alerts',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildInsightCard(
              'Jaipur Capacity Expansion',
              'Jaipur shows 26.4% booking growth with 89% utilization. Allocate extra artist shifts before scaling marketing.',
              'High Impact (92/100)',
              Colors.green,
            ),
            const SizedBox(height: 8),
            _buildInsightCard(
              'Jaipur Weekend Constraint Risk',
              'Projected weekend demand threatens to breach maximum artist slots during peak October dates.',
              'Severity: HIGH',
              Colors.red,
            ),
            const SizedBox(height: 8),
            _buildInsightCard(
              'Udaipur Referral Leverage',
              '41% of Udaipur bookings come from referrals. Expand bridal referral rewards to fill 37% capacity headroom.',
              'Impact (84/100)',
              Colors.amber.shade900,
            ),

            const SizedBox(height: 24),

            // Expansion Candidate Signals
            const Text(
              '🚀 Expansion Candidate Signals',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildExpansionTile('Ahmedabad', 17, 12, 5, 'High Interest • Rec: Outstation Pop-Up'),
            _buildExpansionTile('Delhi NCR', 14, 9, 4, 'High Interest • Rec: Target Luxury Ads'),
            _buildExpansionTile('Jaisalmer', 9, 6, 3, 'Medium Interest • Rec: Shared Travel Team'),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, String subtext, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(subtext, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildScorecardTile(String name, int score, String status, String details, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.15),
          child: Text('$score', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(details, style: const TextStyle(fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
        ),
      ),
    );
  }

  Widget _buildTravelEfficiencyTile(String name, String ratio, String bookings, String tag, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.directions_car, color: color),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Ratio: $ratio • $bookings'),
        trailing: Text(tag, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }

  Widget _buildInsightCard(String title, String desc, String badge, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
              Text(badge, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildExpansionTile(String city, int inquiries, int leads, int confirmed, String subtext) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.location_on, color: Colors.amber),
        title: Text(city, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('$inquiries Inquiries • $leads Leads • $confirmed Bookings\n$subtext', style: const TextStyle(fontSize: 11)),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('🤖 AI Location Analyst', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text('allowMutations: false', style: TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 8),
              const Text('Synthesized location optimization insights based on deterministic aggregate scores.'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: const Text(
                  'Jaipur exhibits top revenue growth (+32%) with 89% capacity utilization. Jodhpur maintains highest net margin (68.5%). Ahmedabad is top expansion candidate with 17 inquiries.',
                  style: TextStyle(fontSize: 12, color: Colors.black87),
                ),
              ),
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
