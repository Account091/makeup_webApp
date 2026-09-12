class ConsultationAppointment {
  final String appointmentId;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final String consultationType; // VIRTUAL_CONSULTATION, IN_PERSON_CONSULTATION, PAID_TRIAL, FOLLOW_UP
  final DateTime scheduledTime;
  final int durationMinutes;
  final String assignedArtistName;
  final String status; // REQUESTED, CONFIRMED, COMPLETED, CANCELLED
  final String? notes;

  const ConsultationAppointment({
    required this.appointmentId,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.consultationType,
    required this.scheduledTime,
    required this.durationMinutes,
    required this.assignedArtistName,
    required this.status,
    this.notes,
  });
}
