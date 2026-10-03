# Makeovers by Prachi — Master Product Roadmap & Engineering Estimates
## Feature Prioritization, RICE Scoring, Effort Estimates & Sprint Breakdown

> **Version**: 1.0 (Comprehensive Enterprise Execution Plan)  
> **Prepared For**: Makeovers by Prachi (Executive & Engineering Team)  
> **Scope**: Admin Command Center, Field Operations, Customer Experience, Financial Ledger, and Automation Engine  
> **Scoring Methodology**: RICE Framework (Reach, Impact, Confidence, Effort)

---

## 1. Prioritization Framework & Estimation Legend

### 1.1 T-Shirt Sizing & Engineering Effort
* **Small (S)**: 1–2 Engineering Days (Self-contained UI components, single API hook, or local rule).
* **Medium (M)**: 3–5 Engineering Days (Full view with state management, Firestore sub-collection, and WhatsApp/Email trigger).
* **Large (L)**: 1–2 Engineering Weeks (Multi-screen workflow, background cron/queue, external gateway or hardware integration).
* **Extra-Large (XL)**: 3+ Engineering Weeks (Complex cross-platform subsystem, compliance infrastructure, or multi-tenant reconciliation).

### 1.2 RICE Scoring Legend
* **Reach (R)**: Scale of 1–10 (Proportion of monthly brides or team artists interacting with the feature).
* **Impact (I)**: 0.5 (Minor), 1.0 (Moderate), 2.0 (High), 3.0 (Massive revenue / operational gain).
* **Confidence (C)**: 50% (Exploratory), 80% (Validated), 100% (Certain operational requirement).
* **Effort (E)**: Person-weeks (S = 0.5, M = 1, L = 2, XL = 4).
* **RICE Score Formula**: `(Reach × Impact × Confidence) / Effort`

---

## 2. Master Feature Prioritization Matrix

### 2.1 Admin & Field Operations

| Feature Name | Description & Core Workflow | Effort | Reach | Impact | Conf. | RICE Score | Priority Tier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Artist Dispatch Board** | Real-time timeline & map of all wedding bookings for the day, transit durations, artist check-in status, and late-arrival alarms. | **M** (4d) | 10 | 3.0 | 90% | **27.0** | **P0 (Must-Have)** |
| **Backup Artist Auto-Suggest** | Instant fallback engine recommending on-call artists ranked by skill tier (Platinum/Gold), distance, and availability if an artist falls ill. | **S** (2d) | 8 | 3.0 | 90% | **43.2** | **P0 (Must-Have)** |
| **Kit & Inventory Check-In/Out** | Pre-event kit checklist (airbrush guns, Temptu foundation sets, poshak pins) with venue check-out audit to prevent lost studio tools. | **S** (2d) | 9 | 2.0 | 90% | **32.4** | **P0 (Must-Have)** |
| **Product Expiry & Batch Tracker** | Alert system flagging skincare elixirs, foundation batches, and adhesives within 60 days of expiration for client safety. | **S** (2d) | 7 | 2.0 | 80% | **22.4** | **P1 (Next)** |
| **Wedding-Day Incident Log** | High-priority log for skin flare-ups, traffic delays, or broken jewellery with photo capture and immediate coordinator resolution notes. | **S** (2d) | 6 | 2.5 | 90% | **27.0** | **P1 (Next)** |
| **Travel & Convoy Planner** | Flight/train itinerary tracker, hotel room block manager, vanity vehicle fuel logs, and trip budget vs. actual spend monitor. | **M** (4d) | 7 | 2.0 | 80% | **14.0** | **P1 (Next)** |
| **Capacity & Gap Rules** | Enforced studio rules: max 2 functions/artist/day, mandatory 4-hour travel gaps, and separate tracking for poshak drapists vs. makeup artists. | **S** (2d) | 9 | 2.0 | 100% | **36.0** | **P0 (Must-Have)** |

---

### 2.2 Sales, CRM & Customer Pipeline

| Feature Name | Description & Core Workflow | Effort | Reach | Impact | Conf. | RICE Score | Priority Tier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Multi-Version Shareable Quotes** | Retains full revision history of quotations; generates a secure web link for the bride and her family to inspect changes and approve. | **M** (4d) | 10 | 3.0 | 100% | **30.0** | **P0 (Must-Have)** |
| **Automated Follow-Up Rules** | Automatically alerts staff if a quote has no response after 48 hours; triggers a friendly WhatsApp check-in with auspicious date alerts. | **S** (2d) | 9 | 2.5 | 90% | **40.5** | **P0 (Must-Have)** |
| **Lead Source ROI Tracking** | Attribution tags (Instagram Reel, Google Local, WhatsApp Ad, Word-of-Mouth) calculating Customer Acquisition Cost (CAC) per lead. | **S** (2d) | 8 | 2.0 | 90% | **28.8** | **P1 (Next)** |
| **Smart Date Alternatives** | When an auspicious date is fully booked, the system automatically presents the nearest free dates or available associate artists. | **S** (2d) | 7 | 2.0 | 90% | **25.2** | **P1 (Next)** |
| **Lost-Lead Reason Taxonomy** | Mandatory classification upon closing an inquiry (Date Unavailable, Budget Exceeded, Chose Alternate Studio) for quarterly strategy review. | **S** (1d) | 7 | 1.5 | 90% | **31.5** | **P1 (Next)** |
| **Call Notes & Callback Alarms** | Chronological audio/text note logger attached to leads with time-bound push notifications for coordinators. | **S** (2d) | 8 | 1.5 | 80% | **19.2** | **P2 (Later)** |

---

### 2.3 Financial Operations & Compliance

| Feature Name | Description & Core Workflow | Effort | Reach | Impact | Conf. | RICE Score | Priority Tier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Aging Balance Payment Tracker** | Visual dashboard segmenting unpaid balances: *Due in 7 Days*, *Due Tomorrow*, *Overdue (T-0)* with one-click WhatsApp payment reminders. | **S** (2d) | 10 | 3.0 | 100% | **60.0** | **P0 (Must-Have)** |
| **Net Profit Margin per Booking** | Computes real margin after auto-deducting artist commissions, travel fuel, cosmetic product allocation, and 18% GST. | **M** (3d) | 8 | 2.5 | 90% | **30.0** | **P0 (Must-Have)** |
| **Artist Monthly Payout Statements** | Generates formal PDF earnings statements detailing completed functions, overtime, travel per-diem, and tax deductions (TDS). | **M** (3d) | 8 | 2.0 | 90% | **24.0** | **P1 (Next)** |
| **CA-Ready GST & Audit Export** | One-click spreadsheet export format pre-validated with Chartered Accountants for GSTR-1 and GSTR-3B monthly filing. | **S** (2d) | 8 | 2.5 | 100% | **40.0** | **P0 (Must-Have)** |
| **Audited Refund Approval Flow** | Dual-authorization flow (Coordinator proposal + Owner approval) with reason codes before releasing gateway refunds. | **S** (2d) | 5 | 2.0 | 100% | **20.0** | **P1 (Next)** |
| **Expense Capture & Receipt OCR** | Mobile receipt camera capture categorizing fuel, accommodation, and studio consumables against booking reference IDs. | **M** (4d) | 6 | 1.5 | 80% | **11.2** | **P2 (Later)** |

---

### 2.4 Customer Experience & Bridal Planning

| Feature Name | Description & Core Workflow | Effort | Reach | Impact | Conf. | RICE Score | Priority Tier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Family & Guest Styling Roster** | Multi-person booking builder (Mother-of-the-bride, sisters, bridesmaids) itemizing poshak draping, hair, and makeup per individual. | **M** (4d) | 10 | 3.0 | 100% | **30.0** | **P0 (Must-Have)** |
| **Interactive Function Builder** | Step-by-step itinerary configurator for multi-day weddings (Haldi, Mehendi, Sangeet, Pheras, Reception) with custom venue addresses. | **M** (4d) | 10 | 3.0 | 100% | **30.0** | **P0 (Must-Have)** |
| **Palace Venue Logistics Pricing** | Auto-populates travel surcharges and entry protocols when bride selects venues (e.g. Umaid Bhawan, Rambagh, Taj Lake Palace). | **S** (2d) | 8 | 2.5 | 90% | **36.0** | **P0 (Must-Have)** |
| **Interactive Look Finder Quiz** | Advisory 4-step quiz (outfit velvet/silk tone, jewelry kundan/polki, weather, coverage preference) recommending bridal packages. | **M** (3d) | 9 | 2.0 | 80% | **21.6** | **P1 (Next)** |
| **Look Approval & Revision Board** | Dedicated screen where lead artist posts trial formulation swatches and bride marks "Approved" or requests lip shade adjustment. | **S** (2d) | 9 | 2.0 | 90% | **32.4** | **P0 (Must-Have)** |
| **Wedding-Day Bride Companion** | Mobile-friendly day-of checklist (button-up clothing, hair prep, jewellery laid out) and artist ETA with live call button. | **S** (2d) | 10 | 2.5 | 90% | **45.0** | **P0 (Must-Have)** |
| **Two-Stage Post-Event Feedback** | Private internal CSAT/NPS rating first; only prompts for Google/Instagram review if score is 5-star to protect brand reputation. | **S** (2d) | 8 | 2.5 | 90% | **36.0** | **P0 (Must-Have)** |
| **Calendar Sync (.ics)** | One-click button to sync all wedding makeup and trial ready-by times directly into Google Calendar or Apple iCal. | **S** (1d) | 7 | 1.0 | 90% | **25.2** | **P1 (Next)** |
| **Touch-Up Kit Guide & Shop Look** | Curated product recommendations (lipstick shade code, blotting powder, setting spray) used during the makeover. | **S** (2d) | 6 | 1.5 | 80% | **14.4** | **P2 (Later)** |

---

### 2.5 Automation, Intelligence & Platform Quality

| Feature Name | Description & Core Workflow | Effort | Reach | Impact | Conf. | RICE Score | Priority Tier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **No-Code Automation Rules** | Event-driven trigger engine: *Deposit Received ➔ Send WhatsApp Receipt*, *T-7 Days ➔ Send Prep Guide*, *T-1 Day ➔ Send Artist Brief*. | **L** (6d) | 10 | 3.0 | 90% | **22.5** | **P0 (Must-Have)** |
| **Weekly WhatsApp Owner Digest** | Automated Sunday night summary sent to Prachi's WhatsApp: Weekly Gross Revenue, Next Week's Weddings, Unassigned Slots, Overdue Balances. | **S** (2d) | 5 | 3.0 | 100% | **30.0** | **P0 (Must-Have)** |
| **Offline-First Event-Day Queue** | Local SQLite storage in Flutter for heritage forts without cellular coverage; auto-syncs checklist timestamps upon reconnection. | **M** (4d) | 8 | 2.5 | 90% | **22.5** | **P1 (Next)** |
| **Notification Preferences Center** | Staff & client granular notification toggles: mute promotional updates while ensuring emergency schedule changes always break through. | **S** (2d) | 8 | 1.5 | 90% | **21.6** | **P1 (Next)** |
| **In-App Sandbox Training Mode** | Safe practice environment for junior studio coordinators to test booking overrides and WhatsApp broadcasts with mock data. | **S** (2d) | 6 | 1.5 | 80% | **14.4** | **P2 (Later)** |

---

## 3. Sprint-by-Sprint Execution Roadmap

```
2026 Q4 Execution Sprints
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 1: Core Operations, Balance Aging & Backup Suggestions          (Weeks 1 - 2)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 2: Shareable Quotes, Multi-Person Styling & Palace Logistics    (Weeks 3 - 4)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 3: Automation Engine, WhatsApp Owner Digest & Day-Of Companion  (Weeks 5 - 6)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 4: Offline Fort Mode, Kit Tracking & Net Profit Accounting      (Weeks 7 - 8)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 5: Look Approval, Two-Stage Feedback & Expiry Alerts            (Weeks 9 - 10)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6: Touch-Up Guides, Staff Sandbox & Advanced Reporting          (Weeks 11 - 12) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Sprint 1: High-Impact Operations & Balance Recovery (Weeks 1 – 2)
> **Goal**: Protect cash flow, eliminate payment delays, and ensure artist reliability on wedding days.

* **Deliverable 1.1: Aging Balance Payment Tracker**
  * *App Surface*: Flutter Financial Center & Admin Dashboard.
  * *Features*: Buckets outstanding payments into *Due This Week*, *Overdue 7 Days*, *Critical (T-48h)*. One-click button triggers automated WhatsApp payment reminder with instant UPI/Card link.
* **Deliverable 1.2: Backup Artist Auto-Suggest Engine**
  * *App Surface*: Flutter `CalendarScreen` & `Customer360Screen`.
  * *Features*: Suggests certified fallback artists ranked by specialty (Rajputi poshak, HD airbrush) and proximity if a team member is delayed.
* **Deliverable 1.3: Capacity & Travel Gap Rule Enforcement**
  * *Backend*: Cloud Function `validateSlotConflictAndCapacity`.
  * *Features*: Blocks scheduling an artist for two events with less than a 4-hour buffer or more than 2 functions per day.
* **Deliverable 1.4: Kit & Inventory Check-In/Out System**
  * *App Surface*: Mobile Flutter Checklist.
  * *Features*: Check-in and check-out verification before leaving studio and hotel suites.

---

### Sprint 2: Family Styling, Shareable Quotes & Palace Venues (Weeks 3 – 4)
> **Goal**: Expand average order value (AOV) by capturing family members and speeding up quotation approval.

* **Deliverable 2.1: Multi-Person Family & Guest Styling Roster**
  * *App Surface*: Customer Web `/book` & `/my-wedding`.
  * *Features*: Enables brides to add mother, sisters, and bridesmaids with individualized hair, poshak, and makeup services.
* **Deliverable 2.2: Multi-Version Shareable Quote Portal**
  * *App Surface*: Next.js `/quote/[id]` & Admin Quote Generator.
  * *Features*: Revision history tracker (v1, v2, v3); generates a clean shareable link for parents/groom with a formal "Approve & Pay Deposit" action.
* **Deliverable 2.3: Palace & Heritage Venue Logistics Calculator**
  * *App Surface*: Customer Web & Admin Pricing Engine.
  * *Features*: Database of 40+ palaces in Jodhpur, Jaipur, and Udaipur automatically applying accurate convoy travel fees and entry timing rules.
* **Deliverable 2.4: CA-Ready GST & Audit Financial Export**
  * *App Surface*: Flutter Financial Center.
  * *Features*: Generates pre-formatted CSV/Excel tables matching GSTR-1 cosmetic salon specifications.

---

### Sprint 3: Automation Engine, Owner Digest & Day-Of Companion (Weeks 5 – 6)
> **Goal**: Automate repetitive communications and give the bride a frictionless day-of experience.

* **Deliverable 3.1: No-Code Automation Rules Engine**
  * *Backend*: Firestore `/automationRules` + Cloud Functions Event Trigger.
  * *Triggers*: `DEPOSIT_CONFIRMED`, `T_MINUS_7_DAYS`, `T_MINUS_1_DAY`, `EVENT_COMPLETED`.
  * *Actions*: Dispatches WhatsApp templates, creates staff tasks, and updates booking stage flags.
* **Deliverable 3.2: Weekly Sunday Night WhatsApp Owner Digest**
  * *Backend*: Scheduled Cloud Function (Runs every Sunday at 09:00 PM IST).
  * *Features*: Computes weekly gross revenue, next week's bridal count, unassigned dates, and pending balance totals directly to Prachi's personal WhatsApp.
* **Deliverable 3.3: Wedding-Day Bride Companion Page**
  * *App Surface*: Customer Web `/my-wedding` (Wedding Day Mode).
  * *Features*: Step-by-step bridal morning prep checklist, artist arrival ETA with direct call button, and emergency coordinator hotline.
* **Deliverable 3.4: Two-Stage Post-Event Feedback Engine**
  * *App Surface*: Web Survey & WhatsApp Trigger.
  * *Features*: Private 5-star rating; routes 5-star brides to Google Business Profile & Instagram tag, while routing lower ratings to private management resolution.

---

### Sprint 4: Offline Fort Mode & Net Profit Ledger (Weeks 7 – 8)
> **Goal**: Ensure zero downtime in remote desert/palace venues and track true profitability.

* **Deliverable 4.1: Offline-First Event-Day Queue**
  * *App Surface*: Flutter `EventDayModeScreen` with SQLite local persistence.
  * *Features*: Checklists and arrival timestamps work seamlessly without cellular connectivity; auto-synchronizes upon returning to network coverage.
* **Deliverable 4.2: Net Profit Margin per Booking Calculator**
  * *App Surface*: Flutter Financial Center.
  * *Features*: Calculates gross profit, artist commission payout, vanity travel cost, product consumable allocation, and net studio margin.
* **Deliverable 4.3: Artist Monthly Payout Statements (PDF)**
  * *Backend*: Cloud Function PDF generator.
  * *Features*: Monthly itemized statement of jobs completed, commissions earned, and TDS deductions.
* **Deliverable 4.4: Product Expiry & Batch Tracker**
  * *App Surface*: Admin Settings & Inventory.
  * *Features*: Alerts staff when cosmetic product batches approach 60 days to expiry.

---

### Sprint 5: Look Formulation, Quiz & Incident Management (Weeks 9 – 10)
> **Goal**: Elevate bridal styling personalization and brand protection.

* **Deliverable 5.1: Look Approval & Formulation Board**
  * *App Surface*: Customer Web `/my-wedding` & Admin Lookbook.
  * *Features*: Lead artist uploads trial look formulation (lip shade, lash density, contour palette); bride clicks "Approve Formulation".
* **Deliverable 5.2: Advisory Look Finder Quiz**
  * *App Surface*: Customer Web `/quiz`.
  * *Features*: 4-question interactive visual quiz recommending packages based on poshak hue, venue humidity, and coverage preference.
* **Deliverable 5.3: Wedding-Day Incident Log**
  * *App Surface*: Flutter Operations App.
  * *Features*: Instant logging of delays, broken jewellery, or skin sensitivity with photo uploads and resolution timestamps.
* **Deliverable 5.4: Calendar Sync (.ics file generation)**
  * *App Surface*: Customer Web & Email confirmation.
  * *Features*: One-click sync to Google Calendar / Apple iCal for all wedding functions.

---

### Sprint 6: Optimization, Training Sandbox & Advanced BI (Weeks 11 – 12)
> **Goal**: Long-term organizational scalability and operational training.

* **Deliverable 6.1: In-App Sandbox Training Mode**
  * *App Surface*: Flutter Admin App.
  * *Features*: Sandbox toggle allowing junior coordinators to practice booking overrides, slot shifts, and quote generation using mock data.
* **Deliverable 6.2: Touch-Up Kit Guide & Shop-the-Look**
  * *App Surface*: Customer Web `/my-wedding`.
  * *Features*: Customized list of touch-up shades, powders, and setting sprays used on the bride for personal touch-ups during the event.
* **Deliverable 6.3: Advanced Conversion Funnel & Lead Source ROI**
  * *App Surface*: Flutter Business Intelligence Dashboard.
  * *Features*: Detailed conversion metrics from Instagram Ads vs. Word-of-Mouth, CAC per booked bride, and lost-lead reason breakdown.

---

## 4. Summary & Implementation Schedule

| Sprint | Primary Focus | Key Business Milestone | Total Effort |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Cash Recovery & Field Operations | Unpaid balances recovered; double-booking & artist delay risks eliminated. | ~10 Days |
| **Sprint 2** | Family Styling & Shareable Quotes | +25% Average Order Value via family styling; faster quote approval. | ~13 Days |
| **Sprint 3** | Automation & Day-Of Companion | 80% reduction in manual follow-ups; frictionless wedding day. | ~14 Days |
| **Sprint 4** | Offline Fort Mode & Profitability | Zero failure in remote palaces; true net margin visibility for CA. | ~13 Days |
| **Sprint 5** | Personalization & Look Formulation | Higher bridal satisfaction and lower trial miscommunication. | ~11 Days |
| **Sprint 6** | Training Sandbox & Advanced BI | Seamless staff onboarding and data-driven marketing decisions. | ~12 Days |

*This roadmap provides the definitive engineering sequence for Makeovers by Prachi.*
