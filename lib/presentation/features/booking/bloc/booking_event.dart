import 'package:equatable/equatable.dart';
import '../../../../domain/entities/booking_entity.dart';

abstract class BookingEvent extends Equatable {
  const BookingEvent();

  @override
  List<Object?> get props => [];
}

class FetchBookingsEvent extends BookingEvent {}

class SubmitBookingInquiryEvent extends BookingEvent {
  final BookingEntity booking;
  const SubmitBookingInquiryEvent(this.booking);

  @override
  List<Object?> get props => [booking];
}
