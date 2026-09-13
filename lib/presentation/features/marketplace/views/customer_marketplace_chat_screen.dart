import 'package:flutter/material.dart';

class CustomerMarketplaceChatScreen extends StatefulWidget {
  const CustomerMarketplaceChatScreen({super.key});

  @override
  State<CustomerMarketplaceChatScreen> createState() => _CustomerMarketplaceChatScreenState();
}

class _CustomerMarketplaceChatScreenState extends State<CustomerMarketplaceChatScreen> {
  final TextEditingController _messageController = TextEditingController();

  final List<Map<String, dynamic>> _mockMessages = [
    {
      'id': 'msg-01',
      'senderType': 'SYSTEM',
      'text': 'Pre-booking inquiry created for Royal Marwari Bridal Package.',
      'time': '10:00 AM',
    },
    {
      'id': 'msg-02',
      'senderType': 'CUSTOMER',
      'text': 'Hello! Do you provide traditional Rajasthani jewelry draping with bridal makeup?',
      'time': '10:02 AM',
    },
    {
      'id': 'msg-03',
      'senderType': 'ARTIST',
      'text': 'Namaste! Yes, all our bridal packages in Jodhpur include complete jewelry draping and hair styling.',
      'time': '10:05 AM',
    },
  ];

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    setState(() {
      _mockMessages.add({
        'id': 'msg-${DateTime.now().millisecondsSinceEpoch}',
        'senderType': 'CUSTOMER',
        'text': _messageController.text.trim(),
        'time': 'Just now',
      });
      _messageController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Priya Rathore (Jodhpur Royal Glam)',
              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                ),
                const SizedBox(width: 6),
                const Text(
                  'Verified Artist • Active',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Message List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _mockMessages.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final msg = _mockMessages[index];
                final senderType = msg['senderType'] as String;

                if (senderType == 'SYSTEM') {
                  return Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF312E81).withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '⚙️ ${msg['text']}',
                        style: const TextStyle(color: Color(0xFFA5B4FC), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                }

                final isCustomer = senderType == 'CUSTOMER';
                return Align(
                  alignment: isCustomer ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isCustomer ? const Color(0xFF4F46E5) : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: isCustomer ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['text'].toString(),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time'].toString(),
                          style: const TextStyle(color: Colors.white54, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Composer Footer
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              border: Border(top: BorderSide(color: Color(0xFF334155))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Type your message to artist...',
                      hintStyle: const TextStyle(color: Colors.grey),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: Color(0xFF38BDF8)),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
