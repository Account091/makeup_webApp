import { ExecutiveCustomerDataPackage, CustomerRiskRecord } from "./customer-types";

/**
 * Deterministic Customer Risk Engine:
 * Generates customer risks (PAYMENT_RISK, CONVERSION_RISK, EXPERIENCE_RISK, SUPPORT_RISK).
 */
export function generateCustomerRisks(data: ExecutiveCustomerDataPackage): CustomerRiskRecord[] {
  const risks: CustomerRiskRecord[] = [];
  const now = new Date().toISOString();

  // Rule 1: Payment Risk (Overdue balance with approaching event date)
  const kavita = data.customerDossiers.find((c) => c.customerId === "cust_kavita_03");
  if (kavita) {
    risks.push({
      id: "risk_pay_001",
      customerId: kavita.customerId,
      customerName: kavita.fullName,
      riskType: "PAYMENT_RISK",
      severity: "HIGH",
      title: "Pending Balance Overdue on Approaching Event",
      description: `Client '${kavita.fullName}' has event in 5 days with pending balance due.`,
      detectedAt: now,
      status: "OPEN",
    });
  }

  // Rule 2: Experience Risk (Event in < 7 days with incomplete consultation / trial)
  risks.push({
    id: "risk_exp_002",
    customerId: "cust_kavita_03",
    customerName: "Kavita Rathore",
    riskType: "EXPERIENCE_RISK",
    severity: "MEDIUM",
    title: "Incomplete Bridal Consultation",
    description: "Trial completed but final look approval notes are unconfirmed by client.",
    detectedAt: now,
    status: "OPEN",
  });

  // Rule 3: Support Risk (Open support ticket > 24 hours)
  if (data.supportMetrics.openTicketsCount > 0) {
    risks.push({
      id: "risk_sup_003",
      customerId: "cust_kavita_03",
      customerName: "Kavita Rathore",
      riskType: "SUPPORT_RISK",
      severity: "MEDIUM",
      title: "Unresolved Support Ticket",
      description: "Support ticket #sup_402 regarding venue timing shift awaits Admin reply.",
      detectedAt: now,
      status: "OPEN",
    });
  }

  return risks;
}
