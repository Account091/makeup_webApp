import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/booking_model.dart';
import '../../domain/entities/booking_entity.dart';

abstract class BookingRemoteDataSource {
  Future<List<BookingModel>> fetchBookings();
  Future<void> submitInquiry(BookingModel booking);
  Future<void> approveBooking({
    required String bookingId,
    required double quoteAmount,
    required double travelFee,
    required double depositRequired,
    String? notes,
  });
  Future<void> declineBooking(String bookingId, String reason);
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  final FirebaseFirestore firestore;

  BookingRemoteDataSourceImpl({FirebaseFirestore? firestore})
      : firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference get _bookingsRef => firestore.collection('bookings');

  @override
  Future<List<BookingModel>> fetchBookings() async {
    final snapshot =
        await _bookingsRef.orderBy('createdAt', descending: true).get();
    return snapshot.docs.map((doc) => BookingModel.fromFirestore(doc)).toList();
  }

  @override
  Future<void> submitInquiry(BookingModel booking) async {
    await _bookingsRef.doc(booking.id).set(booking.toFirestore());
  }

  @override
  Future<void> approveBooking({
    required String bookingId,
    required double quoteAmount,
    required double travelFee,
    required double depositRequired,
    String? notes,
  }) async {
    await _bookingsRef.doc(bookingId).update({
      'status': BookingStatus.depositPending.name,
      'commercials.basePrice': quoteAmount,
      'commercials.travelFee': travelFee,
      'commercials.depositRequired': depositRequired,
      if (notes != null) 'notes': notes,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  @override
  Future<void> declineBooking(String bookingId, String reason) async {
    await _bookingsRef.doc(bookingId).update({
      'status': BookingStatus.declined.name,
      'notes': 'Declined: $reason',
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
