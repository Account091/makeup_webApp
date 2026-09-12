import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/customer_entity.dart';

class CustomerModel extends CustomerEntity {
  const CustomerModel({
    required super.id,
    required super.fullName,
    required super.phone,
    super.email,
    super.instagramHandle,
    required super.city,
    required super.isRepeatCustomer,
    required super.totalBookingsCount,
    required super.totalRevenue,
    required super.lifetimeValue,
    required super.tier,
    required super.tags,
    required super.createdAt,
    required super.lastActiveAt,
  });

  factory CustomerModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    CustomerTier parseTier(String? val) {
      switch (val) {
        case 'vip':
          return CustomerTier.vip;
        case 'highValue':
          return CustomerTier.highValue;
        case 'bridalVip':
          return CustomerTier.bridalVip;
        default:
          return CustomerTier.standard;
      }
    }

    return CustomerModel(
      id: doc.id,
      fullName: data['fullName'] ?? 'Unknown Customer',
      phone: data['phone'] ?? '',
      email: data['email'],
      instagramHandle: data['instagramHandle'],
      city: data['city'] ?? 'Jodhpur',
      isRepeatCustomer: data['isRepeatCustomer'] ?? false,
      totalBookingsCount: (data['totalBookingsCount'] as num?)?.toInt() ?? 0,
      totalRevenue: (data['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      lifetimeValue: (data['lifetimeValue'] as num?)?.toDouble() ?? 0.0,
      tier: parseTier(data['tier']),
      tags: List<String>.from(data['tags'] ?? []),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      lastActiveAt: (data['lastActiveAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'instagramHandle': instagramHandle,
      'city': city,
      'isRepeatCustomer': isRepeatCustomer,
      'totalBookingsCount': totalBookingsCount,
      'totalRevenue': totalRevenue,
      'lifetimeValue': lifetimeValue,
      'tier': tier.name,
      'tags': tags,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastActiveAt': Timestamp.fromDate(lastActiveAt),
    };
  }
}
