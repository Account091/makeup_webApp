import { AiAuthContext, AiToolDefinition } from "../types";
import { getCustomerProfileTool } from "./getCustomerProfile";
import { getBookingTool } from "./getBooking";
import { getServicesTool } from "./getServices";
import { getAnalyticsTool } from "./getAnalytics";
import { AiToolAuthorizationError } from "../ai-errors";

export const aiToolRegistry: Record<string, AiToolDefinition> = {
  getCustomerProfile: getCustomerProfileTool,
  getBooking: getBookingTool,
  getServices: getServicesTool,
  getAnalytics: getAnalyticsTool,
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
