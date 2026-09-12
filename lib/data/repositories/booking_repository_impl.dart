import '../../domain/entities/booking_entity.dart';
import '../../domain/repositories/i_booking_repository.dart';
import '../datasources/booking_remote_datasource.dart';
import '../models/booking_model.dart';

class BookingRepositoryImpl implements IBookingRepository {
  final BookingRemoteDataSource? remoteDataSource;
  final bool useMockData;

  BookingRepositoryImpl({
    this.remoteDataSource,
    this.useMockData = true,
  });

  final List<BookingEntity> _mockBookings = [
    BookingEntity(
      id: 'BK-2026-001',
      customer: const CustomerDetails(
        fullName: 'Priya Sharma',
        phone: '+91 98290 12345',
        email: 'priya.sharma@example.com',
        instagramHandle: '@priya_bride',
      ),
      event: EventDetails(
        eventType: 'Royal Bridal',
        eventDate: DateTime.now().add(const Duration(days: 14)),
        readyByTime: '16:00',
        venueLocation: 'Gorbandh Palace, Jodhpur',
        city: 'Jodhpur',
        isOutstation: false,
        distanceKm: 12.5,
        guestCount: 1,
      ),
      serviceTitle: 'Signature Bridal Makeover',
      packageName: 'Royal Rajasthani Poshak & Jewelry Package',
      commercials: const CommercialDetails(
        basePrice: 25000,
        travelFee: 1500,
        depositRequired: 7500,
        depositPaid: 0,
      ),
      status: BookingStatus.awaitingApproval,
      referenceImages: const [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
      ],
      notes: 'Wants heavy traditional eye makeup and poshak draping.',
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
    ),
    BookingEntity(
      id: 'BK-2026-002',
      customer: const CustomerDetails(
        fullName: 'Ananya Rathore',
        phone: '+91 94140 67890',
        email: 'ananya.r@example.com',
        instagramHandle: '@ananya_rathore',
      ),
      event: EventDetails(
        eventType: 'Pre-Wedding / Engagement',
        eventDate: DateTime.now().add(const Duration(days: 7)),
        readyByTime: '11:00',
        venueLocation: 'Indana Palace, Jodhpur',
        city: 'Jodhpur',
        isOutstation: false,
        distanceKm: 8.0,
        guestCount: 2,
      ),
      serviceTitle: 'Pre-Wedding & Engagement Glam',
      packageName: 'Soft Dewy Engagement Glam',
      commercials: const CommercialDetails(
        basePrice: 12000,
        travelFee: 0,
        depositRequired: 4000,
        depositPaid: 4000,
      ),
      status: BookingStatus.confirmed,
      notes: 'Soft dewy finish preferred.',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
  ];

  @override
  Future<List<BookingEntity>> getBookings() async {
    if (!useMockData && remoteDataSource != null) {
      return await remoteDataSource!.fetchBookings();
    }
    await Future.delayed(const Duration(milliseconds: 400));
    return List.unmodifiable(_mockBookings);
  }

  @override
  Future<BookingEntity?> getBookingById(String id) async {
    final bookings = await getBookings();
    try {
      return bookings.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> submitInquiry(BookingEntity booking) async {
    if (!useMockData && remoteDataSource != null) {
      await remoteDataSource!
          .submitInquiry(BookingModel.fromEntity(booking));
      return;
    }
    await Future.delayed(const Duration(milliseconds: 500));
    _mockBookings.insert(0, booking);
  }

  @override
  Future<void> approveBooking({
    required String bookingId,
    required double quoteAmount,
    required double travelFee,
    required double depositRequired,
    String? notes,
  }) async {
    if (!useMockData && remoteDataSource != null) {
      await remoteDataSource!.approveBooking(
        bookingId: bookingId,
        quoteAmount: quoteAmount,
        travelFee: travelFee,
        depositRequired: depositRequired,
        notes: notes,
      );
      return;
    }
    await Future.delayed(const Duration(milliseconds: 400));
    final index = _mockBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      final existing = _mockBookings[index];
      final updated = existing.copyWith(
        status: BookingStatus.depositPending,
        commercials: CommercialDetails(
          basePrice: quoteAmount,
          travelFee: travelFee,
          depositRequired: depositRequired,
          depositPaid: existing.commercials.depositPaid,
        ),
        notes: notes ?? existing.notes,
      );
      _mockBookings[index] = updated;
    }
  }

  @override
  Future<void> declineBooking(String bookingId, String reason) async {
    if (!useMockData && remoteDataSource != null) {
      await remoteDataSource!.declineBooking(bookingId, reason);
      return;
    }
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _mockBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _mockBookings[index] = _mockBookings[index].copyWith(
        status: BookingStatus.declined,
        notes: 'Declined: $reason',
      );
    }
  }

  @override
  Future<void> updateBookingStatus(
      String bookingId, BookingStatus newStatus) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _mockBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _mockBookings[index] = _mockBookings[index].copyWith(status: newStatus);
    }
  }
}
