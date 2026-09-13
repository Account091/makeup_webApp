import 'package:flutter/material.dart';

class MarketplaceGeographyScreen extends StatefulWidget {
  const MarketplaceGeographyScreen({super.key});

  @override
  State<MarketplaceGeographyScreen> createState() => _MarketplaceGeographyScreenState();
}

class _MarketplaceGeographyScreenState extends State<MarketplaceGeographyScreen> {
  final List<Map<String, dynamic>> _mockCities = [
    {
      'id': 'JAIPUR',
      'name': 'Jaipur City',
      'gmv': 450000,
      'bookings': 36,
      'artists': 18,
      'demand': 'HIGH',
      'pressure': 'HIGH_DEMAND_LOW_SUPPLY',
    },
    {
      'id': 'JODHPUR',
      'name': 'Jodhpur City',
      'gmv': 320000,
      'bookings': 28,
      'artists': 22,
      'demand': 'HIGH',
      'pressure': 'BALANCED',
    },
    {
      'id': 'UDAIPUR',
      'name': 'Udaipur Lakes',
      'gmv': 210000,
      'bookings': 14,
      'artists': 15,
      'demand': 'MEDIUM',
      'pressure': 'HIGH_DEMAND_LOW_SUPPLY',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Regional Supply & Geography',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'City Performance & Demand Pressure',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _mockCities.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final city = _mockCities[index];
                final isHighPressure = city['pressure'] == 'HIGH_DEMAND_LOW_SUPPLY';

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isHighPressure ? Colors.red.withValues(alpha: 0.4) : const Color(0xFF334155),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            city['name'].toString(),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isHighPressure
                                  ? Colors.red.withValues(alpha: 0.2)
                                  : const Color(0xFF10B981).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              city['pressure'].toString(),
                              style: TextStyle(
                                color: isHighPressure ? Colors.redAccent : const Color(0xFF10B981),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'GMV: ₹${city['gmv']}',
                            style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          Text(
                            '${city['bookings']} Bookings • ${city['artists']} Artists',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
