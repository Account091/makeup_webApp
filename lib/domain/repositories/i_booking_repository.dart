import '../entities/booking_entity.dart';

/// Legacy one-shot booking repository (used only by parked screens).
/// The admin app uses `AdminBookingRepository` (live streams + transactions).
abstract class IBookingRepository {
  Future<List<BookingEntity>> getBookings();
  Future<BookingEntity?> getBookingById(String id);

  /// Bookings are created by the website API, never by this app.
  Future<void> submitInquiry(BookingEntity booking);
  Future<void> updateBookingStatus(String bookingId, BookingStatus newStatus);
}
