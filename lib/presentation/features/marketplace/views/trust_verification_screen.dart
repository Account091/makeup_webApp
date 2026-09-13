import 'package:flutter/material.dart';

class TrustVerificationScreen extends StatefulWidget {
  final String organizationId;

  const TrustVerificationScreen({
    super.key,
    this.organizationId = 'org-jaipur-royal-glam',
  });

  @override
  State<TrustVerificationScreen> createState() => _TrustVerificationScreenState();
}

class _TrustVerificationScreenState extends State<TrustVerificationScreen> {
  bool _isLoading = false;

  final Map<String, dynamic> _trustScore = {
    'score': 94,
    'badge': 'VERIFIED_PRO',
    'rating': 4.93,
    'completionRate': 98,
    'responseRate': 94,
  };

  final List<Map<String, dynamic>> _checklist = [
    {'title': 'Business & Tax Registration (GSTIN)', 'verified': true},
    {'title': 'Profile Information & Bio', 'verified': true},
    {'title': 'Service Catalog & Regional Pricing', 'verified': true},
    {'title': 'Portfolio Image Verification', 'verified': true},
    {'title': 'UPI VPA Payment Setup', 'verified': true},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          'Trust & Verification (${widget.organizationId})',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() => _isLoading = true);
              Future.delayed(const Duration(milliseconds: 500), () {
                if (mounted) setState(() => _isLoading = false);
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Trust Score Banner Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF881337).withValues(alpha: 0.8),
                    const Color(0xFF1E293B),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'BADGE: ${_trustScore['badge']}',
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Marketplace Trust Score',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Rating: ${_trustScore['rating']} ★ | Completion: ${_trustScore['completionRate']}%',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                  Text(
                    '${_trustScore['score']}',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 44, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Verification Checklist',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _checklist.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = _checklist[index];
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item['title'].toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                      const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
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
