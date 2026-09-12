enum AiMessageRole { user, assistant, system, tool }

class AiMessageEntity {
  final String messageId;
  final String conversationId;
  final AiMessageRole role;
  final String content;
  final List<String> recommendedLookIds;
  final List<String> recommendedProductIds;
  final Map<String, dynamic>? toolCallDetails;
  final DateTime timestamp;

  const AiMessageEntity({
    required this.messageId,
    required this.conversationId,
    required this.role,
    required this.content,
    required this.recommendedLookIds,
    required this.recommendedProductIds,
    this.toolCallDetails,
    required this.timestamp,
  });
}

class AiRecommendationEntity {
  final String recommendationId;
  final String skinType;
  final String eventCategory;
  final String finishPreference;
  final List<String> lookTitles;
  final List<String> productTitles;
  final double matchScore;
  final String reasoning;

  const AiRecommendationEntity({
    required this.recommendationId,
    required this.skinType,
    required this.eventCategory,
    required this.finishPreference,
    required this.lookTitles,
    required this.productTitles,
    required this.matchScore,
    required this.reasoning,
  });
}

class AiToolAuditLogEntity {
  final String auditId;
  final String toolName;
  final String actorId;
  final String requestedAction;
  final bool isHumanApproved;
  final String executionResult;
  final DateTime timestamp;

  const AiToolAuditLogEntity({
    required this.auditId,
    required this.toolName,
    required this.actorId,
    required this.requestedAction,
    required this.isHumanApproved,
    required this.executionResult,
    required this.timestamp,
  });
}
