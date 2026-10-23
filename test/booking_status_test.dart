import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/domain/entities/booking_entity.dart';

void main() {
  const expected = {
    BookingStatus.depositPending: 'DEPOSIT_PENDING',
    BookingStatus.paymentProofSubmitted: 'PAYMENT_PROOF_SUBMITTED',
    BookingStatus.confirmed: 'CONFIRMED',
    BookingStatus.paymentRejected: 'PAYMENT_REJECTED',
    BookingStatus.expired: 'EXPIRED',
    BookingStatus.cancelled: 'CANCELLED',
    BookingStatus.completed: 'COMPLETED',
  };

  test('enum has exactly the 7 contract values', () {
    expect(BookingStatus.values.length, 7);
    expect(expected.keys.toSet(), BookingStatus.values.toSet());
  });

  test('toFirestore writes the UPPER_SNAKE contract values', () {
    expected.forEach((status, value) {
      expect(BookingStatusCodec.toFirestore(status), value);
      expect(status.firestoreValue, value);
    });
  });

  test('round-trip all values', () {
    for (final s in BookingStatus.values) {
      expect(BookingStatusCodec.fromFirestore(s.firestoreValue), s);
    }
  });

  test('unknown / legacy / wrong-case values are not silently mapped', () {
    for (final raw in [
      'confirmed',
      'depositPending',
      'AWAITING_APPROVAL',
      'DECLINED',
      'VERIFIED',
      '',
      null,
    ]) {
      expect(BookingStatusCodec.fromFirestore(raw), isNull, reason: '$raw');
    }
  });
}
