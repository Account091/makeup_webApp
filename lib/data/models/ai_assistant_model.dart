import '../../domain/entities/ai_assistant_entity.dart';

class AiMessageModel extends AiMessageEntity {
  const AiMessageModel({
    required super.messageId,
    required super.conversationId,
    required super.role,
    required super.content,
    required super.recommendedLookIds,
    required super.recommendedProductIds,
    super.toolCallDetails,
    required super.timestamp,
  });

  factory AiMessageModel.fromJson(Map<String, dynamic> json, String id) {
    return AiMessageModel(
      messageId: id,
      conversationId: json['conversationId'] ?? '',
      role: AiMessageRole.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['role'] ?? '').toString().toLowerCase(),
        orElse: () => AiMessageRole.assistant,
      ),
      content: json['content'] ?? '',
      recommendedLookIds: List<String>.from(json['recommendedLookIds'] ?? []),
      recommendedProductIds: List<String>.from(json['recommendedProductIds'] ?? []),
      toolCallDetails: json['toolCallDetails'] as Map<String, dynamic>?,
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp'] ?? DateTime.now().millisecondsSinceEpoch),

    );
  }

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'conversationId': conversationId,
      'role': role.name,
      'content': content,
      'recommendedLookIds': recommendedLookIds,
      'recommendedProductIds': recommendedProductIds,
      'toolCallDetails': toolCallDetails,
      'timestamp': timestamp.millisecondsSinceEpoch,
    };
  }
}
