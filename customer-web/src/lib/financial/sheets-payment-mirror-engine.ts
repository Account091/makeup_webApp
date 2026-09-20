/**
 * Google Sheets Dual-Sheet Payment Mirror Engine (Payments & PaymentEvents)
 * 
 * CORE RULES:
 * 1. Firestore is the SINGLE SOURCE OF TRUTH. Sheets is a secondary operational mirror.
 * 2. Mirrors at BOTH stages: (A) Session / QR display start, (B) Screenshot proof upload & AI analysis, (C) Admin verification.
 * 3. Never use event 'QR_SCANNED' for static UPI QR codes. Use 'PAYMENT_SESSION_STARTED' & 'QR_DISPLAYED'.
 * 4. Maintain 2 Sheets: 'Payments' (evolving row state) and 'PaymentEvents' (append-only event log).
 * 5. Server-side dispatch only. If Sheets fails/times out, Firestore operation succeeds; event queued for DLQ retry.
 */

export const GOOGLE_SHEETS_SCRIPT_URL =
  process.env.GOOGLE_SHEETS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyALFEurJX9pskfoAvnK-BZVuwMNueV4RcsEAJRZ6wZMP5q9BrU_tD0Vd_OF77BvkM1/exec";

export type PaymentEventType =
  | 'PAYMENT_SESSION_STARTED'
  | 'QR_DISPLAYED'
  | 'PROOF_SUBMITTED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'SERVER_VALIDATION_COMPLETED'
  | 'ADMIN_VERIFIED'
  | 'ADMIN_REJECTED'
  | 'BOOKING_CONFIRMED'
  | 'CALENDAR_LOCKED';

export interface PaymentSheetRecord {
  paymentSessionId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  organizationId: string;
  serviceId: string;
  serviceName: string;
  location: string;
  venue?: string;
  city?: string;
  packageName?: string;
  totalAmount?: number;
  remainingBalance?: number;
  guestCount?: number;
  eventDate: string;
  eventTime: string;
  bookingStatus: string;
  requiredDeposit: number;
  currency: string;
  upiVpa: string;
  paymentMethod: string;
  qrType: string;
  paymentSessionCreatedAt: string;
  paymentSessionExpiresAt: string;
  paymentSessionStatus: string;
  // Stage 2: Proof & AI
  proofSubmittedAt?: string;
  proofFileReference?: string;
  proofFileName?: string;
  aiStatus?: string;
  aiAmount?: number;
  aiUtr?: string;
  aiPayee?: string;
  aiTransactionDate?: string;
  aiTransactionTime?: string;
  aiConfidence?: number;
  serverAmountCheck?: boolean;
  serverUtrCheck?: boolean;
  serverPayeeCheck?: boolean;
  serverExpiryCheck?: boolean;
  verificationStatus?: string;
  // Stage 3: Admin & Locking
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  bookingConfirmedAt?: string;
  calendarLockedAt?: string;
}

export interface PaymentEventLogItem {
  eventId: string;
  paymentSessionId: string;
  bookingId: string;
  customerId: string;
  organizationId: string;
  eventType: PaymentEventType;
  eventTimestamp: string;
  requestId: string;
  correlationId: string;
  paymentAmount: number;
  currency: string;
  proofReference?: string;
  aiResultReference?: string;
  actorType: 'CUSTOMER' | 'SYSTEM' | 'AI' | 'ADMIN';
  actorId: string;
  status: string;
}

const mirrorPendingRetryQueue: Array<{ sheet: string; payload: any; error: string }> = [];

/**
 * Helper to dispatch mirror payload to Google Sheets Apps Script Webhook safely.
 */
async function dispatchToGoogleSheets(sheetTarget: 'Payments' | 'PaymentEvents', payload: any): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetSheet: sheetTarget,
        payload,
      }),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);
    if (!res.ok || (data && data.success === false)) {
      const errMsg = data?.error || `HTTP ${res.status}`;
      console.warn(`[Sheets Mirror] Google Apps Script notice on '${sheetTarget}': ${errMsg}. Firestore remains authoritative.`);
      mirrorPendingRetryQueue.push({ sheet: sheetTarget, payload, error: errMsg });
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn(`[Sheets Mirror] Network notice dispatching to '${sheetTarget}':`, err?.message || err);
    mirrorPendingRetryQueue.push({ sheet: sheetTarget, payload, error: err?.message || 'Network Timeout' });
    return false;
  }
}

/**
 * Stage 1: Mirror QR / Payment Session Creation.
 * Dispatches both PAYMENT_SESSION_STARTED & QR_DISPLAYED events.
 */
export async function mirrorPaymentSessionStarted(params: {
  sessionRecord: PaymentSheetRecord;
  requestId?: string;
}): Promise<{ success: boolean }> {
  const reqId = params.requestId || `req_${Date.now()}`;

  // 1. Update Main 'Payments' Sheet Row
  const paymentsSuccess = await dispatchToGoogleSheets('Payments', params.sessionRecord);

  // 2. Append to 'PaymentEvents' History Sheet (PAYMENT_SESSION_STARTED)
  const eventStarted: PaymentEventLogItem = {
    eventId: `evt_${Date.now()}_start`,
    paymentSessionId: params.sessionRecord.paymentSessionId,
    bookingId: params.sessionRecord.bookingId,
    customerId: params.sessionRecord.customerId,
    organizationId: params.sessionRecord.organizationId,
    eventType: 'PAYMENT_SESSION_STARTED',
    eventTimestamp: params.sessionRecord.paymentSessionCreatedAt,
    requestId: reqId,
    correlationId: `corr_${params.sessionRecord.bookingId}`,
    paymentAmount: params.sessionRecord.requiredDeposit,
    currency: params.sessionRecord.currency,
    actorType: 'CUSTOMER',
    actorId: params.sessionRecord.customerId,
    status: 'PAYMENT_SESSION_STARTED',
  };
  await dispatchToGoogleSheets('PaymentEvents', eventStarted);

  // 3. Append QR_DISPLAYED Event
  const eventQrDisplayed: PaymentEventLogItem = {
    ...eventStarted,
    eventId: `evt_${Date.now()}_qr`,
    eventType: 'QR_DISPLAYED',
    status: 'QR_DISPLAYED',
  };
  await dispatchToGoogleSheets('PaymentEvents', eventQrDisplayed);

  return { success: paymentsSuccess };
}

/**
 * Stage 2: Mirror Payment Proof Upload & AI Analysis.
 * Dispatches PROOF_SUBMITTED & AI_ANALYSIS_COMPLETED events.
 */
export async function mirrorPaymentProofSubmitted(params: {
  sessionRecord: PaymentSheetRecord;
  proofFileRef: string;
  aiResultRef: string;
  requestId?: string;
}): Promise<{ success: boolean }> {
  const reqId = params.requestId || `req_${Date.now()}`;

  // 1. Update Main 'Payments' Sheet Row
  const paymentsSuccess = await dispatchToGoogleSheets('Payments', params.sessionRecord);

  // 2. Append PROOF_SUBMITTED Event to 'PaymentEvents'
  const eventProof: PaymentEventLogItem = {
    eventId: `evt_${Date.now()}_proof`,
    paymentSessionId: params.sessionRecord.paymentSessionId,
    bookingId: params.sessionRecord.bookingId,
    customerId: params.sessionRecord.customerId,
    organizationId: params.sessionRecord.organizationId,
    eventType: 'PROOF_SUBMITTED',
    eventTimestamp: params.sessionRecord.proofSubmittedAt || new Date().toISOString(),
    requestId: reqId,
    correlationId: `corr_${params.sessionRecord.bookingId}`,
    paymentAmount: params.sessionRecord.requiredDeposit,
    currency: params.sessionRecord.currency,
    proofReference: params.proofFileRef,
    actorType: 'CUSTOMER',
    actorId: params.sessionRecord.customerId,
    status: 'PROOF_SUBMITTED',
  };
  await dispatchToGoogleSheets('PaymentEvents', eventProof);

  // 3. Append AI_ANALYSIS_COMPLETED Event
  const eventAi: PaymentEventLogItem = {
    ...eventProof,
    eventId: `evt_${Date.now()}_ai`,
    eventType: 'AI_ANALYSIS_COMPLETED',
    aiResultReference: params.aiResultRef,
    actorType: 'AI',
    actorId: 'HUGGINGFACE_VISION_AI',
    status: 'AI_ANALYSIS_COMPLETED',
  };
  await dispatchToGoogleSheets('PaymentEvents', eventAi);

  return { success: paymentsSuccess };
}

/**
 * Stage 3: Mirror Admin Verification & Calendar Lock.
 * Dispatches ADMIN_VERIFIED / REJECTED, BOOKING_CONFIRMED, and CALENDAR_LOCKED events.
 */
export async function mirrorAdminVerificationEvent(params: {
  sessionRecord: PaymentSheetRecord;
  approved: boolean;
  adminUid: string;
  requestId?: string;
}): Promise<{ success: boolean }> {
  const reqId = params.requestId || `req_${Date.now()}`;

  // 1. Update Main 'Payments' Sheet Row
  const paymentsSuccess = await dispatchToGoogleSheets('Payments', params.sessionRecord);

  const eventType: PaymentEventType = params.approved ? 'ADMIN_VERIFIED' : 'ADMIN_REJECTED';
  const eventAdmin: PaymentEventLogItem = {
    eventId: `evt_${Date.now()}_admin`,
    paymentSessionId: params.sessionRecord.paymentSessionId,
    bookingId: params.sessionRecord.bookingId,
    customerId: params.sessionRecord.customerId,
    organizationId: params.sessionRecord.organizationId,
    eventType,
    eventTimestamp: params.sessionRecord.verifiedAt || new Date().toISOString(),
    requestId: reqId,
    correlationId: `corr_${params.sessionRecord.bookingId}`,
    paymentAmount: params.sessionRecord.requiredDeposit,
    currency: params.sessionRecord.currency,
    actorType: 'ADMIN',
    actorId: params.adminUid,
    status: eventType,
  };
  await dispatchToGoogleSheets('PaymentEvents', eventAdmin);

  if (params.approved) {
    // Append BOOKING_CONFIRMED and CALENDAR_LOCKED events
    const eventConfirmed: PaymentEventLogItem = {
      ...eventAdmin,
      eventId: `evt_${Date.now()}_confirmed`,
      eventType: 'BOOKING_CONFIRMED',
      status: 'BOOKING_CONFIRMED',
    };
    await dispatchToGoogleSheets('PaymentEvents', eventConfirmed);

    const eventLocked: PaymentEventLogItem = {
      ...eventAdmin,
      eventId: `evt_${Date.now()}_locked`,
      eventType: 'CALENDAR_LOCKED',
      status: 'CALENDAR_LOCKED',
    };
    await dispatchToGoogleSheets('PaymentEvents', eventLocked);
  }

  return { success: paymentsSuccess };
}

export function getMirrorRetryQueue() {
  return [...mirrorPendingRetryQueue];
}
