import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../domain/entities/booking_entity.dart';
import '../models/booking_model.dart';
import 'admin_models.dart';

/// Thrown when an admin action is refused because the data is not in the
/// expected state (e.g. the booking was already reviewed by someone else).
class AdminActionException implements Exception {
  final String message;
  const AdminActionException(this.message);
  @override
  String toString() => message;
}

const _calendarActive = {'HOLD', 'BOOKED', 'BLOCKED'};

/// Bookings: live streams + status transitions (docs/BOOKING_CONTRACT.md).
class AdminBookingRepository {
  final FirebaseFirestore db;
  AdminBookingRepository(this.db);

  CollectionReference<Map<String, dynamic>> get _bookings =>
      db.collection('bookings');
  CollectionReference<Map<String, dynamic>> get _calendar =>
      db.collection('calendar');

  static List<BookingEntity> _map(QuerySnapshot<Map<String, dynamic>> s) =>
      s.docs.map((d) => BookingModel.fromMap(d.id, d.data())).toList();

  /// All bookings, newest first (sorted client-side so docs missing
  /// `createdAt` are not silently dropped by an orderBy).
  Stream<List<BookingEntity>> watchAll() => _bookings.snapshots().map((s) {
    final list = _map(s);
    list.sort(
      (a, b) =>
          (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)),
    );
    return list;
  });

  /// Payment verification queue, oldest submission first.
  Stream<List<BookingEntity>> watchAwaitingVerification() => _bookings
      .where(
        'status',
        isEqualTo: BookingStatus.paymentProofSubmitted.firestoreValue,
      )
      .snapshots()
      .map((s) {
        final list = _map(s);
        list.sort(
          (a, b) => (a.payment.submittedAt ?? a.updatedAt ?? DateTime(0))
              .compareTo(b.payment.submittedAt ?? b.updatedAt ?? DateTime(0)),
        );
        return list;
      });

  /// Bookings whose `event.date` falls in [fromKey, toKey] (inclusive).
  Stream<List<BookingEntity>> watchByEventDateRange(
    String fromKey,
    String toKey,
  ) => _bookings
      .where('event.date', isGreaterThanOrEqualTo: fromKey)
      .where('event.date', isLessThanOrEqualTo: toKey)
      .snapshots()
      .map(_map);

  Stream<BookingEntity?> watchOne(String bookingId) => _bookings
      .doc(bookingId)
      .snapshots()
      .map((d) => d.exists ? BookingModel.fromMap(d.id, d.data()!) : null);

  Map<String, dynamic> _requireStatus(
    DocumentSnapshot<Map<String, dynamic>> snap,
    BookingStatus expected,
  ) {
    if (!snap.exists) throw const AdminActionException('Booking not found.');
    final data = snap.data()!;
    if (data['status'] != expected.firestoreValue) {
      throw AdminActionException(
        'Booking is ${data['status'] ?? 'missing a status'}, expected ${expected.firestoreValue}. It may have been updated already.',
      );
    }
    return data;
  }

  static String? _eventDate(Map<String, dynamic> data) {
    final ev = data['event'];
    final date = ev is Map ? ev['date'] : null;
    return (date is String && date.isNotEmpty) ? date : null;
  }

  /// PAYMENT_PROOF_SUBMITTED -> CONFIRMED and calendar/{date} -> BOOKED.
  Future<void> approvePayment(String bookingId, {required String actor}) {
    return db.runTransaction((tx) async {
      final ref = _bookings.doc(bookingId);
      final data = _requireStatus(
        await tx.get(ref),
        BookingStatus.paymentProofSubmitted,
      );
      final date = _eventDate(data);
      if (date == null) {
        throw const AdminActionException('Booking has no event date.');
      }
      final calRef = _calendar.doc(date);
      final cal = await tx.get(calRef);
      if (cal.exists) {
        final entry = CalendarEntry.fromMap(date, cal.data()!);
        final ownedByThis = entry.bookingId == bookingId;
        if (!ownedByThis &&
            _calendarActive.contains(entry.rawStatus) &&
            !entry.isLapsedHold()) {
          throw AdminActionException(
            '$date is already ${entry.rawStatus}${entry.bookingId != null ? ' by ${entry.bookingId}' : ''}. Resolve the calendar before approving.',
          );
        }
      }
      final comm = data['commercials'];
      final deposit = comm is Map && comm['depositRequired'] is num
          ? comm['depositRequired'] as num
          : 0;
      tx.update(ref, {
        'status': BookingStatus.confirmed.firestoreValue,
        'payment.status': PaymentStatusValues.verified,
        'payment.verifiedAt': FieldValue.serverTimestamp(),
        'payment.verifiedBy': actor,
        'commercials.depositPaid': deposit,
        'confirmedAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
      tx.set(calRef, {
        'status': 'BOOKED',
        'bookingId': bookingId,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    });
  }

  /// PAYMENT_PROOF_SUBMITTED -> PAYMENT_REJECTED; frees calendar/{date} only
  /// if it belongs to this booking.
  Future<void> rejectPayment(String bookingId, {required String reason}) {
    final trimmed = reason.trim();
    if (trimmed.isEmpty) {
      return Future.error(
        const AdminActionException('A rejection reason is required.'),
      );
    }
    return db.runTransaction((tx) async {
      final ref = _bookings.doc(bookingId);
      final data = _requireStatus(
        await tx.get(ref),
        BookingStatus.paymentProofSubmitted,
      );
      final date = _eventDate(data);
      DocumentReference<Map<String, dynamic>>? calRef;
      bool freeDate = false;
      if (date != null) {
        calRef = _calendar.doc(date);
        final cal = await tx.get(calRef);
        freeDate = cal.exists && cal.data()?['bookingId'] == bookingId;
      }
      tx.update(ref, {
        'status': BookingStatus.paymentRejected.firestoreValue,
        'payment.status': PaymentStatusValues.rejected,
        'payment.rejectionReason': trimmed,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      if (freeDate && calRef != null) tx.delete(calRef);
    });
  }

  /// CONFIRMED -> CANCELLED; frees calendar/{date} if it belongs to this booking.
  Future<void> cancelBooking(String bookingId) {
    return db.runTransaction((tx) async {
      final ref = _bookings.doc(bookingId);
      final data = _requireStatus(await tx.get(ref), BookingStatus.confirmed);
      final date = _eventDate(data);
      DocumentReference<Map<String, dynamic>>? calRef;
      bool freeDate = false;
      if (date != null) {
        calRef = _calendar.doc(date);
        final cal = await tx.get(calRef);
        freeDate = cal.exists && cal.data()?['bookingId'] == bookingId;
      }
      tx.update(ref, {
        'status': BookingStatus.cancelled.firestoreValue,
        'cancelledAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
      if (freeDate && calRef != null) tx.delete(calRef);
    });
  }

  /// CONFIRMED -> COMPLETED.
  Future<void> completeBooking(String bookingId) {
    return db.runTransaction((tx) async {
      final ref = _bookings.doc(bookingId);
      _requireStatus(await tx.get(ref), BookingStatus.confirmed);
      tx.update(ref, {
        'status': BookingStatus.completed.firestoreValue,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    });
  }
}

/// `calendar/{YYYY-MM-DD}`.
class AdminCalendarRepository {
  final FirebaseFirestore db;
  AdminCalendarRepository(this.db);

  CollectionReference<Map<String, dynamic>> get _calendar =>
      db.collection('calendar');

  Stream<Map<String, CalendarEntry>> watchRange(String fromKey, String toKey) =>
      _calendar
          .where(FieldPath.documentId, isGreaterThanOrEqualTo: fromKey)
          .where(FieldPath.documentId, isLessThanOrEqualTo: toKey)
          .snapshots()
          .map(
            (s) => {
              for (final d in s.docs)
                d.id: CalendarEntry.fromMap(d.id, d.data()),
            },
          );

  /// Blocks a free date. Fails if the date is held/booked/blocked.
  Future<void> block(String dateKey, String note) {
    return db.runTransaction((tx) async {
      final ref = _calendar.doc(dateKey);
      final snap = await tx.get(ref);
      if (snap.exists) {
        final e = CalendarEntry.fromMap(dateKey, snap.data()!);
        if (!e.isLapsedHold()) {
          throw AdminActionException(
            '$dateKey is ${e.rawStatus}; it can no longer be blocked.',
          );
        }
      }
      tx.set(ref, {
        'status': 'BLOCKED',
        'note': note.trim(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    });
  }

  /// Removes a BLOCKED entry. Refuses to touch HOLD/BOOKED.
  Future<void> unblock(String dateKey) {
    return db.runTransaction((tx) async {
      final ref = _calendar.doc(dateKey);
      final snap = await tx.get(ref);
      if (!snap.exists) return;
      if (snap.data()?['status'] != 'BLOCKED') {
        throw AdminActionException(
          '$dateKey is ${snap.data()?['status']}, not BLOCKED.',
        );
      }
      tx.delete(ref);
    });
  }
}

/// `services/{serviceId}`.
class AdminServicesRepository {
  final FirebaseFirestore db;
  AdminServicesRepository(this.db);

  CollectionReference<Map<String, dynamic>> get _services =>
      db.collection('services');

  Stream<List<StudioService>> watchAll() => _services.snapshots().map((s) {
    final list = s.docs
        .map((d) => StudioService.fromMap(d.id, d.data()))
        .toList();
    list.sort((a, b) {
      final c = a.sortOrder.compareTo(b.sortOrder);
      return c != 0 ? c : a.title.compareTo(b.title);
    });
    return list;
  });

  Future<void> create(StudioService s) => _services.add(s.toMap());

  Future<void> update(StudioService s) => _services.doc(s.id).update(s.toMap());

  Future<void> delete(String id) => _services.doc(id).delete();
}

/// `settings/business`.
class AdminSettingsRepository {
  final FirebaseFirestore db;
  AdminSettingsRepository(this.db);

  DocumentReference<Map<String, dynamic>> get _doc =>
      db.collection('settings').doc('business');

  Future<BusinessSettings?> load() async {
    final snap = await _doc.get();
    return snap.exists ? BusinessSettings.fromMap(snap.data()) : null;
  }

  Future<void> save(BusinessSettings s) =>
      _doc.set(s.toMap(), SetOptions(merge: true));
}

/// `notifications/{autoId}`.
class AdminNotificationsRepository {
  final FirebaseFirestore db;
  AdminNotificationsRepository(this.db);

  CollectionReference<Map<String, dynamic>> get _col =>
      db.collection('notifications');

  Stream<List<AdminNotification>> watchRecent({int limit = 200}) => _col
      .orderBy('createdAt', descending: true)
      .limit(limit)
      .snapshots()
      .map((s) => s.docs.map(AdminNotification.fromDoc).toList());

  Stream<int> watchUnreadCount() =>
      _col.where('isUnread', isEqualTo: true).snapshots().map((s) => s.size);

  Future<void> markRead(String id) => _col.doc(id).update({'isUnread': false});

  Future<void> markAllRead() async {
    final unread = await _col.where('isUnread', isEqualTo: true).get();
    final batch = db.batch();
    for (final d in unread.docs) {
      batch.update(d.reference, {'isUnread': false});
    }
    await batch.commit();
  }
}

/// All repositories, created only after the staff check passes.
class AdminRepositories {
  final AdminBookingRepository bookings;
  final AdminCalendarRepository calendar;
  final AdminServicesRepository services;
  final AdminSettingsRepository settings;
  final AdminNotificationsRepository notifications;

  /// Resolves a Storage `payment.proofPath` to a download URL.
  final Future<String> Function(String path) proofDownloadUrl;

  AdminRepositories(
    FirebaseFirestore db, {
    Future<String> Function(String path)? proofDownloadUrl,
  }) : proofDownloadUrl =
           proofDownloadUrl ??
           ((p) => FirebaseStorage.instance.ref(p).getDownloadURL()),
       bookings = AdminBookingRepository(db),
       calendar = AdminCalendarRepository(db),
       services = AdminServicesRepository(db),
       settings = AdminSettingsRepository(db),
       notifications = AdminNotificationsRepository(db);
}
