import 'package:equatable/equatable.dart';

enum DocumentType { quote, serviceAgreement, bookingConfirmation, cancellationPolicy, travelTerms, invoice, depositReceipt, finalReceipt }
enum DocumentStatus { draft, pendingAcceptance, accepted, expired }

class DigitalDocumentEntity extends Equatable {
  final String id;
  final String bookingId;
  final String customerId;
  final DocumentType documentType;
  final int version;
  final String documentHash;
  final String storagePath;
  final String policyVersion;
  final DocumentStatus status;
  final DateTime? acceptedAt;
  final String? acceptedBy;
  final DateTime createdAt;

  const DigitalDocumentEntity({
    required this.id,
    required this.bookingId,
    required this.customerId,
    required this.documentType,
    this.version = 1,
    required this.documentHash,
    required this.storagePath,
    this.policyVersion = 'v1.0',
    this.status = DocumentStatus.pendingAcceptance,
    this.acceptedAt,
    this.acceptedBy,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        bookingId,
        customerId,
        documentType,
        version,
        documentHash,
        storagePath,
        policyVersion,
        status,
        acceptedAt,
        acceptedBy,
        createdAt,
      ];
}
