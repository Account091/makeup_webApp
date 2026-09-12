import 'package:equatable/equatable.dart';

enum DaySlotType { morning, afternoon, evening }

class CalendarSlotEntity extends Equatable {
  final String date; // YYYY-MM-DD
  final DaySlotType slotType;
  final String? startTime; // e.g. "09:00 AM"
  final String? endTime;   // e.g. "01:00 PM"
  final String? readyByTime; // e.g. "12:30 PM"
  final int serviceDurationMinutes;
  final int prepBufferMinutes;
  final int travelBufferMinutes;
  final String? location;
  final double distanceKm;
  final String? bookingId;
  final bool isAvailable;
  final bool isBlocked;
  final bool isTravelBuffer;

  const CalendarSlotEntity({
    required this.date,
    required this.slotType,
    this.startTime,
    this.endTime,
    this.readyByTime,
    this.serviceDurationMinutes = 180,
    this.prepBufferMinutes = 60,
    this.travelBufferMinutes = 60,
    this.location,
    this.distanceKm = 0.0,
    this.bookingId,
    this.isAvailable = true,
    this.isBlocked = false,
    this.isTravelBuffer = false,
  });

  @override
  List<Object?> get props => [
        date,
        slotType,
        startTime,
        endTime,
        readyByTime,
        serviceDurationMinutes,
        prepBufferMinutes,
        travelBufferMinutes,
        location,
        distanceKm,
        bookingId,
        isAvailable,
        isBlocked,
        isTravelBuffer,
      ];
}

class ManualOverrideEntity extends Equatable {
  final String overrideBy;
  final String overrideReason;
  final DateTime overrideAt;
  final int previousCapacity;
  final int newCapacity;

  const ManualOverrideEntity({
    required this.overrideBy,
    required this.overrideReason,
    required this.overrideAt,
    required this.previousCapacity,
    required this.newCapacity,
  });

  @override
  List<Object?> get props => [
        overrideBy,
        overrideReason,
        overrideAt,
        previousCapacity,
        newCapacity,
      ];
}
