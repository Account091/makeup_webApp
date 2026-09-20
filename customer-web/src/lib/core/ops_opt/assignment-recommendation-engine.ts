/**
 * V10.4 Artist Assignment & Constraint Recommendation Engine
 * 
 * CORE RULE: Recommendations suggest candidates & scores. Actual assignment uses
 * the server-authoritative bookingAssignments workflow and respects tenant isolation.
 */

import { CandidateArtistRecommendation, ResourceProfile } from './ops-types';

export function recommendArtistAssignment(params: {
  bookingId: string;
  organizationId: string;
  requiredService: string;
  requiredSkill: string;
  bookingDate: string;
  bookingLocation: string;
  availableArtists: ResourceProfile[];
  existingArtistBookingsCount?: Record<string, number>;
}): CandidateArtistRecommendation[] {
  const recommendations: CandidateArtistRecommendation[] = [];

  for (const artist of params.availableArtists) {
    // 1. Tenant Isolation Hard Constraint
    if (artist.organizationId !== params.organizationId) {
      recommendations.push({
        artistId: artist.resourceId,
        artistName: artist.name,
        fitScore: 0,
        reasons: [],
        constraintsSatisfied: false,
        hardConstraintViolation: `Tenant Mismatch: Artist belongs to '${artist.organizationId}', booking is '${params.organizationId}'`,
      });
      continue;
    }

    // 2. Skill Match Hard Constraint
    if (!artist.skills.includes(params.requiredSkill)) {
      recommendations.push({
        artistId: artist.resourceId,
        artistName: artist.name,
        fitScore: 0,
        reasons: [],
        constraintsSatisfied: false,
        hardConstraintViolation: `Skill Missing: Required skill '${params.requiredSkill}' not verified for artist`,
      });
      continue;
    }

    // 3. Location / Service Area Check
    const locationMatch = artist.location === params.bookingLocation || artist.serviceArea.includes(params.bookingLocation);
    if (!locationMatch) {
      recommendations.push({
        artistId: artist.resourceId,
        artistName: artist.name,
        fitScore: 0,
        reasons: [],
        constraintsSatisfied: false,
        hardConstraintViolation: `Location Out of Bounds: Artist does not service '${params.bookingLocation}'`,
      });
      continue;
    }

    // Soft Constraint Scoring (Location, Workload)
    const currentJobs = params.existingArtistBookingsCount?.[artist.resourceId] || 0;
    const workloadScore = Math.max(0, 100 - currentJobs * 25);
    const fitScore = Math.round((80 + workloadScore * 0.2));

    recommendations.push({
      artistId: artist.resourceId,
      artistName: artist.name,
      fitScore,
      reasons: [
        `Verified skill '${params.requiredSkill}' match`,
        `Location '${params.bookingLocation}' supported`,
        `Current workload: ${currentJobs} job(s)`,
      ],
      constraintsSatisfied: true,
    });
  }

  // Sort descending by fitScore
  return recommendations.sort((a, b) => b.fitScore - a.fitScore);
}
