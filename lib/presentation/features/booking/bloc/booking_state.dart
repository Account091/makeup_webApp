import 'package:equatable/equatable.dart';
import '../../../../domain/entities/booking_entity.dart';

abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

class BookingInitialState extends BookingState {}

class BookingLoadingState extends BookingState {}

class BookingsLoadedState extends BookingState {
  final List<BookingEntity> bookings;
  const BookingsLoadedState(this.bookings);

  @override
  List<Object?> get props => [bookings];
}

class BookingOperationSuccessState extends BookingState {
  final String message;
  const BookingOperationSuccessState(this.message);

  @override
  List<Object?> get props => [message];
}

class BookingErrorState extends BookingState {
  final String errorMessage;
  const BookingErrorState(this.errorMessage);

  @override
  List<Object?> get props => [errorMessage];
}
