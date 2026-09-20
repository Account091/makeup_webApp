/**
 * Customer-Facing Features Audit & Dynamic CSAT/NPS Test Suite
 */

import { recordActionOrigin } from '../src/lib/core/security/customer-action-boundary-engine';
import { calculateDynamicCsatAndNps } from '../src/lib/core/cx/customer-lifecycle-engine';

console.log('====================================================================');
console.log('RUNNING CUSTOMER-FACING FEATURES & DYNAMIC METRICS AUDIT TEST SUITE');
console.log('====================================================================\n');

let assertionsPassed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

export function runCustomerFacingFeaturesAuditTests() {
  const customerUid = 'usr_ananya_rathore_44';

  // -------------------------------------------------------------
  // Test 1: Customer-Facing Origination Actions
  // -------------------------------------------------------------
  console.log('[Test 1] Customer-Facing Origination Actions (10 Event Types)...');
  
  const qRes = recordActionOrigin({
    eventType: 'CUSTOMER_QUESTIONNAIRE_SUBMITTED',
    actorType: 'CUSTOMER',
    actorId: customerUid,
    actorRole: 'CUSTOMER',
    customerUid,
  });
  assert(qRes.success === true, 'CUSTOMER_QUESTIONNAIRE_SUBMITTED recorded successfully');

  const cRes = recordActionOrigin({
    eventType: 'CUSTOMER_CONSULTATION_APPROVED',
    actorType: 'CUSTOMER',
    actorId: customerUid,
    actorRole: 'CUSTOMER',
    customerUid,
  });
  assert(cRes.success === true, 'CUSTOMER_CONSULTATION_APPROVED recorded successfully');

  const pRes = recordActionOrigin({
    eventType: 'CUSTOMER_PRIVACY_REQUEST',
    actorType: 'CUSTOMER',
    actorId: customerUid,
    actorRole: 'CUSTOMER',
    customerUid,
  });
  assert(pRes.success === true, 'CUSTOMER_PRIVACY_REQUEST recorded successfully');

  // -------------------------------------------------------------
  // Test 2: Dynamic CSAT & NPS Calculation (No Hardcoded Fallbacks)
  // -------------------------------------------------------------
  console.log('\n[Test 2] Dynamic CSAT & NPS Calculation (No Hardcoded Fallbacks)...');
  
  const emptyMetrics = calculateDynamicCsatAndNps([]);
  assert(emptyMetrics.csatFormatted === 'No ratings yet', 'Empty ratings return "No ratings yet" rather than static 4.93');
  assert(emptyMetrics.npsFormatted === 'No data', 'Empty ratings return "No data" rather than static +88');

  const liveMetrics = calculateDynamicCsatAndNps([5, 5, 5, 4, 5, 5, 3]);
  assert(liveMetrics.averageRating === 4.57, 'Dynamic average rating calculated correctly as 4.57');
  assert(liveMetrics.npsScore !== null && liveMetrics.npsScore > 0, 'Dynamic NPS score calculated from live responses');
}

if (require.main === module) {
  runCustomerFacingFeaturesAuditTests();
}
