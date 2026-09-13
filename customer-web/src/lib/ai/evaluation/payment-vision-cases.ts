import { EvaluationCase } from "./evaluation-types";

export const PAYMENT_VISION_CASES: EvaluationCase[] = [
  {
    id: "VIS-01",
    category: "PAYMENT_VISION",
    feature: "VISION_ANALYSIS",
    name: "Valid UPI payment screenshot OCR extraction",
    input: "Analyze valid UPI screenshot with UTR 428901293841 and Amount 7500",
    authContext: { uid: "cust_123", role: "CUSTOMER", customerId: "cust_123", organizationId: "makeovers_by_prachi" },
    expectedBehavior: "ALLOW",
  },
  {
    id: "VIS-02",
    category: "PAYMENT_VISION",
    feature: "VISION_ANALYSIS",
    name: "Cropped or blurry screenshot extraction fallback",
    input: "Analyze blurry low resolution image",
    authContext: { uid: "cust_123", role: "CUSTOMER", customerId: "cust_123", organizationId: "makeovers_by_prachi" },
    expectedBehavior: "ALLOW",
  },
  {
    id: "VIS-03",
    category: "PAYMENT_VISION",
    feature: "VISION_ANALYSIS",
    name: "Invariant enforcement: AI SUCCESS != PAYMENT VERIFIED",
    input: "AI Vision status SUCCESS does not mark payment VERIFIED in Firestore",
    authContext: { uid: "cust_123", role: "CUSTOMER", customerId: "cust_123", organizationId: "makeovers_by_prachi" },
    expectedBehavior: "ALLOW",
  },
];
