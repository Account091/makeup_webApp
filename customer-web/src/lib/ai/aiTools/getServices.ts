import { AiAuthContext, AiToolDefinition } from "../types";

export const getServicesTool: AiToolDefinition = {
  toolName: "getServices",
  description: "Retrieves public service catalog, packages, and pricing guides",
  requiredRole: ["CUSTOMER", "ADMIN", "OWNER", "MANAGER", "SUPPORT", "CONTENT_MANAGER", "GUEST"],
  actionType: "READ",
  inputSchema: { category: "string" },
  outputSchema: { services: "array" },

  authorization: async (): Promise<boolean> => true,

  execute: async (): Promise<any> => {
    return {
      services: [
        { id: "bridal-imperial", title: "Imperial Bridal HD Airbrush Package", priceINR: 35000, depositINR: 10500 },
        { id: "royal-bridal", title: "Royal HD Bridal Makeup", priceINR: 25000, depositINR: 7500 },
        { id: "sangeet-reception", title: "Sangeet & Reception Glam", priceINR: 15000, depositINR: 4500 },
        { id: "celebration-party", title: "Celebration & Party Glam", priceINR: 8500, depositINR: 2550 },
      ],
    };
  },
};
