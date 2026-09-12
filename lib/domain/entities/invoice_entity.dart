import 'package:equatable/equatable.dart';

enum InvoiceStatus { unpaid, partiallyPaid, paid }

class InvoiceEntity extends Equatable {
  final String invoiceNumber; // e.g. MP/2026-27/00001
  final String bookingId;
  final String customerId;
  final double subtotal;
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final double grandTotal;
  final double amountPaid;
  final double balanceDue;
  final InvoiceStatus status;
  final DateTime issuedAt;

  const InvoiceEntity({
    required this.invoiceNumber,
    required this.bookingId,
    required this.customerId,
    required this.subtotal,
    this.cgstAmount = 0.0,
    this.sgstAmount = 0.0,
    this.igstAmount = 0.0,
    required this.grandTotal,
    this.amountPaid = 0.0,
    required this.balanceDue,
    this.status = InvoiceStatus.unpaid,
    required this.issuedAt,
  });

  @override
  List<Object?> get props => [
        invoiceNumber,
        bookingId,
        customerId,
        subtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        grandTotal,
        amountPaid,
        balanceDue,
        status,
        issuedAt,
      ];
}
