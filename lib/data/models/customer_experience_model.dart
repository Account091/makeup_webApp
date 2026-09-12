import '../../domain/entities/customer_experience_entity.dart';

class CustomerExperienceMetricsModel extends CustomerExperienceMetrics {
  const CustomerExperienceMetricsModel({
    required super.overallCsatScore,
    required super.netPromoterScore,
    required super.totalReviewsEvaluated,
    required super.componentRatings,
    required super.npsDistribution,
    required super.evaluatedAt,
  });

  factory CustomerExperienceMetricsModel.fromJson(Map<String, dynamic> json) {
    return CustomerExperienceMetricsModel(
      overallCsatScore: (json['overallCsatScore'] as num?)?.toDouble() ?? 4.9,
      netPromoterScore: json['netPromoterScore'] as int? ?? 88,
      totalReviewsEvaluated: json['totalReviewsEvaluated'] as int? ?? 142,
      componentRatings: (json['componentRatings'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, (v as num).toDouble())) ??
          {
            'Makeup': 4.95,
            'Hair': 4.88,
            'Draping': 4.92,
            'Communication': 4.90,
            'Punctuality': 4.96,
          },
      npsDistribution: (json['npsDistribution'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          {
            'Promoters': 128,
            'Passives': 11,
            'Detractors': 3,
          },
      evaluatedAt: json['evaluatedAt'] != null
          ? DateTime.parse(json['evaluatedAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'overallCsatScore': overallCsatScore,
      'netPromoterScore': netPromoterScore,
      'totalReviewsEvaluated': totalReviewsEvaluated,
      'componentRatings': componentRatings,
      'npsDistribution': npsDistribution,
      'evaluatedAt': evaluatedAt.toIso8601String(),
    };
  }
}
