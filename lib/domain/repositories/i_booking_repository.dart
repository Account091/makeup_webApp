import '../entities/booking_entity.dart';

abstract class IBookingRepository {
  Future<List<BookingEntity>> getBookings();
  Future<BookingEntity?> getBookingById(String id);
  Future<void> submitInquiry(BookingEntity booking);
  Future<void> approveBooking({
    required String bookingId,
    required double quoteAmount,
    required double travelFee,
    required double depositRequired,
    String? notes,
  });
  Future<void> declineBooking(String bookingId, String reason);
  Future<void> updateBookingStatus(String bookingId, BookingStatus newStatus);
}
