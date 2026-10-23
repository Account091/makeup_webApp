import 'package:cloud_firestore/cloud_firestore.dart';

/// A `bookings/{bookingId}` document shaped exactly like
/// docs/BOOKING_CONTRACT.md.
Map<String, dynamic> contractBooking({
  String bookingId = 'MBP-7K2QXD',
  String status = 'PAYMENT_PROOF_SUBMITTED',
  String paymentStatus = 'VERIFICATION_PENDING',
  String date = '2026-12-12',
  String phone = '9876543210',
  String fullName = 'Aditi Rathore',
  String email = 'aditi@example.com',
  num depositRequired = 7500,
  num depositPaid = 0,
  String? expiresAt,
  DateTime? createdAt,
  Timestamp? confirmedAt,
}) {
  return {
    'bookingId': bookingId,
    'status': status,
    'customerDetails': {'fullName': fullName, 'phone': phone, 'email': email},
    'event': {
      'type': 'Bridal Makeup',
      'date': date,
      'readyByTime': '16:30',
      'venue': 'Umaid Bhawan',
      'city': 'Jodhpur',
      'guestCount': 3,
    },
    'serviceId': 'bridal-hd',
    'serviceTitle': 'Bridal Makeup',
    'packageName': 'HD Bridal',
    'notes': 'Prefers soft glam',
    'commercials': {
      'basePrice': 25000,
      'travelFee': 0,
      'totalAmount': 25000,
      'depositRequired': depositRequired,
      'depositPaid': depositPaid,
    },
    'payment': {
      'upiId': 'studio@okicici',
      'payeeName': 'Makeovers by Prachi',
      'status': paymentStatus,
      'utrNumber': '412345678901',
      'proofPath': 'payment_proofs/$bookingId/proof.jpg',
      'submittedAt': Timestamp.fromDate(DateTime.utc(2026, 10, 20, 10)),
    },
    'expiresAt': expiresAt ?? '2026-10-20T10:15:00.000Z',
    'createdAt': Timestamp.fromDate(createdAt ?? DateTime.utc(2026, 10, 20, 9)),
    'updatedAt': Timestamp.fromDate(DateTime.utc(2026, 10, 20, 10)),
    if (confirmedAt != null) 'confirmedAt': confirmedAt,
  };
}
