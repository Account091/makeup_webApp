import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';

class CustomerCrmScreen extends StatelessWidget {
  const CustomerCrmScreen({super.key});

  final List<Map<String, dynamic>> _fallbackCustomers = const [
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
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('bookings').snapshots(),
        builder: (context, snapshot) {
          List<Map<String, dynamic>> customers = [];

          if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
            final Map<String, Map<String, dynamic>> customerMap = {};

            for (var doc in snapshot.data!.docs) {
              final data = doc.data() as Map<String, dynamic>? ?? {};
              final cust = data['customerDetails'] as Map<String, dynamic>? ?? {};
              final comm = data['commercials'] as Map<String, dynamic>? ?? {};
              final event = data['event'] as Map<String, dynamic>? ?? {};

              final name = (cust['fullName'] ?? data['customerName'] ?? 'Client').toString();
              final phone = (cust['phone'] ?? data['customerPhone'] ?? '').toString();
              final email = (cust['email'] ?? '').toString();
              final instagram = (cust['instagramHandle'] ?? '@bride').toString();

              final depositPaid = (comm['depositPaid'] as num?)?.toDouble() ?? 0.0;
              final basePrice = (comm['basePrice'] as num?)?.toDouble() ?? 15000.0;
              final rawStatus = (data['status'] ?? '').toString().toUpperCase();
              final isCompleted = rawStatus == 'CONFIRMED' || rawStatus == 'VERIFIED' || rawStatus == 'COMPLETED';

              String lastDate = 'Recently';
              final rawDate = event['date'];
              if (rawDate is Timestamp) {
                final d = rawDate.toDate();
                lastDate = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
              } else if (rawDate is String) {
                lastDate = rawDate.split('T').first;
              }

              final key = phone.trim().isNotEmpty ? phone.trim() : name.trim();

              if (!customerMap.containsKey(key)) {
                customerMap[key] = {
                  'name': name,
                  'phone': phone,
                  'email': email,
                  'instagram': instagram,
                  'totalBookings': 1,
                  'completedEvents': isCompleted ? 1 : 0,
                  'totalRevenue': depositPaid > 0 ? depositPaid : basePrice,
                  'lastBookingDate': lastDate,
                };
              } else {
                customerMap[key]!['totalBookings'] =
                    (customerMap[key]!['totalBookings'] as int) + 1;
                if (isCompleted) {
                  customerMap[key]!['completedEvents'] =
                      (customerMap[key]!['completedEvents'] as int) + 1;
                }
                customerMap[key]!['totalRevenue'] =
                    (customerMap[key]!['totalRevenue'] as double) +
                        (depositPaid > 0 ? depositPaid : basePrice);
              }
            }

            customers = customerMap.values.toList();
          }

          if (customers.isEmpty) {
            customers = _fallbackCustomers;
          }

          final totalClients = customers.length;
          final totalRev = customers.fold<double>(
              0.0, (acc, c) => acc + (c['totalRevenue'] as num).toDouble());

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Client Profiles & History',
                                style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
                            const SizedBox(height: 4),
                            Text('Track client bookings, preferences, and lifetime value.',
                                style: AppTextStyles.bodySecondary),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.lightBorder),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.people, color: AppColors.deepPlum, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                '$totalClients Clients • ${AppFormatters.formatCurrency(totalRev)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.deepPlum,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
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
                          children: customers.map((customer) => SizedBox(
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
          );
        },
      ),
    );
  }

  Widget _buildCustomerCard(
      BuildContext context, Map<String, dynamic> customer) {
    final name = (customer['name'] ?? 'Client').toString();
    final phone = (customer['phone'] ?? '').toString();
    final firstLetter = name.isNotEmpty ? name[0].toUpperCase() : 'C';

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
                  firstLetter,
                  style: AppTextStyles.sectionHeader
                      .copyWith(color: AppColors.deepPlum),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTextStyles.sectionHeader),
                    Text('$phone • ${customer['instagram']}',
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
                    customer['lastBookingDate'].toString(),
                    style: AppTextStyles.bodyPrimary
                        .copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
          if (phone.isNotEmpty) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () async {
                    final clean = phone.replaceAll(RegExp(r'[^0-9+]'), '');
                    var digits = clean.replaceAll('+', '').trim();
                    if (digits.length == 10) digits = '91$digits';
                    final uri = Uri.parse('https://wa.me/$digits?text=Hello%20${Uri.encodeComponent(name)}%2C%20this%20is%20Prachi%20from%20Makeovers%20by%20Prachi.');
                    try {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } catch (_) {
                      try { await launchUrl(uri); } catch (_) {}
                    }
                  },
                  icon: const Icon(Icons.chat_bubble_outline, size: 16, color: Colors.green),
                  label: const Text('WhatsApp Client', style: TextStyle(color: Colors.green, fontSize: 12)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
