import '../entities/booking_entity.dart';

class DashboardStats {
  final int awaitingVerification;
  final int pendingDeposits;
  final int confirmedThisMonth;
  final double revenueThisMonth;

  /// CONFIRMED bookings with event date today or later, soonest first.
  final List<BookingEntity> upcoming;

  const DashboardStats({
    required this.awaitingVerification,
    required this.pendingDeposits,
    required this.confirmedThisMonth,
    required this.revenueThisMonth,
    required this.upcoming,
  });
}

/// Pure computation of the dashboard numbers.
///
/// - awaiting verification: status PAYMENT_PROOF_SUBMITTED
/// - pending deposits: DEPOSIT_PENDING whose hold has not lapsed
/// - confirmed this month / revenue: CONFIRMED or COMPLETED bookings whose
///   `confirmedAt` is in the current calendar month; revenue sums
///   `commercials.depositPaid` (deposits actually verified).
DashboardStats computeDashboardStats(
  List<BookingEntity> bookings, {
  DateTime? now,
}) {
  final n = now ?? DateTime.now();
  final todayKey =
      '${n.year.toString().padLeft(4, '0')}-${n.month.toString().padLeft(2, '0')}-${n.day.toString().padLeft(2, '0')}';

  var awaiting = 0, pending = 0, confirmedMonth = 0;
  var revenue = 0.0;
  final upcoming = <BookingEntity>[];

  for (final b in bookings) {
    switch (b.status) {
      case BookingStatus.paymentProofSubmitted:
        awaiting++;
        break;
      case BookingStatus.depositPending:
        if (!b.isUnpaidExpired(n)) pending++;
        break;
      default:
        break;
    }
    if (b.status == BookingStatus.confirmed ||
        b.status == BookingStatus.completed) {
      final c = b.confirmedAt;
      if (c != null && c.year == n.year && c.month == n.month) {
        confirmedMonth++;
        revenue += b.commercials.depositPaid;
      }
    }
    if (b.status == BookingStatus.confirmed &&
        b.event.hasValidDate &&
        b.event.dateKey.compareTo(todayKey) >= 0) {
      upcoming.add(b);
    }
  }
  upcoming.sort((a, b) {
    final c = a.event.dateKey.compareTo(b.event.dateKey);
    return c != 0 ? c : a.event.readyByTime.compareTo(b.event.readyByTime);
  });

  return DashboardStats(
    awaitingVerification: awaiting,
    pendingDeposits: pending,
    confirmedThisMonth: confirmedMonth,
    revenueThisMonth: revenue,
    upcoming: upcoming,
  );
}
