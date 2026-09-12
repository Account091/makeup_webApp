import 'package:equatable/equatable.dart';

enum CustomerTier { standard, vip, highValue, bridalVip }

class CustomerEntity extends Equatable {
  final String id;
  final String fullName;
  final String phone;
  final String? email;
  final String? instagramHandle;
  final String city;
  final bool isRepeatCustomer;
  final int totalBookingsCount;
  final double totalRevenue;
  final double lifetimeValue;
  final CustomerTier tier;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime lastActiveAt;

  const CustomerEntity({
    required this.id,
    required this.fullName,
    required this.phone,
    this.email,
    this.instagramHandle,
    required this.city,
    required this.isRepeatCustomer,
    required this.totalBookingsCount,
    required this.totalRevenue,
    required this.lifetimeValue,
    required this.tier,
    required this.tags,
    required this.createdAt,
    required this.lastActiveAt,
  });

  @override
  List<Object?> get props => [
        id,
        fullName,
        phone,
        email,
        instagramHandle,
        city,
        isRepeatCustomer,
        totalBookingsCount,
        totalRevenue,
        lifetimeValue,
        tier,
        tags,
        createdAt,
        lastActiveAt,
      ];
}
