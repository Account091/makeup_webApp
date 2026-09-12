import '../../domain/entities/artist_performance_entity.dart';

class ArtistPerformanceScorecardModel extends ArtistPerformanceScorecard {
  const ArtistPerformanceScorecardModel({
    required super.artistId,
    required super.artistName,
    required super.averageRating,
    required super.checklistCompletionPercent,
    required super.punctualityPercent,
    required super.totalAppointmentsCompleted,
    required super.clientRetentionPercent,
    required super.performanceGrade,
  });

  factory ArtistPerformanceScorecardModel.fromJson(Map<String, dynamic> json) {
    return ArtistPerformanceScorecardModel(
      artistId: json['artistId'] as String? ?? '',
      artistName: json['artistName'] as String? ?? 'Staff Artist',
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 4.95,
      checklistCompletionPercent: (json['checklistCompletionPercent'] as num?)?.toDouble() ?? 99.2,
      punctualityPercent: (json['punctualityPercent'] as num?)?.toDouble() ?? 98.5,
      totalAppointmentsCompleted: json['totalAppointmentsCompleted'] as int? ?? 85,
      clientRetentionPercent: (json['clientRetentionPercent'] as num?)?.toDouble() ?? 92.4,
      performanceGrade: json['performanceGrade'] as String? ?? 'PLATINUM',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'artistId': artistId,
      'artistName': artistName,
      'averageRating': averageRating,
      'checklistCompletionPercent': checklistCompletionPercent,
      'punctualityPercent': punctualityPercent,
      'totalAppointmentsCompleted': totalAppointmentsCompleted,
      'clientRetentionPercent': clientRetentionPercent,
      'performanceGrade': performanceGrade,
    };
  }
}
