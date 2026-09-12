import 'package:equatable/equatable.dart';

enum LeadPipelineStatus {
  newInquiry,
  contacted,
  qualified,
  quoteSent,
  awaitingDeposit,
  confirmed,
  completed,
  reviewRequested,
  repeatCustomer,
  declined,
  cancelled,
  lost,
  expired,
}

enum LeadClassification { hot, warm, cold }

class LeadEntity extends Equatable {
  final String id;
  final String customerId;
  final String bookingId;
  final String customerName;
  final String customerPhone;
  final LeadPipelineStatus status;
  final String serviceType;
  final String eventDate;
  final String venueCity;
  final double estimatedValue;
  final int leadScore;
  final LeadClassification classification;
  final List<String> scoreFactors;
  final DateTime? lastContactedAt;
  final DateTime? nextFollowUpAt;
  final DateTime createdAt;

  const LeadEntity({
    required this.id,
    required this.customerId,
    required this.bookingId,
    required this.customerName,
    required this.customerPhone,
    required this.status,
    required this.serviceType,
    required this.eventDate,
    required this.venueCity,
    required this.estimatedValue,
    required this.leadScore,
    required this.classification,
    required this.scoreFactors,
    this.lastContactedAt,
    this.nextFollowUpAt,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        customerId,
        bookingId,
        customerName,
        customerPhone,
        status,
        serviceType,
        eventDate,
        venueCity,
        estimatedValue,
        leadScore,
        classification,
        scoreFactors,
        lastContactedAt,
        nextFollowUpAt,
        createdAt,
      ];
}
