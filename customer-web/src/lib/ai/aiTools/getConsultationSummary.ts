import { AiAuthContext, AiToolDefinition } from "../types";

export const getConsultationSummaryTool: AiToolDefinition = {
  toolName: "getConsultationSummary",
  description: "Retrieves pre-bridal skincare prep guidelines and consultation notes.",
  requiredRole: ["CUSTOMER", "GUEST", "ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      prepGuidelines: { type: "array" },
      notes: { type: "string" },
    },
  },
  authorization: async (auth: AiAuthContext) => true,
  execute: async (auth: AiAuthContext) => {
    return {
      prepGuidelines: [
        "Clean, moisturized face prior to artist arrival",
        "Avoid chemical peels or aggressive facials 48 hours prior",
        "Have reference hair extensions or poshak ready at venue station",
      ],
      skinType: "Combination / Dewy HD Finish requested",
      consultationCompleted: true,
    };
  },
};
