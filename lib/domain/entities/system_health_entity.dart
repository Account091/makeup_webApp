class SystemHealthStatus {
  final String overallStatus; // HEALTHY, DEGRADED, CRITICAL
  final double healthScorePercent;
  final Map<String, String> componentStatuses; // Firestore, CloudFunctions, Payments, WhatsApp, NextJS, FCM, Storage, AI, Marketplace
  final int activeAlertsCount;
  final DateTime timestamp;

  const SystemHealthStatus({
    required this.overallStatus,
    required this.healthScorePercent,
    required this.componentStatuses,
    required this.activeAlertsCount,
    required this.timestamp,
  });
}

class SystemTraceLog {
  final String requestId;
  final String actorId;
  final String action;
  final int statusCode;
  final int latencyMs;
  final List<String> serviceLogs;
  final DateTime timestamp;

  const SystemTraceLog({
    required this.requestId,
    required this.actorId,
    required this.action,
    required this.statusCode,
    required this.latencyMs,
    required this.serviceLogs,
    required this.timestamp,
  });
}

class RiskAssessment {
  final String assessmentId;
  final String orgId;
  final String transactionId;
  final double riskScore; // 0.0 to 100.0
  final List<String> riskFactors;
  final String verdict; // LOW_RISK, FLAGGED, BLOCKED
  final DateTime timestamp;

  const RiskAssessment({
    required this.assessmentId,
    required this.orgId,
    required this.transactionId,
    required this.riskScore,
    required this.riskFactors,
    required this.verdict,
    required this.timestamp,
  });
}

class PrivacyRequest {
  final String requestId;
  final String customerId;
  final String customerEmail;
  final String requestType; // DATA_EXPORT, ACCOUNT_DELETION
  final String status; // PENDING, PROCESSING, COMPLETED
  final DateTime createdAt;

  const PrivacyRequest({
    required this.requestId,
    required this.customerId,
    required this.customerEmail,
    required this.requestType,
    required this.status,
    required this.createdAt,
  });
}
