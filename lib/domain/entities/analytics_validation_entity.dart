class DataHealthReport {
  final double healthScorePercent;
  final int totalRecordsEvaluated;
  final int anomaliesFoundCount;
  final String freshnessTimestamp;
  final List<DataAnomaly> anomalies;
  final Map<String, String> metricTypeLabels; // Actual, Projected, Forecast, Estimated

  const DataHealthReport({
    required this.healthScorePercent,
    required this.totalRecordsEvaluated,
    required this.anomaliesFoundCount,
    required this.freshnessTimestamp,
    required this.anomalies,
    required this.metricTypeLabels,
  });
}

class DataAnomaly {
  final String collectionName;
  final String documentId;
  final String anomalyType; // MISSING_FIELDS, DUPLICATE_TRANSACTION, ORPHANED_CUSTOMER, UNMATCHED_PAYMENT, NEGATIVE_INVENTORY, DUPLICATE_LOYALTY
  final String description;
  final String severity; // CRITICAL, WARNING, INFO

  const DataAnomaly({
    required this.collectionName,
    required this.documentId,
    required this.anomalyType,
    required this.description,
    required this.severity,
  });
}
