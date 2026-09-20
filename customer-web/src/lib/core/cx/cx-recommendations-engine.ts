/**
 * V10.2 Recommendations, Segmentation & Bridal Lifecycle Engine
 * 
 * CORE RULE: Recommendations suggest actions. They NEVER auto-create bookings,
 * fabricate pricing, alter availability, or manipulate loyalty balances directly.
 */

import { CustomerRecommendation, CustomerSegment } from './cx-types';

const recommendationsStore: CustomerRecommendation[] = [];

export function generateCustomerRecommendation(params: {
  customerId: string;
  organizationId: string;
  previousService?: string;
  daysSinceLastService?: number;
  isBridalCustomer?: boolean;
}): CustomerRecommendation {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  let recType: CustomerRecommendation['recommendationType'] = 'SERVICE';
  let title = 'Recommended Maintenance Service';
  let reason = 'Based on your previous booking schedule';

  if (params.isBridalCustomer) {
    recType = 'PACKAGE';
    title = 'Bridal Trial & Preparation Consultation';
    reason = 'Recommended bridal milestone preparation';
  } else if (params.daysSinceLastService && params.daysSinceLastService > 90) {
    recType = 'RE_ENGAGEMENT';
    title = 'Seasonal Beauty Touchup';
    reason = 'Customer inactive for >90 days';
  }

  const rec: CustomerRecommendation = {
    recommendationId: `rec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId: params.customerId,
    organizationId: params.organizationId,
    recommendationType: recType,
    title,
    reason,
    confidence: 0.95,
    source: 'DETERMINISTIC',
    createdAt: now.toISOString(),
    expiresAt,
  };

  recommendationsStore.push(rec);
  return rec;
}

export function classifyCustomerSegment(params: {
  isBridal: boolean;
  completedBookingsCount: number;
  totalSpent: number;
  daysInactive: number;
}): CustomerSegment {
  if (params.isBridal) return 'BRIDAL_CUSTOMER';
  if (params.daysInactive > 180) return 'INACTIVE_CUSTOMER';
  if (params.totalSpent >= 50000) return 'HIGH_VALUE_CUSTOMER';
  if (params.completedBookingsCount >= 3) return 'REPEAT_CUSTOMER';
  if (params.completedBookingsCount >= 1) return 'LOYALTY_CUSTOMER';
  return 'NEW_CUSTOMER';
}

export function getCustomerRecommendations(customerId: string): CustomerRecommendation[] {
  return recommendationsStore.filter(r => r.customerId === customerId);
}
