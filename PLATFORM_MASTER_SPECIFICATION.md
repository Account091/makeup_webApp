# Makeovers by Prachi — Master Platform Specification
## Enterprise Architecture, Operational State Machines, Security Guardrails & Implementation Roadmap

> **Document Version**: 11.0 (Enterprise Hardened & Compliance Edition)  
> **Brand**: Makeovers by Prachi  
> **Domain**: Luxury Rajputi Bridal, Heritage Destination Weddings, Multi-City Artistry & Multi-Tenant Studio Marketplace  
> **Core Platforms**: Customer Web (Next.js 14 App Router), Operations & Command Center (Flutter 3.x Multi-Platform), Serverless Cloud Microservices (Firebase Cloud Functions v1/v2, Cloud Firestore, Cloud Storage, Meta WhatsApp Cloud API, AI Gateway).

---

## 1. Executive Summary & Brand Identity

### 1.1 Brand Philosophy
**Makeovers by Prachi** is an ultra-luxury bridal artistry house headquartered in Rajasthan, with permanent operations across **Jodhpur**, **Jaipur**, **Udaipur**, and major Indian palace destinations (Jaisalmer, Kumbhalgarh, Pushkar, Bikaner). The platform bridges centuries-old royal Rajputi styling (poshak draping, aad & maang tikka architecture, humidity-proof royal banquet makeup) with modern enterprise operations technology.

### 1.2 Luxury Color Palette & Accessibility Tokens
To ensure visual luxury while strictly complying with **WCAG AA contrast standards (minimum 4.5:1 for normal text, 3:1 for UI components)**:

| Token Name | Hex Code | Contrast on Light Background | Contrast on Dark Background | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Plum** | `#2A0845` | **13.5:1** (Pass AAA) | N/A (Is Dark) | Primary brand color, headers, desktop sidebar, dark hero sections. |
| **Royal Gold** | `#D4AF37` | ~2.1:1 (*Fails text on light*) | **8.2:1** (Pass AAA) | Borders, glowing badges, accent icons on Deep Plum surfaces. |
| **Antique Bronze** | `#8C6D23` | **4.6:1** (Pass AA) | ~4.5:1 (Pass AA) | **Text on Light Surfaces**: Used wherever golden text appears on Champagne. |
| **Dark Royal Umber** | `#4A3710` | **9.1:1** (Pass AAA) | N/A | Subheadings, data labels, and high-density forms on Champagne. |
| **Champagne Cream** | `#FDFBF7` | N/A (Is Light) | **13.5:1** (Pass AAA) | Primary page background; avoids sterile cold hospital whites. |
| **Soft Silk Rose** | `#E8D3C7` | N/A (Is Light) | **9.8:1** (Pass AAA) | Card backgrounds, table header accents, divider lines. |

---

## 2. Master System Architecture & Single Source of Truth

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       USER ACCESS TIERS                                          │
├──────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ Customer Web & Marketplace (Next.js 14)          │ Flutter Command Center (Desktop & Mobile)     │
│ • Brides, Destination Planners, Guests           │ • Prachi (Head Artist), Coordinators, Artists │
│ • Next.js App Router (Node.js SSR + Client)      │ • Multi-Platform: Windows, macOS, Android, iOS│
└─────────────────────────┬────────────────────────┴───────────────────────────────┬───────────────┘
                          │                                                         │
                          │ HTTPS REST / Server Actions                             │ Cloud Firestore SDK
                          ▼                                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SECURITY GATEWAY & ACCESS CONTROL                                │
│  • Firebase App Check (reCAPTCHA Enterprise & Play Integrity token enforcement)                  │
│  • Cloudflare Edge Rate Limiting (DDoS & Calendar Locking Bot mitigation)                        │
│  • OTP Authentication Engine (SMS / WhatsApp OTP verification before PII disclosure)             │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             AUTHORITATIVE BUSINESS LOGIC TIER                                    │
│  • Firebase Cloud Functions (asia-south1, Mumbai region)                                         │
│  • Domain-Separated Microservices: Booking, Payments, CRM, Logistics, Safety, Marketplace        │
│  • Single Write Authority: Clients CANNOT write directly to /bookings or financial ledgers       │
└─────────────────────────┬────────────────────────────────────────────────────────┬───────────────┘
                          │                                                         │
                          ▼                                                         ▼
┌──────────────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│           CLOUD STORAGE & FIRESTORE DB           │     │            EXTERNAL SERVICES            │
│ • Cloud Firestore (30+ collections, PITR enabled)│     │ • Licensed Gateway (Razorpay/Cashfree)  │
│ • Google Cloud Storage (Encrypted at rest)       │     │ • Razorpay Route (RBI Split Payments)   │
│ • BigQuery Continuous Export (Immutable Audit)   │     │ • Meta WhatsApp Cloud API               │
│ • Cloud KMS Managed Encryption Keys              │     │ • Hugging Face Dedicated AI Inference   │
└──────────────────────────────────────────────────┘     └─────────────────────────────────────────┘
```

---

## 3. End-to-End Booking Lifecycle State Machine

To eliminate state ambiguity across customer tracking, admin queues, and financial records, all bookings adhere to the following **Authoritative Finite State Machine (FSM)**:

```
                  ┌────────────────────────┐
                  │ 1. INQUIRY_RECEIVED    │ (Bride submits form via Web / Wizard)
                  └───────────┬────────────┘
                              │ Server generates authoritative quotation
                              ▼
                  ┌────────────────────────┐
                  │ 2. QUOTE_DISPATCHED    │ (Sent via WhatsApp & SMS with secure link)
                  └───────────┬────────────┘
                              │ Bride verifies Phone OTP & initiates date hold
                              ▼
                  ┌────────────────────────┐
                  │ 3. TEMPORARY_HOLD      │ (15-min capacity lock per Date+Slot+Artist)
                  └───────────┬────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
     (15-min timer expires)       (Payment initiated via Gateway / RTGS)
                 ▼                         ▼
        ┌─────────────────┐       ┌────────────────────────┐
        │  HOLD_EXPIRED   │       │ 4. PAYMENT_PROCESSING  │ (Webhook verification pending)
        └─────────────────┘       └───────────┬────────────┘
                                              │
                                 ┌────────────┴────────────┐
                                 │                         │
                        (Signature fails)         (Gateway Webhook Verified)
                                 ▼                         ▼
                        ┌─────────────────┐       ┌────────────────────────┐
                        │ PAYMENT_FAILED  │       │ 5. CONFIRMED           │ (Slot permanently locked)
                        └─────────────────┘       └───────────┬────────────┘
                                                              │
                                                              ├─────────────────────────────┐
                                                              │ Auto-generates Tax Invoice   │ WhatsApp confirmation sent
                                                              ▼                             ▼
                                                  ┌────────────────────────┐
                                                  │ 6. ARTIST_ASSIGNED     │ (Lead makeup, hair & draping staff)
                                                  └───────────┬────────────┘
                                                              │ Pre-wedding trial / digital look formulation
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │ 7. CONSULTATION_DONE   │ (Patch test & media consent logged)
                                                  └───────────┬────────────┘
                                                              │ Wedding day arrives (T-0)
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │ 8. EVENT_DAY_ACTIVE    │ (SOP checklist & milestone tracking)
                                                  └───────────┬────────────┘
                                                              │ Final poshak draping & touch-up complete
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │ 9. COMPLETED           │ (Triggers feedback survey & loyalty)
                                                  └────────────────────────┘
```

### 3.1 Exception & Reschedule States
* **`RESCHEDULE_REQUESTED`**: Triggered when a bride requests a date change. Original slot remains locked until admin approves the new date transfer.
* **`CANCELLED_REFUND_PENDING`**: Triggered upon authorized cancellation. Calculates refund amount based on contractual cancellation window.
* **`REFUNDED`**: Terminal state after refund disbursement via payment gateway.

---

## 4. Role-Based Access Control (RBAC) Matrix

Every authenticated session carries custom claims structured as:
```json
{
  "role": "owner | admin | coordinator | artist | accountant | tenant_owner | client",
  "orgId": "org_prachi_core | org_tenant_123",
  "artistId": "art_101",
  "permissions": ["READ_BOOKINGS", "APPROVE_PAYMENTS", "LOCK_PERIODS"]
}
```

| Role | Bookings Collection | Financial Ledgers & Taxes | Event-Day Checklist | Assign Artists | AI Safety Gate | Tenant Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Owner (Prachi)** | Full Read/Write | Full Read/Write | Full Read/Write | Full Authority | Final Approver | Global (`*`) |
| **Admin** | Full Read/Write | Read / Draft | Full Read/Write | Full Authority | Approver | Own `orgId` |
| **Studio Coordinator** | Read / Create / Reschedule | No Access | View Only | Assign Drafts | No Access | Own `orgId` |
| **Accountant** | Read Only | Full Read/Write/Lock | No Access | No Access | View Audit | Own `orgId` |
| **Team Artist** | View Assigned Only | View Own Payouts | Check-off SOP Items | No Access | No Access | Own Profile |
| **Tenant Studio Owner** | Manage Tenant Bookings | View Tenant Payouts | Manage Tenant SOPs | Manage Own Team| No Access | Isolated `orgId` |
| **Client (Bride)** | View Own Booking (OTP) | View Own Invoices | View Live Status | No Access | No Access | Own UID Only |

---

## 5. Payment Architecture & Regulatory Compliance

### 5.1 Payment Rails & Transaction Routing
To eliminate fraudulent edited screenshots, fake UTR submissions, and UPI ₹1,00,000 transaction caps:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                PAYMENT INGESTION ENGINE                                │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│ Tier 1: Retail & Advances (≤ ₹1,00,000)│ Tier 2: Luxury Balances (> ₹1,00,000)         │
│ • Licensed Payment Gateway (Razorpay/  │ • Dedicated Virtual Bank Account (Smart Collect)│
│   Cashfree PG) via Webhooks            │ • Direct NEFT / RTGS / IMPS wire transfer     │
│ • Instant UPI Auto-Intent, Cards, NetB │ • Real-time bank webhook reconciliation       │
├────────────────────────────────────────┴───────────────────────────────────────────────┤
│ Tier 3: Marketplace Tenant Payouts                                                     │
│ • Handled strictly via RBI-compliant licensed split payment (e.g., Razorpay Route)    │
│ • No unlicensed pooling of third-party funds in studio accounts                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Deterministic Financial Rules
1. **Integer Arithmetic**: All monetary values are strictly stored and computed as **integer paise** (e.g., ₹25,000 is stored as `2500000`). Floating-point arithmetic is prohibited.
2. **Advance Tax Compliance (GST)**: Advance deposits trigger a formal **GST Receipt Voucher** with mandatory 18% Cosmetic Salon Tax attribution (9% CGST + 9% SGST for Rajasthan; 18% IGST for interstate destination weddings).
3. **Cash Limitation (Income Tax Act Section 269ST)**: Cash payments of ₹2,00,000 or more for a single event are strictly rejected by the financial ledger. Any cash transactions above ₹50,000 require client PAN collection.
4. **Period Locking**: Accounting periods (calendar months) are cryptographically locked using Cloud Functions Admin SDK. Once locked, documents in `/payments` and `/invoices` cannot be modified; any adjustments must be recorded as distinct debit/credit records in `/adjustments`.

---

## 6. Privacy, Security & Anti-Abuse Specifications

### 6.1 Customer Tracking & PII Protection (`/track`)
* **Elimination of Enumeration Leaks**: Querying booking details using raw phone numbers or sequential IDs is completely decommissioned.
* **OTP Verification**: A user visiting `/track` enters their phone number and receives a 6-digit WhatsApp/SMS OTP. Only upon successful verification does the backend return booking metadata.
* **Cryptographically Unguessable IDs**: Booking references use random alphanumeric identifiers (e.g., `MBP-2026-7K8W`) generated via secure entropy, preventing brute-force ID scraping.

### 6.2 Calendar Locking Bot Protection
* **Per-Slot Granular Locks**: Instead of a single document hotspot `/availability/{date}`, capacity is locked at `/availability/{date}/slots/{slotId}`.
* **Pre-Lock Verification**: Before a client can reserve a 15-minute hold on an auspicious date, they must pass **reCAPTCHA Enterprise** and authenticate their mobile number.
* **Automated TTL**: All holds carry an `expiresAtMs` timestamp. A scheduled Cloud Function automatically releases expired holds every 60 seconds.

### 6.3 DPDP (Digital Personal Data Protection) Compliance
* **Bridal Skin & Face Image Processing**: Before any customer photo is submitted to the AI Concierge or stored in the database, the bride must explicitly review and accept the **DPDP Notice**:
  * *Purpose*: Real-time makeup undertone analysis only.
  * *Processor*: Dedicated enterprise inference endpoint (data not used for foundation model training).
  * *Retention*: Automatically purged from temporary cache within 24 hours.
* **Media Consent Management**: Wedding event photos default to **Private (No Public Posting)**. The studio cannot publish photos to Instagram or the website unless the bride signs a verified digital consent waiver.

---

## 7. Operational Realities of Rajasthani Weddings

### 7.1 Auspicious Dates ("Abujh Sawa") & Capacity Management
In Rajasthan, peak wedding volume is concentrated around **Abujh Sawa** dates (अबूझ सावा — auspicious days requiring no astrological calculation, such as *Akshaya Tritiya*, *Dev Uthani Gyaras*, *Basant Panchami*).
* **Dynamic Capacity Model**: On Abujh Sawa dates, the studio deploys three distinct teams (Lead Bridal Team, Senior Hair & Makeup Team, and Family Draping Convoy).
* **Multi-Function Scheduling**: Bookings support linked multi-day functions:
  1. *Mehendi & Sangeet Glam* (Afternoon / Evening)
  2. *Haldi & Chuda Ceremony* (Morning Dewy Finish)
  3. *Royal Wedding & Pheras* (Supporting both Evening Sunset and Late Night Muhurat slots: 10:00 PM – 4:00 AM)
  4. *Royal Reception* (High Glam / Sculpted look)

### 7.2 Emergency Artist Continuity & No-Show Protocol
To safeguard high-ticket weddings against artist illness, transit delays, or emergencies:
* **T-14 Day Checkpoint**: Automated confirmation of artist team allocation and travel tickets.
* **T-48 Hour Checkpoint**: Artist health check and kit inventory confirmation.
* **Standby Artist Pool**: For any tier-1 destination wedding, an on-call senior backup artist is designated in the geographic hub (Jodhpur/Jaipur). If the primary artist does not check in by T-4 hours, the coordinator receives an escalated alert with one-click standby dispatch.

### 7.3 Offline-First Event-Day Mode
Heritage forts (Mehrangarh, Kumbhalgarh) and palace basements frequently have zero mobile network connectivity:
* **Local Storage Queue**: The Flutter Event-Day screen caches the wedding day roster and checklist in local SQLite / Hive storage upon loading.
* **Offline Check-offs**: Artists check off SOP milestones (Skin Prep, Airbrush Base, Dupatta Draping) locally with client device timestamps.
* **Automatic Sync**: When connectivity is re-established, the queue automatically syncs with Firestore using conflict-free timestamp ordering.

---

## 8. Calibrated Customer Intelligence & Lead Scoring

### 8.1 Lead Quality Scoring Calibration
The lead scoring algorithm (Cloud Function `calculateLeadScore`) operates on a **100-Point Objective Scale** evaluating customer intent rather than staff speed:

| Signal Category | Evaluation Criteria | Maximum Points |
| :--- | :--- | :--- |
| **Wedding Format** | Destination Palace / Multi-Day Event | **30 Points** |
| **Scope of Work** | Full Package (Bride + Groom + Family Draping) | **25 Points** |
| **Date Alignment** | High-demand peak season / Abujh Sawa date | **20 Points** |
| **Communication Intent** | Prompt WhatsApp reply, venue location confirmed | **15 Points** |
| **Budget Alignment** | Package preference matches signature luxury tier | **10 Points** |
| **Total Available** | | **100 Points** |

* **Tier Classification**:
  * **Green Tier (High Intent)**: **75 – 100 Points** (Auto-assigned senior bridal coordinator; high priority).
  * **Amber Tier (Moderate Intent)**: **50 – 74 Points** (Automated WhatsApp lookbook & standard follow-up queue).
  * **Blue Tier (Low Intent / Casual)**: **< 50 Points** (General catalog dispatch).

### 8.2 Bridal Network Lifetime Value (LTV)
Traditional ecommerce churn models do not apply to brides. Instead, the platform tracks **Bridal Network LTV**:
* **Family Tree Bookings**: Cross-referencing bookings for sisters, cousins, and sisters-in-law.
* **Lifecycle Events**: Maternity glam, baby shower, 1st anniversary photoshoot, and Diwali/Karwa Chauth royal styling.
* **Advocacy & Referrals**: Brides earn referral rewards when a newly engaged friend completes a booking.

---

## 9. AI Gateway Architecture & Safety Guardrails

### 9.1 Model Selection & Purpose-Fit Routing
To ensure contextual, brand-aligned beauty consultation without using code-generation models for conversation:

| Feature Role | Primary Model | Fallback Model | Processing Type |
| :--- | :--- | :--- | :--- |
| **AI Beauty Concierge** | `Qwen/Qwen2.5-72B-Instruct` | `meta-llama/Llama-3.3-70B-Instruct` | Text & Tone Styling |
| **Multimodal Skin/Outfit Analysis**| `Qwen/Qwen2-VL-7B-Instruct` | `Qwen2-VL-7B-Instruct` | Computer Vision |
| **WhatsApp Chat Assistant** | `Qwen/Qwen2.5-72B-Instruct` | `meta-llama/Llama-3.3-70B-Instruct` | Multi-turn Support Chat |
| **Social Content Drafter** | `meta-llama/Llama-3.3-70B-Instruct` | `Qwen2.5-72B-Instruct` | Copywriting & Captions |

### 9.2 Human-in-the-Loop Approval Cryptographic Binding
Any AI tool execution that recommends mutating database state (e.g., drafting a refund or creating an adjustment) creates an immutable record in `/aiToolCalls`:
1. **Proposal SHA-256 Hash**: The proposal payload is hashed (`hash = sha256(action + params + timestamp)`).
2. **Staff Approval Signature**: Staff must review the exact visual diff in the `AdminAiSafetyScreen`. Approval submits `approvedHash: hash` along with staff UID. If the proposal was altered in transit, the hash fails and execution is aborted.
3. **Dual Authorization for High-Value Operations**: Any financial adjustment or refund exceeding ₹10,000 requires independent approvals from two distinct authorized accounts (e.g., Coordinator + Owner).

---

## 10. Phased Implementation Roadmap

To maintain engineering discipline and prevent feature bloat:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PHASED EXECUTION ROADMAP                                 │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ PHASE 1: NOW       │ • Licensed payment gateway integration (Razorpay/Cashfree PG)     │
│ (Core Hardening)   │ • Eliminate manual UTR screenshot vulnerability & close client    │
│                    │   direct-write path in firestore.rules                            │
│                    │ • Secure /track page with Phone OTP authentication               │
│                    │ • WCAG AA contrast compliance (Antique Bronze on Champagne)       │
│                    │ • Granular per-slot date locking & automated TTL cleanup          │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ PHASE 2: NEXT      │ • Single authoritative booking state machine transition engine    │
│ (Operations & DPDP)│ • RBAC matrix enforcement with tenant orgId isolation             │
│                    │ • Emergency artist continuity & standby backup workflows          │
│                    │ • DPDP consent notices and AI image retention auto-purges         │
│                    │ • Firestore PITR backups and external uptime monitoring           │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ PHASE 3: THEN      │ • Offline-first Event-Day Mode with local queue synchronization   │
│ (Scale & Multi-Hub)│ • Multi-city destination wedding hubs (Jaisalmer, Kumbhalgarh)   │
│                    │ • Licensed split payments (Razorpay Route) for marketplace        │
│                    │ • Full-text multi-lingual search (Hindi / Rajasthani phrasing)    │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ PHASE 4: DEFER     │ • Complex standalone beauty ecommerce inventory & returns         │
│ (Post-Scale)       │ • Algorithmic salon recurrence churn models                       │
│                    │ • Multi-tier consumer loyalty point redemption programs           │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 11. Verification & Compliance Sign-Off

* **Security Posture**: Server-authoritative APIs with Firebase App Check; raw client writes to `/bookings` and financial ledgers disabled.
* **Accessibility**: Contrast compliance verified with WCAG AA standard (Antique Bronze `#8C6D23` and Dark Umber `#4A3710` replacing low-contrast gold on light surfaces).
* **Data Privacy**: DPDP purpose-limited consent verified; customer tracking enumeration blocked via phone OTP.
* **Financial Integrity**: Integer paise storage, GST 18% salon tax compliance, Section 269ST cash enforcement, and immutable period locking.

*This specification is the authoritative, binding architectural blueprint for Makeovers by Prachi.*
