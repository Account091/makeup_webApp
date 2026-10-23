import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/booking_entity.dart';
import '../../domain/repositories/i_booking_repository.dart';
import '../datasources/booking_remote_datasource.dart';

/// Legacy repository kept for parked screens. No mock data: failures surface
/// to the caller.
class BookingRepositoryImpl implements IBookingRepository {
  final BookingRemoteDataSource remoteDataSource;
  final FirebaseFirestore? firestore;

  BookingRepositoryImpl({required this.remoteDataSource, this.firestore});

  @override
  Future<List<BookingEntity>> getBookings() => remoteDataSource.fetchBookings();

  @override
  Future<BookingEntity?> getBookingById(String id) async {
    final bookings = await getBookings();
    for (final b in bookings) {
      if (b.id == id) return b;
    }
    return null;
  }

  @override
  Future<void> submitInquiry(BookingEntity booking) {
    throw UnsupportedError(
      'Bookings are created on the website (POST /api/booking/create-session).',
    );
  }

  @override
  Future<void> updateBookingStatus(
    String bookingId,
    BookingStatus newStatus,
  ) async {
    final db = firestore ?? FirebaseFirestore.instance;
    await db.collection('bookings').doc(bookingId).update({
      'status': newStatus.firestoreValue,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
