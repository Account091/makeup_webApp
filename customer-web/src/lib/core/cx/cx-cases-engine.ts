/**
 * V10.2 Customer Cases, Complaint Workflows & SLA Engine
 */

import { CustomerCase, CustomerCaseType } from './cx-types';

const customerCasesStore: CustomerCase[] = [];

export function createCustomerCase(params: {
  customerId: string;
  organizationId: string;
  type: CustomerCaseType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}): CustomerCase {
  const cCase: CustomerCase = {
    caseId: `ccase_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId: params.customerId,
    organizationId: params.organizationId,
    type: params.type,
    priority: params.priority,
    status: 'OPEN',
    openedAt: new Date().toISOString(),
  };

  customerCasesStore.push(cCase);
  return cCase;
}

export function recordFirstResponse(caseId: string, responderUid: string): CustomerCase | null {
  const cCase = customerCasesStore.find(c => c.caseId === caseId);
  if (!cCase) return null;

  cCase.firstResponseAt = new Date().toISOString();
  cCase.assignedTo = responderUid;
  cCase.status = 'IN_PROGRESS';
  return cCase;
}

export function resolveCustomerCase(params: {
  caseId: string;
  resolutionSummary: string;
}): CustomerCase | null {
  const cCase = customerCasesStore.find(c => c.caseId === params.caseId);
  if (!cCase) return null;

  cCase.status = 'RESOLVED';
  cCase.resolutionSummary = params.resolutionSummary;
  cCase.resolvedAt = new Date().toISOString();
  return cCase;
}

export function getCustomerCases(customerId: string): CustomerCase[] {
  return customerCasesStore.filter(c => c.customerId === customerId);
}
