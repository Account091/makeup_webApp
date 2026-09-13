import 'package:flutter/material.dart';

class AdminWhatsAppCopilotScreen extends StatefulWidget {
  const AdminWhatsAppCopilotScreen({super.key});

  @override
  State<AdminWhatsAppCopilotScreen> createState() => _AdminWhatsAppCopilotScreenState();
}

class _AdminWhatsAppCopilotScreenState extends State<AdminWhatsAppCopilotScreen> {
  final TextEditingController _messageController = TextEditingController();
  bool _aiEnabled = true;
  String _convStatus = 'ACTIVE';

  final List<Map<String, dynamic>> _chatLog = [
    {
      'direction': 'INBOUND',
      'sender': 'Customer (+91 9829012345)',
      'text': 'Hi, I uploaded my payment screenshot for Royal Bridal.',
      'timestamp': '10:15 AM',
      'isImage': true,
    },
    {
      'direction': 'OUTBOUND',
      'sender': 'AI WhatsApp Assistant ✨',
      'text': 'Payment proof received! AI screening: SUCCESS. Amount detected: ₹7,500. Status: Awaiting manual verification by team.',
      'timestamp': '10:15 AM',
    },
  ];

  void _handleSend([String? text]) {
    final messageText = text ?? _messageController.text.trim();
    if (messageText.isEmpty) return;

    if (text == null) {
      _messageController.clear();
    }

    setState(() {
      _chatLog.add({
        'direction': 'INBOUND',
        'sender': 'Customer (+91 9829012345)',
        'text': messageText,
        'timestamp': TimeOfDay.now().format(context),
      });
    });

    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      setState(() {
        if (_aiEnabled) {
          _chatLog.add({
            'direction': 'OUTBOUND',
            'sender': 'AI WhatsApp Assistant ✨',
            'text':
                'Thank you for reaching out! For "$messageText", our team has updated your booking schedule. You can view your invoice directly at makeoversbyprachi.com/track',
            'timestamp': TimeOfDay.now().format(context),
          });
        } else {
          _chatLog.add({
            'direction': 'OUTBOUND',
            'sender': 'SYSTEM',
            'text': '💬 [SYSTEM] AI is paused. Message routed to Human Support Inbox.',
            'timestamp': TimeOfDay.now().format(context),
          });
        }
      });
    });
  }

  void _toggleAi(bool enable) {
    setState(() {
      _aiEnabled = enable;
      _convStatus = enable ? 'ACTIVE' : 'PAUSED';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(enable ? 'AI WhatsApp Assistant Resumed.' : 'AI WhatsApp Assistant Paused.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    const greenPrimary = Color(0xFF22C55E);
    const darkBg = Color(0xFF0C0C10);
    const cardBg = Color(0xFF161620);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF14121A),
        elevation: 2,
        title: const Row(
          children: [
            Icon(Icons.chat_rounded, color: greenPrimary, size: 20),
            SizedBox(width: 8),
            Text(
              'AI WhatsApp Control 🟢',
              style: TextStyle(
                color: Color(0xFFF3E5AB),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(_aiEnabled ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
                color: _aiEnabled ? Colors.orangeAccent : greenPrimary),
            onPressed: () => _toggleAi(!_aiEnabled),
            tooltip: _aiEnabled ? 'Pause AI' : 'Resume AI',
          )
        ],
      ),
      body: Column(
        children: [
          // Status Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            color: const Color(0xFF121218),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: _aiEnabled ? greenPrimary : Colors.orangeAccent,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Status: ${_aiEnabled ? "● ACTIVE" : "PAUSED"} ($_convStatus)',
                      style: TextStyle(
                        color: _aiEnabled ? Colors.greenAccent : Colors.orangeAccent,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _toggleAi(false),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent.withValues(alpha: 0.2),
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Colors.redAccent),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  ),
                  icon: const Icon(Icons.person_pin_rounded, size: 14),
                  label: const Text('Human Takeover', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ),

          // Chat Messages
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: _chatLog.length,
              itemBuilder: (context, index) {
                final msg = _chatLog[index];
                final isInbound = msg['direction'] == 'INBOUND';

                return Align(
                  alignment: isInbound ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12.0),
                    padding: const EdgeInsets.all(14.0),
                    constraints: const BoxConstraints(maxWidth: 300),
                    decoration: BoxDecoration(
                      color: isInbound ? cardBg : greenPrimary.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isInbound ? Colors.white12 : greenPrimary.withValues(alpha: 0.5),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${msg['sender']} • ${msg['timestamp']}',
                          style: TextStyle(
                            color: isInbound ? const Color(0xFFD4AF37) : Colors.greenAccent,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['text'] ?? '',
                          style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Simulation Input Bar
          Container(
            padding: const EdgeInsets.all(12.0),
            color: const Color(0xFF14121A),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Simulate WhatsApp message...',
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                      filled: true,
                      fillColor: Colors.white.withValues(alpha: 0.05),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: greenPrimary.withValues(alpha: 0.4)),
                      ),
                    ),
                    onSubmitted: (val) => _handleSend(val),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () => _handleSend(),
                  icon: const Icon(Icons.send_rounded, color: greenPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
