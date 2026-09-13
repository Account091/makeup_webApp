import { AiAuthContext, AiToolDefinition } from "../types";
import { calculateExecutiveBiData } from "../../bi/kpi-engine";
import { validateAnalyticsReconciliation } from "../../bi/bi-reconciliation";

export const getAnalyticsTool: AiToolDefinition = {
  toolName: "getAnalytics",
  description: "Retrieves validated deterministic business intelligence analytics for authorized admin roles",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: { city: "string", dateRange: "string" },
  outputSchema: {
    dataAsOf: "string",
    topKpis: "array",
    reconciliationStatus: "string",
  },

  authorization: async (auth: AiAuthContext): Promise<boolean> => {
    return ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"].includes(auth.role);
  },

  execute: async (args?: any): Promise<any> => {
    const biData = calculateExecutiveBiData({ city: args?.city, dateRange: args?.dateRange });
    const reconciliation = validateAnalyticsReconciliation(biData);

    return {
      dataAsOf: biData.dataAsOf,
      calculationVersion: biData.calculationVersion,
      topKpis: biData.topKpis,
      revenueSummary: biData.revenueMetrics,
      reconciliationStatus: reconciliation.status,
    };
  },
};
