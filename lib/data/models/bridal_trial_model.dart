import '../../domain/entities/bridal_trial_entity.dart';

class BridalTrialSessionModel extends BridalTrialSession {
  const BridalTrialSessionModel({
    required super.trialId,
    required super.customerId,
    required super.customerName,
    required super.trialType,
    required super.scheduledAt,
    required super.status,
    required super.productsUsed,
    super.lookTitle,
    super.feedbackNotes,
    required super.isLookApproved,
  });

  factory BridalTrialSessionModel.fromJson(Map<String, dynamic> json) {
    return BridalTrialSessionModel(
      trialId: json['trialId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Bride',
      trialType: json['trialType'] as String? ?? 'IN_PERSON_TRIAL',
      scheduledAt: json['scheduledAt'] != null
          ? DateTime.parse(json['scheduledAt'].toString())
          : DateTime.now(),
      status: json['status'] as String? ?? 'SCHEDULED',
      productsUsed: (json['productsUsed'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      lookTitle: json['lookTitle'] as String?,
      feedbackNotes: json['feedbackNotes'] as String?,
      isLookApproved: json['isLookApproved'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'trialId': trialId,
      'customerId': customerId,
      'customerName': customerName,
      'trialType': trialType,
      'scheduledAt': scheduledAt.toIso8601String(),
      'status': status,
      'productsUsed': productsUsed,
      'lookTitle': lookTitle,
      'feedbackNotes': feedbackNotes,
      'isLookApproved': isLookApproved,
    };
  }
}
