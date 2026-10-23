import '../entities/booking_entity.dart';

/// A customer derived from their bookings (grouped by phone).
class CustomerSummary {
  final String phone;
  final String name;
  final String email;
  final int bookingCount;
  final double totalPaid;

  /// Latest `event.date` (YYYY-MM-DD) among the customer's bookings.
  final String? lastEventDate;

  /// Newest first.
  final List<BookingEntity> bookings;

  const CustomerSummary({
    required this.phone,
    required this.name,
    required this.email,
    required this.bookingCount,
    required this.totalPaid,
    required this.lastEventDate,
    required this.bookings,
  });
}

/// Normalises a phone to its last 10 digits (contract: 10 digits, no +91).
String normalizePhone(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  return digits.length > 10 ? digits.substring(digits.length - 10) : digits;
}

/// Groups bookings by normalised phone. Name/email come from the most
/// recently created booking that has them. Total paid = sum of
/// `commercials.depositPaid`. Sorted by last event date, newest first.
List<CustomerSummary> aggregateCustomers(List<BookingEntity> bookings) {
  final groups = <String, List<BookingEntity>>{};
  for (final b in bookings) {
    final key = normalizePhone(b.customer.phone);
    groups.putIfAbsent(key.isEmpty ? '(no phone)' : key, () => []).add(b);
  }

  final result = <CustomerSummary>[];
  groups.forEach((phone, list) {
    final byNewest = [...list]
      ..sort(
        (a, b) =>
            (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)),
      );
    final name = byNewest
        .map((b) => b.customer.fullName.trim())
        .firstWhere((n) => n.isNotEmpty, orElse: () => '(no name)');
    final email = byNewest
        .map((b) => b.customer.email.trim())
        .firstWhere((e) => e.isNotEmpty, orElse: () => '');
    final paid = list.fold<double>(
      0,
      (sum, b) => sum + b.commercials.depositPaid,
    );
    String? last;
    for (final b in list) {
      if (!b.event.hasValidDate) continue;
      if (last == null || b.event.dateKey.compareTo(last) > 0) {
        last = b.event.dateKey;
      }
    }
    result.add(
      CustomerSummary(
        phone: phone,
        name: name,
        email: email,
        bookingCount: list.length,
        totalPaid: paid,
        lastEventDate: last,
        bookings: byNewest,
      ),
    );
  });

  result.sort(
    (a, b) => (b.lastEventDate ?? '').compareTo(a.lastEventDate ?? ''),
  );
  return result;
}
