import '../../domain/entities/system_health_entity.dart';

class SystemHealthStatusModel extends SystemHealthStatus {
  const SystemHealthStatusModel({
    required super.overallStatus,
    required super.healthScorePercent,
    required super.componentStatuses,
    required super.activeAlertsCount,
    required super.timestamp,
  });

  factory SystemHealthStatusModel.fromJson(Map<String, dynamic> json) {
    return SystemHealthStatusModel(
      overallStatus: json['overallStatus'] as String? ?? 'HEALTHY',
      healthScorePercent: (json['healthScorePercent'] as num?)?.toDouble() ?? 100.0,
      componentStatuses: (json['componentStatuses'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v.toString())) ??
          {
            'Firestore': 'HEALTHY',
            'CloudFunctions': 'HEALTHY',
            'Payments': 'HEALTHY',
            'WhatsApp': 'HEALTHY',
            'NextJS': 'HEALTHY',
            'FCM': 'HEALTHY',
            'Storage': 'HEALTHY',
            'AI': 'HEALTHY',
            'Marketplace': 'HEALTHY',
          },
      activeAlertsCount: json['activeAlertsCount'] as int? ?? 0,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'overallStatus': overallStatus,
      'healthScorePercent': healthScorePercent,
      'componentStatuses': componentStatuses,
      'activeAlertsCount': activeAlertsCount,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class SystemTraceLogModel extends SystemTraceLog {
  const SystemTraceLogModel({
    required super.requestId,
    required super.actorId,
    required super.action,
    required super.statusCode,
    required super.latencyMs,
    required super.serviceLogs,
    required super.timestamp,
  });

  factory SystemTraceLogModel.fromJson(Map<String, dynamic> json) {
    return SystemTraceLogModel(
      requestId: json['requestId'] as String? ?? '',
      actorId: json['actorId'] as String? ?? 'SYSTEM',
      action: json['action'] as String? ?? '',
      statusCode: json['statusCode'] as int? ?? 200,
      latencyMs: json['latencyMs'] as int? ?? 0,
      serviceLogs: (json['serviceLogs'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'requestId': requestId,
      'actorId': actorId,
      'action': action,
      'statusCode': statusCode,
      'latencyMs': latencyMs,
      'serviceLogs': serviceLogs,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class RiskAssessmentModel extends RiskAssessment {
  const RiskAssessmentModel({
    required super.assessmentId,
    required super.orgId,
    required super.transactionId,
    required super.riskScore,
    required super.riskFactors,
    required super.verdict,
    required super.timestamp,
  });

  factory RiskAssessmentModel.fromJson(Map<String, dynamic> json) {
    return RiskAssessmentModel(
      assessmentId: json['assessmentId'] as String? ?? '',
      orgId: json['orgId'] as String? ?? '',
      transactionId: json['transactionId'] as String? ?? '',
      riskScore: (json['riskScore'] as num?)?.toDouble() ?? 0.0,
      riskFactors: (json['riskFactors'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      verdict: json['verdict'] as String? ?? 'LOW_RISK',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'assessmentId': assessmentId,
      'orgId': orgId,
      'transactionId': transactionId,
      'riskScore': riskScore,
      'riskFactors': riskFactors,
      'verdict': verdict,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class PrivacyRequestModel extends PrivacyRequest {
  const PrivacyRequestModel({
    required super.requestId,
    required super.customerId,
    required super.customerEmail,
    required super.requestType,
    required super.status,
    required super.createdAt,
  });

  factory PrivacyRequestModel.fromJson(Map<String, dynamic> json) {
    return PrivacyRequestModel(
      requestId: json['requestId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      customerEmail: json['customerEmail'] as String? ?? '',
      requestType: json['requestType'] as String? ?? 'DATA_EXPORT',
      status: json['status'] as String? ?? 'PENDING',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'requestId': requestId,
      'customerId': customerId,
      'customerEmail': customerEmail,
      'requestType': requestType,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
