import {
  CommissionTransaction,
  ArtistEarningsTransaction,
  CommissionTransactionType,
} from "./marketplace-types";
import { resolveActiveCommissionRule } from "./commission-rule-engine";

const commissionLedger: CommissionTransaction[] = [
  {
    id: "tx_comm_v82_01",
    bookingId: "bk_sample_01",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmount: 25000,
    discountAmount: 2000,
    taxAmount: 0,
    commissionBase: 23000,
    platformCommission: 2300, // 10% of 23,000
    gatewayFee: 460,         // 2% of 23,000
    artistShare: 20240,      // 88% of 23,000
    currency: "INR",
    ruleId: "rule_standard_v1",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "commission_bk_sample_01_EARNED",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "tx_comm_v82_02",
    bookingId: "bk_sample_02",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmount: 45000,
    discountAmount: 3000,
    taxAmount: 0,
    commissionBase: 42000,
    platformCommission: 4200,
    gatewayFee: 840,
    artistShare: 36960,
    currency: "INR",
    ruleId: "rule_standard_v1",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "commission_bk_sample_02_EARNED",
    createdAt: "2026-09-05T14:30:00.000Z",
  },
  {
    id: "tx_comm_v82_03",
    bookingId: "bk_sample_03",
    organizationId: "jaipur-royal-glam",
    artistId: "artist_ananya",
    grossAmount: 50000,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: 50000,
    platformCommission: 4000, // 8% Jaipur premium rule
    gatewayFee: 1000,        // 2%
    artistShare: 45000,       // 90%
    currency: "INR",
    ruleId: "rule_jaipur_premium_v1",
    ruleVersion: 1,
    transactionType: "EARNED",
    idempotencyKey: "commission_bk_sample_03_EARNED",
    createdAt: "2026-09-08T11:15:00.000Z",
  },
];

const artistEarningsLedger: ArtistEarningsTransaction[] = [];

/**
 * Authoritative Server-Side Commission Calculation Function.
 * Enforces Idempotency & Pre-Tax Net Base (GROSS_AFTER_DISCOUNT).
 */
export function calculateMarketplaceCommission(payload: {
  bookingId: string;
  organizationId: string;
  artistId: string;
  grossAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  transactionType?: CommissionTransactionType;
  idempotencyKey?: string;
  requestId?: string;
}): CommissionTransaction {
  const type = payload.transactionType || "EARNED";
  const ik = payload.idempotencyKey || `commission_${payload.bookingId}_${type}`;

  // Idempotency Check: Return existing transaction if key matches
  const existing = commissionLedger.find((t) => t.idempotencyKey === ik);
  if (existing) {
    return existing;
  }

  const activeRule = resolveActiveCommissionRule({
    organizationId: payload.organizationId,
  });

  const discount = payload.discountAmount || 0;
  const tax = payload.taxAmount || 0;
  const commissionBase = Math.max(0, payload.grossAmount - discount);

  const platformCommission = Math.round((commissionBase * activeRule.platformPercent) / 100);
  const gatewayFee = Math.round((commissionBase * activeRule.gatewayPercent) / 100);
  const artistShare = commissionBase - platformCommission - gatewayFee;

  const tx: CommissionTransaction = {
    id: `tx_comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingId: payload.bookingId,
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    grossAmount: payload.grossAmount,
    discountAmount: discount,
    taxAmount: tax,
    commissionBase,
    platformCommission,
    gatewayFee,
    artistShare,
    currency: "INR",
    ruleId: activeRule.ruleId,
    ruleVersion: activeRule.version,
    transactionType: type,
    idempotencyKey: ik,
    createdAt: new Date().toISOString(),
    requestId: payload.requestId,
  };

  commissionLedger.push(tx);

  // Write corresponding artist earnings ledger entry
  artistEarningsLedger.push({
    id: `tx_earn_${Date.now()}`,
    bookingId: payload.bookingId,
    commissionTransactionId: tx.id,
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    grossAmount: payload.grossAmount,
    netArtistShare: artistShare,
    type,
    createdAt: new Date().toISOString(),
  });

  return tx;
}

/**
 * Creates an append-only refund reversal transaction without mutating original ledger.
 */
export function recordCommissionRefundReversal(
  parentTransactionId: string,
  refundAmount: number,
  reason: string
): CommissionTransaction {
  const parentTx = commissionLedger.find((t) => t.id === parentTransactionId);
  if (!parentTx) {
    throw new Error(`Parent transaction '${parentTransactionId}' not found.`);
  }

  const activeRule = resolveActiveCommissionRule({ organizationId: parentTx.organizationId });
  const refundBase = Math.min(parentTx.commissionBase, refundAmount);
  const platformReversal = Math.round((refundBase * activeRule.platformPercent) / 100);
  const gatewayReversal = Math.round((refundBase * activeRule.gatewayPercent) / 100);
  const artistReversal = refundBase - platformReversal - gatewayReversal;

  const reversalTx: CommissionTransaction = {
    id: `tx_rev_${Date.now()}`,
    bookingId: parentTx.bookingId,
    organizationId: parentTx.organizationId,
    artistId: parentTx.artistId,
    grossAmount: -refundAmount,
    discountAmount: 0,
    taxAmount: 0,
    commissionBase: -refundBase,
    platformCommission: -platformReversal,
    gatewayFee: -gatewayReversal,
    artistShare: -artistReversal,
    currency: parentTx.currency,
    ruleId: parentTx.ruleId,
    ruleVersion: parentTx.ruleVersion,
    transactionType: "REVERSAL",
    idempotencyKey: `reversal_${parentTransactionId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isReversal: true,
    parentTransactionId,
    overrideReason: reason,
  };

  commissionLedger.push(reversalTx);
  return reversalTx;
}

export function getCommissionLedgerStore(orgId?: string): CommissionTransaction[] {
  if (orgId) {
    return commissionLedger.filter((t) => t.organizationId === orgId);
  }
  return commissionLedger;
}

export function getArtistEarningsLedgerStore(artistId?: string): ArtistEarningsTransaction[] {
  if (artistId) {
    return artistEarningsLedger.filter((e) => e.artistId === artistId);
  }
  return artistEarningsLedger;
}
