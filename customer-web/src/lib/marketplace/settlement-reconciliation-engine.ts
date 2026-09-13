import { getSettlementsStore, getSettlementItemsStore } from "./settlement-engine";
import { getPayoutsStore, getPayoutTransactionsStore } from "./payout-engine";
import { getArtistEarningsLedgerStore } from "./commission-calculation-engine";

export interface SettlementReconciliationReportV83 {
  settlementId: string;
  artistId: string;
  organizationId: string;
  earningsLedgerTotal: number;
  settlementItemsTotal: number;
  settlementEligibleTotal: number;
  payoutTotal: number;
  payoutTransactionTotal: number;
  discrepancyAmount: number;
  reconciled: boolean;
}

export function reconcileSettlementV83(settlementId: string): SettlementReconciliationReportV83 {
  const settlements = getSettlementsStore();
  const settlement = settlements.find(s => s.settlementId === settlementId);

  if (!settlement) {
    throw new Error(`Settlement '${settlementId}' not found for reconciliation.`);
  }

  const items = getSettlementItemsStore(settlementId);
  const payouts = getPayoutsStore(settlementId);
  const payoutTxs = getPayoutTransactionsStore(settlement.artistId).filter(pt => pt.settlementId === settlementId);

  const settlementItemsTotal = items.reduce((sum, item) => sum + item.eligibleAmount, 0);
  const payoutTotal = payouts.reduce((sum, p) => sum + p.amount, 0);
  const payoutTransactionTotal = payoutTxs.reduce((sum, pt) => sum + pt.amount, 0);

  // If settlement is PAID, payoutTotal should equal settlement.eligibleAmount
  let discrepancyAmount = Math.abs(settlement.eligibleAmount - settlementItemsTotal);
  if (settlement.status === "PAID") {
    discrepancyAmount += Math.abs(settlement.eligibleAmount - payoutTotal);
    discrepancyAmount += Math.abs(payoutTotal - payoutTransactionTotal);
  }

  const reconciled = discrepancyAmount === 0;

  return {
    settlementId,
    artistId: settlement.artistId,
    organizationId: settlement.organizationId,
    earningsLedgerTotal: settlement.grossEarnings,
    settlementItemsTotal,
    settlementEligibleTotal: settlement.eligibleAmount,
    payoutTotal,
    payoutTransactionTotal,
    discrepancyAmount,
    reconciled
  };
}

export function runGlobalSettlementReconciliation(): {
  totalSettlementsAudited: number;
  totalDiscrepancyAmount: number;
  allReconciled: boolean;
  reports: SettlementReconciliationReportV83[];
} {
  const settlements = getSettlementsStore();
  const reports = settlements.map(s => reconcileSettlementV83(s.settlementId));

  const totalDiscrepancyAmount = reports.reduce((sum, r) => sum + r.discrepancyAmount, 0);
  const allReconciled = reports.every(r => r.reconciled);

  return {
    totalSettlementsAudited: reports.length,
    totalDiscrepancyAmount,
    allReconciled,
    reports
  };
}
