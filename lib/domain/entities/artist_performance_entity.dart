class ArtistPerformanceScorecard {
  final String artistId;
  final String artistName;
  final double averageRating; // 4.95
  final double checklistCompletionPercent; // 99.2%
  final double punctualityPercent; // 98.5%
  final int totalAppointmentsCompleted;
  final double clientRetentionPercent;
  final String performanceGrade; // PLATINUM, GOLD, SILVER

  const ArtistPerformanceScorecard({
    required this.artistId,
    required this.artistName,
    required this.averageRating,
    required this.checklistCompletionPercent,
    required this.punctualityPercent,
    required this.totalAppointmentsCompleted,
    required this.clientRetentionPercent,
    required this.performanceGrade,
  });
}
