import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/digital_document_entity.dart';

class DigitalDocumentModel extends DigitalDocumentEntity {
  const DigitalDocumentModel({
    required super.id,
    required super.bookingId,
    required super.customerId,
    required super.documentType,
    super.version,
    required super.documentHash,
    required super.storagePath,
    super.policyVersion,
    super.status,
    super.acceptedAt,
    super.acceptedBy,
    required super.createdAt,
  });

  factory DigitalDocumentModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    DocumentType parseType(String? val) {
      switch (val) {
        case 'QUOTE':
          return DocumentType.quote;
        case 'CONFIRMATION':
          return DocumentType.bookingConfirmation;
        case 'CANCELLATION_POLICY':
          return DocumentType.cancellationPolicy;
        case 'TRAVEL_TERMS':
          return DocumentType.travelTerms;
        case 'INVOICE':
          return DocumentType.invoice;
        case 'DEPOSIT_RECEIPT':
          return DocumentType.depositReceipt;
        case 'FINAL_RECEIPT':
          return DocumentType.finalReceipt;
        default:
          return DocumentType.serviceAgreement;
      }
    }

    DocumentStatus parseStatus(String? val) {
      switch (val) {
        case 'ACCEPTED':
          return DocumentStatus.accepted;
        case 'EXPIRED':
          return DocumentStatus.expired;
        case 'DRAFT':
          return DocumentStatus.draft;
        default:
          return DocumentStatus.pendingAcceptance;
      }
    }

    return DigitalDocumentModel(
      id: doc.id,
      bookingId: data['bookingId'] ?? '',
      customerId: data['customerId'] ?? '',
      documentType: parseType(data['documentType']),
      version: (data['version'] as num?)?.toInt() ?? 1,
      documentHash: data['documentHash'] ?? '',
      storagePath: data['storagePath'] ?? '',
      policyVersion: data['policyVersion'] ?? 'v1.0',
      status: parseStatus(data['status']),
      acceptedAt: (data['acceptedAt'] as Timestamp?)?.toDate(),
      acceptedBy: data['acceptedBy'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'bookingId': bookingId,
      'customerId': customerId,
      'documentType': documentType.name.toUpperCase(),
      'version': version,
      'documentHash': documentHash,
      'storagePath': storagePath,
      'policyVersion': policyVersion,
      'status': status.name.toUpperCase(),
      'acceptedAt': acceptedAt != null ? Timestamp.fromDate(acceptedAt!) : null,
      'acceptedBy': acceptedBy,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
