import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/data/models/booking_model.dart';
import 'package:makeup_webapp/domain/entities/booking_entity.dart';

import 'fixtures.dart';

void main() {
  test('fromMap parses every contract field', () {
    final b = BookingModel.fromMap('MBP-7K2QXD', contractBooking());

    expect(b.id, 'MBP-7K2QXD');
    expect(b.bookingId, 'MBP-7K2QXD');
    expect(b.status, BookingStatus.paymentProofSubmitted);
    expect(b.rawStatus, 'PAYMENT_PROOF_SUBMITTED');
    expect(b.customer.fullName, 'Aditi Rathore');
    expect(b.customer.phone, '9876543210');
    expect(b.customer.email, 'aditi@example.com');
    expect(b.event.eventType, 'Bridal Makeup');
    expect(b.event.dateKey, '2026-12-12');
    expect(b.event.hasValidDate, isTrue);
    expect(b.event.eventDate, DateTime(2026, 12, 12));
    expect(b.event.readyByTime, '16:30');
    expect(b.event.venueLocation, 'Umaid Bhawan');
    expect(b.event.city, 'Jodhpur');
    expect(b.event.guestCount, 3);
    expect(b.serviceId, 'bridal-hd');
    expect(b.serviceTitle, 'Bridal Makeup');
    expect(b.packageName, 'HD Bridal');
    expect(b.notes, 'Prefers soft glam');
    expect(b.commercials.basePrice, 25000);
    expect(b.commercials.travelFee, 0);
    expect(b.commercials.totalAmount, 25000);
    expect(b.commercials.depositRequired, 7500);
    expect(b.commercials.depositPaid, 0);
    expect(b.payment.upiId, 'studio@okicici');
    expect(b.payment.payeeName, 'Makeovers by Prachi');
    expect(b.payment.status, 'VERIFICATION_PENDING');
    expect(b.payment.utrNumber, '412345678901');
    expect(b.payment.proofPath, 'payment_proofs/MBP-7K2QXD/proof.jpg');
    expect(
      b.payment.submittedAt!.isAtSameMomentAs(DateTime.utc(2026, 10, 20, 10)),
      isTrue,
    );
    expect(b.payment.rejectionReason, isNull);
    expect(
      b.expiresAt!.isAtSameMomentAs(DateTime.utc(2026, 10, 20, 10, 15)),
      isTrue,
    );
    expect(
      b.createdAt!.isAtSameMomentAs(DateTime.utc(2026, 10, 20, 9)),
      isTrue,
    );
  });

  test('fromFirestore works on a real (fake) document snapshot', () async {
    final db = FakeFirebaseFirestore();
    await db.collection('bookings').doc('MBP-7K2QXD').set(contractBooking());
    final snap = await db.collection('bookings').doc('MBP-7K2QXD').get();
    final b = BookingModel.fromFirestore(snap);
    expect(b.id, 'MBP-7K2QXD');
    expect(b.commercials.depositRequired, 7500);
  });

  test('unknown status is kept raw and shown, not mapped', () {
    final b = BookingModel.fromMap(
      'MBP-AAAAAA',
      contractBooking(status: 'AWAITING_APPROVAL'),
    );
    expect(b.status, isNull);
    expect(b.rawStatus, 'AWAITING_APPROVAL');
    expect(b.statusLabel(), 'Unknown: AWAITING_APPROVAL');
  });

  test('DEPOSIT_PENDING past expiresAt displays as Expired (unpaid)', () {
    final b = BookingModel.fromMap(
      'MBP-BBBBBB',
      contractBooking(
        status: 'DEPOSIT_PENDING',
        expiresAt: '2026-10-20T10:15:00.000Z',
      ),
    );
    expect(b.isUnpaidExpired(DateTime.utc(2026, 10, 20, 11)), isTrue);
    expect(b.statusLabel(DateTime.utc(2026, 10, 20, 11)), 'Expired (unpaid)');
    expect(b.isUnpaidExpired(DateTime.utc(2026, 10, 20, 10)), isFalse);
    expect(b.statusLabel(DateTime.utc(2026, 10, 20, 10)), 'Deposit pending');
  });

  test('invalid event date keeps the raw value', () {
    final b = BookingModel.fromMap('X', contractBooking(date: '12/12/2026'));
    expect(b.event.hasValidDate, isFalse);
    expect(b.event.dateKey, '12/12/2026');
  });
}
