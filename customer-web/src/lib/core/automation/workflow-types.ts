/**
 * V10.1 Business Automation & Workflow Orchestration Domain Types
 */

export type WorkflowTriggerType = 'EVENT' | 'SCHEDULE' | 'MANUAL' | 'CONDITION';

export type WorkflowStatus = 'DRAFT' | 'TESTING' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type WorkflowRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WorkflowStepType =
  | 'CHECK'
  | 'WAIT'
  | 'CREATE_TASK'
  | 'SEND_NOTIFICATION'
  | 'SEND_EMAIL'
  | 'SEND_WHATSAPP'
  | 'CREATE_DOCUMENT'
  | 'CREATE_DRAFT'
  | 'CREATE_REVIEW'
  | 'CALL_AUTHORIZED_FUNCTION'
  | 'ESCALATE'
  | 'WAIT_FOR_APPROVAL';

export type WorkflowScope = 'PLATFORM' | 'ORGANIZATION';

export interface WorkflowCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'BEFORE_NOW';
  value: any;
}

export interface WorkflowStep {
  stepId: string;
  name: string;
  type: WorkflowStepType;
  params: Record<string, any>;
  requiresHumanApproval?: boolean;
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  scope: WorkflowScope;
  organizationId?: string; // Present if scope is ORGANIZATION
  triggerType: WorkflowTriggerType;
  triggerEvent?: string;
  cronSchedule?: string;
  conditions: WorkflowCondition[];
  steps: WorkflowStep[];
  status: WorkflowStatus;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRun {
  runId: string;
  workflowId: string;
  workflowVersion: number;
  organizationId?: string;
  triggerEventId: string;
  entityType: string;
  entityId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  failureCode?: string;
  requestId: string;
  correlationId: string;
  completedStepKeys: string[]; // For DR recovery & step idempotency
}

export interface MessageTemplate {
  templateId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'FCM';
  purpose: string;
  language: string;
  version: number;
  content: string;
  variables: string[];
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'RETIRED';
}
