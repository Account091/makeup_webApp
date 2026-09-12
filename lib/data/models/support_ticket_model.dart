import '../../domain/entities/support_ticket_entity.dart';

class SupportTicketModel extends SupportTicket {
  const SupportTicketModel({
    required super.ticketId,
    required super.customerId,
    required super.customerName,
    required super.category,
    required super.priority,
    required super.subject,
    required super.description,
    required super.status,
    required super.assignedStaffName,
    required super.createdAt,
  });

  factory SupportTicketModel.fromJson(Map<String, dynamic> json) {
    return SupportTicketModel(
      ticketId: json['ticketId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Customer',
      category: json['category'] as String? ?? 'GENERAL',
      priority: json['priority'] as String? ?? 'MEDIUM',
      subject: json['subject'] as String? ?? '',
      description: json['description'] as String? ?? '',
      status: json['status'] as String? ?? 'OPEN',
      assignedStaffName: json['assignedStaffName'] as String? ?? 'Unassigned',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ticketId': ticketId,
      'customerId': customerId,
      'customerName': customerName,
      'category': category,
      'priority': priority,
      'subject': subject,
      'description': description,
      'status': status,
      'assignedStaffName': assignedStaffName,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
