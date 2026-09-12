import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/lead_entity.dart';

class LeadModel extends LeadEntity {
  const LeadModel({
    required super.id,
    required super.customerId,
    required super.bookingId,
    required super.customerName,
    required super.customerPhone,
    required super.status,
    required super.serviceType,
    required super.eventDate,
    required super.venueCity,
    required super.estimatedValue,
    required super.leadScore,
    required super.classification,
    required super.scoreFactors,
    super.lastContactedAt,
    super.nextFollowUpAt,
    required super.createdAt,
  });

  factory LeadModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    LeadPipelineStatus parseStatus(String? val) {
      switch (val) {
        case 'CONTACTED':
          return LeadPipelineStatus.contacted;
        case 'QUALIFIED':
          return LeadPipelineStatus.qualified;
        case 'QUOTE_SENT':
          return LeadPipelineStatus.quoteSent;
        case 'AWAITING_DEPOSIT':
          return LeadPipelineStatus.awaitingDeposit;
        case 'CONFIRMED':
          return LeadPipelineStatus.confirmed;
        case 'COMPLETED':
          return LeadPipelineStatus.completed;
        case 'REVIEW_REQUESTED':
          return LeadPipelineStatus.reviewRequested;
        case 'REPEAT_CUSTOMER':
          return LeadPipelineStatus.repeatCustomer;
        case 'DECLINED':
          return LeadPipelineStatus.declined;
        case 'CANCELLED':
          return LeadPipelineStatus.cancelled;
        case 'LOST':
          return LeadPipelineStatus.lost;
        case 'EXPIRED':
          return LeadPipelineStatus.expired;
        default:
          return LeadPipelineStatus.newInquiry;
      }
    }

    LeadClassification parseClassification(String? val) {
      switch (val) {
        case 'HOT':
          return LeadClassification.hot;
        case 'WARM':
          return LeadClassification.warm;
        default:
          return LeadClassification.cold;
      }
    }

    return LeadModel(
      id: doc.id,
      customerId: data['customerId'] ?? '',
      bookingId: data['bookingId'] ?? '',
      customerName: data['customerName'] ?? 'Guest Customer',
      customerPhone: data['customerPhone'] ?? '',
      status: parseStatus(data['status']),
      serviceType: data['serviceType'] ?? 'Bridal Makeup',
      eventDate: data['eventDate'] ?? '',
      venueCity: data['venueCity'] ?? 'Jodhpur',
      estimatedValue: (data['estimatedValue'] as num?)?.toDouble() ?? 15000.0,
      leadScore: (data['leadScore'] as num?)?.toInt() ?? 15,
      classification: parseClassification(data['scoreClassification']),
      scoreFactors: List<String>.from(data['scoreFactors'] ?? []),
      lastContactedAt: (data['lastContactedAt'] as Timestamp?)?.toDate(),
      nextFollowUpAt: (data['nextFollowUpAt'] as Timestamp?)?.toDate(),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'bookingId': bookingId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'status': status.name.toUpperCase(),
      'serviceType': serviceType,
      'eventDate': eventDate,
      'venueCity': venueCity,
      'estimatedValue': estimatedValue,
      'leadScore': leadScore,
      'scoreClassification': classification.name.toUpperCase(),
      'scoreFactors': scoreFactors,
      'lastContactedAt': lastContactedAt != null ? Timestamp.fromDate(lastContactedAt!) : null,
      'nextFollowUpAt': nextFollowUpAt != null ? Timestamp.fromDate(nextFollowUpAt!) : null,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
