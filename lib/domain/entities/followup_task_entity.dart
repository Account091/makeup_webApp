import 'package:equatable/equatable.dart';

enum FollowUpTaskType { depositPending, unansweredInquiry, quoteExpiring, reviewFollowup }
enum TaskPriority { high, medium, low }

class FollowUpTaskEntity extends Equatable {
  final String id;
  final String leadId;
  final String customerId;
  final String bookingId;
  final String customerName;
  final String customerPhone;
  final String serviceTitle;
  final String eventDate;
  final double quoteAmount;
  final FollowUpTaskType taskType;
  final TaskPriority priority;
  final DateTime dueDate;
  final bool isCompleted;
  final DateTime createdAt;

  const FollowUpTaskEntity({
    required this.id,
    required this.leadId,
    required this.customerId,
    required this.bookingId,
    required this.customerName,
    required this.customerPhone,
    required this.serviceTitle,
    required this.eventDate,
    required this.quoteAmount,
    required this.taskType,
    required this.priority,
    required this.dueDate,
    required this.isCompleted,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        leadId,
        customerId,
        bookingId,
        customerName,
        customerPhone,
        serviceTitle,
        eventDate,
        quoteAmount,
        taskType,
        priority,
        dueDate,
        isCompleted,
        createdAt,
      ];
}
