import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';

class CustomerCrmScreen extends StatelessWidget {
  const CustomerCrmScreen({super.key});

  final List<Map<String, dynamic>> _mockCustomers = const [
    {
      'name': 'Priya Sharma',
      'phone': '+91 98290 12345',
      'email': 'priya.sharma@example.com',
      'instagram': '@priya_bride',
      'totalBookings': 2,
      'completedEvents': 1,
      'totalRevenue': 26500.0,
      'lastBookingDate': '2026-09-20',
    },
    {
      'name': 'Ananya Rathore',
      'phone': '+91 94140 67890',
      'email': 'ananya.r@example.com',
      'instagram': '@ananya_rathore',
      'totalBookings': 1,
      'completedEvents': 1,
      'totalRevenue': 12000.0,
      'lastBookingDate': '2026-09-05',
    },
    {
      'name': 'Kavita Mehta',
      'phone': '+91 97850 54321',
      'email': 'kavita.m@example.com',
      'instagram': '@kavita_makeup',
      'totalBookings': 1,
      'completedEvents': 0,
      'totalRevenue': 4500.0,
      'lastBookingDate': '2026-09-12',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Customer CRM & Revenue Insights',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 18),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Client Profiles & History',
                    style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
                const SizedBox(height: 4),
                Text('Track client bookings, preferences, and lifetime value.',
                    style: AppTextStyles.bodySecondary),
                const SizedBox(height: 20),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final width = constraints.maxWidth;
                    final int cols = width > 760 ? 2 : 1;
                    final double cardWidth = cols == 1
                        ? width
                        : (width - (cols - 1) * 16) / cols;

                    return Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      children: _mockCustomers.map((customer) => SizedBox(
                        width: cardWidth,
                        child: _buildCustomerCard(context, customer),
                      )).toList(),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCustomerCard(
      BuildContext context, Map<String, dynamic> customer) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.softRose,
                child: Text(
                  customer['name'][0],
                  style: AppTextStyles.sectionHeader
                      .copyWith(color: AppColors.deepPlum),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customer['name'], style: AppTextStyles.sectionHeader),
                    Text('${customer['phone']} • ${customer['instagram']}',
                        style: AppTextStyles.bodySecondary),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.roseGold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${customer['completedEvents']} Completed',
                  style: AppTextStyles.badgeText.copyWith(color: AppColors.roseGold),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: AppColors.lightBorder),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Lifetime Revenue', style: AppTextStyles.bodySecondary),
                  Text(
                    AppFormatters.formatCurrency(customer['totalRevenue']),
                    style: AppTextStyles.sectionHeader
                        .copyWith(color: AppColors.deepPlum),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Last Booking', style: AppTextStyles.bodySecondary),
                  Text(
                    customer['lastBookingDate'],
                    style: AppTextStyles.bodyPrimary
                        .copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
