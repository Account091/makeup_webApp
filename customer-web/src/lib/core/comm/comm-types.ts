/**
 * V10.5 Unified Omnichannel Communication & Customer Engagement Types
 */

export type CommChannel =
  | 'WHATSAPP'
  | 'EMAIL'
  | 'FCM'
  | 'PORTAL'
  | 'SMS'
  | 'MARKETPLACE_CHAT'
  | 'ADMIN_INTERNAL';

export type CommMessageType =
  | 'TRANSACTIONAL'
  | 'SERVICE'
  | 'REMINDER'
  | 'MARKETING'
  | 'SUPPORT'
  | 'SECURITY'
  | 'SYSTEM';

export type CommPurpose =
  | 'BOOKING_CONFIRMATION'
  | 'PAYMENT_REMINDER'
  | 'APPOINTMENT_REMINDER'
  | 'DOCUMENT_READY'
  | 'INVOICE_READY'
  | 'REVIEW_REQUEST'
  | 'MARKETING_PROMOTION'
  | 'SUPPORT_RESPONSE'
  | 'SECURITY_ALERT';

export type CommMessageStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'CANCELLED';

export type CommPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface CommunicationProfile {
  customerId: string;
  organizationId: string;
  preferredChannel: CommChannel;
  allowedChannels: CommChannel[];
  transactionalPreferences: { enabled: boolean };
  marketingPreferences: { enabled: boolean };
  quietHoursActive: boolean;
  timezone: string;
}

export interface CommunicationMessage {
  messageId: string;
  customerId: string;
  organizationId: string;
  channel: CommChannel;
  messageType: CommMessageType;
  purpose: CommPurpose;
  executionKey: string; // Deterministic send key for idempotency
  body: string;
  internalNoteOnly?: boolean;
  status: CommMessageStatus;
  priority: CommPriority;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
}

export interface CommunicationThread {
  threadId: string;
  customerId: string;
  organizationId: string;
  channel: CommChannel;
  status: 'OPEN' | 'WAITING_FOR_CUSTOMER' | 'WAITING_FOR_TEAM' | 'RESOLVED';
  assignedTo?: string;
  automatedTurnsCount: number;
  lastMessageAt: string;
}

export interface HandoffEscalation {
  escalationId: string;
  threadId: string;
  customerId: string;
  reason: 'CUSTOMER_REQUESTED_HUMAN' | 'AI_UNCERTAINTY' | 'PAYMENT_DISPUTE' | 'COMPLAINT';
  status: 'PENDING' | 'ASSIGNED' | 'RESOLVED';
  createdAt: string;
}
