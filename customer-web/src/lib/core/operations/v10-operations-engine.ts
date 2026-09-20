/**
 * V10.0 Operations Lifecycle Master Engine
 * 
 * CYCLE: CERTIFY -> OPERATE -> OBSERVE -> IMPROVE -> TEST -> RE-CERTIFY
 */

import { runProductionCertification, ProductionCertificationRecord } from '../certification/production-certification';
import { runDataConsistencyAudit, DataReconciliationResult } from './data-reconciliation';
import { getProductionAssetInventory, getConfigurationDriftEvents, checkConfigurationDrift } from './config-drift';
import { getChangeRequests } from './release-manager';
import { getPostIncidentReviews } from './incident-ops';

export interface ProductionOperationsSummary {
  engineVersion: 'V10.0';
  lifecycleState: 'OPERATING' | 'MAINTENANCE' | 'RE_CERTIFICATION_REQUIRED';
  certificationSummary: ProductionCertificationRecord;
  dataIntegrityAudit: DataReconciliationResult;
  totalAssetsCount: number;
  openDriftEventsCount: number;
  totalChangeRequestsCount: number;
  totalPostIncidentReviewsCount: number;
  costGovernanceStatus: 'ZERO_COST_COMPLIANT';
  evaluatedAt: string;
}

export function evaluateProductionOperations(): ProductionOperationsSummary {
  const certSummary = runProductionCertification('PRODUCTION');
  const auditResult = runDataConsistencyAudit();
  const assets = getProductionAssetInventory();
  const driftEvents = getConfigurationDriftEvents();
  const changeReqs = getChangeRequests();
  const pirs = getPostIncidentReviews();

  const openDrift = driftEvents.length;
  let lifecycleState: ProductionOperationsSummary['lifecycleState'] = 'OPERATING';

  // Trigger targeted re-certification requirement if critical drift or pending change
  if (openDrift > 0 || changeReqs.some(c => c.status === 'DEPLOYING')) {
    lifecycleState = 'RE_CERTIFICATION_REQUIRED';
  }

  return {
    engineVersion: 'V10.0',
    lifecycleState,
    certificationSummary: certSummary,
    dataIntegrityAudit: auditResult,
    totalAssetsCount: assets.length,
    openDriftEventsCount: openDrift,
    totalChangeRequestsCount: changeReqs.length,
    totalPostIncidentReviewsCount: pirs.length,
    costGovernanceStatus: 'ZERO_COST_COMPLIANT',
    evaluatedAt: new Date().toISOString(),
  };
}
