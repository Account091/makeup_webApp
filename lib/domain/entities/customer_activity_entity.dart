import 'package:equatable/equatable.dart';

class CustomerActivityEntity extends Equatable {
  final String id;
  final String customerId;
  final String? bookingId;
  final String eventType;
  final String description;
  final DateTime timestamp;

  const CustomerActivityEntity({
    required this.id,
    required this.customerId,
    this.bookingId,
    required this.eventType,
    required this.description,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [id, customerId, bookingId, eventType, description, timestamp];
}
