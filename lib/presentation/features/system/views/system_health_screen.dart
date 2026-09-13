import 'package:flutter/material.dart';

/// V9.0 — System Health & Observability Screen (Flutter Mobile Admin)
class SystemHealthScreen extends StatefulWidget {
  const SystemHealthScreen({super.key});

  @override
  State<SystemHealthScreen> createState() => _SystemHealthScreenState();
}

class _SystemHealthScreenState extends State<SystemHealthScreen> {
  final List<Map<String, dynamic>> _dependencies = [
    {'name': 'Firestore', 'status': 'HEALTHY', 'latency': 14, 'verification': 'SANDBOX_VERIFIED'},
    {'name': 'Storage', 'status': 'HEALTHY', 'latency': 22, 'verification': 'SANDBOX_VERIFIED'},
    {'name': 'FCM', 'status': 'HEALTHY', 'latency': 38, 'verification': 'INTEGRATION_TESTED'},
    {'name': 'Google Sheets', 'status': 'DEGRADED', 'latency': 420, 'verification': 'INTEGRATION_TESTED'},
    {'name': 'WhatsApp', 'status': 'NOT_CONFIGURED', 'latency': 0, 'verification': 'CODE_CONFIGURED'},
    {'name': 'HuggingFace', 'status': 'HEALTHY', 'latency': 180, 'verification': 'SANDBOX_VERIFIED'},
  ];

  final Map<String, dynamic> _metrics = {
    'totalRequests': 14820,
    'errorRate': '0.25%',
    'avgLatency': '92ms',
    'retries': 12,
    'failedEvents': 2,
    'openIncidents': 1,
  };

  final Map<String, bool> _killSwitches = {
    'booking': true,
    'paymentProof': true,
    'ai': true,
    'whatsapp': true,
    'marketplace': true,
    'chat': true,
  };

  final bool _maintenanceMode = false;

  IconData _statusIcon(String status) {
    switch (status) {
      case 'HEALTHY': return Icons.check_circle;
      case 'DEGRADED': return Icons.warning_amber_rounded;
      case 'UNAVAILABLE': return Icons.error;
      default: return Icons.radio_button_unchecked;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'HEALTHY': return Colors.green;
      case 'DEGRADED': return Colors.amber;
      case 'UNAVAILABLE': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        title: const Text('System Health'),
        backgroundColor: const Color(0xFF111827),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overall status
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                children: [
                  Icon(Icons.shield, color: Colors.amber, size: 28),
                  const SizedBox(width: 12),
                  const Text('Overall: ', style: TextStyle(color: Colors.white70, fontSize: 16)),
                  const Text('DEGRADED', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Dependencies
            const Text('Dependencies', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ..._dependencies.map((d) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                children: [
                  Icon(_statusIcon(d['status']), color: _statusColor(d['status']), size: 20),
                  const SizedBox(width: 10),
                  Expanded(child: Text(d['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500))),
                  Text('${d['latency']}ms', style: const TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            )),
            const SizedBox(height: 16),

            // Metrics grid
            const Text('Metrics', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.2,
              children: _metrics.entries.map((e) => Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF1e293b)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(e.key, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('${e.value}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              )).toList(),
            ),
            const SizedBox(height: 16),

            // Kill Switches
            const Text('Feature Kill Switches', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ..._killSwitches.entries.map((e) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(e.key, style: const TextStyle(color: Colors.white)),
                  Text(e.value ? 'ON' : 'OFF', style: TextStyle(color: e.value ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                ],
              ),
            )),
            const SizedBox(height: 16),

            // Maintenance
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                children: [
                  const Text('Maintenance Mode: ', style: TextStyle(color: Colors.white70)),
                  Text(
                    _maintenanceMode ? 'ACTIVE' : 'INACTIVE',
                    style: TextStyle(color: _maintenanceMode ? Colors.red : Colors.green, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
