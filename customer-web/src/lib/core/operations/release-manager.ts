/**
 * V10.0 Production Release Manager & Change Control Engine
 */

import {
  ChangeRequest,
  ChangeRiskLevel,
  ChangeRequestStatus,
} from './operations-types';

const changeRequestsStore: ChangeRequest[] = [];

export function createChangeRequest(params: {
  title: string;
  description: string;
  category: string;
  riskLevel: ChangeRiskLevel;
  requestedBy: string;
  affectedSystems: string[];
  testPlan: string;
  rollbackPlan: string;
}): ChangeRequest {
  const change: ChangeRequest = {
    changeId: `change_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    title: params.title,
    description: params.description,
    category: params.category,
    riskLevel: params.riskLevel,
    requestedBy: params.requestedBy,
    affectedSystems: params.affectedSystems,
    testPlan: params.testPlan,
    rollbackPlan: params.rollbackPlan,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };

  changeRequestsStore.push(change);
  return change;
}

export function approveChangeRequest(params: {
  changeId: string;
  approverUid: string;
}): ChangeRequest | null {
  const change = changeRequestsStore.find(c => c.changeId === params.changeId);
  if (!change) return null;

  // CRITICAL / HIGH changes cannot be self-approved
  if (change.requestedBy === params.approverUid && (change.riskLevel === 'CRITICAL' || change.riskLevel === 'HIGH')) {
    throw new Error('Risk Policy Violation: High/Critical changes require an independent approver.');
  }

  change.status = 'APPROVED';
  change.approvedBy = params.approverUid;
  change.approvedAt = new Date().toISOString();
  return change;
}

export function advanceChangeStatus(
  changeId: string,
  newStatus: ChangeRequestStatus
): ChangeRequest | null {
  const change = changeRequestsStore.find(c => c.changeId === changeId);
  if (!change) return null;

  if (newStatus === 'DEPLOYING' && change.status !== 'APPROVED') {
    throw new Error('Deployment Blocked: Change request has not been APPROVED.');
  }

  change.status = newStatus;
  if (newStatus === 'VERIFIED' || newStatus === 'ROLLED_BACK') {
    change.completedAt = new Date().toISOString();
  }

  return change;
}

export function getChangeRequests(): ChangeRequest[] {
  return [...changeRequestsStore];
}
