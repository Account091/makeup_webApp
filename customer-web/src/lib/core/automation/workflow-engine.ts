/**
 * V10.1 Workflow Orchestration Engine
 * 
 * CORE RULE: Automation initiates approved workflows, notifications, reminders,
 * queue processing, and drafts. It MUST NOT bypass authorization, financial controls,
 * privacy controls, risk controls, or human approval requirements.
 */

import {
  WorkflowDefinition,
  WorkflowRun,
  WorkflowStep,
  WorkflowCondition,
  MessageTemplate,
} from './workflow-types';
import { hasPermission } from '../security/permission-matrix';
import { verifyTenantIsolation } from '../security/tenant-verifier';

const registeredWorkflows: WorkflowDefinition[] = [];
const activeWorkflowRuns: WorkflowRun[] = [];
const processedEventsSet = new Set<string>();
const sentCommunicationsSet = new Set<string>();

export function registerWorkflow(def: Omit<WorkflowDefinition, 'workflowId' | 'createdAt' | 'updatedAt'>): WorkflowDefinition {
  const workflow: WorkflowDefinition = {
    ...def,
    workflowId: `wf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  registeredWorkflows.push(workflow);
  return workflow;
}

export function evaluateCondition(condition: WorkflowCondition, entity: Record<string, any>): boolean {
  const fieldValue = entity[condition.field];
  switch (condition.operator) {
    case 'EQUALS':
      return fieldValue === condition.value;
    case 'NOT_EQUALS':
      return fieldValue !== condition.value;
    case 'GREATER_THAN':
      return fieldValue > condition.value;
    case 'LESS_THAN':
      return fieldValue < condition.value;
    case 'IN':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    default:
      return false;
  }
}

export function triggerWorkflowEvent(params: {
  eventType: string;
  entityType: string;
  entityId: string;
  entityVersion: number;
  entityData: Record<string, any>;
  actorRole: string;
  actorOrgId?: string;
  dryRun?: boolean;
}): { triggeredRunsCount: number; runs: WorkflowRun[]; skippedDuplicates: boolean } {
  // Deterministic event key for idempotency
  const eventKey = `${params.eventType}_${params.entityId}_v${params.entityVersion}`;
  if (processedEventsSet.has(eventKey)) {
    return { triggeredRunsCount: 0, runs: [], skippedDuplicates: true };
  }
  if (!params.dryRun) {
    processedEventsSet.add(eventKey);
  }

  const matchingWorkflows = registeredWorkflows.filter(wf => {
    if (wf.status !== 'ACTIVE') return false;
    if (wf.triggerType !== 'EVENT') return false;
    if (wf.triggerEvent !== params.eventType) return false;

    // Tenant boundary check
    if (wf.scope === 'ORGANIZATION') {
      const isolation = verifyTenantIsolation({
        actorUid: 'sys_workflow_engine',
        actorRole: params.actorRole,
        actorOrgId: params.actorOrgId,
        targetOrgId: wf.organizationId || '',
      });
      if (!isolation.authorized) return false;
    }

    // Evaluate all conditions deterministically
    return wf.conditions.every(cond => evaluateCondition(cond, params.entityData));
  });

  const runs: WorkflowRun[] = [];

  for (const wf of matchingWorkflows) {
    const run: WorkflowRun = {
      runId: `wfrun_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      workflowId: wf.workflowId,
      workflowVersion: wf.version,
      organizationId: wf.organizationId,
      triggerEventId: eventKey,
      entityType: params.entityType,
      entityId: params.entityId,
      status: params.dryRun ? 'COMPLETED' : 'RUNNING',
      startedAt: new Date().toISOString(),
      currentStepIndex: 0,
      requestId: `req_wf_${Date.now().toString(36)}`,
      correlationId: `corr_${params.entityId}`,
      completedStepKeys: [],
    };

    if (!params.dryRun) {
      activeWorkflowRuns.push(run);
      // Process steps deterministically
      processWorkflowRun(run, wf, params.actorRole, params.entityData);
    }

    runs.push(run);
  }

  return { triggeredRunsCount: runs.length, runs, skippedDuplicates: false };
}

function processWorkflowRun(
  run: WorkflowRun,
  wf: WorkflowDefinition,
  actorRole: string,
  entityData: Record<string, any>
): void {
  for (let i = 0; i < wf.steps.length; i++) {
    const step = wf.steps[i];
    const stepExecutionKey = `${run.runId}_step_${step.stepId}`;

    // Step Idempotency Guard (e.g. after DR resume)
    if (run.completedStepKeys.includes(stepExecutionKey)) {
      continue;
    }

    // Check for Human Approval Requirement or Sensitive Action
    if (step.requiresHumanApproval || step.type === 'WAIT_FOR_APPROVAL') {
      run.status = 'WAITING';
      run.currentStepIndex = i;
      return;
    }

    // Step RBAC & Authorization Guard (No privileged bypass)
    if (step.type === 'CALL_AUTHORIZED_FUNCTION' && !hasPermission(actorRole, step.params.requiredPermission)) {
      run.status = 'FAILED';
      run.failureCode = `AUTHORIZATION_DENIED: Role '${actorRole}' lacks required permission '${step.params.requiredPermission}'`;
      return;
    }

    // Duplicate Communication Safeguard
    if (step.type === 'SEND_WHATSAPP' || step.type === 'SEND_EMAIL' || step.type === 'SEND_NOTIFICATION') {
      const commKey = `comm_${run.entityId}_${step.stepId}`;
      if (sentCommunicationsSet.has(commKey)) {
        continue; // Skip duplicate communication
      }
      sentCommunicationsSet.add(commKey);
    }

    // Record step completion
    run.completedStepKeys.push(stepExecutionKey);
  }

  run.status = 'COMPLETED';
  run.completedAt = new Date().toISOString();
}

export function getWorkflowRuns(): WorkflowRun[] {
  return [...activeWorkflowRuns];
}

export function getRegisteredWorkflows(): WorkflowDefinition[] {
  return [...registeredWorkflows];
}
