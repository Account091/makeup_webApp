/**
 * V10.4 — Advanced Operations & Resource Optimization Test Suite
 */

import { recommendArtistAssignment } from '../src/lib/core/ops_opt/assignment-recommendation-engine';
import { calculateCapacityStatus, detectOperationalBottlenecks } from '../src/lib/core/ops_opt/schedule-optimization-engine';
import { addWaitlistEntry, matchWaitlistOnCancellation, evaluateBookingOperationalReadiness } from '../src/lib/core/ops_opt/waitlist-cancellation-engine';
import { ResourceProfile } from '../src/lib/core/ops_opt/ops-types';

console.log('=================================================');
console.log('RUNNING V10.4 ADVANCED OPERATIONS TESTS');
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

const mockArtists: ResourceProfile[] = [
  {
    resourceId: 'art_101',
    organizationId: 'org_glam',
    resourceType: 'ARTIST',
    name: 'Pooja Sharma',
    skills: ['Bridal Makeup', 'Airbrush', 'Hairstyling'],
    location: 'Jodhpur',
    serviceArea: ['Jodhpur', 'Pali'],
    active: true,
  },
  {
    resourceId: 'art_102',
    organizationId: 'org_glam',
    resourceType: 'ARTIST',
    name: 'Neha Verma',
    skills: ['Party Makeup', 'Draping'], // Lacks Bridal Makeup
    location: 'Jodhpur',
    serviceArea: ['Jodhpur'],
    active: true,
  },
  {
    resourceId: 'art_901',
    organizationId: 'org_other_tenant', // Cross-tenant artist
    resourceType: 'ARTIST',
    name: 'Ritu Singh',
    skills: ['Bridal Makeup'],
    location: 'Jodhpur',
    serviceArea: ['Jodhpur'],
    active: true,
  },
];

// -------------------------------------------------------------
// Test 1: Artist Assignment Scoring & Constraint Validation
// -------------------------------------------------------------
console.log('[Test 1] Artist Assignment Scoring & Constraint Validation...');
const recs = recommendArtistAssignment({
  bookingId: 'bk_2001',
  organizationId: 'org_glam',
  requiredService: 'Bridal Makeup Service',
  requiredSkill: 'Bridal Makeup',
  bookingDate: '2026-10-15',
  bookingLocation: 'Jodhpur',
  availableArtists: mockArtists,
});

assert(recs.length === 3, 'Evaluated all 3 candidate artists');

const validRec = recs.find(r => r.artistId === 'art_101');
assert(validRec?.constraintsSatisfied === true, 'Qualified artist matches constraints');
assert((validRec?.fitScore || 0) > 80, 'Qualified artist receives high fit score');

// -------------------------------------------------------------
// Test 2: Hard Constraint Violations (Tenant & Skill Mismatch)
// -------------------------------------------------------------
console.log('\n[Test 2] Hard Constraint Violations (Tenant & Skill Mismatch)...');
const skillUnsatisfied = recs.find(r => r.artistId === 'art_102');
assert(skillUnsatisfied?.constraintsSatisfied === false, 'Artist lacking required skill rejected');
assert(skillUnsatisfied?.hardConstraintViolation?.includes('Skill Missing') === true, 'Skill missing reason reported');

const tenantUnsatisfied = recs.find(r => r.artistId === 'art_901');
assert(tenantUnsatisfied?.constraintsSatisfied === false, 'Cross-tenant artist strictly rejected');
assert(tenantUnsatisfied?.hardConstraintViolation?.includes('Tenant Mismatch') === true, 'Tenant mismatch reason reported');

// -------------------------------------------------------------
// Test 3: Capacity Status Calculation
// -------------------------------------------------------------
console.log('\n[Test 3] Capacity Status Calculation...');
const capAvail = calculateCapacityStatus({ totalCapacitySlots: 10, bookedSlots: 4, bufferSlots: 1 });
assert(capAvail.status === 'CAPACITY_AVAILABLE', '50% utilization evaluates to CAPACITY_AVAILABLE');

const capOverloaded = calculateCapacityStatus({ totalCapacitySlots: 10, bookedSlots: 10, bufferSlots: 1 });
assert(capOverloaded.status === 'CAPACITY_OVERLOADED', '110% utilization evaluates to CAPACITY_OVERLOADED');

// -------------------------------------------------------------
// Test 4: Operational Bottleneck Detection
// -------------------------------------------------------------
console.log('\n[Test 4] Operational Bottleneck Detection...');
const bottleneck = detectOperationalBottlenecks({
  city: 'Jodhpur',
  totalDemand: 15,
  availableArtists: 3, // Max capacity = 9
  availableStudioStations: 5,
});

assert(bottleneck.hasBottleneck === true, 'Bottleneck detected when demand exceeds capacity');
assert(bottleneck.bottleneckType === 'ARTIST_CAPACITY_SHORTAGE', 'Bottleneck classified as ARTIST_CAPACITY_SHORTAGE');
assert(bottleneck.recommendation?.includes('Onboard or assign') === true, 'Expansion recommendation provided');

// -------------------------------------------------------------
// Test 5: Waitlist Matching & Cancellation Recovery
// -------------------------------------------------------------
console.log('\n[Test 5] Waitlist Matching & Cancellation Recovery...');
addWaitlistEntry({
  customerId: 'cust_901',
  organizationId: 'org_glam',
  service: 'Bridal Makeup',
  preferredDate: '2026-11-01',
  preferredTime: '10:00 AM',
  location: 'Jodhpur',
});

const matchedWaitlist = matchWaitlistOnCancellation({
  cancelledBookingService: 'Bridal Makeup',
  cancelledBookingDate: '2026-11-01',
  cancelledBookingLocation: 'Jodhpur',
  organizationId: 'org_glam',
});

assert(matchedWaitlist !== null, 'Matching waitlist entry found on cancellation');
assert(matchedWaitlist?.status === 'OFFERED', 'Waitlist status updated to OFFERED');

// -------------------------------------------------------------
// Test 6: Booking Operational Readiness Scoring
// -------------------------------------------------------------
console.log('\n[Test 6] Booking Operational Readiness Scoring...');
const readyBooking = evaluateBookingOperationalReadiness({
  bookingId: 'bk_2001',
  paymentVerified: true,
  calendarLocked: true,
  artistAssigned: true,
  travelConfirmed: true,
  documentsComplete: true,
});
assert(readyBooking.status === 'READY', 'Fully complete booking evaluates to READY');
assert(readyBooking.missingItems.length === 0, 'Zero missing items');

const unreadyBooking = evaluateBookingOperationalReadiness({
  bookingId: 'bk_2002',
  paymentVerified: false,
  calendarLocked: false,
  artistAssigned: false,
  travelConfirmed: true,
  documentsComplete: true,
});
assert(unreadyBooking.status === 'NOT_READY', 'Booking missing 3 critical items evaluates to NOT_READY');
assert(unreadyBooking.missingItems.length === 3, '3 missing items recorded');

console.log('\n=================================================');
console.log(`ALL V10.4 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 🎯🏆`);
console.log('=================================================\n');
