class CustomerExperienceMetrics {
  final double overallCsatScore; // e.g. 4.9 out of 5.0
  final int netPromoterScore; // e.g. +88
  final int totalReviewsEvaluated;
  final Map<String, double> componentRatings; // Makeup, Hair, Draping, Communication, Punctuality
  final Map<String, int> npsDistribution; // Promoters, Passives, Detractors
  final DateTime evaluatedAt;

  const CustomerExperienceMetrics({
    required this.overallCsatScore,
    required this.netPromoterScore,
    required this.totalReviewsEvaluated,
    required this.componentRatings,
    required this.npsDistribution,
    required this.evaluatedAt,
  });
}

class CustomerRiskPrediction {
  final String customerId;
  final String customerName;
  final double repeatProbabilityPercent;
  final String churnRiskLabel; // HIGH_VALUE_LOYAL, LIKELY_REPEAT, AT_RISK, INACTIVE
  final String recommendedAction;

  const CustomerRiskPrediction({
    required this.customerId,
    required this.customerName,
    required this.repeatProbabilityPercent,
    required this.churnRiskLabel,
    required this.recommendedAction,
  });
}
