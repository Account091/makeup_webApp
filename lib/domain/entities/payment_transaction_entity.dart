import 'package:equatable/equatable.dart';

class PaymentTransactionEntity extends Equatable {
  final String paymentId;
  final String bookingId;
  final String? invoiceId;
  final double amount;
  final String paymentMethod; // e.g. "UPI", "Card", "Cash"
  final String gatewayTransactionId;
  final DateTime paidAt;

  const PaymentTransactionEntity({
    required this.paymentId,
    required this.bookingId,
    this.invoiceId,
    required this.amount,
    required this.paymentMethod,
    required this.gatewayTransactionId,
    required this.paidAt,
  });

  @override
  List<Object?> get props => [
        paymentId,
        bookingId,
        invoiceId,
        amount,
        paymentMethod,
        gatewayTransactionId,
        paidAt,
      ];
}
