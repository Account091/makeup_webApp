import '../../domain/entities/marketplace_chat_entity.dart';

class MarketplaceConversationModel extends MarketplaceConversation {
  const MarketplaceConversationModel({
    required super.conversationId,
    required super.customerId,
    required super.customerName,
    required super.orgId,
    required super.artistId,
    required super.artistName,
    required super.lastMessage,
    required super.lastMessageTime,
    super.bookingInquiryId,
  });

  factory MarketplaceConversationModel.fromJson(Map<String, dynamic> json) {
    return MarketplaceConversationModel(
      conversationId: json['conversationId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Customer',
      orgId: json['orgId'] as String? ?? '',
      artistId: json['artistId'] as String? ?? '',
      artistName: json['artistName'] as String? ?? 'Artist',
      lastMessage: json['lastMessage'] as String? ?? '',
      lastMessageTime: json['lastMessageTime'] != null
          ? DateTime.parse(json['lastMessageTime'].toString())
          : DateTime.now(),
      bookingInquiryId: json['bookingInquiryId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'conversationId': conversationId,
      'customerId': customerId,
      'customerName': customerName,
      'orgId': orgId,
      'artistId': artistId,
      'artistName': artistName,
      'lastMessage': lastMessage,
      'lastMessageTime': lastMessageTime.toIso8601String(),
      'bookingInquiryId': bookingInquiryId,
    };
  }
}

class MarketplaceMessageModel extends MarketplaceMessage {
  const MarketplaceMessageModel({
    required super.messageId,
    required super.conversationId,
    required super.senderId,
    required super.text,
    required super.timestamp,
    super.isSystemMessage,
  });

  factory MarketplaceMessageModel.fromJson(Map<String, dynamic> json) {
    return MarketplaceMessageModel(
      messageId: json['messageId'] as String? ?? '',
      conversationId: json['conversationId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      text: json['text'] as String? ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
      isSystemMessage: json['isSystemMessage'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'conversationId': conversationId,
      'senderId': senderId,
      'text': text,
      'timestamp': timestamp.toIso8601String(),
      'isSystemMessage': isSystemMessage,
    };
  }
}
