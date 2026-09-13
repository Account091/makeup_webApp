import { 
  PayoutProvider, 
  PayoutCreationRequest, 
  PayoutResult 
} from "./payout-provider-interface";

export class ManualPayoutProvider implements PayoutProvider {
  private static instance: ManualPayoutProvider;

  public static getInstance(): ManualPayoutProvider {
    if (!ManualPayoutProvider.instance) {
      ManualPayoutProvider.instance = new ManualPayoutProvider();
    }
    return ManualPayoutProvider.instance;
  }

  getProviderId(): string {
    return "MANUAL_PAYOUT_PROVIDER";
  }

  async createPayout(request: PayoutCreationRequest): Promise<PayoutResult> {
    if (!request.payoutReference || request.payoutReference.trim().length === 0) {
      throw new Error("Manual Payout Error: Payout reference/UTR number is required to process manual payouts.");
    }

    const providerPayoutId = `man_po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const processedAt = new Date().toISOString();

    return {
      payoutId: `po_${request.settlementId}`,
      providerPayoutId,
      status: "PAID",
      payoutReference: request.payoutReference,
      processedAt
    };
  }

  async getPayoutStatus(providerPayoutId: string): Promise<PayoutResult> {
    return {
      payoutId: providerPayoutId,
      providerPayoutId,
      status: "PAID",
      processedAt: new Date().toISOString()
    };
  }

  async cancelPayout(providerPayoutId: string, reason: string): Promise<PayoutResult> {
    return {
      payoutId: providerPayoutId,
      providerPayoutId,
      status: "CANCELLED",
      failureReason: reason
    };
  }
}
