import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/data/models/booking_model.dart';
import 'package:makeup_webapp/domain/services/customer_aggregation.dart';
import 'package:makeup_webapp/domain/services/dashboard_stats.dart';

import 'fixtures.dart';

BookingModel _b(
  String id, {
  String phone = '9876543210',
  String name = 'Aditi',
  String email = '',
  String status = 'CONFIRMED',
  String date = '2026-12-12',
  num paid = 0,
  String? expiresAt,
  DateTime? createdAt,
  DateTime? confirmedAt,
}) => BookingModel.fromMap(
  id,
  contractBooking(
    bookingId: id,
    phone: phone,
    fullName: name,
    email: email,
    status: status,
    date: date,
    depositPaid: paid,
    expiresAt: expiresAt,
    createdAt: createdAt,
    confirmedAt: confirmedAt == null ? null : Timestamp.fromDate(confirmedAt),
  ),
);

void main() {
  group('aggregateCustomers', () {
    test('groups by normalised phone and sums deposits', () {
      final list = [
        _b(
          'MBP-1',
          phone: '9876543210',
          name: 'Aditi R',
          paid: 7500,
          date: '2026-11-01',
          createdAt: DateTime(2026, 9, 1),
        ),
        _b(
          'MBP-2',
          phone: '+91 98765 43210',
          name: 'Aditi Rathore',
          email: 'a@x.com',
          paid: 5000,
          date: '2027-01-15',
          createdAt: DateTime(2026, 10, 1),
        ),
        _b(
          'MBP-3',
          phone: '9000000001',
          name: 'Neha',
          paid: 0,
          date: '2026-12-20',
        ),
      ];
      final customers = aggregateCustomers(list);
      expect(customers.length, 2);

      final aditi = customers.firstWhere((c) => c.phone == '9876543210');
      expect(aditi.bookingCount, 2);
      expect(aditi.totalPaid, 12500);
      expect(aditi.name, 'Aditi Rathore'); // most recent booking
      expect(aditi.email, 'a@x.com');
      expect(aditi.lastEventDate, '2027-01-15');
      expect(aditi.bookings.first.id, 'MBP-2');

      // sorted by last event date, newest first
      expect(customers.first.phone, '9876543210');
    });

    test('empty input gives empty list', () {
      expect(aggregateCustomers(const []), isEmpty);
    });
  });

  group('computeDashboardStats', () {
    test('counts and revenue', () {
      final now = DateTime(2026, 10, 22, 12);
      final list = [
        _b('A', status: 'PAYMENT_PROOF_SUBMITTED'),
        _b('B', status: 'PAYMENT_PROOF_SUBMITTED'),
        _b('C', status: 'DEPOSIT_PENDING', expiresAt: '2026-10-22T13:00:00'),
        _b('D', status: 'DEPOSIT_PENDING', expiresAt: '2026-10-22T11:00:00'),
        _b(
          'E',
          status: 'CONFIRMED',
          paid: 7500,
          date: '2026-10-22',
          confirmedAt: DateTime(2026, 10, 5),
        ),
        _b(
          'F',
          status: 'COMPLETED',
          paid: 3000,
          date: '2026-10-10',
          confirmedAt: DateTime(2026, 10, 2),
        ),
        _b(
          'G',
          status: 'CONFIRMED',
          paid: 9000,
          date: '2026-11-30',
          confirmedAt: DateTime(2026, 9, 30),
        ),
        _b(
          'H',
          status: 'CONFIRMED',
          paid: 1000,
          date: '2026-10-01',
          confirmedAt: DateTime(2026, 9, 1),
        ),
      ];
      final s = computeDashboardStats(list, now: now);
      expect(s.awaitingVerification, 2);
      expect(s.pendingDeposits, 1);
      expect(s.confirmedThisMonth, 2);
      expect(s.revenueThisMonth, 10500);
      expect(s.upcoming.map((b) => b.id), ['E', 'G']);
    });
  });
}
