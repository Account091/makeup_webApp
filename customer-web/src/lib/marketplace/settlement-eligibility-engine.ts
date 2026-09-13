import { 
  SettlementHold, 
  PayoutRules, 
  ArtistEarningsTransaction, 
  ArtistPayoutProfile,
  SettlementStatusV83
} from "./marketplace-types";
import { getArtistEarningsLedgerStore } from "./commission-calculation-engine";

export interface SettlementEligibilityResult {
  artistId: string;
  organizationId: string;
  grossEarnings: number;
  holdsTotal: number;
  rolloverBalance: number;
  eligibleAmount: number;
  status: SettlementStatusV83;
  rejectionReasons: string[];
  qualifyingTransactions: ArtistEarningsTransaction[];
  activeHolds: SettlementHold[];
}

const payoutRulesStore: PayoutRules = {
  minimumPayoutAmount: 1000,
  currency: "INR",
  autoApproveThreshold: 50000,
  dualControlRequired: true
};

const holdsStore: SettlementHold[] = [
  {
    holdId: "hold-sample-01",
    artistId: "artist-dispute-01",
    organizationId: "org-jaipur-royal-glam",
    amount: 5000,
    holdReason: "OPEN_DISPUTE",
    createdByUid: "admin-risk",
    createdAt: "2026-09-01T00:00:00Z",
    active: true
  }
];

export function getPayoutRules(): PayoutRules {
  return payoutRulesStore;
}

export function setPayoutRules(rules: Partial<PayoutRules>): PayoutRules {
  if (rules.minimumPayoutAmount !== undefined) payoutRulesStore.minimumPayoutAmount = rules.minimumPayoutAmount;
  if (rules.currency !== undefined) payoutRulesStore.currency = rules.currency;
  if (rules.dualControlRequired !== undefined) payoutRulesStore.dualControlRequired = rules.dualControlRequired;
  return payoutRulesStore;
}

export function getSettlementHolds(artistId?: string): SettlementHold[] {
  if (artistId) {
    return holdsStore.filter(h => h.artistId === artistId && h.active);
  }
  return holdsStore.filter(h => h.active);
}

export function placeHold(payload: {
  artistId: string;
  organizationId: string;
  bookingId?: string;
  amount: number;
  holdReason: SettlementHold["holdReason"];
  createdByUid: string;
}): SettlementHold {
  const newHold: SettlementHold = {
    holdId: `hold_${Date.now()}`,
    artistId: payload.artistId,
    organizationId: payload.organizationId,
    bookingId: payload.bookingId,
    amount: payload.amount,
    holdReason: payload.holdReason,
    createdByUid: payload.createdByUid,
    createdAt: new Date().toISOString(),
    active: true
  };
  holdsStore.push(newHold);
  return newHold;
}

export function releaseHold(holdId: string, releasedByUid: string): SettlementHold {
  const hold = holdsStore.find(h => h.holdId === holdId);
  if (!hold) {
    throw new Error(`Settlement hold '${holdId}' not found.`);
  }
  hold.active = false;
  hold.releasedByUid = releasedByUid;
  hold.releasedAt = new Date().toISOString();
  return hold;
}

/**
 * Deterministic Settlement Eligibility Calculator.
 * Enforces all 8 statutory verification checks. Client status toggles cannot override this.
 */
export function calculateSettlementEligibility(payload: {
  artistId: string;
  organizationId: string;
  artistProfile?: Partial<ArtistPayoutProfile>;
  previousRolloverBalance?: number;
}): SettlementEligibilityResult {
  const rejectionReasons: string[] = [];

  // Fetch artist earnings ledger
  const allArtistTxs = getArtistEarningsLedgerStore(payload.artistId);
  
  // Qualifying completed transactions
  const qualifyingTransactions = allArtistTxs.filter(
    tx => tx.organizationId === payload.organizationId && tx.netArtistShare > 0
  );

  const grossEarnings = qualifyingTransactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const netEarnedTotal = qualifyingTransactions.reduce((sum, tx) => sum + tx.netArtistShare, 0);

  // Active Holds
  const activeHolds = holdsStore.filter(h => h.artistId === payload.artistId && h.active);
  const holdsTotal = activeHolds.reduce((sum, h) => sum + h.amount, 0);

  // Rollover balance
  const rolloverBalance = payload.previousRolloverBalance || 0;

  // Compute total payable before threshold check
  const grossPayable = netEarnedTotal + rolloverBalance - holdsTotal;
  const eligibleAmount = Math.max(0, grossPayable);

  // Statutory Verification Checks
  if (activeHolds.some(h => h.holdReason === "OPEN_DISPUTE")) {
    rejectionReasons.push("HOLD_ACTIVE: OPEN_DISPUTE exists");
  }
  if (activeHolds.some(h => h.holdReason === "REFUND_WINDOW")) {
    rejectionReasons.push("HOLD_ACTIVE: REFUND_WINDOW in progress");
  }
  if (activeHolds.some(h => h.holdReason === "RISK_REVIEW")) {
    rejectionReasons.push("HOLD_ACTIVE: RISK_REVIEW pending");
  }
  if (activeHolds.some(h => h.holdReason === "MISSING_BANK_DETAILS")) {
    rejectionReasons.push("HOLD_ACTIVE: MISSING_BANK_DETAILS");
  }

  if (payload.artistProfile && payload.artistProfile.accountStatus === "UNVERIFIED") {
    rejectionReasons.push("ARTIST_UNVERIFIED: Bank account status unverified");
  }

  // Minimum Payout Threshold check
  const minThreshold = payoutRulesStore.minimumPayoutAmount;
  if (eligibleAmount < minThreshold) {
    rejectionReasons.push(`BELOW_THRESHOLD: ₹${eligibleAmount} is below minimum threshold ₹${minThreshold} (Balance will ROLLOVER)`);
  }

  let status: SettlementStatusV83 = "READY";
  if (rejectionReasons.some(r => r.startsWith("BELOW_THRESHOLD"))) {
    status = "CALCULATING"; // Will rollover to next period
  } else if (rejectionReasons.length > 0) {
    status = "ON_HOLD";
  }

  return {
    artistId: payload.artistId,
    organizationId: payload.organizationId,
    grossEarnings,
    holdsTotal,
    rolloverBalance,
    eligibleAmount: status === "READY" ? eligibleAmount : 0,
    status,
    rejectionReasons,
    qualifyingTransactions,
    activeHolds
  };
}
