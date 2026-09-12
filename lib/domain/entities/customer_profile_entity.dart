import 'package:equatable/equatable.dart';

class CustomerProfileEntity extends Equatable {
  final String uid; // Firebase Auth UID
  final String customerId; // Canonical Customer ID
  final String fullName;
  final String phone;
  final String? email;
  final String? instagramHandle;
  final List<String> savedLookIds;
  final bool whatsappNotifications;
  final DateTime createdAt;

  const CustomerProfileEntity({
    required this.uid,
    required this.customerId,
    required this.fullName,
    required this.phone,
    this.email,
    this.instagramHandle,
    required this.savedLookIds,
    this.whatsappNotifications = true,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        uid,
        customerId,
        fullName,
        phone,
        email,
        instagramHandle,
        savedLookIds,
        whatsappNotifications,
        createdAt,
      ];
}
