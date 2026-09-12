import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../common/widgets/custom_button.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _businessNameController = TextEditingController(text: 'Makeovers by Prachi');
  final _phoneController = TextEditingController(text: '+91 98290 12345');
  final _emailController = TextEditingController(text: 'prachi@makeoversbyprachi.com');
  final _depositPercentController = TextEditingController(text: '30');
  final _depositFixedController = TextEditingController(text: '5000');

  // Dynamic Distance Tiers Defaults
  final _tier1Controller = TextEditingController(text: '0');    // 0-10 km
  final _tier2Controller = TextEditingController(text: '1500'); // 10-25 km
  final _tier3Controller = TextEditingController(text: '3000'); // 25-50 km
  final _tier4Controller = TextEditingController(text: '5500'); // 50-100 km

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Business Settings & Rules Engine',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Global Dynamic Settings',
                style: AppTextStyles.headingDisplay.copyWith(fontSize: 20)),
            const SizedBox(height: 4),
            Text('Control deposit rules, travel pricing tiers, and business info without code changes.',
                style: AppTextStyles.bodySecondary),
            const SizedBox(height: 20),

            // 1. Business Info Card
            _buildCardWrapper(
              title: '1. Business Profile',
              child: Column(
                children: [
                  TextField(
                    controller: _businessNameController,
                    decoration: const InputDecoration(labelText: 'Brand Name', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _phoneController,
                    decoration: const InputDecoration(labelText: 'Phone / WhatsApp', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'Contact Email', border: OutlineInputBorder()),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2. Deposit Rules Card
            _buildCardWrapper(
              title: '2. Deposit & Booking Rules',
              child: Column(
                children: [
                  TextField(
                    controller: _depositPercentController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Default Deposit Percentage (%)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _depositFixedController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Minimum Fixed Deposit Amount (₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. Dynamic Distance Travel Pricing Tiers
            _buildCardWrapper(
              title: '3. Distance Travel Pricing Tiers (Jodhpur Base)',
              child: Column(
                children: [
                  TextField(
                    controller: _tier1Controller,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '0 – 10 km Travel Charge (₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _tier2Controller,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '10 – 25 km Travel Charge (₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _tier3Controller,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '25 – 50 km Travel Charge (₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _tier4Controller,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '50 – 100 km Travel Charge (₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Note: 100+ km outstation travel requires custom quote.',
                      style: AppTextStyles.bodySecondary),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Save Settings CTA Button
            SizedBox(
              width: double.infinity,
              child: CustomButton(
                label: 'Save Configuration Settings',
                icon: Icons.save,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Settings saved successfully in Firestore!'),
                      backgroundColor: AppColors.emeraldGreen,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardWrapper({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.sectionHeader),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
