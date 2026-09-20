import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum DateLockStatus {
  available,
  inQueue, // Booking submitted, awaiting approval or payment verification
  locked, // Payment verified & calendar locked / confirmed
}

class DateAvailabilityResult {
  final DateLockStatus status;
  final String dateKey; // yyyy-MM-dd
  final String? clientName;
  final String? serviceTitle;
  final String? bookingId;
  final String? message;

  const DateAvailabilityResult({
    required this.status,
    required this.dateKey,
    this.clientName,
    this.serviceTitle,
    this.bookingId,
    this.message,
  });

  bool get isLocked => status == DateLockStatus.locked;
  bool get isInQueue => status == DateLockStatus.inQueue;
  bool get isAvailable => status == DateLockStatus.available;
}

class BookingDateService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static String formatDateKey(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  /// Checks the real-time availability of a single date
  static Future<DateAvailabilityResult> checkDateAvailability(
      DateTime date) async {
    final dateKey = formatDateKey(date);

    try {
      final snapshot = await _firestore.collection('bookings').get();

      for (var doc in snapshot.docs) {
        final data = doc.data();
        final event = data['event'] as Map<String, dynamic>? ?? {};
        final cust = data['customerDetails'] as Map<String, dynamic>? ?? {};
        final pay = data['payment'] as Map<String, dynamic>? ?? {};

        // Parse date from Timestamp or ISO String
        String? docDateKey;
        final rawDate = event['date'];
        if (rawDate is Timestamp) {
          docDateKey = formatDateKey(rawDate.toDate());
        } else if (rawDate is String) {
          docDateKey = rawDate.split('T').first;
        }

        if (docDateKey == dateKey) {
          final rawStatus =
              (pay['status'] ?? data['status'] ?? '').toString().toUpperCase();
          final isCalendarLocked =
              data['calendarLocked'] == true || pay['isCalendarLocked'] == true;

          // 1. LOCKED / APPROVED: Admin approved payment or confirmed
          if (isCalendarLocked ||
              rawStatus == 'VERIFIED' ||
              rawStatus == 'CONFIRMED') {
            return DateAvailabilityResult(
              status: DateLockStatus.locked,
              dateKey: dateKey,
              clientName: cust['fullName'] ?? 'Royal Bride',
              serviceTitle: data['serviceTitle'] ?? 'Bridal Makeover',
              bookingId: data['bookingId'] ?? doc.id,
              message:
                  'This date is confirmed and locked for another royal bride. No further bookings can be accepted for this date.',
            );
          }

          // 2. IN QUEUE: Awaiting approval, deposit pending, or proof submitted
          if (rawStatus == 'PAYMENT_PROOF_SUBMITTED' ||
              rawStatus == 'DEPOSIT_PENDING' ||
              rawStatus == 'AWAITING_APPROVAL' ||
              rawStatus == 'AWAITINGAPPROVAL') {
            return DateAvailabilityResult(
              status: DateLockStatus.inQueue,
              dateKey: dateKey,
              clientName: cust['fullName'] ?? 'Client',
              serviceTitle: data['serviceTitle'] ?? 'Bridal Makeover',
              bookingId: data['bookingId'] ?? doc.id,
              message:
                  'This date currently has a booking inquiry in the verification queue. You may submit a priority waitlist inquiry, but final confirmation is subject to slot availability.',
            );
          }
        }
      }
    } catch (e) {
      debugPrint('[BookingDateService] checkDateAvailability notice: $e');
    }

    return DateAvailabilityResult(
      status: DateLockStatus.available,
      dateKey: dateKey,
    );
  }

  /// Stream of all dates with active bookings for the Master Calendar
  static Stream<Map<String, DateAvailabilityResult>> streamDateSlots() {
    return _firestore.collection('bookings').snapshots().map((snapshot) {
      final Map<String, DateAvailabilityResult> map = {};

      for (var doc in snapshot.docs) {
        final data = doc.data();
        final event = data['event'] as Map<String, dynamic>? ?? {};
        final cust = data['customerDetails'] as Map<String, dynamic>? ?? {};
        final pay = data['payment'] as Map<String, dynamic>? ?? {};

        String? docDateKey;
        final rawDate = event['date'];
        if (rawDate is Timestamp) {
          docDateKey = formatDateKey(rawDate.toDate());
        } else if (rawDate is String) {
          docDateKey = rawDate.split('T').first;
        }

        if (docDateKey != null && docDateKey.isNotEmpty) {
          final rawStatus =
              (pay['status'] ?? data['status'] ?? '').toString().toUpperCase();
          final isCalendarLocked =
              data['calendarLocked'] == true || pay['isCalendarLocked'] == true;

          DateLockStatus status;
          if (isCalendarLocked ||
              rawStatus == 'VERIFIED' ||
              rawStatus == 'CONFIRMED') {
            status = DateLockStatus.locked;
          } else if (rawStatus == 'PAYMENT_PROOF_SUBMITTED' ||
              rawStatus == 'DEPOSIT_PENDING' ||
              rawStatus == 'AWAITING_APPROVAL' ||
              rawStatus == 'AWAITINGAPPROVAL') {
            status = DateLockStatus.inQueue;
          } else {
            status = DateLockStatus.available;
          }

          // Locked takes precedence if multiple entries on same date
          if (!map.containsKey(docDateKey) ||
              status == DateLockStatus.locked) {
            map[docDateKey] = DateAvailabilityResult(
              status: status,
              dateKey: docDateKey,
              clientName: cust['fullName'] ?? 'Client',
              serviceTitle: data['serviceTitle'] ?? 'Bridal Service',
              bookingId: data['bookingId'] ?? doc.id,
            );
          }
        }
      }

      return map;
    });
  }
}
