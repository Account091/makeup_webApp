import 'package:equatable/equatable.dart';

/// Booking lifecycle status. Mirrors `docs/BOOKING_CONTRACT.md` exactly.
///
/// Firestore stores the UPPER_SNAKE value (see [BookingStatusCodec]); never
/// write `status.name`.
enum BookingStatus {
  depositPending,
  paymentProofSubmitted,
  confirmed,
  paymentRejected,
  expired,
  cancelled,
  completed,
}

/// Explicit mapping between [BookingStatus] and the Firestore string values.
class BookingStatusCodec {
  BookingStatusCodec._();

  static const Map<BookingStatus, String> toFirestoreMap = {
    BookingStatus.depositPending: 'DEPOSIT_PENDING',
    BookingStatus.paymentProofSubmitted: 'PAYMENT_PROOF_SUBMITTED',
    BookingStatus.confirmed: 'CONFIRMED',
    BookingStatus.paymentRejected: 'PAYMENT_REJECTED',
    BookingStatus.expired: 'EXPIRED',
    BookingStatus.cancelled: 'CANCELLED',
    BookingStatus.completed: 'COMPLETED',
  };

  static final Map<String, BookingStatus> fromFirestoreMap = {
    for (final e in toFirestoreMap.entries) e.value: e.key,
  };

  static String toFirestore(BookingStatus status) => toFirestoreMap[status]!;

  /// Returns null for any value that is not exactly one of the contract values.
  /// Callers must keep the raw string visible instead of guessing.
  static BookingStatus? fromFirestore(String? value) =>
      value == null ? null : fromFirestoreMap[value];
}

extension BookingStatusX on BookingStatus {
  String get firestoreValue => BookingStatusCodec.toFirestore(this);

  String get label {
    switch (this) {
      case BookingStatus.depositPending:
        return 'Deposit pending';
      case BookingStatus.paymentProofSubmitted:
        return 'Awaiting verification';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.paymentRejected:
        return 'Payment rejected';
      case BookingStatus.expired:
        return 'Expired';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.completed:
        return 'Completed';
    }
  }
}

/// `payment.status` values from the contract.
class PaymentStatusValues {
  PaymentStatusValues._();
  static const depositPending = 'DEPOSIT_PENDING';
  static const verificationPending = 'VERIFICATION_PENDING';
  static const verified = 'VERIFIED';
  static const rejected = 'REJECTED';
  static const expired = 'EXPIRED';
}

class CustomerDetails extends Equatable {
  final String fullName;
  final String phone;
  final String email;
  final String? instagramHandle;

  const CustomerDetails({
    required this.fullName,
    required this.phone,
    required this.email,
    this.instagramHandle,
  });

  @override
  List<Object?> get props => [fullName, phone, email, instagramHandle];
}

class EventDetails extends Equatable {
  /// `event.type` (service title at booking time).
  final String eventType;

  /// Raw `event.date` string (`YYYY-MM-DD`). Always show this if
  /// [hasValidDate] is false.
  final String dateKey;

  /// Parsed [dateKey]; only meaningful when [hasValidDate] is true.
  final DateTime eventDate;
  final String readyByTime;
  final String venueLocation;
  final String city;
  final int guestCount;

  EventDetails({
    required this.eventType,
    String? dateKey,
    required this.eventDate,
    required this.readyByTime,
    required this.venueLocation,
    required this.city,
    this.guestCount = 1,
  }) : dateKey = dateKey ?? formatDateKey(eventDate);

  bool get hasValidDate => parseDateKey(dateKey) != null;

  static String formatDateKey(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  static DateTime? parseDateKey(String? key) {
    if (key == null) return null;
    final m = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$').firstMatch(key);
    if (m == null) return null;
    final y = int.parse(m.group(1)!);
    final mo = int.parse(m.group(2)!);
    final d = int.parse(m.group(3)!);
    final dt = DateTime(y, mo, d);
    if (dt.year != y || dt.month != mo || dt.day != d) return null;
    return dt;
  }

  @override
  List<Object?> get props => [
    eventType,
    dateKey,
    eventDate,
    readyByTime,
    venueLocation,
    city,
    guestCount,
  ];
}

class CommercialDetails extends Equatable {
  final double basePrice;
  final double travelFee;
  final double totalAmount;
  final double depositRequired;
  final double depositPaid;

  const CommercialDetails({
    required this.basePrice,
    this.travelFee = 0.0,
    required this.totalAmount,
    required this.depositRequired,
    this.depositPaid = 0.0,
  });

  /// Kept for older screens.
  double get totalPrice => totalAmount;
  double get remainingBalance => totalAmount - depositPaid;

  @override
  List<Object?> get props => [
    basePrice,
    travelFee,
    totalAmount,
    depositRequired,
    depositPaid,
  ];
}

class PaymentDetails extends Equatable {
  final String upiId;
  final String payeeName;

  /// Raw `payment.status` string (see [PaymentStatusValues]).
  final String status;
  final String? utrNumber;
  final String? proofPath;
  final DateTime? submittedAt;
  final DateTime? verifiedAt;
  final String? verifiedBy;
  final String? rejectionReason;

  const PaymentDetails({
    this.upiId = '',
    this.payeeName = '',
    this.status = '',
    this.utrNumber,
    this.proofPath,
    this.submittedAt,
    this.verifiedAt,
    this.verifiedBy,
    this.rejectionReason,
  });

  @override
  List<Object?> get props => [
    upiId,
    payeeName,
    status,
    utrNumber,
    proofPath,
    submittedAt,
    verifiedAt,
    verifiedBy,
    rejectionReason,
  ];
}

class BookingEntity extends Equatable {
  /// Document ID == `bookingId` (e.g. `MBP-7K2QXD`).
  final String id;

  /// Parsed status; null when Firestore holds a value outside the contract.
  final BookingStatus? status;

  /// Raw `status` string exactly as stored.
  final String rawStatus;
  final CustomerDetails customer;
  final EventDetails event;
  final String serviceId;
  final String serviceTitle;
  final String? packageName;
  final String? notes;
  final CommercialDetails commercials;
  final PaymentDetails payment;
  final DateTime? expiresAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? confirmedAt;
  final DateTime? cancelledAt;

  BookingEntity({
    required this.id,
    required this.status,
    String? rawStatus,
    required this.customer,
    required this.event,
    this.serviceId = '',
    required this.serviceTitle,
    this.packageName,
    this.notes,
    required this.commercials,
    this.payment = const PaymentDetails(),
    this.expiresAt,
    this.createdAt,
    this.updatedAt,
    this.confirmedAt,
    this.cancelledAt,
  }) : rawStatus =
           rawStatus ??
           (status == null ? '' : BookingStatusCodec.toFirestore(status));

  String get bookingId => id;

  /// A DEPOSIT_PENDING booking whose hold has lapsed (server expires lazily).
  bool isUnpaidExpired([DateTime? now]) =>
      status == BookingStatus.depositPending &&
      expiresAt != null &&
      expiresAt!.isBefore(now ?? DateTime.now());

  /// Human label; keeps unknown raw values visible.
  String statusLabel([DateTime? now]) {
    if (isUnpaidExpired(now)) return 'Expired (unpaid)';
    final s = status;
    if (s == null) {
      return rawStatus.isEmpty ? 'No status' : 'Unknown: $rawStatus';
    }
    return s.label;
  }

  @override
  List<Object?> get props => [
    id,
    status,
    rawStatus,
    customer,
    event,
    serviceId,
    serviceTitle,
    packageName,
    notes,
    commercials,
    payment,
    expiresAt,
    createdAt,
    updatedAt,
    confirmedAt,
    cancelledAt,
  ];
}
