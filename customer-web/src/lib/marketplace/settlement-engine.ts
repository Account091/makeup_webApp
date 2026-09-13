import { 
  Settlement, 
  SettlementItem, 
  SettlementPeriod, 
  SettlementStatusV83 
} from "./marketplace-types";
import { calculateSettlementEligibility } from "./settlement-eligibility-engine";

const settlementPeriodsStore: SettlementPeriod[] = [
  {
    periodId: "period-2026-09-w1",
    name: "Sep 1 – Sep 7, 2026",
    cadence: "WEEKLY",
    periodStart: "2026-09-01T00:00:00Z",
    periodEnd: "2026-09-07T23:59:59Z",
    timezone: "Asia/Kolkata"
  },
  {
    periodId: "period-2026-09-w2",
    name: "Sep 8 – Sep 14, 2026",
    cadence: "WEEKLY",
    periodStart: "2026-09-08T00:00:00Z",
    periodEnd: "2026-09-14T23:59:59Z",
    timezone: "Asia/Kolkata"
  }
];

const settlementsStore: Settlement[] = [
  {
    settlementId: "stl-jaipur-001",
    organizationId: "org-jaipur-royal-glam",
    artistId: "artist-101",
    periodId: "period-2026-09-w1",
    grossEarnings: 43000,
    adjustments: 0,
    holds: 0,
    eligibleAmount: 36080,
    payoutAmount: 36080,
    currency: "INR",
    status: "PAID",
    preparedByUid: "acct-01",
    approvedByUid: "owner-01",
    payoutReference: "UTR9876543210",
    paidAt: "2026-09-08T10:00:00Z",
    createdAt: "2026-09-07T18:00:00Z",
    updatedAt: "2026-09-08T10:00:00Z"
  }
];

const settlementItemsStore: SettlementItem[] = [
  {
    itemId: "stli-001",
    settlementId: "stl-jaipur-001",
    artistEarningsTransactionId: "earn-tx-001",
    bookingId: "bk-jaipur-001",
    grossAmount: 25000,
    artistShare: 20240,
    adjustment: 0,
    eligibleAmount: 20240
  },
  {
    itemId: "stli-002",
    settlementId: "stl-jaipur-001",
    artistEarningsTransactionId: "earn-tx-002",
    bookingId: "bk-jaipur-002",
    grossAmount: 18000,
    artistShare: 15840,
    adjustment: 0,
    eligibleAmount: 15840
  }
];

export function getSettlementPeriods(): SettlementPeriod[] {
  return settlementPeriodsStore;
}

export function getSettlementsStore(filter?: { organizationId?: string; artistId?: string; status?: SettlementStatusV83 }): Settlement[] {
  return settlementsStore.filter(s => {
    if (filter?.organizationId && s.organizationId !== filter.organizationId) return false;
    if (filter?.artistId && s.artistId !== filter.artistId) return false;
    if (filter?.status && s.status !== filter.status) return false;
    return true;
  });
}

export function getSettlementItemsStore(settlementId?: string): SettlementItem[] {
  if (settlementId) {
    return settlementItemsStore.filter(item => item.settlementId === settlementId);
  }
  return settlementItemsStore;
}

/**
 * Creates an authoritative Settlement Batch with SettlementItems linking back to Booking & Commission ledgers.
 */
export function createSettlementBatch(payload: {
  organizationId: string;
  artistId: string;
  periodId: string;
  preparedByUid: string;
}): { settlement: Settlement; items: SettlementItem[] } {
  const eligibility = calculateSettlementEligibility({
    artistId: payload.artistId,
    organizationId: payload.organizationId
  });

  if (eligibility.eligibleAmount <= 0) {
    throw new Error(`Cannot create settlement batch: Ineligible amount (₹${eligibility.eligibleAmount}). Reasons: ${eligibility.rejectionReasons.join(", ")}`);
  }

  const settlementId = `stl_${payload.organizationId}_${Date.now()}`;
  const now = new Date().toISOString();

  const items: SettlementItem[] = eligibility.qualifyingTransactions.map((tx, idx) => ({
    itemId: `stli_${settlementId}_${idx + 1}`,
    settlementId,
    artistEarningsTransactionId: tx.id,
    bookingId: tx.bookingId,
    grossAmount: tx.grossAmount,
    artistShare: tx.netArtistShare,
    adjustment: 0,
    eligibleAmount: tx.netArtistShare
  }));

  const settlement: Settlement = {
    settlementId,
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    periodId: payload.periodId,
    grossEarnings: eligibility.grossEarnings,
    adjustments: 0,
    holds: eligibility.holdsTotal,
    eligibleAmount: eligibility.eligibleAmount,
    payoutAmount: eligibility.eligibleAmount,
    currency: "INR",
    status: "READY",
    preparedByUid: payload.preparedByUid,
    createdAt: now,
    updatedAt: now
  };

  settlementsStore.push(settlement);
  settlementItemsStore.push(...items);

  return { settlement, items };
}

/**
 * Approves a READY settlement using Dual Control checks.
 * PreparedBy user and ApprovedBy user MUST be different.
 */
export function approveSettlement(payload: {
  settlementId: string;
  approvedByUid: string;
}): Settlement {
  const settlement = settlementsStore.find(s => s.settlementId === payload.settlementId);
  if (!settlement) {
    throw new Error(`Settlement '${payload.settlementId}' not found.`);
  }

  if (settlement.status !== "READY") {
    throw new Error(`Cannot approve settlement '${payload.settlementId}': Current status is '${settlement.status}', expected 'READY'.`);
  }

  // Dual Control Verification
  if (settlement.preparedByUid && settlement.preparedByUid === payload.approvedByUid) {
    throw new Error(`Dual Control Violation: User '${payload.approvedByUid}' who prepared the settlement cannot also approve it.`);
  }

  settlement.status = "APPROVED";
  settlement.approvedByUid = payload.approvedByUid;
  settlement.updatedAt = new Date().toISOString();

  return settlement;
}

/**
 * Generates an auditable Settlement Statement Markdown document.
 */
export function generateSettlementStatementMarkdown(settlementId: string): string {
  const settlement = settlementsStore.find(s => s.settlementId === settlementId);
  if (!settlement) throw new Error(`Settlement '${settlementId}' not found.`);

  const items = settlementItemsStore.filter(i => i.settlementId === settlementId);

  return `
# Official Settlement Statement: ${settlement.settlementId}

**Organization:** ${settlement.organizationId}  
**Artist ID:** ${settlement.artistId}  
**Period:** ${settlement.periodId}  
**Status:** ${settlement.status}  
**Date:** ${new Date(settlement.createdAt).toLocaleDateString()}  

---

### Financial Summary
- **Gross Customer Earnings:** ₹${settlement.grossEarnings.toLocaleString()}
- **Dispute / Risk Holds:** -₹${settlement.holds.toLocaleString()}
- **Net Eligible Payout:** ₹${settlement.eligibleAmount.toLocaleString()}
- **Payout Reference:** ${settlement.payoutReference || 'Pending Transfer'}

---

### Itemized Booking Ledger Breakdown
| Item ID | Booking ID | Gross Booking | Artist Share | Net Eligible |
|---|---|---|---|---|
${items.map(item => `| ${item.itemId} | ${item.bookingId} | ₹${item.grossAmount.toLocaleString()} | ₹${item.artistShare.toLocaleString()} | ₹${item.eligibleAmount.toLocaleString()} |`).join('\n')}

---
*Authorized by dual-control compliance engine. Prepared by Uid: ${settlement.preparedByUid || 'System'}, Approved by Uid: ${settlement.approvedByUid || 'Pending'}.*
`;
}
