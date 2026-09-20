import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/booking_entity.dart';

class BookingModel extends BookingEntity {
  const BookingModel({
    required super.id,
    required super.customer,
    required super.event,
    required super.serviceTitle,
    super.packageName,
    required super.commercials,
    required super.status,
    super.referenceImages,
    super.notes,
    required super.createdAt,
  });

  factory BookingModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    final custData = data['customerDetails'] as Map<String, dynamic>? ?? {};
    final eventData = data['event'] as Map<String, dynamic>? ?? {};
    final commData = data['commercials'] as Map<String, dynamic>? ?? {};

    return BookingModel(
      id: doc.id,
      customer: CustomerDetails(
        fullName: custData['fullName'] ?? '',
        phone: custData['phone'] ?? '',
        email: custData['email'] ?? '',
        instagramHandle: custData['instagram'],
      ),
      event: EventDetails(
        eventType: eventData['type'] ?? 'Bridal',
        eventDate: _parseDateTime(eventData['date']),
        readyByTime: eventData['readyByTime'] ?? '16:00',
        venueLocation: eventData['venue'] ?? '',
        city: eventData['city'] ?? 'Jodhpur',
        isOutstation: eventData['isOutstation'] ?? false,
        distanceKm: (eventData['distanceKm'] as num?)?.toDouble() ?? 0.0,
        guestCount: eventData['guestCount'] ?? 1,
      ),
      serviceTitle: data['serviceTitle'] ?? '',
      packageName: data['packageName'],
      commercials: CommercialDetails(
        basePrice: (commData['basePrice'] as num?)?.toDouble() ?? 0.0,
        travelFee: (commData['travelFee'] as num?)?.toDouble() ?? 0.0,
        stayFee: (commData['stayFee'] as num?)?.toDouble() ?? 0.0,
        discount: (commData['discount'] as num?)?.toDouble() ?? 0.0,
        depositRequired: (commData['depositRequired'] as num?)?.toDouble() ?? 0.0,
        depositPaid: (commData['depositPaid'] as num?)?.toDouble() ?? 0.0,
      ),
      status: _parseStatus(data['status']),
      referenceImages: List<String>.from(data['referenceImages'] ?? []),
      notes: data['notes'],
      createdAt: _parseDateTime(data['createdAt']),
    );
  }

  static DateTime _parseDateTime(dynamic val) {
    if (val is Timestamp) return val.toDate();
    if (val is String) {
      try {
        return DateTime.parse(val);
      } catch (_) {}
    }
    return DateTime.now();
  }

  static BookingStatus _parseStatus(String? statusStr) {
    final s = (statusStr ?? '').trim().toLowerCase();
    switch (s) {
      case 'depositpending':
      case 'deposit_pending':
      case 'payment_proof_submitted':
        return BookingStatus.depositPending;
      case 'confirmed':
      case 'verified':
        return BookingStatus.confirmed;
      case 'completed':
        return BookingStatus.completed;
      case 'declined':
      case 'rejected':
        return BookingStatus.declined;
      case 'cancelled':
      case 'expired':
        return BookingStatus.cancelled;
      case 'awaitingapproval':
      case 'awaiting_approval':
      default:
        return BookingStatus.awaitingApproval;
    }
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerDetails': {
        'fullName': customer.fullName,
        'phone': customer.phone,
        'email': customer.email,
        'instagram': customer.instagramHandle,
      },
      'event': {
        'type': event.eventType,
        'date': event.eventDate.toIso8601String().substring(0, 10),
        'readyByTime': event.readyByTime,
        'venue': event.venueLocation,
        'city': event.city,
        'isOutstation': event.isOutstation,
        'distanceKm': event.distanceKm,
        'guestCount': event.guestCount,
      },
      'serviceTitle': serviceTitle,
      'packageName': packageName,
      'commercials': {
        'basePrice': commercials.basePrice,
        'travelFee': commercials.travelFee,
        'stayFee': commercials.stayFee,
        'discount': commercials.discount,
        'depositRequired': commercials.depositRequired,
        'depositPaid': commercials.depositPaid,
      },
      'status': status.name,
      'referenceImages': referenceImages,
      'notes': notes,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  factory BookingModel.fromEntity(BookingEntity entity) {
    return BookingModel(
      id: entity.id,
      customer: entity.customer,
      event: entity.event,
      serviceTitle: entity.serviceTitle,
      packageName: entity.packageName,
      commercials: entity.commercials,
      status: entity.status,
      referenceImages: entity.referenceImages,
      notes: entity.notes,
      createdAt: entity.createdAt,
    );
  }
}
