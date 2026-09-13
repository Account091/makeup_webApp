import 'package:flutter/material.dart';

class ArtistChatInboxScreen extends StatefulWidget {
  const ArtistChatInboxScreen({super.key});

  @override
  State<ArtistChatInboxScreen> createState() => _ArtistChatInboxScreenState();
}

class _ArtistChatInboxScreenState extends State<ArtistChatInboxScreen> {
  String _selectedFilter = 'ALL';

  final List<Map<String, dynamic>> _mockConversations = [
    {
      'id': 'conv-01',
      'customerName': 'Neha Sharma',
      'lastMessage': 'Do you provide traditional Rajasthani jewelry draping?',
      'time': '10:02 AM',
      'unread': 1,
      'bookingId': null,
      'status': 'ACTIVE',
    },
    {
      'id': 'conv-02',
      'customerName': 'Kavita Rathore',
      'lastMessage': 'Looking forward to your Marwari bridal makeup on Oct 18!',
      'time': 'Yesterday',
      'unread': 0,
      'bookingId': 'BK-JDP-901',
      'status': 'ACTIVE',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _mockConversations.filterWhere((c) {
      if (_selectedFilter == 'UNREAD') return (c['unread'] as int) > 0;
      if (_selectedFilter == 'BOOKED') return c['bookingId'] != null;
      if (_selectedFilter == 'NEW') return c['bookingId'] == null;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Artist Chat Inbox',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF1E293B),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['ALL', 'UNREAD', 'BOOKED', 'NEW'].map((filterLabel) {
                  final isSelected = _selectedFilter == filterLabel;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(filterLabel),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      selectedColor: const Color(0xFF4F46E5),
                      backgroundColor: const Color(0xFF0F172A),
                      onSelected: (_) => setState(() => _selectedFilter = filterLabel),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = filtered[index];
                final unread = item['unread'] as int;
                final bookingId = item['bookingId'] as String?;

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: unread > 0 ? const Color(0xFF38BDF8) : const Color(0xFF334155),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  item['customerName'].toString(),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: bookingId != null
                                        ? const Color(0xFF10B981).withValues(alpha: 0.2)
                                        : Colors.amber.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    bookingId != null ? 'Booking: $bookingId' : 'Pre-Booking',
                                    style: TextStyle(
                                      color: bookingId != null ? const Color(0xFF10B981) : Colors.amber,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item['lastMessage'].toString(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(item['time'].toString(), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                          if (unread > 0) ...[
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '$unread',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

extension IterableExtension<T> on Iterable<T> {
  Iterable<T> filterWhere(bool Function(T element) test) sync* {
    for (var element in this) {
      if (test(element)) yield element;
    }
  }
}
