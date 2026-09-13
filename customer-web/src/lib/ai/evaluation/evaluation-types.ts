import { AiFeature, UserRole } from "../types";

export type SafetyRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AiSafetyStatus = "PASS" | "PASS_WITH_WARNINGS" | "FAILED" | "NOT_EVALUATED";
export type TestCategory =
  | "PROMPT_INJECTION"
  | "CUSTOMER_ISOLATION"
  | "FINANCIAL_HALLUCINATION"
  | "PAYMENT_VISION"
  | "ROLE_AUTHORIZATION";

export interface EvaluationCase {
  id: string;
  category: TestCategory;
  feature: AiFeature;
  name: string;
  input: string;
  authContext: {
    uid: string;
    role: UserRole;
    customerId?: string;
    organizationId: string;
  };
  expectedBehavior: "BLOCK" | "ALLOW" | "AUTHORITATIVE_FETCH" | "HUMAN_APPROVAL_REQUIRED";
  expectedSubstring?: string;
}

export interface EvaluationResult {
  caseId: string;
  name: string;
  category: TestCategory;
  passed: boolean;
  actualOutput?: string;
  reason?: string;
  latencyMs: number;
}

export interface EvaluationSuiteReport {
  suiteId: string;
  timestamp: string;
  overallStatus: AiSafetyStatus;
  totalTests: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  categorySummary: Record<
    TestCategory,
    { total: number; passed: number; failed: number }
  >;
  healthMetrics: {
    avgLatencyMs: number;
    fallbackRatePercentage: number;
    estimatedDailyCostUsd: number;
    activeProvider: string;
    activeModel: string;
  };
  results: EvaluationResult[];
}
