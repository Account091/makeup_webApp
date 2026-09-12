import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/followup_task_entity.dart';

class FollowUpTaskModel extends FollowUpTaskEntity {
  const FollowUpTaskModel({
    required super.id,
    required super.leadId,
    required super.customerId,
    required super.bookingId,
    required super.customerName,
    required super.customerPhone,
    required super.serviceTitle,
    required super.eventDate,
    required super.quoteAmount,
    required super.taskType,
    required super.priority,
    required super.dueDate,
    required super.isCompleted,
    required super.createdAt,
  });

  factory FollowUpTaskModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    FollowUpTaskType parseTaskType(String? val) {
      switch (val) {
        case 'UNANSWERED_INQUIRY':
          return FollowUpTaskType.unansweredInquiry;
        case 'QUOTE_EXPIRING':
          return FollowUpTaskType.quoteExpiring;
        case 'REVIEW_FOLLOWUP':
          return FollowUpTaskType.reviewFollowup;
        default:
          return FollowUpTaskType.depositPending;
      }
    }

    TaskPriority parsePriority(String? val) {
      switch (val) {
        case 'HIGH':
          return TaskPriority.high;
        case 'LOW':
          return TaskPriority.low;
        default:
          return TaskPriority.medium;
      }
    }

    return FollowUpTaskModel(
      id: doc.id,
      leadId: data['leadId'] ?? '',
      customerId: data['customerId'] ?? '',
      bookingId: data['bookingId'] ?? '',
      customerName: data['customerName'] ?? 'Customer',
      customerPhone: data['customerPhone'] ?? '',
      serviceTitle: data['serviceTitle'] ?? 'Makeup Service',
      eventDate: data['eventDate'] ?? '',
      quoteAmount: (data['quoteAmount'] as num?)?.toDouble() ?? 0.0,
      taskType: parseTaskType(data['taskType']),
      priority: parsePriority(data['priority']),
      dueDate: (data['dueDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isCompleted: data['isCompleted'] ?? false,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'leadId': leadId,
      'customerId': customerId,
      'bookingId': bookingId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'serviceTitle': serviceTitle,
      'eventDate': eventDate,
      'quoteAmount': quoteAmount,
      'taskType': taskType.name.toUpperCase(),
      'priority': priority.name.toUpperCase(),
      'dueDate': Timestamp.fromDate(dueDate),
      'isCompleted': isCompleted,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
