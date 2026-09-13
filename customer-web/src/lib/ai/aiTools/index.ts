import { AiAuthContext, AiToolDefinition } from "../types";
import { getCustomerProfileTool } from "./getCustomerProfile";
import { getBookingTool } from "./getBooking";
import { getServicesTool } from "./getServices";
import { getAnalyticsTool } from "./getAnalytics";
import { getTodayBookingsTool } from "./getTodayBookings";
import { getPendingPaymentVerificationsTool } from "./getPendingPaymentVerifications";
import { getLeadFollowupsTool } from "./getLeadFollowups";
import { getCustomerSummaryTool } from "./getCustomerSummary";
import { getUpcomingEventsTool } from "./getUpcomingEvents";
import { getCalendarAvailabilityTool } from "./getCalendarAvailability";
import { getOutstandingBalancesTool } from "./getOutstandingBalances";
import { getRecentSupportTicketsTool } from "./getRecentSupportTickets";
import { getServicePerformanceTool } from "./getServicePerformance";
import { getMarketingPerformanceTool } from "./getMarketingPerformance";
import { getRevenueSummaryTool } from "./getRevenueSummary";
import { getOperationalRisksTool } from "./getOperationalRisks";

import { AiToolAuthorizationError } from "../ai-errors";

export const aiToolRegistry: Record<string, AiToolDefinition> = {
  getCustomerProfile: getCustomerProfileTool,
  getBooking: getBookingTool,
  getServices: getServicesTool,
  getAnalytics: getAnalyticsTool,
  getTodayBookings: getTodayBookingsTool,
  getPendingPaymentVerifications: getPendingPaymentVerificationsTool,
  getLeadFollowups: getLeadFollowupsTool,
  getCustomerSummary: getCustomerSummaryTool,
  getUpcomingEvents: getUpcomingEventsTool,
  getCalendarAvailability: getCalendarAvailabilityTool,
  getOutstandingBalances: getOutstandingBalancesTool,
  getRecentSupportTickets: getRecentSupportTicketsTool,
  getServicePerformance: getServicePerformanceTool,
  getMarketingPerformance: getMarketingPerformanceTool,
  getRevenueSummary: getRevenueSummaryTool,
  getOperationalRisks: getOperationalRisksTool,
};

export async function executeAuthorizedTool(
  toolName: string,
  auth: AiAuthContext,
  args?: any
): Promise<any> {
  const tool = aiToolRegistry[toolName];
  if (!tool) {
    throw new Error(`Tool '${toolName}' is not registered in AI Tool Registry.`);
  }

  // 1. Role Check
  if (!tool.requiredRole.includes(auth.role)) {
    throw new AiToolAuthorizationError(
      `Role '${auth.role}' is not authorized to execute AI tool '${toolName}'. Required: ${tool.requiredRole.join(", ")}`
    );
  }

  // 2. Functional Authorization Check
  const authorized = await tool.authorization(auth, args);
  if (!authorized) {
    throw new AiToolAuthorizationError(`Access denied for tool '${toolName}' execution under specified scope.`);
  }

  // 3. Execution (READ ONLY)
  return await tool.execute(auth, args);
}
