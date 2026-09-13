import 'package:flutter/material.dart';

/// V9.2 — Disaster Recovery Screen (Flutter Mobile Admin)
class DisasterRecoveryScreen extends StatelessWidget {
  const DisasterRecoveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final backupInfo = {
      'Last Backup': '13 Sep 01:00',
      'Verified': '13 Sep 01:12',
      'Age': '10h',
      'Status': 'VERIFIED',
      'Documents': '14,320',
      'Media': '834',
    };

    final drills = [
      {'test': 'Firestore restore', 'result': 'PASS'},
      {'test': 'Storage restore', 'result': 'PASS'},
      {'test': 'Financial reconcile', 'result': 'PASS'},
      {'test': 'Tenant isolation', 'result': 'PASS'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        title: const Text('Disaster Recovery'),
        backgroundColor: const Color(0xFF111827),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Latest Backup', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.2,
              children: backupInfo.entries.map((e) => Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF1e293b)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(e.key, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    const SizedBox(height: 2),
                    Text(e.value, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              )).toList(),
            ),
            const SizedBox(height: 20),

            const Text('Recovery Tests', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ...drills.map((d) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(d['test']!, style: const TextStyle(color: Colors.white)),
                  Text('✅ ${d['result']}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            )),
            const SizedBox(height: 20),

            // Financial
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Financial Reconciliation', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  SizedBox(height: 8),
                  Text('Payment Ledger: ₹5,40,000 ↔ Backup: ₹5,40,000', style: TextStyle(color: Colors.white70)),
                  SizedBox(height: 4),
                  Text('Commission: ₹54,000 ↔ Backup: ₹54,000', style: TextStyle(color: Colors.white70)),
                  SizedBox(height: 4),
                  Text('Difference: ₹0 ✅', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
