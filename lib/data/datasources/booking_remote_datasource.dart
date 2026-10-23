import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/booking_model.dart';

abstract class BookingRemoteDataSource {
  Future<List<BookingModel>> fetchBookings();
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  final FirebaseFirestore firestore;

  BookingRemoteDataSourceImpl({FirebaseFirestore? firestore})
    : firestore = firestore ?? FirebaseFirestore.instance;

  /// Errors propagate to the caller; there is no silent fallback.
  @override
  Future<List<BookingModel>> fetchBookings() async {
    final snapshot = await firestore.collection('bookings').get();
    final list = snapshot.docs.map(BookingModel.fromFirestore).toList();
    list.sort(
      (a, b) =>
          (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)),
    );
    return list;
  }
}
