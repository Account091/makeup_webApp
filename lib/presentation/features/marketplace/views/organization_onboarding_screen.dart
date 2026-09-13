import 'package:flutter/material.dart';

class OrganizationOnboardingScreen extends StatefulWidget {
  const OrganizationOnboardingScreen({super.key});

  @override
  State<OrganizationOnboardingScreen> createState() =>
      _OrganizationOnboardingScreenState();
}

class _OrganizationOnboardingScreenState
    extends State<OrganizationOnboardingScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Organization Onboarding & Readiness'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Score Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green.shade900, Colors.teal.shade900],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Marketplace Readiness: 100% READY',
                    style: TextStyle(
                      color: Colors.amberAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'All Onboarding Milestones Complete',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Your organization is fully authorized to receive public marketplace bookings.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              '📋 Mandatory Onboarding Checklist',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildChecklistTile('1. Business Profile & Contact Info', true),
            _buildChecklistTile('2. Service Catalog & Pricing', true),
            _buildChecklistTile('3. Artist Team Roster', true),
            _buildChecklistTile('4. Calendar & Booking Rules', true),
            _buildChecklistTile('5. Payment Destination & Tenant UPI VPA', true),
            _buildChecklistTile('6. Business Verification Approval', true),
          ],
        ),
      ),
    );
  }

  Widget _buildChecklistTile(String title, bool isDone) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          isDone ? Icons.check_circle : Icons.radio_button_unchecked,
          color: isDone ? Colors.green : Colors.grey,
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        trailing: Text(
          isDone ? 'COMPLETE' : 'PENDING',
          style: TextStyle(
            color: isDone ? Colors.green : Colors.amber.shade900,
            fontWeight: FontWeight.bold,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}
