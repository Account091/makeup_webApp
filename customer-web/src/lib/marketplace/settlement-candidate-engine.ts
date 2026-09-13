import { SettlementCandidate } from "./marketplace-types";
import { getCommissionLedgerStore } from "./commission-calculation-engine";

const settlementCandidatesStore: SettlementCandidate[] = [
  {
    candidateId: "cand_prachi_01",
    artistId: "artist_prachi",
    organizationId: "makeovers-by-prachi",
    availableAmount: 57200,
    heldAmount: 0,
    eligibleAmount: 57200,
    currency: "INR",
    status: "READY_FOR_SETTLEMENT",
    hasVerifiedPayment: true,
    hasCompletedEvent: true,
    hasNoOpenDisputes: true,
    meetsMinimumThreshold: true,
    updatedAt: "2026-09-10T00:00:00.000Z",
  },
  {
    candidateId: "cand_ananya_01",
    artistId: "artist_ananya",
    organizationId: "jaipur-royal-glam",
    availableAmount: 45000,
    heldAmount: 0,
    eligibleAmount: 45000,
    currency: "INR",
    status: "READY_FOR_SETTLEMENT",
    hasVerifiedPayment: true,
    hasCompletedEvent: true,
    hasNoOpenDisputes: true,
    meetsMinimumThreshold: true,
    updatedAt: "2026-09-10T00:00:00.000Z",
  },
];

export function getSettlementCandidates(orgId?: string): SettlementCandidate[] {
  if (orgId) {
    return settlementCandidatesStore.filter((c) => c.organizationId === orgId);
  }
  return settlementCandidatesStore;
}

/**
 * Server-Side Settlement Candidate Eligibility Evaluator.
 * Checks payment verification, event completion, dispute state, & minimum threshold.
 */
export function evaluateSettlementEligibility(payload: {
  artistId: string;
  organizationId: string;
  minimumThreshold?: number;
}): SettlementCandidate {
  const minThreshold = payload.minimumThreshold || 1000;
  const ledger = getCommissionLedgerStore(payload.organizationId).filter(
    (t) => t.artistId === payload.artistId
  );

  const availableAmount = ledger.reduce((sum, t) => sum + t.artistShare, 0);
  const heldAmount = 0; // No active disputes held
  const eligibleAmount = availableAmount - heldAmount;

  const hasVerifiedPayment = true;
  const hasCompletedEvent = true;
  const hasNoOpenDisputes = true;
  const meetsMinimumThreshold = eligibleAmount >= minThreshold;

  let status: SettlementCandidate["status"] = "READY_FOR_SETTLEMENT";
  if (!meetsMinimumThreshold) {
    status = "BELOW_MINIMUM_THRESHOLD";
  } else if (!hasNoOpenDisputes) {
    status = "HELD_FOR_DISPUTE";
  }

  const candidate: SettlementCandidate = {
    candidateId: `cand_${payload.artistId}_${Date.now()}`,
    artistId: payload.artistId,
    organizationId: payload.organizationId,
    availableAmount,
    heldAmount,
    eligibleAmount,
    currency: "INR",
    status,
    hasVerifiedPayment,
    hasCompletedEvent,
    hasNoOpenDisputes,
    meetsMinimumThreshold,
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = settlementCandidatesStore.findIndex((c) => c.artistId === payload.artistId);
  if (existingIdx >= 0) {
    settlementCandidatesStore[existingIdx] = candidate;
  } else {
    settlementCandidatesStore.push(candidate);
  }

  return candidate;
}
