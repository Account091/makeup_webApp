class ProductionCertificationReport {
  final String certificationId;
  final bool isCertified;
  final String readinessStatusLabel;
  final double overallPassRatePercent;
  final Map<String, String> productionReadiness; // codeQuality, security, firebase, payments, whatsapp, hosting, backups, disasterRecovery, observability, multiTenantIsolation, aiSafety
  final Map<String, String> categoryResults; // INTEGRATION_TESTS, SECURITY_TESTS, LOAD_TESTS, DISASTER_RECOVERY, SMOKE_TESTS
  final List<CertificationTestCase> testSuites;
  final DateTime certifiedAt;

  const ProductionCertificationReport({
    required this.certificationId,
    required this.isCertified,
    required this.readinessStatusLabel,
    required this.overallPassRatePercent,
    required this.productionReadiness,
    required this.categoryResults,
    required this.testSuites,
    required this.certifiedAt,
  });
}

class CertificationTestCase {
  final String caseId;
  final String category;
  final String name;
  final String status; // PASSED, FAILED, SKIPPED, NOT_VERIFIED
  final String verificationLevel; // AUTOMATED, INTEGRATION, EXTERNAL_SANDBOX, PRODUCTION_LIVE
  final int executionTimeMs;
  final String details;

  const CertificationTestCase({
    required this.caseId,
    required this.category,
    required this.name,
    required this.status,
    required this.verificationLevel,
    required this.executionTimeMs,
    required this.details,
  });
}

