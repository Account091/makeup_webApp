/**
 * V10.4 Waitlist Matching, Cancellation Recovery & Operational Readiness Engine
 */

import { WaitlistEntry, BookingOperationalReadiness, OperationalReadinessStatus } from './ops-types';

const waitlistStore: WaitlistEntry[] = [];

export function addWaitlistEntry(params: Omit<WaitlistEntry, 'waitlistId' | 'status' | 'createdAt'>): WaitlistEntry {
  const entry: WaitlistEntry = {
    ...params,
    waitlistId: `wait_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'WAITING',
    createdAt: new Date().toISOString(),
  };

  waitlistStore.push(entry);
  return entry;
}

export function matchWaitlistOnCancellation(params: {
  cancelledBookingService: string;
  cancelledBookingDate: string;
  cancelledBookingLocation: string;
  organizationId: string;
}): WaitlistEntry | null {
  // Find matching waitlist entry (same org, service, date, location, status WAITING)
  const candidate = waitlistStore.find(
    w =>
      w.organizationId === params.organizationId &&
      w.service === params.cancelledBookingService &&
      w.preferredDate === params.cancelledBookingDate &&
      w.location === params.cancelledBookingLocation &&
      w.status === 'WAITING'
  );

  if (!candidate) return null;

  candidate.status = 'OFFERED';
  return candidate;
}

export function evaluateBookingOperationalReadiness(params: {
  bookingId: string;
  paymentVerified: boolean;
  calendarLocked: boolean;
  artistAssigned: boolean;
  travelConfirmed: boolean;
  documentsComplete: boolean;
}): BookingOperationalReadiness {
  const missingItems: string[] = [];

  if (!params.paymentVerified) missingItems.push('Payment Verification');
  if (!params.calendarLocked) missingItems.push('Calendar Lock');
  if (!params.artistAssigned) missingItems.push('Artist Assignment');
  if (!params.travelConfirmed) missingItems.push('Travel Confirmation');
  if (!params.documentsComplete) missingItems.push('Client Documents');

  let status: OperationalReadinessStatus = 'READY';
  if (missingItems.length >= 3) {
    status = 'NOT_READY';
  } else if (missingItems.length > 0) {
    status = 'ATTENTION_REQUIRED';
  }

  return {
    bookingId: params.bookingId,
    status,
    paymentVerified: params.paymentVerified,
    calendarLocked: params.calendarLocked,
    artistAssigned: params.artistAssigned,
    travelConfirmed: params.travelConfirmed,
    documentsComplete: params.documentsComplete,
    missingItems,
  };
}

export function getWaitlistEntries(organizationId: string): WaitlistEntry[] {
  return waitlistStore.filter(w => w.organizationId === organizationId);
}
