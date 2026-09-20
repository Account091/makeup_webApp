/**
 * V10.6 Executive Forecasting & Scenario Planning Engine
 */

import { ExecutiveScenario, ClassifiedValue, ForecastConfidence } from './bi-types';
import { createClassifiedValue } from './metric-registry-engine';

const scenariosStore: ExecutiveScenario[] = [];

export function forecastMetric(params: {
  metricId: string;
  horizonDays: 7 | 30 | 90 | 180 | 365;
  historicalValues: number[];
}): { forecastValue: ClassifiedValue; confidence: ForecastConfidence; historicalTrend: string } {
  const count = params.historicalValues.length;

  if (count < 3) {
    return {
      forecastValue: createClassifiedValue({ value: 0, classification: 'FORECAST', period: `${params.horizonDays}d` }),
      confidence: 'INSUFFICIENT_DATA',
      historicalTrend: 'INSUFFICIENT_HISTORICAL_DATA',
    };
  }

  const sum = params.historicalValues.reduce((a, b) => a + b, 0);
  const avg = sum / count;

  // Simple growth projection multiplier based on trend
  const last = params.historicalValues[count - 1];
  const first = params.historicalValues[0];
  const growthRate = first > 0 ? (last - first) / first : 0;

  const forecastVal = Math.round(avg * (1 + growthRate * (params.horizonDays / 30)));
  const confidence: ForecastConfidence = count >= 10 ? 'HIGH' : count >= 5 ? 'MEDIUM' : 'LOW';

  return {
    forecastValue: createClassifiedValue({ value: Math.max(0, forecastVal), classification: 'FORECAST', period: `${params.horizonDays}d` }),
    confidence,
    historicalTrend: growthRate >= 0 ? `UPWARD (+${(growthRate * 100).toFixed(1)}%)` : `DOWNWARD (${(growthRate * 100).toFixed(1)}%)`,
  };
}

export function simulateExecutiveScenario(params: {
  name: string;
  type: ExecutiveScenario['type'];
  baseRevenue: number;
  baseBookings: number;
  assumptions: ExecutiveScenario['assumptions'];
}): ExecutiveScenario {
  const revMult = params.assumptions.leadVolumeMultiplier * params.assumptions.conversionRateMultiplier * params.assumptions.averageValueMultiplier;
  const projRev = Math.round(params.baseRevenue * revMult);
  const projBook = Math.round(params.baseBookings * params.assumptions.leadVolumeMultiplier * params.assumptions.conversionRateMultiplier);

  const scenario: ExecutiveScenario = {
    scenarioId: `scen_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    name: params.name,
    type: params.type,
    assumptions: params.assumptions,
    projectedRevenue: createClassifiedValue({ value: projRev, classification: 'PROJECTED', period: '30d' }),
    projectedBookings: createClassifiedValue({ value: projBook, classification: 'PROJECTED', period: '30d' }),
    createdAt: new Date().toISOString(),
  };

  scenariosStore.push(scenario);
  return scenario;
}

export function getExecutiveScenarios(): ExecutiveScenario[] {
  return [...scenariosStore];
}
