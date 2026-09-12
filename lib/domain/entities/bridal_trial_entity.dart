class BridalTrialSession {
  final String trialId;
  final String customerId;
  final String customerName;
  final String trialType; // VIRTUAL_CONSULTATION, IN_PERSON_TRIAL, PAID_BRIDAL_TRIAL
  final DateTime scheduledAt;
  final String status; // REQUESTED, SCHEDULED, COMPLETED, LOOK_APPROVED, CANCELLED
  final List<String> productsUsed;
  final String? lookTitle;
  final String? feedbackNotes;
  final bool isLookApproved;

  const BridalTrialSession({
    required this.trialId,
    required this.customerId,
    required this.customerName,
    required this.trialType,
    required this.scheduledAt,
    required this.status,
    required this.productsUsed,
    this.lookTitle,
    this.feedbackNotes,
    required this.isLookApproved,
  });
}
