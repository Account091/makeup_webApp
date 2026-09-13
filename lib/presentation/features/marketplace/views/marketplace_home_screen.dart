import 'package:flutter/material.dart';

class MarketplaceHomeScreen extends StatefulWidget {
  const MarketplaceHomeScreen({super.key});

  @override
  State<MarketplaceHomeScreen> createState() => _MarketplaceHomeScreenState();
}

class _MarketplaceHomeScreenState extends State<MarketplaceHomeScreen> {
  String _selectedCity = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Beauty Marketplace & Discovery'),
        actions: [
          IconButton(
            icon: const Icon(Icons.storefront),
            tooltip: 'Tenant Portal',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tenant Portal Selected')),
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
            // Banner Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.amber.shade900, Colors.purple.shade900],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'V8.0 Marketplace Engine',
                    style: TextStyle(
                      color: Colors.amberAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Multi-Tenant Artist Marketplace',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Discover verified makeup artists, hair stylists, and studios with transparent pricing and verified reviews.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // City Filter Selector
            Row(
              children: [
                const Text(
                  'Select City:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                DropdownButton<String>(
                  value: _selectedCity,
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Cities')),
                    DropdownMenuItem(value: 'jodhpur', child: Text('Jodhpur')),
                    DropdownMenuItem(value: 'jaipur', child: Text('Jaipur')),
                    DropdownMenuItem(value: 'udaipur', child: Text('Udaipur')),
                    DropdownMenuItem(value: 'destination', child: Text('Destination')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedCity = val;
                      });
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Featured Artists Header
            const Text(
              '🌟 Featured Verified Artists',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            if (_selectedCity == 'all' || _selectedCity == 'jodhpur')
              _buildArtistCard(
                'Prachi Rathore',
                'Makeovers by Prachi',
                'Jodhpur • Jaipur • Udaipur • Dest',
                '4.92 ★ (125 reviews)',
                'From ₹25,000',
                Colors.amber.shade900,
              ),
            if (_selectedCity == 'all' || _selectedCity == 'jaipur')
              _buildArtistCard(
                'Ananya Sharma',
                'Jaipur Royal Glam Studio',
                'Jaipur • Udaipur',
                '4.85 ★ (73 reviews)',
                'From ₹28,000',
                Colors.indigo.shade700,
              ),

            const SizedBox(height: 24),

            // Marketplace Listings Header
            const Text(
              '✨ Signature Package Listings',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildListingTile('Signature Royal Destination Bridal Package', 'Makeovers by Prachi', '₹35,000', '4.95 ★'),
            _buildListingTile('Heritage Royal Jaipur Bridal Suite', 'Jaipur Royal Glam Studio', '₹28,000', '4.85 ★'),
          ],
        ),
      ),
    );
  }

  Widget _buildArtistCard(
    String name,
    String studio,
    String locations,
    String rating,
    String price,
    Color color,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: color.withValues(alpha: 0.2),
                      child: Icon(Icons.person, color: color),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(studio, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('✓ Verified', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(locations, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(rating, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.amber)),
                Text(price, style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green.shade700, fontSize: 16)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListingTile(String title, String org, String price, String rating) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.auto_awesome, color: Colors.amber),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(org, style: const TextStyle(fontSize: 11)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(price, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 14)),
            Text(rating, style: const TextStyle(fontSize: 10, color: Colors.amber)),
          ],
        ),
      ),
    );
  }
}
