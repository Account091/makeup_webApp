import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../domain/repositories/i_booking_repository.dart';
import 'booking_event.dart';
import 'booking_state.dart';

/// Legacy bloc used by parked (unreachable) screens only.
class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final IBookingRepository repository;

  BookingBloc({required this.repository}) : super(BookingInitialState()) {
    on<FetchBookingsEvent>(_onFetchBookings);
    on<SubmitBookingInquiryEvent>(_onSubmitInquiry);
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
      emit(const BookingOperationSuccessState('Inquiry submitted.'));
    } catch (e) {
      emit(BookingErrorState(e.toString()));
    }
  }
}
