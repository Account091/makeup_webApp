class SupportTicket {
  final String ticketId;
  final String customerId;
  final String customerName;
  final String category; // PAYMENT, BOOKING, WHATSAPP, ECOMMERCE, GENERAL
  final String priority; // LOW, MEDIUM, HIGH, CRITICAL
  final String subject;
  final String description;
  final String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  final String assignedStaffName;
  final DateTime createdAt;

  const SupportTicket({
    required this.ticketId,
    required this.customerId,
    required this.customerName,
    required this.category,
    required this.priority,
    required this.subject,
    required this.description,
    required this.status,
    required this.assignedStaffName,
    required this.createdAt,
  });
}
