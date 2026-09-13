import { 
  submitOrganizationVerification,
  approveOrganizationVerification,
  getOrganizationVerification,
  getVerificationChecklist 
} from '../src/lib/marketplace/verification-engine';
import { 
  submitVerifiedReview, 
  flagReview, 
  createReviewResponse,
  getRatingAggregation,
  getMarketplaceReviews 
} from '../src/lib/marketplace/review-engine';
import { 
  calculateTrustScore, 
  calculateProfileCompleteness,
  getTrustAlerts 
} from '../src/lib/marketplace/trust-score-engine';
import { 
  analyzeReviewThemes, 
  draftReviewResponse 
} from '../src/lib/ai/review-ai-assistant';
import { MarketplaceReviewV84 } from '../src/lib/marketplace/marketplace-types';

export function runV84TrustReviewsTests() {
  console.log('🧪 Starting V8.4 Trust, Reviews & Verification Engine Tests...\n');
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

  // 1. Organization & Artist Verification Workflows
  (() => {
    const verif = submitOrganizationVerification({
      organizationId: 'org-test-trust-01',
      verificationType: 'BUSINESS_TAX',
      evidencePaths: ['path/gst.pdf', 'path/pan.pdf']
    });
    assert(verif.status === 'SUBMITTED', 'Organization verification status is SUBMITTED');

    const approved = approveOrganizationVerification({
      organizationId: 'org-test-trust-01',
      reviewedByUid: 'admin-trust-01'
    });
    assert(approved.status === 'VERIFIED', 'Approved verification status is VERIFIED');
    assert(approved.expiryDate !== undefined, 'Approved verification includes 1-year expiry date');

    const checklist = getVerificationChecklist('org-test-trust-01');
    assert(checklist.overallReady === true, 'Verification checklist reflects overallReady = true');
  })();

  // 2. Verified Booking Review Rules & Safety Controls
  (() => {
    // Valid completed booking review
    const review = submitVerifiedReview({
      bookingId: 'bk-jaipur-003',
      customerId: 'cust-103',
      rating: 5,
      qualityRating: 5,
      punctualityRating: 5,
      communicationRating: 5,
      professionalismRating: 5,
      reviewText: 'Outstanding bridal makeup experience!'
    });
    assert(review.verifiedBooking === true, 'Review marked as verifiedBooking');
    assert(review.moderationStatus === 'APPROVED', 'Verified review automatically published');

    // Rule 1: Mismatched customer ownership
    try {
      submitVerifiedReview({
        bookingId: 'bk-jaipur-003',
        customerId: 'wrong-customer-99',
        rating: 5,
        reviewText: 'Fake review'
      });
      assert(false, 'Should throw error when customer did not own booking');
    } catch (err: any) {
      assert(err.message.includes('did not participate'), 'Mismatched customer correctly blocked');
    }

    // Rule 2: Uncompleted booking review
    try {
      submitVerifiedReview({
        bookingId: 'bk-pending-001',
        customerId: 'cust-103',
        rating: 5,
        reviewText: 'Premature review'
      });
      assert(false, 'Should throw error when booking is not COMPLETED');
    } catch (err: any) {
      assert(err.message.includes('COMPLETED'), 'Uncompleted booking review correctly blocked');
    }

    // Rule 3: Duplicate review prevention
    try {
      submitVerifiedReview({
        bookingId: 'bk-jaipur-001',
        customerId: 'cust-101',
        rating: 5,
        reviewText: 'Duplicate submission'
      });
      assert(false, 'Should throw error on duplicate review for same booking');
    } catch (err: any) {
      assert(err.message.includes('already been reviewed'), 'Duplicate review correctly blocked');
    }
  })();

  // 3. Multi-Dimensional Rating Aggregation
  (() => {
    const ratings = getRatingAggregation('artist-101');
    assert(ratings.reviewCount >= 2, 'Rating aggregation includes at least 2 reviews');
    assert(ratings.averageRating >= 4.5, 'Calculated average rating is >= 4.5');
    assert(ratings.qualityAvg >= 4.0, 'Multi-dimensional quality average calculated');
  })();

  // 4. Review Flagging & Artist Responses
  (() => {
    const reviews = getMarketplaceReviews({ artistId: 'artist-101' });
    const targetRev = reviews[0];

    const flag = flagReview({
      reviewId: targetRev.reviewId,
      flaggedByUid: 'user-reporter-01',
      flagReason: 'SPAM',
      notes: 'Testing flag system'
    });
    assert(flag.flagReason === 'SPAM', 'Review flag created with reason SPAM');

    const response = createReviewResponse({
      reviewId: targetRev.reviewId,
      organizationId: 'org-jaipur-royal-glam',
      artistId: 'artist-101',
      responseText: 'Thank you for your wonderful review!'
    });
    assert(response.responseText.includes('Thank you'), 'Artist review response published');
  })();

  // 5. Deterministic Trust Score Engine & Profile Completeness
  (() => {
    const trustRecord = calculateTrustScore({
      organizationId: 'org-jaipur-royal-glam',
      artistId: 'artist-101'
    });
    assert(trustRecord.overallTrustScore >= 90, 'Calculated trust score is >= 90/100');
    assert(trustRecord.badge === 'VERIFIED_PRO', 'Trust badge assigned is VERIFIED_PRO');

    const completeness = calculateProfileCompleteness('org-jaipur-royal-glam');
    assert(completeness.completenessPercent === 100, 'Profile completeness calculated as 100%');

    const alerts = getTrustAlerts('org-jaipur-royal-glam');
    assert(alerts.length >= 1, 'Trust alerts queried');
  })();

  // 6. AI Review Assistant Theme Extraction & Safety Bounds
  (() => {
    const sampleReview: MarketplaceReviewV84 = {
      reviewId: 'rev-ai-test',
      bookingId: 'bk-ai-001',
      customerId: 'cust-101',
      artistId: 'artist-101',
      organizationId: 'org-jaipur-royal-glam',
      rating: 5,
      reviewText: 'Punctual artist! Amazing makeup quality and great communication.',
      verifiedBooking: true,
      moderationStatus: 'APPROVED',
      createdAt: new Date().toISOString()
    };

    const themes = analyzeReviewThemes(sampleReview);
    assert(themes.themes.includes('quality'), 'AI extracted quality theme');
    assert(themes.themes.includes('punctuality'), 'AI extracted punctuality theme');
    assert(themes.sentiment === 'POSITIVE', 'AI classified positive sentiment');

    const draft = draftReviewResponse(sampleReview);
    assert(draft.draftText.includes('Thank you'), 'AI generated response draft');
    assert(draft.disclaimer.includes('human review'), 'AI response draft includes human review disclaimer');
  })();

  console.log(`\n🎉 All ${passed}/${total} V8.4 Trust, Reviews & Verification tests passed successfully!`);
}
