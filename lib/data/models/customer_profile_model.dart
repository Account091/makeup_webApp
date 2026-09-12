import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/customer_profile_entity.dart';

class CustomerProfileModel extends CustomerProfileEntity {
  const CustomerProfileModel({
    required super.uid,
    required super.customerId,
    required super.fullName,
    required super.phone,
    super.email,
    super.instagramHandle,
    required super.savedLookIds,
    super.whatsappNotifications,
    required super.createdAt,
  });

  factory CustomerProfileModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    return CustomerProfileModel(
      uid: doc.id,
      customerId: data['customerId'] ?? doc.id,
      fullName: data['fullName'] ?? 'Guest Customer',
      phone: data['phone'] ?? '',
      email: data['email'],
      instagramHandle: data['instagramHandle'],
      savedLookIds: List<String>.from(data['savedLookIds'] ?? []),
      whatsappNotifications: data['whatsappNotifications'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'instagramHandle': instagramHandle,
      'savedLookIds': savedLookIds,
      'whatsappNotifications': whatsappNotifications,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
