import '../../domain/entities/consultation_appointment_entity.dart';

class ConsultationAppointmentModel extends ConsultationAppointment {
  const ConsultationAppointmentModel({
    required super.appointmentId,
    required super.customerId,
    required super.customerName,
    required super.customerPhone,
    required super.consultationType,
    required super.scheduledTime,
    required super.durationMinutes,
    required super.assignedArtistName,
    required super.status,
    super.notes,
  });

  factory ConsultationAppointmentModel.fromJson(Map<String, dynamic> json) {
    return ConsultationAppointmentModel(
      appointmentId: json['appointmentId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Client',
      customerPhone: json['customerPhone'] as String? ?? '',
      consultationType: json['consultationType'] as String? ?? 'VIRTUAL_CONSULTATION',
      scheduledTime: json['scheduledTime'] != null
          ? DateTime.parse(json['scheduledTime'].toString())
          : DateTime.now(),
      durationMinutes: json['durationMinutes'] as int? ?? 30,
      assignedArtistName: json['assignedArtistName'] as String? ?? 'Prachi',
      status: json['status'] as String? ?? 'CONFIRMED',
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'appointmentId': appointmentId,
      'customerId': customerId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'consultationType': consultationType,
      'scheduledTime': scheduledTime.toIso8601String(),
      'durationMinutes': durationMinutes,
      'assignedArtistName': assignedArtistName,
      'status': status,
      'notes': notes,
    };
  }
}
