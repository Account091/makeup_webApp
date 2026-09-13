import { ExecutiveBiDataPackage, BusinessAlertItem } from "./bi-types";

/**
 * Deterministic Insight Engine: Evaluates business thresholds and generates structured alerts.
 */
export function generateBusinessAlerts(biData: ExecutiveBiDataPackage): BusinessAlertItem[] {
  const alerts: BusinessAlertItem[] = [];
  const now = new Date().toISOString();

  // Rule 1: Capacity Threshold Check
  if (biData.capacityMetrics.capacityUtilizationPercent > 75.0) {
    alerts.push({
      id: "alt_capacity_001",
      type: "CAPACITY_RISK",
      severity: "HIGH",
      title: "Weekend Capacity Approaching Limit",
      metric: "capacityUtilizationPercent",
      currentValue: biData.capacityMetrics.capacityUtilizationPercent,
      baselineValue: 70.0,
      changePercent: +(biData.capacityMetrics.capacityUtilizationPercent - 70.0).toFixed(1),
      detectedAt: now,
      status: "OPEN",
      message: `Weekend studio capacity is at ${biData.capacityMetrics.capacityUtilizationPercent}%. Peak wedding dates are approaching max safe booking threshold.`,
      recommendedAction: "Review assistant artist assignments to handle non-bridal guest makeup slots.",
    });
  }

  // Rule 2: Overdue Follow-ups in CRM Lead Funnel
  if (biData.crmMetrics.followupsOverdueCount > 0) {
    alerts.push({
      id: "alt_lead_002",
      type: "LEAD_BACKLOG",
      severity: "MEDIUM",
      title: "HOT Bridal Leads Pending Follow-up",
      metric: "followupsOverdueCount",
      currentValue: biData.crmMetrics.followupsOverdueCount,
      baselineValue: 0,
      changePercent: 100,
      detectedAt: now,
      status: "OPEN",
      message: `${biData.crmMetrics.followupsOverdueCount} HOT bridal inquiries have overdue follow-ups (> 24 hours).`,
      recommendedAction: "Trigger WhatsApp Assistant follow-up prompt or assign lead manager.",
    });
  }

  // Rule 3: Low-Stock Inventory Warning
  if (biData.ecommerceMetrics.lowStockProducts.length > 0) {
    const prod = biData.ecommerceMetrics.lowStockProducts[0];
    alerts.push({
      id: "alt_stock_003",
      type: "INVENTORY_RISK",
      severity: "MEDIUM",
      title: "Low Cosmetics Inventory Warning",
      metric: "currentStock",
      currentValue: prod.currentStock,
      baselineValue: prod.minThreshold,
      changePercent: -60.0,
      detectedAt: now,
      status: "OPEN",
      message: `Inventory low for '${prod.name}' (${prod.currentStock} units remaining; threshold ${prod.minThreshold}).`,
      recommendedAction: "Reorder product batch to avoid stockout during upcoming peak wedding season.",
    });
  }

  return alerts;
}
