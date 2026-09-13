# Operations Runbook

## V9.0 — Reliability, Security & Observability

This runbook provides structured incident detection, containment, and recovery procedures for all critical operational scenarios.

---

## General Incident Workflow

Every incident follows: **Detect → Contain → Verify → Recover → Reconcile → Close**

---

## 1. Payment Verification Failure

**Detect**: Payment proof uploaded but AI analysis returns error or timeout.
**Contain**: Payment remains in `PENDING` state. Do NOT auto-reject or auto-approve.
**Verify**: Check `failedEvents` DLQ for event type `PAYMENT_VERIFICATION`. Check AI observability metrics for HuggingFace failures.
**Recover**: If AI is unavailable, flag for `MANUAL_REVIEW`. Admin verifies proof manually via secure storage URL.
**Reconcile**: Ensure `payments` record matches `bookings` state. Verify no duplicate `commissions` created.
**Close**: Update incident status to `RESOLVED`. Log audit event.

---

## 2. WhatsApp Outage

**Detect**: `systemAlerts` shows `DEPENDENCY_DOWN` for WhatsApp or `failedEvents` accumulate for `WHATSAPP_NOTIFICATION`.
**Contain**: Feature kill switch `whatsappEnabled = false` prevents new send attempts. Booking flow continues without WhatsApp notifications.
**Verify**: Check Meta Business API status. Verify webhook configuration.
**Recover**: Re-enable kill switch. Process DLQ events with `RETRY_WITH_BACKOFF`.
**Reconcile**: Ensure no duplicate notifications sent on retry.
**Close**: Update dependency status. Log resolution.

---

## 3. Google Sheets Sync Failure

**Detect**: Sheets observability shows `totalFailed > 0` or `PENDING` count increasing. `DEPENDENCY_DEGRADED` alert triggered.
**Contain**: Sheets sync failure does NOT block business operations. Firestore remains authoritative.
**Verify**: Check Google Sheets API quotas and service account permissions.
**Recover**: Retry failed sync events from DLQ. If persistent, manually export and sync.
**Reconcile**: Compare Firestore ledger data with Sheets mirror. Resolve discrepancies from Firestore (source of truth).
**Close**: Verify `totalPending = 0`. Close incident.

---

## 4. AI Service Outage (HuggingFace)

**Detect**: AI observability shows spike in `FAILED` or `RATE_LIMITED` status. Health check shows `UNAVAILABLE`.
**Contain**: `aiEnabled = false` kill switch disables AI features. All business operations continue without AI.
**Verify**: Check HuggingFace API status. Verify `HF_TOKEN` validity and rate limits.
**Recover**: Re-enable AI. Verify budget not exhausted (`AI_FREE_MODE`).
**Reconcile**: No financial data depends on AI. AI is explanation layer only.
**Close**: Confirm AI observability metrics return to normal.

---

## 5. Firestore / Database Issue

**Detect**: Health check returns `UNAVAILABLE` for Firestore. API requests fail with `DEPENDENCY_UNAVAILABLE`.
**Contain**: Application returns maintenance response. No writes attempted during outage.
**Verify**: Check Firebase Console for service status. Check project quotas.
**Recover**: Once Firestore is available, verify data integrity with `validateSystemDataConsistency()`.
**Reconcile**: Run data consistency checks for orphaned records.
**Close**: Confirm all entity relationships are intact.

---

## 6. Firebase Storage Issue

**Detect**: Upload failures or signed URL generation failures. Health check shows Storage `UNAVAILABLE`.
**Contain**: Disable upload-dependent features. Bookings without proof remain in `PENDING`.
**Verify**: Check Firebase Storage Console. Verify security rules and quotas.
**Recover**: Once available, retry failed uploads from DLQ.
**Reconcile**: Verify all payment proofs have matching Firestore records.
**Close**: Confirm upload/download operations functional.

---

## 7. Duplicate Webhook Event

**Detect**: Webhook replay protection returns `isReplay = true`. Event ID found in `processedWebhookEvents`.
**Contain**: Already handled — idempotent return prevents duplicate processing.
**Verify**: Confirm no duplicate business actions were created.
**Recover**: N/A — system already prevents duplicates.
**Reconcile**: If duplicate was processed before replay protection, manually verify and deduplicate.
**Close**: Log security event `INVALID_WEBHOOK_SIGNATURE` if signature mismatch.

---

## 8. Calendar Conflict / Double Booking

**Detect**: Booking creation fails with `CONFLICT` error code. Calendar lock check fails.
**Contain**: Second booking attempt is rejected. First booking retains calendar slot.
**Verify**: Check calendar entries for the artist/date combination.
**Recover**: If legitimate conflict, notify customer of unavailability. Offer alternative dates.
**Reconcile**: Ensure no orphaned payment proofs for rejected bookings.
**Close**: Confirm calendar state is correct.

---

## 9. Tenant Isolation Incident

**Detect**: Security event `TENANT_ACCESS_ATTEMPT` logged. Cross-tenant data access detected.
**Contain**: Request denied with `FORBIDDEN`. Security event logged as `HIGH` severity.
**Verify**: Investigate whether data exposure occurred. Check audit log for the `requestId`.
**Recover**: If data was exposed, create privacy incident. Notify affected organization.
**Reconcile**: Review Firestore security rules. Run tenant isolation regression tests.
**Close**: Confirm rules are enforced. Update verification level.

---

## 10. Data Inconsistency

**Detect**: `validateSystemDataConsistency()` returns orphaned records. Alerts generated.
**Contain**: Orphaned records do not affect active operations but may indicate a past failure.
**Verify**: Trace orphan to originating `requestId` and failed event.
**Recover**: Re-link or clean up orphaned records with admin tools.
**Reconcile**: Re-run consistency checks to confirm resolution.
**Close**: Confirm `orphanCount = 0`.

---

## Severity Definitions

| Severity | Definition | Response Time |
|----------|-----------|---------------|
| **SEV1** | Critical production business operation unavailable | Immediate |
| **SEV2** | Major function degraded, workaround may exist | < 1 hour |
| **SEV3** | Limited feature failure, non-critical | < 4 hours |
| **SEV4** | Minor issue, cosmetic or low-impact | Best effort |
