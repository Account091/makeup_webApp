class WaitlistSubscription {
  final String subscriptionId;
  final String targetDate; // YYYY-MM-DD
  final String customerId;
  final String customerName;
  final String customerPhone;
  final String serviceTitle;
  final String status; // WAITING, NOTIFIED, CONVERTED, EXPIRED

  const WaitlistSubscription({
    required this.subscriptionId,
    required this.targetDate,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.serviceTitle,
    required this.status,
  });
}
