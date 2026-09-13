import 'package:flutter/material.dart';

class OrganizationAdminScreen extends StatefulWidget {
  const OrganizationAdminScreen({super.key});

  @override
  State<OrganizationAdminScreen> createState() =>
      _OrganizationAdminScreenState();
}

class _OrganizationAdminScreenState extends State<OrganizationAdminScreen> {
  String _selectedTenant = 'makeovers-by-prachi';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Organization Admin Portal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shield_outlined),
            tooltip: 'Tenant Security',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tenant Security Isolation Active')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tenant Selector
            Row(
              children: [
                const Text(
                  'Tenant Organization:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                DropdownButton<String>(
                  value: _selectedTenant,
                  items: const [
                    DropdownMenuItem(
                      value: 'makeovers-by-prachi',
                      child: Text('Makeovers by Prachi'),
                    ),
                    DropdownMenuItem(
                      value: 'jaipur-royal-glam',
                      child: Text('Jaipur Royal Glam'),
                    ),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedTenant = val;
                      });
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Earnings Summary Cards
            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Gross Bookings',
                    '₹70,000',
                    '2 Ledger Transactions',
                    Colors.blue.shade700,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Platform Fee (10%)',
                    '₹7,000',
                    'Platform Share',
                    Colors.amber.shade800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Gateway Fee (2%)',
                    '₹1,400',
                    'Processing Cost',
                    Colors.indigo.shade700,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Net Artist Share (88%)',
                    '₹61,600',
                    'Pending Settlement',
                    Colors.green.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Commission Ledger Header
            const Text(
              '📜 Append-Only Commission Ledger',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildLedgerTile('tx_comm_01', 'bk_sample_01', '₹25,000 Gross', '₹22,000 Net', 'Rule v1.0'),
            _buildLedgerTile('tx_comm_02', 'bk_sample_02', '₹45,000 Gross', '₹39,600 Net', 'Rule v1.0'),

            const SizedBox(height: 24),

            // Verification & Security Details
            const Text(
              '🔒 Tenant Security & Verification',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.verified, color: Colors.green),
                title: const Text('Organization Verification Status', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('VERIFIED • Business tax registration confirmed'),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('ACTIVE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ),
            ),
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

  Widget _buildLedgerTile(String txId, String bkId, String gross, String net, String rule) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.receipt_long, color: Colors.blue),
        title: Text('Tx: $txId ($bkId)', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        subtitle: Text('Gross: $gross • Rule: $rule', style: const TextStyle(fontSize: 11)),
        trailing: Text(net, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
      ),
    );
  }
}
