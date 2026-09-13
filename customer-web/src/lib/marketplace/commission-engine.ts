import {
  CommissionRule,
  CommissionTransaction,
  ArtistSettlement,
  SettlementStatus,
} from "./marketplace-types";

// Configurable platform commission rules
const commissionRules: CommissionRule[] = [
  {
    ruleId: "rule_v1_default",
    category: "STANDARD",
    version: 1,
    platformPercent: 10,
    gatewayPercent: 2,
    artistPercent: 88,
    commissionBaseType: "GROSS_AFTER_DISCOUNT",
    recognitionEvent: "PAYMENT_VERIFIED",
    active: true,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
  },
];

// Append-only ledger storage
const commissionLedger: CommissionTransaction[] = [
  {
    id: "tx_comm_01",
    bookingId: "bk_sample_01",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmount: 25000,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: 25000,
    platformCommission: 2500,
    gatewayFee: 500,
    artistShare: 22000,
    currency: "INR",
    ruleId: "rule_v1_default",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "idemp_tx_01",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "tx_comm_02",
    bookingId: "bk_sample_02",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmount: 45000,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: 45000,
    platformCommission: 4500,
    gatewayFee: 900,
    artistShare: 39600,
    currency: "INR",
    ruleId: "rule_v1_default",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "idemp_tx_02",
    createdAt: "2026-09-05T14:30:00.000Z",
  },
  {
    id: "tx_comm_03",
    bookingId: "bk_sample_03",
    organizationId: "jaipur-royal-glam",
    artistId: "artist_ananya",
    grossAmount: 50000,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: 50000,
    platformCommission: 5000,
    gatewayFee: 1000,
    artistShare: 44000,
    currency: "INR",
    ruleId: "rule_v1_default",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "idemp_tx_03",
    createdAt: "2026-09-08T11:15:00.000Z",
  },
];

const settlements: ArtistSettlement[] = [
  {
    settlementId: "stl_01_prachi",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmountTotal: 70000,
    platformCommissionTotal: 7000,
    gatewayFeeTotal: 1400,
    netArtistShareTotal: 61600,
    status: "PENDING",
    transactionCount: 2,
    periodStart: "2026-09-01T00:00:00.000Z",
    periodEnd: "2026-09-15T00:00:00.000Z",
    createdAt: "2026-09-10T00:00:00.000Z",
  },
];

export function getActiveCommissionRule(): CommissionRule {
  const activeRule = commissionRules.find((r) => r.active);
  if (!activeRule) {
    return {
      ruleId: "rule_fallback",
      category: "STANDARD",
      version: 1,
      platformPercent: 10,
      gatewayPercent: 2,
      artistPercent: 88,
      commissionBaseType: "GROSS_AFTER_DISCOUNT",
      recognitionEvent: "PAYMENT_VERIFIED",
      active: true,
      effectiveFrom: new Date().toISOString(),
    };
  }
  return activeRule;
}

/**
 * Deterministic calculation for gross amount based on active rule version.
 */
export function calculateCommissionBreakdown(grossAmount: number, rule?: CommissionRule): {
  grossAmount: number;
  platformCommission: number;
  gatewayFee: number;
  artistShare: number;
  ruleVersion: number;
} {
  const activeRule = rule || getActiveCommissionRule();
  const platformCommission = Math.round((grossAmount * activeRule.platformPercent) / 100);
  const gatewayFee = Math.round((grossAmount * activeRule.gatewayPercent) / 100);
  const artistShare = grossAmount - platformCommission - gatewayFee;

  return {
    grossAmount,
    platformCommission,
    gatewayFee,
    artistShare,
    ruleVersion: activeRule.version,
  };
}

/**
 * Records an immutable commission transaction in the ledger.
 * NEVER mutates existing records.
 */
export function recordCommissionTransaction(payload: {
  bookingId: string;
  organizationId: string;
  artistId: string;
  grossAmount: number;
}): CommissionTransaction {
  const breakdown = calculateCommissionBreakdown(payload.grossAmount);

  const tx: CommissionTransaction = {
    id: `tx_comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingId: payload.bookingId,
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    grossAmount: breakdown.grossAmount,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: breakdown.grossAmount,
    platformCommission: breakdown.platformCommission,
    gatewayFee: breakdown.gatewayFee,
    artistShare: breakdown.artistShare,
    currency: "INR",
    ruleId: "rule_v1_default",
    ruleVersion: breakdown.ruleVersion,
    transactionType: "EARNED",
    idempotencyKey: `idemp_${payload.bookingId}_EARNED`,
    createdAt: new Date().toISOString(),
  };

  commissionLedger.push(tx);
  return tx;
}

/**
 * Creates an explicit reversal transaction to adjust historical transaction without mutation.
 */
export function recordCommissionReversal(parentTransactionId: string, reason: string): CommissionTransaction {
  const parentTx = commissionLedger.find((t) => t.id === parentTransactionId);
  if (!parentTx) {
    throw new Error(`Parent commission transaction '${parentTransactionId}' not found.`);
  }

  const reversalTx: CommissionTransaction = {
    id: `tx_rev_${Date.now()}`,
    bookingId: parentTx.bookingId,
    organizationId: parentTx.organizationId,
    artistId: parentTx.artistId,
    grossAmount: -parentTx.grossAmount,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: -parentTx.commissionBase,
    platformCommission: -parentTx.platformCommission,
    gatewayFee: -parentTx.gatewayFee,
    artistShare: -parentTx.artistShare,
    currency: parentTx.currency,
    ruleId: parentTx.ruleId,
    ruleVersion: parentTx.ruleVersion,
    transactionType: "REVERSAL",
    idempotencyKey: `reversal_${parentTransactionId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isReversal: true,
    parentTransactionId,
  };

  commissionLedger.push(reversalTx);
  return reversalTx;
}

export function getCommissionLedger(orgId?: string): CommissionTransaction[] {
  if (orgId) {
    return commissionLedger.filter((t) => t.organizationId === orgId);
  }
  return commissionLedger;
}

export function calculateArtistEarnings(orgId: string): {
  grossBookings: number;
  platformFees: number;
  gatewayFees: number;
  netEarnings: number;
  pendingSettlement: number;
  transactionCount: number;
} {
  const orgTxs = commissionLedger.filter((t) => t.organizationId === orgId);

  const grossBookings = orgTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const platformFees = orgTxs.reduce((sum, t) => sum + t.platformCommission, 0);
  const gatewayFees = orgTxs.reduce((sum, t) => sum + t.gatewayFee, 0);
  const netEarnings = orgTxs.reduce((sum, t) => sum + t.artistShare, 0);

  const pendingStls = settlements.filter(
    (s) => s.organizationId === orgId && s.status === "PENDING"
  );
  const pendingSettlement = pendingStls.reduce((sum, s) => sum + s.netArtistShareTotal, 0);

  return {
    grossBookings,
    platformFees,
    gatewayFees,
    netEarnings,
    pendingSettlement,
    transactionCount: orgTxs.length,
  };
}

export function getSettlements(orgId?: string): ArtistSettlement[] {
  if (orgId) {
    return settlements.filter((s) => s.organizationId === orgId);
  }
  return settlements;
}

export function updateSettlementStatus(settlementId: string, newStatus: SettlementStatus): ArtistSettlement {
  const stl = settlements.find((s) => s.settlementId === settlementId);
  if (!stl) {
    throw new Error(`Settlement '${settlementId}' not found.`);
  }

  stl.status = newStatus;
  if (newStatus === "PAID") {
    stl.paidAt = new Date().toISOString();
  }
  return stl;
}
