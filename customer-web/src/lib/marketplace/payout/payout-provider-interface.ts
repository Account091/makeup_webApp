import { Payout, PayoutStatus } from "../marketplace-types";

export interface PayoutCreationRequest {
  settlementId: string;
  organizationId: string;
  artistId: string;
  amount: number;
  currency: string;
  payoutMethod: string;
  idempotencyKey: string;
  payoutReference?: string;
  processedByUid?: string;
}

export interface PayoutResult {
  payoutId: string;
  providerPayoutId: string;
  status: PayoutStatus;
  payoutReference?: string;
  processedAt?: string;
  failureReason?: string;
}

export interface PayoutProvider {
  getProviderId(): string;
  createPayout(request: PayoutCreationRequest): Promise<PayoutResult>;
  getPayoutStatus(providerPayoutId: string): Promise<PayoutResult>;
  cancelPayout(providerPayoutId: string, reason: string): Promise<PayoutResult>;
}
