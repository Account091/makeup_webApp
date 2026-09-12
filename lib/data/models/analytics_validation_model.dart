import '../../domain/entities/analytics_validation_entity.dart';

class DataHealthReportModel extends DataHealthReport {
  const DataHealthReportModel({
    required super.healthScorePercent,
    required super.totalRecordsEvaluated,
    required super.anomaliesFoundCount,
    required super.freshnessTimestamp,
    required super.anomalies,
    required super.metricTypeLabels,
  });

  factory DataHealthReportModel.fromJson(Map<String, dynamic> json) {
    return DataHealthReportModel(
      healthScorePercent: (json['healthScorePercent'] as num?)?.toDouble() ?? 100.0,
      totalRecordsEvaluated: json['totalRecordsEvaluated'] as int? ?? 0,
      anomaliesFoundCount: json['anomaliesFoundCount'] as int? ?? 0,
      freshnessTimestamp: json['freshnessTimestamp'] as String? ?? '',
      anomalies: (json['anomalies'] as List<dynamic>?)
              ?.map((e) => DataAnomalyModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      metricTypeLabels: (json['metricTypeLabels'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v.toString())) ??
          {
            'actual': 'Actual Measured Data',
            'projected': 'Projected Trend',
            'forecast': 'Moving Average Forecast',
            'estimated': 'Estimated Multiplier',
          },
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'healthScorePercent': healthScorePercent,
      'totalRecordsEvaluated': totalRecordsEvaluated,
      'anomaliesFoundCount': anomaliesFoundCount,
      'freshnessTimestamp': freshnessTimestamp,
      'anomalies': anomalies.map((e) => (e as DataAnomalyModel).toJson()).toList(),
      'metricTypeLabels': metricTypeLabels,
    };
  }
}

class DataAnomalyModel extends DataAnomaly {
  const DataAnomalyModel({
    required super.collectionName,
    required super.documentId,
    required super.anomalyType,
    required super.description,
    required super.severity,
  });

  factory DataAnomalyModel.fromJson(Map<String, dynamic> json) {
    return DataAnomalyModel(
      collectionName: json['collectionName'] as String? ?? '',
      documentId: json['documentId'] as String? ?? '',
      anomalyType: json['anomalyType'] as String? ?? 'GENERAL',
      description: json['description'] as String? ?? '',
      severity: json['severity'] as String? ?? 'WARNING',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'collectionName': collectionName,
      'documentId': documentId,
      'anomalyType': anomalyType,
      'description': description,
      'severity': severity,
    };
  }
}
