/**
 * V9.4 / V10.7 Customer Action Origin & Trust Boundary Engine
 * 
 * CORE RULES:
 * 1. Customer-originated events CANNOT be fabricated or impersonated by an Admin.
 * 2. Admin operations must record actorType: 'ADMIN' with admin UID.
 * 3. Customer actions must record actorType: 'CUSTOMER' with customer UID and timestamp.
 * 4. Admin UI displays explicit origin attribution ("Created by: Customer") and disables customer impersonation controls.
 */

export type StrictCustomerEventType =
  | 'CUSTOMER_QUESTIONNAIRE_SUBMITTED'
  | 'CUSTOMER_CONSULTATION_APPROVED'
  | 'MEDIA_CONSENT_GRANTED'
  | 'MEDIA_CONSENT_REVOKED'
  | 'SERVICE_AGREEMENT_ACCEPTED'
  | 'PAYMENT_PROOF_UPLOADED'
  | 'CUSTOMER_REVIEW_SUBMITTED'
  | 'CUSTOMER_COMMUNICATION_OPT_OUT'
  | 'CUSTOMER_PRIVACY_REQUEST'
  | 'CUSTOMER_APPOINTMENT_CHANGE_ACCEPTED';

export type StrictAdminEventType =
  | 'ADMIN_BOOKING_CREATED'
  | 'ADMIN_QUOTE_GENERATED'
  | 'ADMIN_CALENDAR_HOLD_CREATED'
  | 'ADMIN_PAYMENT_VERIFIED'
  | 'ADMIN_PAYMENT_REJECTED'
  | 'ADMIN_INVOICE_ISSUED'
  | 'ADMIN_CRM_TASK_CREATED'
  | 'ADMIN_SUPPORT_CASE_CREATED'
  | 'ADMIN_ARTIST_ASSIGNED'
  | 'ADMIN_INVENTORY_ADJUSTED';

export type ActorType = 'CUSTOMER' | 'ADMIN' | 'SYSTEM' | 'AI';

export interface ActionOriginRecord {
  recordId: string;
  eventType: StrictCustomerEventType | StrictAdminEventType;
  actorType: ActorType;
  actorId: string;
  actorRole: string;
  customerUid: string;
  timestamp: string;
  payloadHash?: string;
  isCustomerOriginated: boolean;
}

const actionOriginStore: ActionOriginRecord[] = [];

/**
 * Validates and records event origin, blocking admin impersonation of customer-originated events.
 */
export function recordActionOrigin(params: {
  eventType: StrictCustomerEventType | StrictAdminEventType;
  actorType: ActorType;
  actorId: string;
  actorRole: string;
  customerUid: string;
  payloadHash?: string;
}): { success: boolean; record?: ActionOriginRecord; error?: string } {
  const isCustomerEvent = [
    'CUSTOMER_QUESTIONNAIRE_SUBMITTED',
    'CUSTOMER_CONSULTATION_APPROVED',
    'MEDIA_CONSENT_GRANTED',
    'MEDIA_CONSENT_REVOKED',
    'SERVICE_AGREEMENT_ACCEPTED',
    'PAYMENT_PROOF_UPLOADED',
    'CUSTOMER_REVIEW_SUBMITTED',
    'CUSTOMER_COMMUNICATION_OPT_OUT',
    'CUSTOMER_PRIVACY_REQUEST',
    'CUSTOMER_APPOINTMENT_CHANGE_ACCEPTED',
  ].includes(params.eventType);

  // TRUST BOUNDARY GUARD: Admin cannot perform or fabricate customer-originated events as 'CUSTOMER'
  if (isCustomerEvent && params.actorType === 'ADMIN') {
    return {
      success: false,
      error: `TRUST_BOUNDARY_VIOLATION: Admin '${params.actorId}' cannot fabricate customer event '${params.eventType}' as actorType CUSTOMER. Admin actions must use admin event types with actorType ADMIN.`,
    };
  }

  // Ensure Customer events carry valid customer UID
  if (isCustomerEvent && params.actorType === 'CUSTOMER' && params.actorId !== params.customerUid) {
    return {
      success: false,
      error: `IDENTITY_MISMATCH: Customer actorId '${params.actorId}' does not match target customerUid '${params.customerUid}'.`,
    };
  }

  const recordId = `aorig_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const record: ActionOriginRecord = {
    recordId,
    eventType: params.eventType,
    actorType: params.actorType,
    actorId: params.actorId,
    actorRole: params.actorRole,
    customerUid: params.customerUid,
    timestamp: new Date().toISOString(),
    payloadHash: params.payloadHash,
    isCustomerOriginated: isCustomerEvent,
  };

  actionOriginStore.push(record);
  return { success: true, record };
}

export function getActionOriginsByCustomer(customerUid: string): ActionOriginRecord[] {
  return actionOriginStore.filter(r => r.customerUid === customerUid);
}

export function getActionOriginRecord(recordId: string): ActionOriginRecord | undefined {
  return actionOriginStore.find(r => r.recordId === recordId);
}
