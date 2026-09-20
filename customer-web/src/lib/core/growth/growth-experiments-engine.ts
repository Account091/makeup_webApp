/**
 * V10.3 Growth Experiments & Capacity Guard Engine
 */

import { GrowthExperiment, CapacityGuardStatus } from './growth-types';

const experimentsStore: GrowthExperiment[] = [];

export function createGrowthExperiment(params: Omit<GrowthExperiment, 'experimentId' | 'sampleSize' | 'resultStatus' | 'createdAt'>): GrowthExperiment {
  const exp: GrowthExperiment = {
    ...params,
    experimentId: `exp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    sampleSize: 0,
    resultStatus: 'INSUFFICIENT_DATA',
    createdAt: new Date().toISOString(),
  };

  experimentsStore.push(exp);
  return exp;
}

export function evaluateExperimentResults(experimentId: string, sampleSize: number, testSuccessRate: number, controlSuccessRate: number): GrowthExperiment | null {
  const exp = experimentsStore.find(e => e.experimentId === experimentId);
  if (!exp) return null;

  exp.sampleSize = sampleSize;

  // Enforce statistical discipline: requires at least 100 samples per variant
  if (sampleSize < 200) {
    exp.resultStatus = 'INSUFFICIENT_DATA';
    return exp;
  }

  const diff = testSuccessRate - controlSuccessRate;
  if (diff > 5) {
    exp.resultStatus = 'WINNER_TEST';
  } else if (diff < -5) {
    exp.resultStatus = 'WINNER_CONTROL';
  } else {
    exp.resultStatus = 'NO_STATISTICAL_DIFFERENCE';
  }

  return exp;
}

export function evaluateCampaignCapacityGuard(params: {
  expectedCampaignBookings: number;
  availableCapacitySlots: number;
}): { status: CapacityGuardStatus; warningMessage?: string } {
  if (params.expectedCampaignBookings > params.availableCapacitySlots) {
    return {
      status: 'CAPACITY_CONSTRAINED',
      warningMessage: `Campaign demand (${params.expectedCampaignBookings}) exceeds operational capacity (${params.availableCapacitySlots}). Review artist assignment.`,
    };
  }

  if (params.expectedCampaignBookings > params.availableCapacitySlots * 0.8) {
    return {
      status: 'CAPACITY_WARNING',
      warningMessage: 'Campaign expected demand is near operational capacity limit (80%).',
    };
  }

  return { status: 'CAPACITY_OK' };
}
