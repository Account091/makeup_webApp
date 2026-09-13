import 'package:flutter/material.dart';

class MarketplaceSearchScreen extends StatefulWidget {
  const MarketplaceSearchScreen({super.key});

  @override
  State<MarketplaceSearchScreen> createState() => _MarketplaceSearchScreenState();
}

class _MarketplaceSearchScreenState extends State<MarketplaceSearchScreen> {
  bool _isLoading = false;
  String _selectedLocation = 'ALL';
  bool _verifiedOnly = true;



  final TextEditingController _searchController = TextEditingController();
  String? _aiExplanation;

  final List<Map<String, dynamic>> _mockListings = [
    {
      'id': 'listing-jdp-01',
      'title': 'Royal Marwari Bridal Package',
      'orgName': 'Jodhpur Royal Glamour',
      'artistName': 'Priya Rathore',
      'locationId': 'JODHPUR',
      'rating': 4.93,
      'reviewCount': 128,
      'price': 25000,
      'verified': true,
      'promoted': true,
      'coldStart': false,
      'score': 94.2,
      'completionRate': 99.1,
    },
    {
      'id': 'listing-jpr-02',
      'title': 'High Fashion Sangeet & Bridal Makeup',
      'orgName': 'Jaipur Couture Beauty',
      'artistName': 'Ananya Sharma',
      'locationId': 'JAIPUR',
      'rating': 4.88,
      'reviewCount': 85,
      'price': 22000,
      'verified': true,
      'promoted': false,
      'coldStart': false,
      'score': 88.5,
      'completionRate': 98.4,
    },
    {
      'id': 'listing-udr-03',
      'title': 'Palace Destination Wedding Glow',
      'orgName': 'Udaipur Palace Makeovers',
      'artistName': 'Sunita Mehta',
      'locationId': 'UDAIPUR',
      'rating': 4.95,
      'reviewCount': 42,
      'price': 35000,
      'verified': true,
      'promoted': false,
      'coldStart': true,
      'score': 86.1,
      'completionRate': 100.0,
    },
  ];

  void _runAiSearch() {
    if (_searchController.text.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _aiExplanation = null;
    });

    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _aiExplanation =
              'AI parsed intent: Location set to ${_selectedLocation == 'ALL' ? 'Rajasthan Multi-City' : _selectedLocation}, intent prioritized for verified high-completion providers matching "${_searchController.text.trim()}".';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Marketplace Search & Discovery',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AI Assistant Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'AI Marketplace Discovery',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Search using natural language prompt. Parsed safely into deterministic ranking engine.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(color: Colors.black87, fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'e.g. Bridal makeup artist in Jodhpur under ₹25,000',
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _runAiSearch,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF4F46E5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4F46E5)),
                              )
                            : const Text('Search', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            if (_aiExplanation != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withValues(alpha: 0.5),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _aiExplanation!,
                  style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 12),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Filter Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  DropdownButton<String>(
                    value: _selectedLocation,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: 'ALL', child: Text('All Locations')),
                      DropdownMenuItem(value: 'JODHPUR', child: Text('Jodhpur')),
                      DropdownMenuItem(value: 'JAIPUR', child: Text('Jaipur')),
                      DropdownMenuItem(value: 'UDAIPUR', child: Text('Udaipur')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedLocation = val);
                    },
                  ),
                  Row(
                    children: [
                      const Text('Verified', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Switch(
                        value: _verifiedOnly,
                        activeTrackColor: const Color(0xFF10B981),
                        onChanged: (val) => setState(() => _verifiedOnly = val),
                      ),

                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'Ranked Results (V8.5 Bayesian Weight Engine)',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Listings List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _mockListings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = _mockListings[index];
                final isPromoted = item['promoted'] as bool;
                final isVerified = item['verified'] as bool;
                final isColdStart = item['coldStart'] as bool;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isPromoted ? const Color(0xFF8B5CF6) : const Color(0xFF334155),
                      width: isPromoted ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item['title'].toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          if (isPromoted)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8B5CF6),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'SPONSORED',
                                style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'by ${item['artistName']} • ${item['orgName']} (${item['locationId']})',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${item['rating']} (${item['reviewCount']})',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              const SizedBox(width: 10),
                              if (isVerified)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    '✓ Verified',
                                    style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              if (isColdStart) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'NEW PRO',
                                    style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          Text(
                            '₹${item['price']}',
                            style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 14),
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
