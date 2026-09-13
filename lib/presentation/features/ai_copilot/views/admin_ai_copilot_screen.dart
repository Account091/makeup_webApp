import 'package:flutter/material.dart';

class AdminAiCopilotScreen extends StatefulWidget {
  const AdminAiCopilotScreen({super.key});

  @override
  State<AdminAiCopilotScreen> createState() => _AdminAiCopilotScreenState();
}

class _AdminAiCopilotScreenState extends State<AdminAiCopilotScreen> {
  final TextEditingController _queryController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'query': 'Initial Operations Snapshot',
      'summary':
          'Good morning, Prachi! Today you have 4 scheduled bookings, 2 UPI payment proofs awaiting manual verification, 3 hot CRM lead follow-ups overdue, and 1 travel buffer conflict alert.',
      'reasoning': [
        {'factor': 'HOT LEAD', 'details': 'Bridal inquiry for peak date Nov 15', 'source': 'CRM lead scoring'},
        {'factor': 'TRAVEL RISK', 'details': '3.5h drive between Jaipur & Jodhpur', 'source': 'Calendar engine'}
      ],
      'actionCards': [
        {'label': 'Review Payment (BK-9921)', 'actionType': 'VERIFY_PAYMENT_RECOMMENDED'},
        {'label': 'Call Customer (Neha)', 'actionType': 'CALL_CUSTOMER'},
      ],
      'timestamp': '09:00 AM'
    }
  ];

  bool _loading = false;
  String _selectedRole = 'ADMIN';

  void _handleSend([String? customPrompt]) {
    final text = customPrompt ?? _queryController.text.trim();
    if (text.isEmpty || _loading) return;

    if (customPrompt == null) {
      _queryController.clear();
    }

    setState(() {
      _loading = true;
      _messages.add({
        'role': 'user',
        'content': text,
        'timestamp': TimeOfDay.now().format(context),
      });
    });

    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _messages.add({
          'role': 'assistant',
          'query': text,
          'summary':
              'AI Copilot Recommendation: For query "$text", priorities are:\n1. Verify Priya Sharma\'s UTR screenshot (BK-9921)\n2. Call Neha Gupta regarding her bridal quote\n3. Review Saturday reschedule request.',
          'reasoning': [
            {'factor': 'HIGH PRIORITY', 'details': 'Payment proof uploaded with AI status SUCCESS', 'source': 'Payment Engine'},
          ],
          'actionCards': [
            {'label': 'Review & Execute Action', 'actionType': 'REVIEW_AND_EXECUTE'},
          ],
          'timestamp': TimeOfDay.now().format(context),
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    const goldPrimary = Color(0xFFD4AF37);
    const darkBg = Color(0xFF0C0C10);
    const cardBg = Color(0xFF161620);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF14121A),
        elevation: 2,
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: goldPrimary, size: 20),
            SizedBox(width: 8),
            Text(
              'AI Admin Copilot V5.2',
              style: TextStyle(
                color: Color(0xFFF3E5AB),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: DropdownButton<String>(
              value: _selectedRole,
              dropdownColor: cardBg,
              style: const TextStyle(color: goldPrimary, fontSize: 12, fontWeight: FontWeight.bold),
              underline: const SizedBox(),
              items: ['ADMIN', 'MANAGER', 'SUPPORT', 'ACCOUNTANT'].map((r) {
                return DropdownMenuItem(value: r, child: Text('Role: $r'));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedRole = val);
              },
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Overview Summary Cards
          Container(
            padding: const EdgeInsets.all(16.0),
            color: const Color(0xFF121218),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Today's Overview Snapshot",
                  style: TextStyle(color: Color(0xFFF3E5AB), fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildMetricTile('Bookings Today', '4 Scheduled', Colors.amber),
                      _buildMetricTile('Payments Pending', '2 Screenshots', Colors.orangeAccent),
                      _buildMetricTile('Lead Follow-ups', '3 Overdue', Colors.blueAccent),
                      _buildMetricTile('Risk Alerts', '1 Travel Conflict', Colors.redAccent),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Preset Action Pills
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildPill('Today\'s operations', "Which bookings need attention today?"),
                  _buildPill('Pending payments', "Show pending payment verifications"),
                  _buildPill('Follow-ups', "Which leads haven't been followed up?"),
                  _buildPill('Revenue summary', "Summarize revenue stats"),
                  _buildPill('Risks', "What are today's operational risks?"),
                ],
              ),
            ),
          ),

          // Chat Messages
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';

                if (isUser) {
                  return Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12.0),
                      padding: const EdgeInsets.all(14.0),
                      decoration: BoxDecoration(
                        color: goldPrimary.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: goldPrimary.withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        msg['content'] ?? '',
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ),
                  );
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 16.0),
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '✨ ADMIN AI COPILOT',
                            style: TextStyle(color: goldPrimary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          Text(msg['timestamp'] ?? '', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        msg['summary'] ?? '',
                        style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5),
                      ),
                      if (msg['reasoning'] != null) ...[
                        const SizedBox(height: 10),
                        ...(msg['reasoning'] as List).map((r) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 4.0),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.04),
                              border: const Border(left: BorderSide(color: goldPrimary, width: 3)),
                            ),
                            child: Text(
                              '• ${r['factor']}: ${r['details']} (Source: ${r['source']})',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          );
                        }),
                      ],
                      if (msg['actionCards'] != null) ...[
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: (msg['actionCards'] as List).map((card) {
                            return ElevatedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Selected: ${card['label']}. Human approval initiated.')),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: goldPrimary.withValues(alpha: 0.25),
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: goldPrimary),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              icon: const Icon(Icons.arrow_forward_rounded, size: 14, color: goldPrimary),
                              label: Text(card['label'] ?? 'Execute Action', style: const TextStyle(fontSize: 12)),
                            );
                          }).toList(),
                        )
                      ],
                    ],
                  ),
                );
              },
            ),
          ),

          if (_loading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(color: goldPrimary),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12.0),
            color: const Color(0xFF14121A),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _queryController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Ask Copilot about bookings, payments, or CRM leads...',
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                      filled: true,
                      fillColor: Colors.white.withValues(alpha: 0.06),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: goldPrimary.withValues(alpha: 0.4)),
                      ),
                    ),
                    onSubmitted: (val) => _handleSend(val),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () => _handleSend(),
                  icon: const Icon(Icons.send_rounded, color: goldPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildPill(String label, String prompt) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      child: ActionChip(
        backgroundColor: Colors.white.withValues(alpha: 0.06),
        side: BorderSide(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
        label: Text(label, style: const TextStyle(color: Color(0xFFF3E5AB), fontSize: 12)),
        onPressed: () => _handleSend(prompt),
      ),
    );
  }
}
