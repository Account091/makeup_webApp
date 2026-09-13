import 'package:flutter/material.dart';

/// V9.1 — Privacy Admin Screen (Flutter Mobile Admin)
class PrivacyAdminScreen extends StatelessWidget {
  const PrivacyAdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final healthItems = {
      'Open Requests': 2,
      'Pending Deletions': 1,
      'Expired Jobs': 0,
      'Consent Issues': 0,
      'Media Violations': 0,
      'Incidents': 0,
    };

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        title: const Text('Privacy Admin'),
        backgroundColor: const Color(0xFF111827),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Privacy Health', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: 2.5,
                    children: healthItems.entries.map((e) => Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1e293b),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(e.key, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                          Text('${e.value}', style: TextStyle(
                            color: e.value == 0 ? Colors.green : Colors.amber,
                            fontWeight: FontWeight.bold, fontSize: 16,
                          )),
                        ],
                      ),
                    )).toList(),
                  ),
                  const SizedBox(height: 8),
                  const Text('Status: ✅ HEALTHY', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
