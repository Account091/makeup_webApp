class EventDaySession {
  final String sessionId;
  final String bookingId;
  final String customerName;
  final String customerPhone;
  final String eventType; // Sangeet, Mehendi, Haldi, Wedding, Reception
  final String venueLocation;
  final String readyByTime;
  final String currentStatus; // ARRIVED, MAKEUP_STARTED, HAIR_STARTED, DRAPING_STARTED, READY, COMPLETED
  final List<ChecklistItem> checklist;
  final List<String> assignedArtistNames;
  final String? notes;
  final DateTime updatedAt;

  const EventDaySession({
    required this.sessionId,
    required this.bookingId,
    required this.customerName,
    required this.customerPhone,
    required this.eventType,
    required this.venueLocation,
    required this.readyByTime,
    required this.currentStatus,
    required this.checklist,
    required this.assignedArtistNames,
    this.notes,
    required this.updatedAt,
  });
}

class ChecklistItem {
  final String id;
  final String taskName; // Skin prep, Base makeup, Eye makeup, Lips, Hair, Poshak, Final photos
  final bool isCompleted;
  final String? completedBy;

  const ChecklistItem({
    required this.id,
    required this.taskName,
    required this.isCompleted,
    this.completedBy,
  });
}
