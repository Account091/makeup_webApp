import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/ai_assistant_entity.dart';

class CustomerAiAssistantScreen extends StatefulWidget {
  const CustomerAiAssistantScreen({super.key});

  @override
  State<CustomerAiAssistantScreen> createState() => _CustomerAiAssistantScreenState();
}

class _CustomerAiAssistantScreenState extends State<CustomerAiAssistantScreen> {
  final TextEditingController _queryController = TextEditingController();
  final List<AiMessageEntity> _messages = [
    AiMessageEntity(
      messageId: 'msg_01',
      conversationId: 'conv_101',
      role: AiMessageRole.assistant,
      content: 'Hello! I am Prachi\'s AI Beauty Assistant ✨. Ask me anything about Rajasthani bridal makeup, skin prep, product recommendations, or date availability!',
      recommendedLookIds: [],
      recommendedProductIds: [],
      timestamp: DateTime.parse('2026-09-12 10:00:00'),
    ),
  ];

  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Prachi AI Beauty Concierge',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
      ),
      body: Column(
        children: [
          // 1. Guardrail Info Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.amber.withValues(alpha: 0.1),
            child: const Row(
              children: [
                Icon(Icons.shield_outlined, color: AppPalette.textGold, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'AI recommendations use Prachi\'s official catalog & approved consultation guidelines.',
                    style: TextStyle(color: AppPalette.textGold, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),

          // 2. Chat Messages Stream
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.role == AiMessageRole.user;
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isUser ? AppPalette.goldAccent : AppPalette.surfaceDark,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isUser ? AppPalette.goldAccent : Colors.white10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg.content,
                          style: TextStyle(
                            color: isUser ? Colors.black : Colors.white,
                            fontSize: 13,
                            fontWeight: isUser ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        if (msg.recommendedProductIds.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.black26,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: const [
                                Icon(Icons.shopping_bag_outlined, color: AppPalette.textGold, size: 14),
                                SizedBox(width: 6),
                                Text('Matched Catalog Item: Royal Velvet Matte Lipstick', style: TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isProcessing) const LinearProgressIndicator(color: AppPalette.goldAccent, backgroundColor: Colors.transparent),

          // 3. Input Query Box

          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: AppPalette.surfaceDark,
              border: Border(top: BorderSide(color: Colors.white10)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _queryController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Ask about bridal looks, skin prep, or products...',
                      hintStyle: TextStyle(color: AppPalette.textSecondary, fontSize: 12),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (val) => _handleSendQuery(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send_rounded, color: AppPalette.textGold),
                  onPressed: _handleSendQuery,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSendQuery() {
    final text = _queryController.text.trim();
    if (text.isEmpty) return;

    final nowMs = DateTime.now().millisecondsSinceEpoch;

    setState(() {
      _messages.add(AiMessageEntity(
        messageId: 'msg_u_$nowMs',
        conversationId: 'conv_101',
        role: AiMessageRole.user,
        content: text,
        recommendedLookIds: [],
        recommendedProductIds: [],
        timestamp: DateTime.now(),
      ));
      _queryController.clear();
      _isProcessing = true;
    });

    // Simulate AI response calling generateCustomerBeautyRecommendation
    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        _messages.add(AiMessageEntity(
          messageId: 'msg_a_${DateTime.now().millisecondsSinceEpoch}',
          conversationId: 'conv_101',
          role: AiMessageRole.assistant,
          content: 'For a $text look, Prachi recommends an HD Airbrush dewy finish with soft smokey eyes. Would you like me to submit a booking inquiry for Prachi to review?',
          recommendedLookIds: ['look_01'],
          recommendedProductIds: ['prod_01'],
          timestamp: DateTime.now(),
        ));
      });
    });
  }
}

