import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../domain/repositories/i_booking_repository.dart';
import 'booking_event.dart';
import 'booking_state.dart';

class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final IBookingRepository repository;

  BookingBloc({required this.repository}) : super(BookingInitialState()) {
    on<FetchBookingsEvent>(_onFetchBookings);
    on<SubmitBookingInquiryEvent>(_onSubmitInquiry);
    on<ApproveBookingEvent>(_onApproveBooking);
    on<DeclineBookingEvent>(_onDeclineBooking);
  }

  Future<void> _onFetchBookings(
    FetchBookingsEvent event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoadingState());
    try {
      final bookings = await repository.getBookings();
      emit(BookingsLoadedState(bookings));
    } catch (e) {
      emit(BookingErrorState(e.toString()));
    }
  }

  Future<void> _onSubmitInquiry(
    SubmitBookingInquiryEvent event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoadingState());
    try {
      await repository.submitInquiry(event.booking);
      emit(const BookingOperationSuccessState(
          'Inquiry submitted successfully! Awaiting Prachi\'s approval.'));
      final bookings = await repository.getBookings();
      emit(BookingsLoadedState(bookings));
    } catch (e) {
      emit(BookingErrorState(e.toString()));
    }
  }

  Future<void> _onApproveBooking(
    ApproveBookingEvent event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoadingState());
    try {
      await repository.approveBooking(
        bookingId: event.bookingId,
        quoteAmount: event.quoteAmount,
        travelFee: event.travelFee,
        depositRequired: event.depositRequired,
        notes: event.notes,
      );
      emit(const BookingOperationSuccessState('Booking approved! Quote sent.'));
      final bookings = await repository.getBookings();
      emit(BookingsLoadedState(bookings));
    } catch (e) {
      emit(BookingErrorState(e.toString()));
    }
  }

  Future<void> _onDeclineBooking(
    DeclineBookingEvent event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoadingState());
    try {
      await repository.declineBooking(event.bookingId, event.reason);
      emit(const BookingOperationSuccessState('Booking request declined.'));
      final bookings = await repository.getBookings();
      emit(BookingsLoadedState(bookings));
    } catch (e) {
      emit(BookingErrorState(e.toString()));
    }
  }
}
