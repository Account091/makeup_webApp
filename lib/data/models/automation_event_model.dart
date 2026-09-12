import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';

class AutomationEventModel extends Equatable {
  final String eventId;
  final String bookingId;
  final String customerId;
  final String trigger;
  final String channel;
  final String recipientPhone;
  final String status; // Sent, Delivered, Read, Failed
  final DateTime sentAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;
  final String? providerMessageId;

  const AutomationEventModel({
    required this.eventId,
    required this.bookingId,
    required this.customerId,
    required this.trigger,
    required this.channel,
    required this.recipientPhone,
    required this.status,
    required this.sentAt,
    this.deliveredAt,
    this.readAt,
    this.providerMessageId,
  });

  factory AutomationEventModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return AutomationEventModel(
      eventId: doc.id,
      bookingId: data['bookingId'] ?? '',
      customerId: data['customerId'] ?? '',
      trigger: data['trigger'] ?? '',
      channel: data['channel'] ?? 'WhatsApp',
      recipientPhone: data['recipientPhone'] ?? '',
      status: data['status'] ?? 'Sent',
      sentAt: (data['sentAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      deliveredAt: (data['deliveredAt'] as Timestamp?)?.toDate(),
      readAt: (data['readAt'] as Timestamp?)?.toDate(),
      providerMessageId: data['providerMessageId'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'bookingId': bookingId,
      'customerId': customerId,
      'trigger': trigger,
      'channel': channel,
      'recipientPhone': recipientPhone,
      'status': status,
      'sentAt': Timestamp.fromDate(sentAt),
      if (deliveredAt != null) 'deliveredAt': Timestamp.fromDate(deliveredAt!),
      if (readAt != null) 'readAt': Timestamp.fromDate(readAt!),
      'providerMessageId': providerMessageId,
    };
  }

  @override
  List<Object?> get props => [
        eventId,
        bookingId,
        customerId,
        trigger,
        channel,
        recipientPhone,
        status,
        sentAt,
        deliveredAt,
        readAt,
        providerMessageId,
      ];
}
