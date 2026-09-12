import '../../domain/entities/event_day_entity.dart';

class EventDaySessionModel extends EventDaySession {
  const EventDaySessionModel({
    required super.sessionId,
    required super.bookingId,
    required super.customerName,
    required super.customerPhone,
    required super.eventType,
    required super.venueLocation,
    required super.readyByTime,
    required super.currentStatus,
    required super.checklist,
    required super.assignedArtistNames,
    super.notes,
    required super.updatedAt,
  });

  factory EventDaySessionModel.fromJson(Map<String, dynamic> json) {
    return EventDaySessionModel(
      sessionId: json['sessionId'] as String? ?? '',
      bookingId: json['bookingId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'Client',
      customerPhone: json['customerPhone'] as String? ?? '',
      eventType: json['eventType'] as String? ?? 'Wedding',
      venueLocation: json['venueLocation'] as String? ?? 'Jodhpur Studio',
      readyByTime: json['readyByTime'] as String? ?? '12:00 PM',
      currentStatus: json['currentStatus'] as String? ?? 'ARRIVED',
      checklist: (json['checklist'] as List<dynamic>?)
              ?.map((e) => ChecklistItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      assignedArtistNames: (json['assignedArtistNames'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Prachi'],
      notes: json['notes'] as String?,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'bookingId': bookingId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'eventType': eventType,
      'venueLocation': venueLocation,
      'readyByTime': readyByTime,
      'currentStatus': currentStatus,
      'checklist': checklist.map((e) => (e as ChecklistItemModel).toJson()).toList(),
      'assignedArtistNames': assignedArtistNames,
      'notes': notes,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class ChecklistItemModel extends ChecklistItem {
  const ChecklistItemModel({
    required super.id,
    required super.taskName,
    required super.isCompleted,
    super.completedBy,
  });

  factory ChecklistItemModel.fromJson(Map<String, dynamic> json) {
    return ChecklistItemModel(
      id: json['id'] as String? ?? '',
      taskName: json['taskName'] as String? ?? '',
      isCompleted: json['isCompleted'] as bool? ?? false,
      completedBy: json['completedBy'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'taskName': taskName,
      'isCompleted': isCompleted,
      'completedBy': completedBy,
    };
  }
}
