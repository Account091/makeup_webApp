import '../../domain/entities/waitlist_subscription_entity.dart';

class WaitlistSubscriptionModel extends WaitlistSubscription {
  const WaitlistSubscriptionModel({
    required super.subscriptionId,
    required super.targetDate,
    required super.customerId,
    required super.customerName,
    required super.customerPhone,
    required super.serviceTitle,
    required super.status,
  });

  factory WaitlistSubscriptionModel.fromJson(Map<String, dynamic> json) {
    return WaitlistSubscriptionModel(
      subscriptionId: json['subscriptionId'] as String? ?? '',
      targetDate: json['targetDate'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Client',
      customerPhone: json['customerPhone'] as String? ?? '',
      serviceTitle: json['serviceTitle'] as String? ?? 'Bridal Service',
      status: json['status'] as String? ?? 'WAITING',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subscriptionId': subscriptionId,
      'targetDate': targetDate,
      'customerId': customerId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'serviceTitle': serviceTitle,
      'status': status,
    };
  }
}
