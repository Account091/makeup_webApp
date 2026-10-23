import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/data/admin/admin_models.dart';
import 'package:makeup_webapp/data/admin/admin_repositories.dart';
import 'package:makeup_webapp/domain/entities/booking_entity.dart';

import 'fixtures.dart';

void main() {
  late FakeFirebaseFirestore db;
  late AdminRepositories repos;
  const id = 'MBP-7K2QXD';
  const date = '2026-12-12';

  Future<Map<String, dynamic>> booking() async =>
      (await db.collection('bookings').doc(id).get()).data()!;
  Future<DocumentSnapshot<Map<String, dynamic>>> cal([String d = date]) =>
      db.collection('calendar').doc(d).get();

  setUp(() async {
    db = FakeFirebaseFirestore();
    repos = AdminRepositories(db);
    await db
        .collection('bookings')
        .doc(id)
        .set(contractBooking(bookingId: id, date: date));
    await db.collection('calendar').doc(date).set({
      'status': 'HOLD',
      'bookingId': id,
      'expiresAt': '2026-10-20T10:15:00.000Z',
      'updatedAt': Timestamp.now(),
    });
  });

  group('approvePayment', () {
    test('confirms booking, records deposit, books the calendar', () async {
      await repos.bookings.approvePayment(id, actor: 'owner@studio.in');
      final b = await booking();
      expect(b['status'], 'CONFIRMED');
      expect(b['payment']['status'], 'VERIFIED');
      expect(b['payment']['verifiedBy'], 'owner@studio.in');
      expect(b['payment']['verifiedAt'], isA<Timestamp>());
      expect(b['payment']['utrNumber'], '412345678901'); // untouched
      expect(b['commercials']['depositPaid'], 7500);
      expect(b['commercials']['totalAmount'], 25000); // untouched
      expect(b['confirmedAt'], isA<Timestamp>());
      expect(b['updatedAt'], isA<Timestamp>());

      final c = (await cal()).data()!;
      expect(c['status'], 'BOOKED');
      expect(c['bookingId'], id);
      expect(c.containsKey('expiresAt'), isFalse);
      expect(c['updatedAt'], isA<Timestamp>());
    });

    test('refuses when booking is not awaiting verification', () async {
      await db.collection('bookings').doc(id).update({'status': 'CONFIRMED'});
      await expectLater(
        repos.bookings.approvePayment(id, actor: 'x'),
        throwsA(isA<AdminActionException>()),
      );
    });

    test('refuses when the date is booked by another booking', () async {
      await db.collection('calendar').doc(date).set({
        'status': 'BOOKED',
        'bookingId': 'MBP-OTHER1',
      });
      await expectLater(
        repos.bookings.approvePayment(id, actor: 'x'),
        throwsA(isA<AdminActionException>()),
      );
      expect((await booking())['status'], 'PAYMENT_PROOF_SUBMITTED');
    });

    test(
      'allowed when the date has a lapsed HOLD from another booking',
      () async {
        await db.collection('calendar').doc(date).set({
          'status': 'HOLD',
          'bookingId': 'MBP-OTHER1',
          'expiresAt': '2020-01-01T00:00:00.000Z',
        });
        await repos.bookings.approvePayment(id, actor: 'x');
        expect((await cal()).data()!['bookingId'], id);
      },
    );

    test('missing booking throws', () async {
      await expectLater(
        repos.bookings.approvePayment('MBP-NOPE00', actor: 'x'),
        throwsA(isA<AdminActionException>()),
      );
    });
  });

  group('rejectPayment', () {
    test(
      'rejects with reason and frees this booking\'s calendar hold',
      () async {
        await repos.bookings.rejectPayment(id, reason: '  UTR not found ');
        final b = await booking();
        expect(b['status'], 'PAYMENT_REJECTED');
        expect(b['payment']['status'], 'REJECTED');
        expect(b['payment']['rejectionReason'], 'UTR not found');
        expect(b['updatedAt'], isA<Timestamp>());
        expect(b['commercials']['depositPaid'], 0);
        expect((await cal()).exists, isFalse);
      },
    );

    test('does not delete a calendar doc owned by another booking', () async {
      await db.collection('calendar').doc(date).set({
        'status': 'HOLD',
        'bookingId': 'MBP-OTHER1',
      });
      await repos.bookings.rejectPayment(id, reason: 'Wrong amount');
      expect((await cal()).exists, isTrue);
    });

    test('requires a reason', () async {
      await expectLater(
        repos.bookings.rejectPayment(id, reason: '   '),
        throwsA(isA<AdminActionException>()),
      );
      expect((await booking())['status'], 'PAYMENT_PROOF_SUBMITTED');
    });
  });

  group('cancel / complete', () {
    setUp(() => repos.bookings.approvePayment(id, actor: 'x'));

    test('cancel frees the date and stamps cancelledAt', () async {
      await repos.bookings.cancelBooking(id);
      final b = await booking();
      expect(b['status'], 'CANCELLED');
      expect(b['cancelledAt'], isA<Timestamp>());
      expect(b['updatedAt'], isA<Timestamp>());
      expect((await cal()).exists, isFalse);
    });

    test('complete sets COMPLETED', () async {
      await repos.bookings.completeBooking(id);
      expect((await booking())['status'], 'COMPLETED');
    });

    test('cannot cancel a completed booking', () async {
      await repos.bookings.completeBooking(id);
      await expectLater(
        repos.bookings.cancelBooking(id),
        throwsA(isA<AdminActionException>()),
      );
    });
  });

  group('streams', () {
    test('verification queue only contains PAYMENT_PROOF_SUBMITTED', () async {
      await db
          .collection('bookings')
          .doc('MBP-AAAAAA')
          .set(
            contractBooking(bookingId: 'MBP-AAAAAA', status: 'DEPOSIT_PENDING'),
          );
      final queue = await repos.bookings.watchAwaitingVerification().first;
      expect(queue.map((b) => b.id), [id]);
      expect(queue.single.status, BookingStatus.paymentProofSubmitted);
    });

    test('approved item leaves the queue', () async {
      await repos.bookings.approvePayment(id, actor: 'x');
      expect(await repos.bookings.watchAwaitingVerification().first, isEmpty);
    });
  });

  group('calendar', () {
    const free = '2026-12-25';

    test('block a free date then unblock it', () async {
      await repos.calendar.block(free, 'Family function');
      final c = (await cal(free)).data()!;
      expect(c['status'], 'BLOCKED');
      expect(c['note'], 'Family function');
      expect(c['updatedAt'], isA<Timestamp>());

      await repos.calendar.unblock(free);
      expect((await cal(free)).exists, isFalse);
    });

    test('lapsed HOLD counts as free and can be blocked', () async {
      // setUp's HOLD expired on 2026-10-20.
      await repos.calendar.block(date, 'x');
      expect((await cal()).data()!['status'], 'BLOCKED');
    });

    test(
      'cannot block an active hold; cannot unblock a non-BLOCKED date',
      () async {
        await db.collection('calendar').doc(date).update({
          'expiresAt': DateTime.now()
              .add(const Duration(hours: 1))
              .toIso8601String(),
        });
        await expectLater(
          repos.calendar.block(date, 'x'),
          throwsA(isA<AdminActionException>()),
        );
        await expectLater(
          repos.calendar.unblock(date),
          throwsA(isA<AdminActionException>()),
        );
        expect((await cal()).data()!['status'], 'HOLD');
      },
    );

    test('watchRange returns entries in the month', () async {
      await repos.calendar.block(free, 'x');
      await db.collection('calendar').doc('2027-01-01').set({
        'status': 'BLOCKED',
      });
      final m = await repos.calendar
          .watchRange('2026-12-01', '2026-12-31')
          .first;
      expect(m.keys.toSet(), {date, free});
      expect(m[free]!.status, CalendarEntryStatus.blocked);
    });
  });

  group('services & settings', () {
    test('service CRUD', () async {
      await repos.services.create(
        const StudioService(
          title: 'Party Makeup',
          price: 4500,
          category: 'Party',
          sortOrder: 2,
        ),
      );
      var list = await repos.services.watchAll().first;
      expect(list.single.title, 'Party Makeup');
      expect(list.single.active, isTrue);

      final s = list.single;
      await repos.services.update(
        StudioService(
          id: s.id,
          title: 'Party Glam',
          price: 5000,
          active: false,
          sortOrder: 1,
        ),
      );
      list = await repos.services.watchAll().first;
      expect(list.single.title, 'Party Glam');
      expect(list.single.price, 5000);
      expect(list.single.active, isFalse);

      await repos.services.delete(s.id);
      expect(await repos.services.watchAll().first, isEmpty);
    });

    test('settings save and load', () async {
      expect(await repos.settings.load(), isNull);
      await repos.settings.save(
        const BusinessSettings(
          businessName: 'Makeovers by Prachi',
          upiId: 'studio@okicici',
          payeeName: 'Makeovers by Prachi',
          whatsappNumber: '919800000000',
          depositPercent: 30,
          holdMinutes: 15,
          travelFees: {
            'jodhpur': 0,
            'jaipur': 3500,
            'udaipur': 3500,
            'other': 8500,
          },
        ),
      );
      final raw = (await db.collection('settings').doc('business').get())
          .data()!;
      expect(raw['travelFees'], {
        'jodhpur': 0,
        'jaipur': 3500,
        'udaipur': 3500,
        'other': 8500,
      });
      final s = (await repos.settings.load())!;
      expect(s.upiId, 'studio@okicici');
      expect(s.travelFees['other'], 8500);
    });

    test('settings validators', () {
      expect(SettingsValidators.upiId('studio@okicici'), isNull);
      expect(SettingsValidators.upiId('studio'), isNotNull);
      expect(SettingsValidators.whatsapp('919800000000'), isNull);
      expect(SettingsValidators.whatsapp('+91 98000'), isNotNull);
      expect(SettingsValidators.intInRange('30', 'x', 1, 100), isNull);
      expect(SettingsValidators.intInRange('0', 'x', 1, 100), isNotNull);
      expect(SettingsValidators.nonNegativeAmount('-1'), isNotNull);
    });
  });

  group('notifications', () {
    test('unread count and mark read', () async {
      final col = db.collection('notifications');
      await col.add({
        'title': 'a',
        'isUnread': true,
        'createdAt': Timestamp.now(),
      });
      final second = await col.add({
        'title': 'b',
        'isUnread': true,
        'createdAt': Timestamp.now(),
      });
      expect(await repos.notifications.watchUnreadCount().first, 2);
      await repos.notifications.markRead(second.id);
      expect(await repos.notifications.watchUnreadCount().first, 1);
      await repos.notifications.markAllRead();
      expect(await repos.notifications.watchUnreadCount().first, 0);
      expect((await repos.notifications.watchRecent().first).length, 2);
    });
  });
}
