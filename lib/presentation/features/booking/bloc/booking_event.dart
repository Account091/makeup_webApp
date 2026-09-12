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

class ApproveBookingEvent extends BookingEvent {
  final String bookingId;
  final double quoteAmount;
  final double travelFee;
  final double depositRequired;
  final String? notes;

  const ApproveBookingEvent({
    required this.bookingId,
    required this.quoteAmount,
    required this.travelFee,
    required this.depositRequired,
    this.notes,
  });

  @override
  List<Object?> get props =>
      [bookingId, quoteAmount, travelFee, depositRequired, notes];
}

class DeclineBookingEvent extends BookingEvent {
  final String bookingId;
  final String reason;

  const DeclineBookingEvent({
    required this.bookingId,
    required this.reason,
  });

  @override
  List<Object?> get props => [bookingId, reason];
}
