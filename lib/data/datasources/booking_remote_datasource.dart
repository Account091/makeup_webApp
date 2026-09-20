import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/booking_model.dart';

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
    try {
      final snapshot = await _bookingsRef.get();
      final list =
          snapshot.docs.map((doc) => BookingModel.fromFirestore(doc)).toList();
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return list;
    } catch (e) {
      return [];
    }
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
      'status': 'DEPOSIT_PENDING',
      'payment.status': 'DEPOSIT_PENDING',
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
      'status': 'DECLINED',
      'payment.status': 'DECLINED',
      'notes': 'Declined: $reason',
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
