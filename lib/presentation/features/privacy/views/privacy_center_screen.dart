import 'package:flutter/material.dart';

/// V9.1 — Privacy Center Screen (Customer Mobile)
class PrivacyCenterScreen extends StatefulWidget {
  const PrivacyCenterScreen({super.key});

  @override
  State<PrivacyCenterScreen> createState() => _PrivacyCenterScreenState();
}

class _PrivacyCenterScreenState extends State<PrivacyCenterScreen> {
  final Map<String, bool> _consents = {
    'Service Communication': true,
    'WhatsApp Marketing': false,
    'Email Marketing': false,
    'Portfolio / Website': true,
    'Instagram': false,
    'Advertisements': false,
    'Before/After': true,
    'Data Processing': true,
    'AI Assistance': true,
  };

  final List<String> _dataCategories = [
    'Profile', 'Bookings', 'Payments', 'Consultations',
    'Reviews', 'Chat', 'Uploaded Images', 'Documents',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        title: const Text('Privacy Center'),
        backgroundColor: const Color(0xFF111827),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('My Data', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _dataCategories.map((c) => Chip(
                label: Text(c, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                backgroundColor: const Color(0xFF1e293b),
              )).toList(),
            ),
            const SizedBox(height: 20),
            const Text('Consent Preferences', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ..._consents.entries.map((e) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1e293b)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(e.key, style: const TextStyle(color: Colors.white, fontSize: 14)),
                  Switch(
                    value: e.value,
                    onChanged: (val) => setState(() => _consents[e.key] = val),
                    activeTrackColor: Colors.green,
                  ),
                ],
              ),
            )),
            const SizedBox(height: 20),
            const Text('Privacy Actions', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ['Request My Data', 'Download Data', 'Request Deletion'].map((a) => OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white70,
                  side: const BorderSide(color: Color(0xFF334155)),
                ),
                child: Text(a),
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
