import 'package:equatable/equatable.dart';

enum DiscountType { percentage, fixed }

class CouponEntity extends Equatable {
  final String code;
  final String description;
  final DiscountType discountType;
  final double discountValue; // e.g. 10 for 10% or 2000 for ₹2000
  final double minBookingValue;
  final double? maxDiscountAmount;
  final DateTime validFrom;
  final DateTime validUntil;
  final int usageLimit;
  final int usedCount;
  final bool isFirstBookingOnly;
  final bool isActive;

  const CouponEntity({
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    this.minBookingValue = 0.0,
    this.maxDiscountAmount,
    required this.validFrom,
    required this.validUntil,
    this.usageLimit = 100,
    this.usedCount = 0,
    this.isFirstBookingOnly = false,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [
        code,
        description,
        discountType,
        discountValue,
        minBookingValue,
        maxDiscountAmount,
        validFrom,
        validUntil,
        usageLimit,
        usedCount,
        isFirstBookingOnly,
        isActive,
      ];
}
