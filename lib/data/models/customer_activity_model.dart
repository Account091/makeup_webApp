import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/customer_activity_entity.dart';

class CustomerActivityModel extends CustomerActivityEntity {
  const CustomerActivityModel({
    required super.id,
    required super.customerId,
    super.bookingId,
    required super.eventType,
    required super.description,
    required super.timestamp,
  });

  factory CustomerActivityModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    return CustomerActivityModel(
      id: doc.id,
      customerId: data['customerId'] ?? '',
      bookingId: data['bookingId'],
      eventType: data['eventType'] ?? 'ACTIVITY',
      description: data['description'] ?? '',
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'bookingId': bookingId,
      'eventType': eventType,
      'description': description,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }
}
