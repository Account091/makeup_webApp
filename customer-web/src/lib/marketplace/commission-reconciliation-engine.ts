import { CommissionReconciliationReport } from "./marketplace-types";
import { getCommissionLedgerStore } from "./commission-calculation-engine";

export function reconcileBookingCommission(bookingId: string): CommissionReconciliationReport {
  const ledger = getCommissionLedgerStore().filter((t) => t.bookingId === bookingId);

  const grossTotal = ledger.reduce((sum, t) => sum + t.grossAmount, 0);
  const discountTotal = ledger.reduce((sum, t) => sum + t.discountAmount, 0);
  const baseTotal = ledger.reduce((sum, t) => sum + t.commissionBase, 0);
  const platformTotal = ledger.reduce((sum, t) => sum + t.platformCommission, 0);
  const gatewayTotal = ledger.reduce((sum, t) => sum + t.gatewayFee, 0);
  const artistTotal = ledger.reduce((sum, t) => sum + t.artistShare, 0);

  // Verification check: CommissionBase = PlatformCommission + GatewayFee + ArtistShare
  const calculatedSum = platformTotal + gatewayTotal + artistTotal;
  const discrepancyAmount = Math.abs(baseTotal - calculatedSum);
  const reconciled = discrepancyAmount === 0;

  return {
    bookingId,
    bookingTotal: grossTotal,
    paymentLedgerTotal: grossTotal - discountTotal,
    commissionBase: baseTotal,
    platformCommission: platformTotal,
    artistShare: artistTotal,
    reconciled,
    discrepancyAmount,
  };
}

export function runGlobalCommissionReconciliation(): {
  totalBookingsReconciled: number;
  totalDiscrepancyAmount: number;
  allReconciled: boolean;
  reports: CommissionReconciliationReport[];
} {
  const ledger = getCommissionLedgerStore();
  const bookingIds = Array.from(new Set(ledger.map((t) => t.bookingId)));

  const reports = bookingIds.map((id) => reconcileBookingCommission(id));
  const totalDiscrepancyAmount = reports.reduce((sum, r) => sum + r.discrepancyAmount, 0);
  const allReconciled = reports.every((r) => r.reconciled);

  return {
    totalBookingsReconciled: reports.length,
    totalDiscrepancyAmount,
    allReconciled,
    reports,
  };
}
