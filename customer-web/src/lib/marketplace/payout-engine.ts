import { 
  Payout, 
  PayoutTransaction, 
  Settlement 
} from "./marketplace-types";
import { getPayoutProvider } from "./payout/payout-router";
import { getSettlementsStore } from "./settlement-engine";

const payoutsStore: Payout[] = [
  {
    payoutId: "po_stl-jaipur-001",
    settlementId: "stl-jaipur-001",
    organizationId: "org-jaipur-royal-glam",
    artistId: "artist-101",
    amount: 36080,
    currency: "INR",
    payoutMethod: "MANUAL",
    providerId: "MANUAL_PAYOUT_PROVIDER",
    idempotencyKey: "settlement_stl-jaipur-001",
    status: "PAID",
    payoutReference: "UTR9876543210",
    processedAt: "2026-09-08T10:00:00Z",
    processedByUid: "owner-01"
  }
];

const payoutTransactionsStore: PayoutTransaction[] = [
  {
    id: "tx_payout_stl-jaipur-001",
    organizationId: "org-jaipur-royal-glam",
    artistId: "artist-101",
    settlementId: "stl-jaipur-001",
    payoutId: "po_stl-jaipur-001",
    amount: 36080,
    currency: "INR",
    transactionType: "PAYOUT",
    status: "PAID",
    payoutReference: "UTR9876543210",
    createdAt: "2026-09-08T10:00:00Z"
  }
];

export function getPayoutsStore(settlementId?: string): Payout[] {
  if (settlementId) {
    return payoutsStore.filter(p => p.settlementId === settlementId);
  }
  return payoutsStore;
}

export function getPayoutTransactionsStore(artistId?: string): PayoutTransaction[] {
  if (artistId) {
    return payoutTransactionsStore.filter(pt => pt.artistId === artistId);
  }
  return payoutTransactionsStore;
}

/**
 * Authoritative Server-Side Payout Execution Engine.
 * Enforces Idempotency Keys (settlement_${settlementId}), Provider Abstraction, and Append-Only Payout Ledgers.
 */
export async function executeSettlementPayout(payload: {
  settlementId: string;
  payoutMethod?: string; // e.g. "MANUAL" or "BANK_TRANSFER"
  payoutReference?: string;
  processedByUid: string;
}): Promise<{ payout: Payout; transaction: PayoutTransaction }> {
  const settlements = getSettlementsStore();
  const settlement = settlements.find(s => s.settlementId === payload.settlementId);

  if (!settlement) {
    throw new Error(`Settlement '${payload.settlementId}' not found.`);
  }

  // Idempotency Protection Check
  const idempotencyKey = `settlement_${payload.settlementId}`;
  const existingPayout = payoutsStore.find(p => p.idempotencyKey === idempotencyKey);
  if (existingPayout) {
    const existingTx = payoutTransactionsStore.find(pt => pt.payoutId === existingPayout.payoutId);
    if (existingTx) {
      return { payout: existingPayout, transaction: existingTx };
    }
  }

  if (settlement.status !== "APPROVED" && settlement.status !== "READY") {
    throw new Error(`Cannot execute payout for settlement '${payload.settlementId}': Status is '${settlement.status}', expected 'APPROVED' or 'READY'.`);
  }

  // Transition Settlement to PROCESSING
  settlement.status = "PROCESSING";
  settlement.updatedAt = new Date().toISOString();

  // Resolve Provider via Payout Router
  const providerKey = payload.payoutMethod || "MANUAL";
  const provider = getPayoutProvider(providerKey);

  // Invoke Provider
  const providerResult = await provider.createPayout({
    settlementId: settlement.settlementId,
    organizationId: settlement.organizationId,
    artistId: settlement.artistId,
    amount: settlement.eligibleAmount,
    currency: settlement.currency,
    payoutMethod: providerKey,
    idempotencyKey,
    payoutReference: payload.payoutReference,
    processedByUid: payload.processedByUid
  });

  // Create Payout Record
  const payout: Payout = {
    payoutId: providerResult.payoutId,
    settlementId: settlement.settlementId,
    organizationId: settlement.organizationId,
    artistId: settlement.artistId,
    amount: settlement.eligibleAmount,
    currency: settlement.currency,
    payoutMethod: (payload.payoutMethod as any) || "MANUAL",
    providerId: provider.getProviderId(),
    idempotencyKey,
    status: providerResult.status,
    payoutReference: providerResult.payoutReference,
    processedAt: providerResult.processedAt,
    processedByUid: payload.processedByUid
  };

  // Update Settlement status to PAID
  settlement.status = "PAID";
  settlement.payoutReference = providerResult.payoutReference;
  settlement.paidAt = providerResult.processedAt;
  settlement.updatedAt = new Date().toISOString();

  // Create Append-Only Payout Transaction
  const transaction: PayoutTransaction = {
    id: `tx_payout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    organizationId: settlement.organizationId,
    artistId: settlement.artistId,
    settlementId: settlement.settlementId,
    payoutId: payout.payoutId,
    amount: settlement.eligibleAmount,
    currency: settlement.currency,
    transactionType: "PAYOUT",
    status: providerResult.status,
    payoutReference: providerResult.payoutReference,
    createdAt: new Date().toISOString()
  };

  payoutsStore.push(payout);
  payoutTransactionsStore.push(transaction);

  return { payout, transaction };
}
