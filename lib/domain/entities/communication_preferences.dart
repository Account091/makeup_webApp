import 'package:equatable/equatable.dart';

class CommunicationPreferences extends Equatable {
  final String customerId;
  final bool allowWhatsAppTransactional;
  final bool allowWhatsAppMarketing;
  final bool allowSms;
  final bool allowEmail;
  final DateTime updatedAt;

  const CommunicationPreferences({
    required this.customerId,
    this.allowWhatsAppTransactional = true,
    this.allowWhatsAppMarketing = false,
    this.allowSms = true,
    this.allowEmail = true,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        customerId,
        allowWhatsAppTransactional,
        allowWhatsAppMarketing,
        allowSms,
        allowEmail,
        updatedAt,
      ];
}
