/**
 * V10.3 — Growth, Marketing & Revenue Intelligence Test Suite
 */

import { normalizeUTM, createCampaign, recordAttribution, calculateCampaignPerformance } from '../src/lib/core/growth/campaign-attribution-engine';
import { calculateFunnelConversion, evaluateCityGrowthPerformance } from '../src/lib/core/growth/funnel-analytics-engine';
import { createGrowthExperiment, evaluateExperimentResults, evaluateCampaignCapacityGuard } from '../src/lib/core/growth/growth-experiments-engine';

console.log('=================================================');
console.log('RUNNING V10.3 GROWTH & MARKETING TESTS');
console.log('=================================================\n');

let assertionsPassed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// Test 1: UTM Normalization & Channel Classification
// -------------------------------------------------------------
console.log('[Test 1] UTM Normalization & Channel Classification...');
const normIg = normalizeUTM({ utmSource: 'instagram', utmMedium: 'story_ad' });
assert(normIg.channel === 'INSTAGRAM', 'Instagram UTM normalized to INSTAGRAM channel');

const normPaiSearch = normalizeUTM({ utmSource: 'google', utmMedium: 'cpc' });
assert(normPaiSearch.channel === 'PAID_SEARCH', 'Google CPC normalized to PAID_SEARCH channel');

const normOrgSearch = normalizeUTM({ utmSource: 'google', utmMedium: 'organic' });
assert(normOrgSearch.channel === 'ORGANIC_SEARCH', 'Google Organic normalized to ORGANIC_SEARCH channel');

// -------------------------------------------------------------
// Test 2: Campaign Creation & Performance Metrics
// -------------------------------------------------------------
console.log('\n[Test 2] Campaign Creation & Performance Metrics...');
const camp = createCampaign({
  organizationId: 'org_glam',
  name: 'Bridal Fest 2026',
  objective: 'Lead Generation',
  channels: ['INSTAGRAM', 'WHATSAPP'],
  startAt: new Date().toISOString(),
  budget: 50000,
  status: 'ACTIVE',
  targetLocations: ['Jodhpur', 'Jaipur'],
  targetServices: ['Bridal Makeup'],
  createdBy: 'usr_mkt_lead',
});

assert(camp.campaignId.startsWith('camp_'), 'Campaign created with valid ID');
assert(camp.status === 'ACTIVE', 'Campaign created in ACTIVE status');

recordAttribution({
  entityId: 'bk_9001',
  entityType: 'BOOKING',
  channel: 'INSTAGRAM',
  source: 'instagram',
  medium: 'story_ad',
  campaignId: camp.campaignId,
});

const perf = calculateCampaignPerformance(camp.campaignId);
assert(perf.bookingsCount === 1, 'Attributed booking counted in campaign performance');
assert(perf.revenueCompleted === 15000, 'Actual completed revenue calculated');

// -------------------------------------------------------------
// Test 3: Multi-Touch Attribution Engine
// -------------------------------------------------------------
console.log('\n[Test 3] Multi-Touch Attribution Engine...');
const firstAttr = recordAttribution({
  entityId: 'lead_8801',
  entityType: 'LEAD',
  channel: 'ORGANIC_SEARCH',
  source: 'google',
  medium: 'organic',
});
assert(firstAttr.channel === 'ORGANIC_SEARCH', 'First touch channel recorded');

const secondAttr = recordAttribution({
  entityId: 'lead_8801',
  entityType: 'LEAD',
  channel: 'WHATSAPP',
  source: 'whatsapp',
  medium: 'direct',
});
assert(secondAttr.assistedChannels.includes('WHATSAPP'), 'Secondary touch added to assisted channels without overwriting first touch');

// -------------------------------------------------------------
// Test 4: Funnel Analytics & Drop-off Detection
// -------------------------------------------------------------
console.log('\n[Test 4] Funnel Analytics & Drop-off Detection...');
const funnelMetrics = calculateFunnelConversion({
  visitors: 1000,
  leads: 100,
  qualifiedLeads: 80,
  consultations: 60,
  quotes: 40,
  bookings: 10, // 10% lead to booking rate < 30% threshold
  confirmedBookings: 10,
  completedBookings: 10,
});

assert(funnelMetrics.visitorToLeadRate === 10, 'Visitor to lead rate is 10%');
assert(funnelMetrics.leadToBookingRate === 10, 'Lead to booking rate is 10%');
assert(funnelMetrics.dropOffStage === 'LEAD_TO_BOOKING_DROPOFF', 'Lead to booking drop-off stage detected');

// -------------------------------------------------------------
// Test 5: City Growth Performance & Experiment Discipline
// -------------------------------------------------------------
console.log('\n[Test 5] City Growth Performance & Experiment Discipline...');
const cityPerf = evaluateCityGrowthPerformance('Jodhpur');
assert(cityPerf.leadVolume === 250, 'Jodhpur lead volume calculated');
assert(cityPerf.growthOpportunity === true, 'High growth city identified');

const exp = createGrowthExperiment({
  name: 'Landing Page CTA Experiment',
  hypothesis: 'Changing CTA to Book Free Consultation increases lead conversion',
  controlVariant: 'Book Now',
  testVariant: 'Book Free Consultation',
  primaryMetric: 'visitorToLeadRate',
  status: 'ACTIVE',
  createdBy: 'usr_growth_lead',
});

assert(exp.experimentId.startsWith('exp_'), 'Growth experiment created');

const lowSampleRes = evaluateExperimentResults(exp.experimentId, 50, 15, 8);
assert(lowSampleRes?.resultStatus === 'INSUFFICIENT_DATA', 'Enforced INSUFFICIENT_DATA due to sample size < 200');

const highSampleRes = evaluateExperimentResults(exp.experimentId, 300, 15, 8);
assert(highSampleRes?.resultStatus === 'WINNER_TEST', 'Winner declared when sample size requirement is met');

// -------------------------------------------------------------
// Test 6: Capacity Guard Safeguard
// -------------------------------------------------------------
console.log('\n[Test 6] Capacity Guard Safeguard...');
const okCap = evaluateCampaignCapacityGuard({ expectedCampaignBookings: 20, availableCapacitySlots: 50 });
assert(okCap.status === 'CAPACITY_OK', 'Capacity evaluated as CAPACITY_OK');

const constrainedCap = evaluateCampaignCapacityGuard({ expectedCampaignBookings: 60, availableCapacitySlots: 50 });
assert(constrainedCap.status === 'CAPACITY_CONSTRAINED', 'Capacity evaluated as CAPACITY_CONSTRAINED when demand > slots');
assert(constrainedCap.warningMessage?.includes('exceeds operational capacity') === true, 'Warning message generated');

console.log('\n=================================================');
console.log(`ALL V10.3 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 📈🏆`);
console.log('=================================================\n');
