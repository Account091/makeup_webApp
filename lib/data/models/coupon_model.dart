import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/coupon_entity.dart';

class CouponModel extends CouponEntity {
  const CouponModel({
    required super.code,
    required super.description,
    required super.discountType,
    required super.discountValue,
    super.minBookingValue,
    super.maxDiscountAmount,
    required super.validFrom,
    required super.validUntil,
    super.usageLimit,
    super.usedCount,
    super.isFirstBookingOnly,
    super.isActive,
  });

  factory CouponModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    return CouponModel(
      code: doc.id,
      description: data['description'] ?? '',
      discountType: data['discountType'] == 'FIXED' ? DiscountType.fixed : DiscountType.percentage,
      discountValue: (data['discountValue'] as num?)?.toDouble() ?? 0.0,
      minBookingValue: (data['minBookingValue'] as num?)?.toDouble() ?? 0.0,
      maxDiscountAmount: (data['maxDiscountAmount'] as num?)?.toDouble(),
      validFrom: (data['validFrom'] as Timestamp?)?.toDate() ?? DateTime.now(),
      validUntil: (data['validUntil'] as Timestamp?)?.toDate() ?? DateTime.now().add(const Duration(days: 30)),
      usageLimit: (data['usageLimit'] as num?)?.toInt() ?? 100,
      usedCount: (data['usedCount'] as num?)?.toInt() ?? 0,
      isFirstBookingOnly: data['isFirstBookingOnly'] ?? false,
      isActive: data['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'description': description,
      'discountType': discountType == DiscountType.fixed ? 'FIXED' : 'PERCENTAGE',
      'discountValue': discountValue,
      'minBookingValue': minBookingValue,
      'maxDiscountAmount': maxDiscountAmount,
      'validFrom': Timestamp.fromDate(validFrom),
      'validUntil': Timestamp.fromDate(validUntil),
      'usageLimit': usageLimit,
      'usedCount': usedCount,
      'isFirstBookingOnly': isFirstBookingOnly,
      'isActive': isActive,
    };
  }
}
