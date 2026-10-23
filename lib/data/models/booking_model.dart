import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/booking_entity.dart';

/// Firestore mapping for `bookings/{bookingId}` (see docs/BOOKING_CONTRACT.md).
class BookingModel extends BookingEntity {
  BookingModel({
    required super.id,
    required super.status,
    super.rawStatus,
    required super.customer,
    required super.event,
    super.serviceId,
    required super.serviceTitle,
    super.packageName,
    super.notes,
    required super.commercials,
    super.payment,
    super.expiresAt,
    super.createdAt,
    super.updatedAt,
    super.confirmedAt,
    super.cancelledAt,
  });

  factory BookingModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? const {};
    return BookingModel.fromMap(doc.id, data);
  }

  factory BookingModel.fromMap(String docId, Map<String, dynamic> data) {
    final cust = _map(data['customerDetails']);
    final ev = _map(data['event']);
    final comm = _map(data['commercials']);
    final pay = _map(data['payment']);

    final rawStatus = data['status'] is String ? data['status'] as String : '';
    final dateKey = _str(ev['date']);
    final parsedDate = EventDetails.parseDateKey(dateKey);

    final bookingId = _str(data['bookingId']);

    return BookingModel(
      id: bookingId.isNotEmpty ? bookingId : docId,
      status: BookingStatusCodec.fromFirestore(rawStatus),
      rawStatus: rawStatus,
      customer: CustomerDetails(
        fullName: _str(cust['fullName']),
        phone: _str(cust['phone']),
        email: _str(cust['email']),
      ),
      event: EventDetails(
        eventType: _str(ev['type']),
        dateKey: dateKey,
        eventDate: parsedDate ?? DateTime(1970),
        readyByTime: _str(ev['readyByTime']),
        venueLocation: _str(ev['venue']),
        city: _str(ev['city']),
        guestCount: (ev['guestCount'] as num?)?.toInt() ?? 1,
      ),
      serviceId: _str(data['serviceId']),
      serviceTitle: _str(data['serviceTitle']),
      packageName: _optStr(data['packageName']),
      notes: _optStr(data['notes']),
      commercials: CommercialDetails(
        basePrice: _num(comm['basePrice']),
        travelFee: _num(comm['travelFee']),
        totalAmount: _num(comm['totalAmount']),
        depositRequired: _num(comm['depositRequired']),
        depositPaid: _num(comm['depositPaid']),
      ),
      payment: PaymentDetails(
        upiId: _str(pay['upiId']),
        payeeName: _str(pay['payeeName']),
        status: _str(pay['status']),
        utrNumber: _optStr(pay['utrNumber']),
        proofPath: _optStr(pay['proofPath']),
        submittedAt: parseDate(pay['submittedAt']),
        verifiedAt: parseDate(pay['verifiedAt']),
        verifiedBy: _optStr(pay['verifiedBy']),
        rejectionReason: _optStr(pay['rejectionReason']),
      ),
      expiresAt: parseDate(data['expiresAt']),
      createdAt: parseDate(data['createdAt']),
      updatedAt: parseDate(data['updatedAt']),
      confirmedAt: parseDate(data['confirmedAt']),
      cancelledAt: parseDate(data['cancelledAt']),
    );
  }

  /// Accepts Firestore Timestamp, ISO string, or epoch milliseconds.
  static DateTime? parseDate(dynamic val) {
    if (val is Timestamp) return val.toDate();
    if (val is DateTime) return val;
    if (val is String && val.isNotEmpty) return DateTime.tryParse(val);
    if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
    return null;
  }

  static Map<String, dynamic> _map(dynamic v) =>
      v is Map ? Map<String, dynamic>.from(v) : const {};

  static String _str(dynamic v) => v == null ? '' : v.toString();

  static String? _optStr(dynamic v) {
    if (v == null) return null;
    final s = v.toString();
    return s.isEmpty ? null : s;
  }

  static double _num(dynamic v) => (v is num) ? v.toDouble() : 0.0;
}
