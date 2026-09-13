import { 
  calculateSettlementEligibility,
  getPayoutRules,
  setPayoutRules,
  placeHold,
  releaseHold
} from '../src/lib/marketplace/settlement-eligibility-engine';
import { 
  createSettlementBatch, 
  approveSettlement,
  getSettlementPeriods,
  generateSettlementStatementMarkdown 
} from '../src/lib/marketplace/settlement-engine';
import { 
  executeSettlementPayout, 
  getPayoutsStore 
} from '../src/lib/marketplace/payout-engine';
import { 
  reconcileSettlementV83, 
  runGlobalSettlementReconciliation 
} from '../src/lib/marketplace/settlement-reconciliation-engine';
import { 
  ManualPayoutProvider 
} from '../src/lib/marketplace/payout/manual-payout-provider';
import { 
  calculateMarketplaceCommission 
} from '../src/lib/marketplace/commission-calculation-engine';

export async function runV83SettlementsEngineTests() {
  console.log('🧪 Starting V8.3 Settlements & Payouts Engine Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // Seed test earnings ledger
  calculateMarketplaceCommission({
    bookingId: 'bk-v83-001',
    organizationId: 'org-jaipur-royal-glam',
    artistId: 'artist-v83-01',
    grossAmount: 30000,
    discountAmount: 0,
    idempotencyKey: 'idemp_v83_001'
  });

  // 1. Settlement Periods Resolution
  (() => {
    const periods = getSettlementPeriods();
    assert(periods.length >= 2, 'Settlement periods list contains at least 2 default weekly periods');
    assert(periods[0].cadence === 'WEEKLY', 'Period cadence is WEEKLY');
  })();

  // 2. Minimum Payout Threshold & Rollover Balance
  (() => {
    const defaultRules = getPayoutRules();
    assert(defaultRules.minimumPayoutAmount === 1000, 'Default minimum payout threshold is ₹1,000');

    // Test eligibility for artist with no earnings
    const resEmpty = calculateSettlementEligibility({
      artistId: 'artist-empty-00',
      organizationId: 'org-jaipur-royal-glam'
    });
    assert(resEmpty.status === 'CALCULATING', 'Zero earnings status is CALCULATING (Rollover)');

    // Test rollover balance application
    const resRollover = calculateSettlementEligibility({
      artistId: 'artist-v83-01',
      organizationId: 'org-jaipur-royal-glam',
      previousRolloverBalance: 500
    });
    assert(resRollover.eligibleAmount > 20000, 'Eligible amount includes net earnings + previous rollover balance');
  })();

  // 3. Settlement Holds & Statutory Rejections
  (() => {
    const hold = placeHold({
      artistId: 'artist-v83-01',
      organizationId: 'org-jaipur-royal-glam',
      amount: 5000,
      holdReason: 'OPEN_DISPUTE',
      createdByUid: 'risk-admin'
    });
    assert(hold.active === true, 'Settlement hold placed active');

    const resHold = calculateSettlementEligibility({
      artistId: 'artist-v83-01',
      organizationId: 'org-jaipur-royal-glam'
    });
    assert(resHold.status === 'ON_HOLD', 'Active OPEN_DISPUTE hold sets eligibility status to ON_HOLD');
    assert(resHold.rejectionReasons.length > 0, 'Rejection reasons recorded for active hold');

    releaseHold(hold.holdId, 'risk-admin');
    const resReleased = calculateSettlementEligibility({
      artistId: 'artist-v83-01',
      organizationId: 'org-jaipur-royal-glam'
    });
    assert(resReleased.status === 'READY', 'Releasing hold restores status to READY');
  })();

  // 4. Batch Creation & Item Traceability
  let batchSettlementId = '';
  (() => {
    const batch = createSettlementBatch({
      organizationId: 'org-jaipur-royal-glam',
      artistId: 'artist-v83-01',
      periodId: 'period-2026-09-w1',
      preparedByUid: 'accountant-user-01'
    });

    batchSettlementId = batch.settlement.settlementId;
    assert(batch.settlement.status === 'READY', 'Created settlement batch status is READY');
    assert(batch.settlement.preparedByUid === 'accountant-user-01', 'Settlement records preparedByUid');
    assert(batch.items.length > 0, 'Settlement items generated linking to booking ledger');
  })();

  // 5. Dual-Control Approval Enforcement
  (() => {
    // Attempt approving with SAME user who prepared it
    try {
      approveSettlement({ settlementId: batchSettlementId, approvedByUid: 'accountant-user-01' });
      assert(false, 'Should throw error when same user prepares and approves settlement');
    } catch (err: any) {
      assert(err.message.includes('Dual Control Violation'), 'Dual Control violation correctly rejected');
    }

    // Approve with DIFFERENT authorized user
    const approved = approveSettlement({ settlementId: batchSettlementId, approvedByUid: 'finance-owner-02' });
    assert(approved.status === 'APPROVED', 'Settlement approved cleanly with different user');
    assert(approved.approvedByUid === 'finance-owner-02', 'Settlement records approvedByUid');
  })();

  // 6. Provider Abstraction & Manual Payout Provider
  await (async () => {
    const manualProvider = ManualPayoutProvider.getInstance();
    assert(manualProvider.getProviderId() === 'MANUAL_PAYOUT_PROVIDER', 'Manual payout provider ID verified');

    const result = await executeSettlementPayout({
      settlementId: batchSettlementId,
      payoutMethod: 'MANUAL',
      payoutReference: 'UTR1122334455',
      processedByUid: 'finance-owner-02'
    });

    assert(result.payout.status === 'PAID', 'Executed payout status is PAID');
    assert(result.payout.payoutReference === 'UTR1122334455', 'Payout reference matches UTR');
    assert(result.transaction.transactionType === 'PAYOUT', 'Payout transaction type is PAYOUT');
  })();

  // 7. Idempotency Key Enforcement
  await (async () => {
    const retryResult = await executeSettlementPayout({
      settlementId: batchSettlementId,
      payoutMethod: 'MANUAL',
      payoutReference: 'UTR_RETRY_DUPLICATE',
      processedByUid: 'finance-owner-02'
    });

    assert(retryResult.payout.payoutReference === 'UTR1122334455', 'Idempotent retry returned original payout without creating duplicate');
    assert(getPayoutsStore(batchSettlementId).length === 1, 'Exactly 1 payout record exists for settlement');
  })();

  // 8. $0-Discrepancy Reconciliation
  (() => {
    const reconReport = reconcileSettlementV83(batchSettlementId);
    assert(reconReport.reconciled === true, 'Settlement reconciled with 0 discrepancy');
    assert(reconReport.discrepancyAmount === 0, 'Discrepancy amount is strictly 0');

    const globalRecon = runGlobalSettlementReconciliation();
    assert(globalRecon.allReconciled === true, 'Global settlements reconciliation passed ($0 discrepancy)');
  })();

  // 9. Settlement Statement Generation
  (() => {
    const statementMarkdown = generateSettlementStatementMarkdown(batchSettlementId);
    assert(statementMarkdown.includes('Official Settlement Statement'), 'Statement title rendered');
    assert(statementMarkdown.includes('UTR1122334455'), 'Statement contains UTR reference number');
    assert(statementMarkdown.includes('accountant-user-01'), 'Statement contains preparedByUid');
  })();

  console.log(`\n🎉 All ${passed}/${total} V8.3 Settlements & Payouts tests passed successfully!`);
}
