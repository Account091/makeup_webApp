class MarketplaceConversation {
  final String conversationId;
  final String customerId;
  final String customerName;
  final String orgId;
  final String artistId;
  final String artistName;
  final String lastMessage;
  final DateTime lastMessageTime;
  final String? bookingInquiryId;

  const MarketplaceConversation({
    required this.conversationId,
    required this.customerId,
    required this.customerName,
    required this.orgId,
    required this.artistId,
    required this.artistName,
    required this.lastMessage,
    required this.lastMessageTime,
    this.bookingInquiryId,
  });
}

class MarketplaceMessage {
  final String messageId;
  final String conversationId;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final bool isSystemMessage;

  const MarketplaceMessage({
    required this.messageId,
    required this.conversationId,
    required this.senderId,
    required this.text,
    required this.timestamp,
    this.isSystemMessage = false,
  });
}
