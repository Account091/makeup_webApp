import '../../domain/entities/calendar_slot_entity.dart';


class CalendarSlotModel extends CalendarSlotEntity {
  const CalendarSlotModel({
    required super.date,
    required super.slotType,
    super.startTime,
    super.endTime,
    super.readyByTime,
    super.serviceDurationMinutes,
    super.prepBufferMinutes,
    super.travelBufferMinutes,
    super.location,
    super.distanceKm,
    super.bookingId,
    super.isAvailable,
    super.isBlocked,
    super.isTravelBuffer,
  });

  factory CalendarSlotModel.fromFirestore(Map<String, dynamic> data, String dateKey, DaySlotType slot) {
    return CalendarSlotModel(
      date: dateKey,
      slotType: slot,
      startTime: data['startTime'],
      endTime: data['endTime'],
      readyByTime: data['readyByTime'],
      serviceDurationMinutes: (data['serviceDurationMinutes'] as num?)?.toInt() ?? 180,
      prepBufferMinutes: (data['prepBufferMinutes'] as num?)?.toInt() ?? 60,
      travelBufferMinutes: (data['travelBufferMinutes'] as num?)?.toInt() ?? 60,
      location: data['location'],
      distanceKm: (data['distanceKm'] as num?)?.toDouble() ?? 0.0,
      bookingId: data['bookingId'],
      isAvailable: data['isAvailable'] ?? true,
      isBlocked: data['isBlocked'] ?? false,
      isTravelBuffer: data['isTravelBuffer'] ?? false,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'slotType': slotType.name,
      'startTime': startTime,
      'endTime': endTime,
      'readyByTime': readyByTime,
      'serviceDurationMinutes': serviceDurationMinutes,
      'prepBufferMinutes': prepBufferMinutes,
      'travelBufferMinutes': travelBufferMinutes,
      'location': location,
      'distanceKm': distanceKm,
      'bookingId': bookingId,
      'isAvailable': isAvailable,
      'isBlocked': isBlocked,
      'isTravelBuffer': isTravelBuffer,
    };
  }
}
