import { 
  calculateMarketplaceCommission, 
  recordCommissionRefundReversal 
} from '../src/lib/marketplace/commission-calculation-engine';
import { 
  resolveActiveCommissionRule 
} from '../src/lib/marketplace/commission-rule-engine';
import { 
  evaluateSettlementEligibility 
} from '../src/lib/marketplace/settlement-candidate-engine';
import { 
  reconcileBookingCommission,
  runGlobalCommissionReconciliation 
} from '../src/lib/marketplace/commission-reconciliation-engine';

export function runV82CommissionEngineTests() {
  console.log('🧪 Starting V8.2 Commission & Earnings Engine Tests...\n');
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

  // 1. Precedence Rule Resolution
  (() => {
    const resolved = resolveActiveCommissionRule({
      organizationId: 'jaipur-royal-glam',
      serviceId: 'srv-bridal'
    });
    assert(resolved.category === 'ORGANIZATION_SPECIFIC', 'Organization-specific rule overrides standard rule');
    assert(resolved.platformPercent === 8, 'Resolved platform fee is 8% for Jaipur Org');
  })();

  // 2. Authoritative Pre-Tax Net Commission Calculation
  (() => {
    const tx = calculateMarketplaceCommission({
      bookingId: 'bk-test-101',
      organizationId: 'makeovers-by-prachi',
      artistId: 'artist_prachi',
      grossAmount: 25000,
      discountAmount: 2000,
      taxAmount: 3600,
      idempotencyKey: 'idemp_bk_test_101'
    });
    
    assert(tx.commissionBase === 23000, 'Pre-tax net commission base is ₹23,000 (25000 - 2000)');
    assert(tx.platformCommission === 2300, 'Platform commission (10%) is ₹2,300');
    assert(tx.gatewayFee === 460, 'Gateway fee (2%) is ₹460');
    assert(tx.artistShare === 20240, 'Artist net earnings is ₹20,240 (23000 - 2300 - 460)');
    assert(tx.idempotencyKey === 'idemp_bk_test_101', 'Commission Tx contains valid idempotency key');
  })();

  // 3. Refund Reversal (Append-only Reversal Entries)
  (() => {
    const parentTx = calculateMarketplaceCommission({
      bookingId: 'bk-refund-001',
      organizationId: 'makeovers-by-prachi',
      artistId: 'artist_prachi',
      grossAmount: 10000,
      discountAmount: 0,
      idempotencyKey: 'idemp_bk_refund_001'
    });

    const reversalTx = recordCommissionRefundReversal(
      parentTx.id,
      5000,
      'Partial customer cancellation'
    );

    assert(reversalTx.transactionType === 'REVERSAL', 'Commission reversal tx type is REVERSAL');
    assert(reversalTx.platformCommission === -500, 'Platform fee reversed by -₹500 (10% of ₹5,000)');
    assert(reversalTx.gatewayFee === -100, 'Gateway fee reversed by -₹100 (2% of ₹5,000)');
    assert(reversalTx.artistShare === -4400, 'Artist net share reversed by -₹4,400');
  })();

  // 4. Settlement Eligibility Evaluator
  (() => {
    const candidateReady = evaluateSettlementEligibility({
      artistId: 'artist_prachi',
      organizationId: 'makeovers-by-prachi',
      minimumThreshold: 1000
    });
    assert(candidateReady.status === 'READY_FOR_SETTLEMENT', 'Completed booking with > ₹1,000 is READY_FOR_SETTLEMENT');
    assert(candidateReady.meetsMinimumThreshold === true, 'Meets minimum threshold');

    const candidateBelowThreshold = evaluateSettlementEligibility({
      artistId: 'artist_unknown',
      organizationId: 'non_existent_org',
      minimumThreshold: 1000
    });
    assert(candidateBelowThreshold.status === 'BELOW_MINIMUM_THRESHOLD', 'Empty or low earnings status is BELOW_MINIMUM_THRESHOLD');
  })();

  // 5. Commission Reconciliation Engine ($0 discrepancy verification)
  (() => {
    const report = reconcileBookingCommission('bk-test-101');
    assert(report.reconciled === true, 'Booking commission reconciled with 0 discrepancy');
    assert(report.discrepancyAmount === 0, 'Discrepancy amount is strictly 0');

    const globalRecon = runGlobalCommissionReconciliation();
    assert(globalRecon.allReconciled === true, 'All marketplace booking ledgers reconciled ($0 global discrepancy)');
  })();

  console.log(`\n🎉 All ${passed}/${total} V8.2 Commission Engine tests passed successfully!`);
}
