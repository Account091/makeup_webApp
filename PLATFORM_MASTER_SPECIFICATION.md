# Makeovers by Prachi — Master Platform Specification
## Comprehensive Architecture, Features, UI/UX Presentation & Operational Logic

> **Document Version**: 10.2 (Authoritative Enterprise Master Document)  
> **Brand**: Makeovers by Prachi  
> **Domain**: Luxury Rajputi Bridal, Destination Weddings, Beauty Ecommerce, Multi-Artist Agency & Multi-Tenant Studio Marketplace  
> **Tech Stack**: Next.js 14 App Router (Customer Web & Marketplace), Flutter 3.x / Dart (Cross-Platform Admin Operations & Command Center), Firebase Cloud Functions (v1/v2 Node.js Microservices), Cloud Firestore, Firebase Storage, Firebase Auth, WhatsApp Cloud API, Hugging Face AI Gateway.

---

## 1. Executive Overview & Brand Ecosystem

### 1.1 Brand Identity & Proposition
**Makeovers by Prachi** is a premier luxury bridal beauty house and multi-city artistry platform headquartered in Rajasthan (operating across **Jodhpur**, **Jaipur**, **Udaipur**, and pan-India destination venues). The digital ecosystem blends ultra-high-end Rajputi bridal heritage styling with modern enterprise operations technology.

### 1.2 System Actors & Roles
| Role Name | Scope & Authority | Primary Interface |
| :--- | :--- | :--- |
| **Bride / Customer** | Browses packages, runs AI skin/look concierge, books dates, submits UPI payments, tracks live preparation stages on wedding day, manages private consultation history. | Customer Web (`/`, `/book`, `/track`, `/concierge`, `/privacy`) & Flutter Customer Portal |
| **Head Artist (Prachi)** | Master calendar authority, final look designer, high-ticket bridal service executor, financial review, AI content approver. | Flutter Command Center (Desktop / Tablet) & Admin Web (`/admin-copilot`) |
| **Senior & Junior Artists** | Assigned to specific wedding functions, updates real-time Event-Day SOP checklists, views individual performance scorecards, logs earnings. | Flutter Operations App (Mobile / Tablet) & Artist Web (`/artist/[slug]`, `/artist/earnings`) |
| **Studio Manager / Coordinator** | Manages booking inquiries, coordinates multi-car convoy travel logistics for destination weddings, reviews moderation queues, handles client support tickets. | Flutter Admin Command Center & Next.js Ops (`/destination-ops`, `/whatsapp-admin`) |
| **Accountant / Risk Officer** | Manages ledger entries, generates GST-compliant invoices (18% cosmetic tax slab), performs payment reconciliation, closes accounting periods, audits risk scores. | Flutter Financial Center & Next.js Financial Portal (`/financial`, `/marketplace-admin/finance`) |
| **Tenant Salon / Studio Owner** | Onboards external beauty businesses, registers staff artists, manages catalog rates, receives automated marketplace commission payouts. | Next.js Multi-Tenant Portal (`/organization/*`) & Flutter Marketplace Console |
| **Platform Administrator** | DevOps monitoring, disaster recovery simulation, feature flag toggling, AI safety audits, DPDP user data privacy enforcement. | Flutter Platform Health & Web Admin (`/platform-admin/*`, `/ai-safety`) |

### 1.3 Design Aesthetics & Visual Tokens
The entire UI adheres to a curated **Luxury Royal Rajasthani Color Palette**:
* **Deep Plum (`#2A0845`)**: Symbolizing royalty, grandeur, depth, and night-time bridal festivities. Used for sidebar containers, hero headlines, and authoritative badges.
* **Rose Gold & Royal Gold (`#D4AF37` / `#C5A059`)**: Accent color representing gold jewellery, zardozi work, and luxury. Used for active tabs, borders, CTA buttons, and rating stars.
* **Champagne Cream (`#FDFBF7`)**: Warm, premium background tone avoiding sterile hospital whites.
* **Soft Rose Gold (`#E8D3C7`) & Silk White (`#FFFFFF`)**: Card surfaces, modal sheets, and subtle separators.
* **Typography**: Elegant serif pairings (Playfair Display / Cormorant Garamond) for bridal headlines, combined with ultra-clean modern geometric sans (Inter / Outfit) for high-density dashboards and forms.

---

## 2. High-Level System Architecture & Flow

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │                    USERS & CLIENTS                     │
                                      └────────────┬───────────────────────────────┬────────────┘
                                                  │                               │
                                                  ▼                               ▼
                      ┌───────────────────────────────────────┐   ┌────────────────────────────────────────┐
                      │   CUSTOMER WEB & MARKETPLACE (NEXTJS) │   │ FLUTTER MULTI-PLATFORM APP (DESKTOP/MOB│
                      │  • Landing & City Portals (Jodhpur/etc│   │  • Admin Command Center (31 Views)     │
                      │  • Multi-step Booking Wizard          │   │  • Event-Day Mode & SOP Checklist      │
                      │  • UPI Dynamic QR & Proof Upload      │   │  • Master Multi-Slot Calendar          │
                      │  • AI Beauty Concierge (Qwen/Llama)   │   │  • Unified CRM 360 & Lead Pipeline     │
                      │  • Multi-Tenant Organization Portal   │   │  • Financial Ledger & GST 18% Invoices │
                      │  • DPDP Privacy Compliance Center     │   │  • WhatsApp Engine & AI Copilot        │
                      └───────────────────┬───────────────────┘   └───────────────────┬────────────────────┘
                                          │                                           │
                                          │ HTTPS REST / TRPC                         │ Cloud Firestore SDK
                                          ▼                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FIREBASE SERVERLESS INFRASTRUCTURE                                         │
├───────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┤
│ 1. Cloud Firestore (NoSQL Source of Truth)        │ 2. Cloud Functions (Node.js Microservices - 71+ Endpoints)   │
│    • 30+ Core Collections                         │    • Booking Lifecycle & Atomic Double-Booking Lock          │
│    • Deterministic UTR Hash Deduplication         │    • Financial Ledger & Period Lock Compliance               │
│    • Multi-Tenant Boundary Isolation              │    • Real-Time Lead Scoring & Automated WhatsApp Alerts      │
│    • Append-Only Audit Logging                    │    • Event-Day SOP State Machine & Media Consent Engine      │
├───────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 3. Storage & Cloud CDN                            │ 4. Identity & Access Management (Firebase Auth)              │
│    • High-res Bridal Portfolios & Lookbooks       │    • Custom Claims: admin, owner, accountant, artist, client │
│    • Encrypted Payment Proofs & Storage Signed URL│    • DPDP Cryptographic Account Deletion & Data Export       │
└─────────────────────────┬─────────────────────────┴───────────────────────────────┬──────────────────────────────┘
                          │                                                         │
                          ▼                                                         ▼
       ┌──────────────────────────────────────┐                  ┌──────────────────────────────────────┐
       │     EXTERNAL HARDWARE & APIs         │                  │      INTELLIGENT AI GATEWAY          │
       ├──────────────────────────────────────┤                  ├──────────────────────────────────────┤
       │ • Meta WhatsApp Cloud Business API   │                  │ • Primary: Qwen-2.5-Coder-32B        │
       │ • NPCI Dynamic UPI QR Payment Engine │                  │ • Fallback: Llama-3.3-70B-Instruct   │
       │ • Google Sheets Bi-Directional Mirror│                  │ • Vision: Qwen-2-VL Multimodal       │
       │ • Google Maps Distance Matrix API    │                  │ • Human-in-the-Loop Safety Gate     │
       └──────────────────────────────────────┘                  └──────────────────────────────────────┘
```

---

## 3. Customer Web Experience (`customer-web`)

The Customer Web platform is built on Next.js 14 with server and client components, providing instant loading, SEO pre-rendering for Rajasthan cities, and fluid Framer Motion transitions.

### 3.1 Public Landing & Hero Experience (`/`)
* **How It Is Shown**:
  * Luxury full-viewport hero section featuring high-resolution editorial bridal photography.
  * Real-time availability indicator badge: `"✨ Booking Open for 2026-2027 Rajputi Bridal Season"`.
  * Visual service tiles with golden shimmer borders covering: *Royal Rajputi Bridal*, *Cocktail / Sangeet Glam*, *Destination Wedding Convoy*, and *Pre-Wedding Shoots*.
  * Direct action triggers: `"Book Your Bridal Date"`, `"Launch AI Beauty Concierge"`, `"Browse Verified Artists"`, and `"Explore Rajasthan Cities"`.
* **How It Is Handled**:
  * Server-side rendered with OpenGraph meta tags, JSON-LD structured schema for `LocalBusiness` and `BeautySalon`.
  * Dynamically queries Firestore `/settings/businessSettings` and `/services` for live starting rates.

### 3.2 Multi-Step Interactive Bridal Booking Wizard (`/book`)
* **How It Is Shown**:
  * Step-by-step progress indicator styled like fine bridal jewellery (Gold Beads and Rose Gold track).
  * **Step 1: Date & Time Selection**: Calendar with instant slot conflict highlighting. Shows slots: Morning Wedding (4:00 AM – 10:00 AM), Evening Pheras (2:00 PM – 8:00 PM), or Full Day Royal Package.
  * **Step 2: Service & Package Customization**: Radio cards for packages (e.g., *Padmavati Royal HD Bridal*, *Airbrush Sabyasachi Look*, *Family & Guest Draping Add-ons*).
  * **Step 3: Venue & Travel Logistics**: Real-time venue selection (Studio in Jodhpur vs Hotel / Resort / Destination Fort). Distance calculator computes outstation surcharges automatically.
  * **Step 4: Commercials & Live Quotation Snapshot**: Shows Base Package Price, Add-on Total, Travel Surcharge, GST (18%), Applied Discount/Coupon, and the required 25% Advance Lock Deposit.
* **How It Is Handled**:
  * Communicates with `/api/booking/create-session` which verifies date availability in Firestore `/availability` to prevent client-side price tampering.
  * Writes a provisional booking with status `awaitingApproval` or `quoteSent`.

### 3.3 Dynamic UPI QR & Instant Payment Proof Verification Flow (`/book`, `/api/booking/submit-proof`)
* **How It Is Shown**:
  * Once the booking summary is generated, the user is presented with a **Dynamic UPI QR Code**.
  * The QR string is generated using the authoritative NPCI format:  
    `upi://pay?pa=prachiy055@oksbi&pn=MakeoversByPrachi&am=7500.00&cu=INR&tr=BK_172800&tn=Deposit_Booking_BK_172800`
  * Below the QR code, a countdown timer (15 minutes) is shown before the temporary slot reservation expires.
  * File upload dropzone allowing the bride to upload a screenshot of their GPay / PhonePe / Paytm payment.
  * Input field for the 12-digit UPI Transaction ID / UTR Number.
* **How It Is Handled**:
  * Handled by Next.js Server Route [submit-proof/route.ts](file:///d:/projects/makeup_webapp/customer-web/src/app/api/booking/submit-proof/route.ts).
  * **Deterministic UTR Uniqueness Check**: Queries `paymentUtrIndex/UTR_<HASH>`. If already present for another booking, rejects immediately with HTTP 409 Conflict (prevents receipt re-use fraud).
  * Uploads screenshot to Cloud CDN / Firebase Storage.
  * Updates booking state from `depositPending` to `verificationPending`.
  * Triggers `mirrorPaymentProofSubmitted` to mirror the transaction into Google Sheets for accounting audit.
  * Fires an administrative WhatsApp alert to Prachi's team and creates an entry in the Flutter Admin Payment Queue.

### 3.4 Live Booking Status & Event-Day Tracker (`/track`)
* **How It Is Shown**:
  * Search bar allowing the client to look up their booking using their **Phone Number** or **Booking Ref ID**.
  * Interactive Timeline Tracker:
    * `Inquiry Submitted` ➔ `Quote Approved` ➔ `Deposit Verified` ➔ `Artist Assigned` ➔ `Consultation Completed` ➔ `Event Day Active` ➔ `Completed`.
  * When active on the wedding day, shows real-time artist arrival status and countdown to `Ready-By Time`.
  * One-click download button for official PDF Booking Receipt and Service Agreement.
* **How It Is Handled**:
  * Queries Firestore `/bookings` collection with client read security limits.
  * Listens to live Firestore document snapshots (`onSnapshot`) for real-time progress updates without page refreshes.

### 3.5 Rajasthan Destination Hub Portals (`/jaipur`, `/jodhpur`, `/udaipur`)
* **How It Is Shown**:
  * City-specific luxury landing pages tailored for high-ticket destination weddings.
  * **Jodhpur Portal (`/jodhpur`)**: Highlights Umaid Bhawan, Mehrangarh Fort shoots, studio appointments, and local Rajputi poshak draping.
  * **Jaipur Portal (`/jaipur`)**: Focuses on heritage palaces (Fairmont, Leela, Rambagh), royal banquet makeup, humidity-resistant airbrush formulas.
  * **Udaipur Portal (`/udaipur`)**: Tailored for lakeside palaces (Taj Lake Palace, Oberoi Udaivilas), water-resistant setting sprays, boat convoy logistics.
* **How It Is Handled**:
  * Pre-rendered statically with ISR (Incremental Static Regeneration).
  * Embeds city-specific travel fee calculators (`baseTravelFee`, `perKmFee`, `hotelStayRequired`).

### 3.6 Multimodal AI Beauty Concierge (`/concierge`, `/ai-concierge`, Modal)
* **How It Is Shown**:
  * Floating luxury chat modal with rose-gold glassmorphic UI (`AiBeautyConciergeModal.tsx`).
  * Features quick-prompt pills: *"Help me choose a look for red lehenga"*, *"What foundation suits humid weather?"*, *"Difference between Airbrush and HD Makeup"*.
  * Photo upload widget: The bride can upload photos of their bridal outfit, jewellery, or skin close-up.
  * Multimodal visual analysis: AI analyzes outfit undertones (warm gold vs cool silver) and suggests complementary lip shades, eye makeup pigments, and jewellery settings.
* **How It Is Handled**:
  * Dispatched to `/api/ai/concierge` and `/api/ai/chat`.
  * Routed through the **V5.0 AI Gateway**:
    * Text processing: Qwen-2.5-Coder-32B or Llama-3.3-70B.
    * Multimodal image analysis: Qwen-2-VL-7B-Instruct.
  * **Deterministic Boundary**: AI **never** provides final pricing or locks dates directly; it recommends packages and passes the bride to the `/book` wizard with pre-selected parameters.

### 3.7 DPDP / GDPR Privacy & Compliance Center (`/privacy`, `/api/privacy/*`)
* **How It Is Shown**:
  * Clean, legally compliant privacy portal adhering to India's **Digital Personal Data Protection (DPDP) Act** and GDPR.
  * **Self-Service Actions**:
    * `Export My Personal Data`: Generates an encrypted JSON/ZIP archive of all customer details, bookings, questionnaires, and invoices.
    * `Revoke Media Consent`: Instantly withdraws permission for the studio to use wedding day photos on Instagram/website.
    * `Erase Account & Personal Data`: Anonymizes phone, email, and photos while maintaining immutable accounting ledger records as required by Indian tax laws.
* **How It Is Handled**:
  * Handled by Cloud Functions `processPrivacyDataRequest` and `/api/privacy/*` endpoints with cryptographic authorization.

---

## 4. Multi-Tenant Beauty Marketplace & Studio Platform

The platform includes a complete two-sided marketplace for independent makeup artists and tenant beauty studios across Rajasthan.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MARKETPLACE ECOSYSTEM (NEXTJS & FLUTTER)                        │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Public Directory & Discovery  │ Multi-Tenant Studio Portals   │ Marketplace Admin & Ops│
│ • Artist Search & Filtering   │ • Studio Onboarding & KYC     │ • Commission Engine    │
│ • Verified Badges & Trust     │ • Roster & Member Management  │ • Escrow Settlements   │
│ • Public Portfolios & Reviews │ • Dynamic Pricing & Settings  │ • Dispute Arbitration  │
│ • Real-Time Chat & Inquiries  │ • Direct Bank Payouts Ledger  │ • Ranking Algorithms   │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### 4.1 Discovery & Search Engine (`/marketplace`, `MarketplaceSearchScreen`)
* **Features**:
  * City filtering (Jodhpur, Jaipur, Udaipur, Outstation).
  * Filter by budget tier, specialty (Airbrush, HD, Rajputi Poshak, Groom Makeup, Hairstyling), and verified trust score.
  * Trust verification badges: *Government ID Verified*, *Prachi Certified Academy Alumni*, *Top Rated Bride Choice*.
* **Implementation**:
  * Search queries executed against Firestore `/organizations` and `/artists` with composite indexes on `city`, `rating`, `verificationStatus`.

### 4.2 Artist Public Portfolio (`/artist/[slug]`)
* **Features**:
  * High-definition gallery carousel, bridal before/after showcases, client video testimonials.
  * Service rate cards with custom packages.
  * Instant inquiry button connecting to the artist's message thread.

### 4.3 Real-Time Marketplace Chat (`/marketplace/chat`, `/artist/chat`, `/organization/chat`)
* **Features**:
  * End-to-end threaded messaging between brides and verified artists.
  * Structured action cards inside chat: *"Send Quote"*, *"Book Date"*, *"Upload Inspiration Photo"*.
* **Handling**:
  * Backed by Cloud Function `sendMarketplaceMessage` and Firestore `/marketplaceConversations` and `/marketplaceMessages` with real-time updates.

### 4.4 Multi-Tenant Organization Management (`/organization/*`, `OrganizationAdminScreen`)
* **Features**:
  * **Onboarding (`/organization/onboarding`)**: Studio business registration, GSTIN, owner verification, salon address.
  * **Team Roster (`/organization/members`)**: Invite senior artists, junior drapists, hair stylists with custom commission split rates.
  * **Payouts & Finance (`/organization/payouts`)**: Automated commission calculation, platform fee deduction (e.g., 10%), bank settlement logs.
  * **Marketplace Settlements Engine**: Cloud Function `processMarketplaceSettlement` atomically calculates platform fees and credits tenant bank accounts.

---

## 5. Flutter Admin Operations & Command Center (`lib/`)

The core enterprise engine used by Prachi and her executive team is built in Flutter, supporting Desktop (Windows/macOS) and Mobile (Android/iOS) with clean BLoC architecture.

```
lib/
├── core/
│   ├── constants/ (AppColors, AppTextStyles, AppDimensions)
│   ├── services/  (FirebaseMessagingService, FirebaseOptions)
│   ├── theme/     (Material 3 Luxury ColorScheme & Typography)
│   └── utils/     (Formatters, Validators, DateHelpers)
├── data/
│   ├── datasources/ (BookingRemoteDataSource, ServiceRemoteDataSource, VercelApiService)
│   └── repositories/ (BookingRepositoryImpl, ServiceRepositoryImpl)
├── domain/
│   ├── entities/ (39 Comprehensive Domain Entities)
│   └── repositories/ (BookingRepository, ServiceRepository)
└── presentation/
    └── features/ (31 Specialized Operations Feature Modules)
```

### 5.1 Luxury Responsive Navigation Wrapper (`main.dart`)
* **Desktop / Large Screen (Width ≥ 960px)**:
  * Persistent luxury deep-plum (`#2A0845`) sidebar with gold divider accents (`#D4AF37`).
  * Collapsible toggle (84px icon-only rail vs 280px full descriptive sidebar).
  * Categorized groups:
    1. **CORE OPERATIONS**: Admin Dashboard, Master Calendar, UPI Payment Queue.
    2. **CLIENTS & PIPELINE**: Customer CRM, Track Booking Status, Booking Wizard.
    3. **SERVICES & MEDIA**: Services Catalog, Reels & Videos, Review Moderation.
    4. **AUTOMATION & SYSTEM**: WhatsApp Engine, Auth & Security, Rules & Settings, Customer Website.
* **Mobile / Tablet Screen (Width < 960px)**:
  * Elegant top AppBar with drawer trigger, notification badge, and quick role switcher.
  * Smooth slide-out luxury navigation drawer.

---

### 5.2 The 31 Operations Feature Modules (Detailed Breakdown)

#### 1. Admin Dashboard (`AdminDashboardScreen` & `DailyOperationsCommandScreen`)
* **UI Presentation**:
  * Gold-accented metric cards: Total Revenue (₹), Confirmed Bookings, Pending UPI Verifications, Next 7 Days Bridal Count.
  * Urgent Action Banner: Alerts if any booking is within 48 hours without artist assignment or full payment.
  * Quick action buttons: *"New Inquiry"*, *"Block Calendar Date"*, *"Trigger WhatsApp Campaign"*.
* **Under the Hood**:
  * Listens to Firestore `/bookings` query with snapshot aggregations.
  * Runs client-side BLoC state `BookingBloc` which computes real-time gross pipeline value.

#### 2. Master Availability Calendar & Double-Booking Lock (`CalendarScreen`)
* **UI Presentation**:
  * Multi-view calendar (Month, Week, Day, Timeline) showing bookings by function (Mehendi, Sangeet, Wedding, Reception).
  * Color-coded tags by status: Green (Confirmed), Amber (Deposit Pending), Blue (Inquiry), Grey (Blocked/Outstation Travel).
* **Under the Hood**:
  * Enforces **Atomic Conflict Prevention** via Cloud Function `validateSlotConflictAndCapacity`.
  * Computes 4-hour travel buffers for outstation events (e.g., Jodhpur to Jaipur requires a 6-hour buffer before and after).

#### 3. Universal Consultation Scheduler (`ConsultationSchedulerScreen`)
* **UI Presentation**:
  * Scheduling interface for 3 types of pre-wedding consultations:
    1. *Virtual Video Consultation (Google Meet)*
    2. *In-Person Studio Consultation (Jodhpur Studio)*
    3. *Paid Bridal Trial Session (with full product preview)*
* **Under the Hood**:
  * Invokes Cloud Function `scheduleUniversalConsultation`.
  * Creates calendar entries and automatically sends WhatsApp meeting links to the bride.

#### 4. Booking Inquiries Wizard (`BookingInquiryScreen`)
* **UI Presentation**:
  * Internal wizard used by phone coordinators to enter inquiries received via Instagram DMs or phone calls.
  * Captures: Bride Name, Groom Name, Wedding Date, Muhurat Time, Function List, Venue Address.
* **Under the Hood**:
  * Creates Firestore document with authoritative default commercials and sends instant quotation link via SMS/WhatsApp.

#### 5. Track Booking Status & Ledger (`BookingStatusScreen`)
* **UI Presentation**:
  * Deep-dive view of any selected booking.
  * Displays client contact, selected services, assigned artists, balance payment due, and chronological activity audit trail.
* **Under the Hood**:
  * Fetches `unifiedCustomerTimeline` merging WhatsApp messages, status changes, and payment logs.

#### 6. Booking Reschedule & Waitlist Engine (`BookingRescheduleWaitlistScreen`)
* **UI Presentation**:
  * Queue of bride reschedule requests (*"Postponing wedding from Dec 12 to Jan 15"*).
  * Date Waitlist tab: Lists brides waiting for a specific high-demand auspicious date (Aabuja Sahva).
* **Under the Hood**:
  * Backed by Cloud Functions `requestBookingReschedule` and `subscribeBookingWaitlist`.
  * When a booking is cancelled, the system automatically alerts waitlisted brides in order of priority.

#### 7. Event-Day Mode & Real-Time SOP Execution (`EventDayModeScreen`)
* **UI Presentation**:
  * High-contrast, touch-optimized screen designed for artists working at hotel suites or palace dressing rooms.
  * Big Countdown Timer to `Ready-By Time` (e.g., 03h:24m remaining until bride leaves for Varmala).
  * **Interactive SOP Checklist**:
    1. [ ] Skin Prep & Hydration (Caudalie / Clinique moisture surge)
    2. [ ] Base & Airbrush Foundation (Temptu Pro lock)
    3. [ ] Eye Makeup, Lashes & Brow Architecture
    4. [ ] Hairstyling & Fresh Flowers / Gajra Pinning
    5. [ ] Rajputi Poshak / Lehenga & Heavy Dupatta Draping
    6. [ ] Jewellery Setting (Maang Tikka, Nath, Aad fixing)
    7. [ ] Final Touch-Up, Setting Spray & Media Photos
* **Under the Hood**:
  * Powered by Cloud Function `updateEventDayStatus`.
  * Each checked item updates Firestore in real-time with timestamp and artist UID.
  * Triggers an automated WhatsApp status update to the wedding planner/family: *"Makeup base completed; hair styling in progress"*.

#### 8. Customer CRM 360 & Revenue Profiles (`CustomerCrmScreen`, `Customer360Screen`)
* **UI Presentation**:
  * Complete customer index with search by name, phone, wedding month, or venue.
  * Customer 360 Card: Displays Total LTV (₹), Total Family Bookings, Skin Type & Sensitivities, Preferred Shades, Loyalty Tier.
* **Under the Hood**:
  * Aggregates data from `/customers`, `/bookings`, `/payments`, and `/bridalQuestionnaires`.

#### 9. Customer Intelligence & Churn Prediction (`CustomerIntelligenceDashboardScreen`)
* **UI Presentation**:
  * AI-driven analytics dashboard segmenting customers into: *High-Value VIP Brides*, *Festive/Party Makeup Repeaters*, *At-Risk Inactive Clients*.
  * Shows predicted repeat probability (e.g., 95% likely to book for upcoming cousin's wedding).
* **Under the Hood**:
  * Evaluated by Cloud Function `predictCustomerRepeatAndChurnRisk` using RFM (Recency, Frequency, Monetary) algorithms.

#### 10. Lead Pipeline & Algorithmic Scoring (`LeadPipelineScreen`, `FollowupQueueScreen`)
* **UI Presentation**:
  * Kanban board with stages: *New Inquiry* ➔ *Quote Sent* ➔ *Follow-up Needed* ➔ *High Intent* ➔ *Converted* ➔ *Lost*.
  * **Lead Quality Score Badge (0 - 100)**: Color-coded green (>80), yellow (50-79), red (<50).
* **Under the Hood**:
  * Scored by Cloud Function `calculateLeadScore`.
  * Scoring weights: Destination wedding (+30), Full package with family (+25), Peak season (+20), Immediate phone response (+15).

#### 11. Unified Omnichannel Customer Inbox (`UnifiedCustomerInboxScreen`)
* **UI Presentation**:
  * Omnichannel chat screen consolidating WhatsApp messages, website inquiries, and marketplace chat into one interface.
* **Under the Hood**:
  * Backed by Cloud Function `getUnifiedCustomerTimeline`. Artists and managers can reply directly without switching apps.

#### 12. Support Help Desk & Resolution SLAs (`SupportHelpDeskScreen`)
* **UI Presentation**:
  * Ticket management queue: Open, In Progress, Resolved.
  * Ticket categories: *Payment Inquiry*, *Booking Reschedule*, *Bridal Trial Feedback*, *General Question*.
* **Under the Hood**:
  * Backed by Cloud Functions `createSupportTicket` and `calculateSupportSlaAnalytics`. Tracks resolution SLA adherence (Target: < 2 hours).

#### 13. Bridal Services & Rates Catalog (`ServiceCatalogScreen`)
* **UI Presentation**:
  * Grid of luxury services and packages with editable prices, descriptions, duration, and required advance deposit percentages.
* **Under the Hood**:
  * Managed via `ServiceBloc` and Firestore `/services` collection with admin write rules.

#### 14. UPI Payment Verification Queue (`AdminPaymentVerificationScreen`)
* **UI Presentation**:
  * Dedicated split-view audit console:
    * Left side: Queue of pending UPI submissions with Customer Name, Booking ID, Claimed Amount, UTR Number, and Submission Time.
    * Right side: High-resolution preview of the uploaded payment screenshot with zoom/pan tools.
    * Instant Action Buttons: `Approve & Issue Receipt` (Green) and `Reject with Reason` (Red).
* **Under the Hood**:
  * Approving calls Cloud Function `approveBooking` or `recordLedgerPayment`.
  * Atomically transitions booking status to `confirmed`, creates a ledger record, generates a PDF receipt, and sends a WhatsApp confirmation template.

#### 15. Financial Dashboard, Invoicing & GST 18% Tax Ledger (`FinancialDashboardScreen`)
* **UI Presentation**:
  * Complete financial suite:
    * Gross Sales, Net Profit Margin, GST Tax Collected (18% Cosmetic Salon Tax slab).
    * Formal Tax Invoices: Generate and download GSTIN-compliant tax invoices with CGST (9%) + SGST (9%) or IGST (18%).
    * Expense Tracker: Log studio consumables, travel expenses, assistant daily wages.
    * **Accounting Period Lock**: Locks completed financial months (e.g., "October 2026 LOCKED") preventing any backdated alterations.
* **Under the Hood**:
  * Handled by Cloud Functions `createAuthoritativeInvoice`, `recordBusinessExpense`, `calculateBookingProfit`, `lockFinancialPeriod`.

#### 16. Customer Loyalty Program & Rewards Tiers (`LoyaltyProgramScreen`)
* **UI Presentation**:
  * Tier overview: **Bronze** (0 pts), **Silver** (1,000 pts), **Gold** (5,000 pts), **Royal VIP** (10,000+ pts).
  * Client point balance, reward redemption history, referral bonuses.
* **Under the Hood**:
  * Backed by Cloud Function `earnOrRedeemLoyaltyPoints` with an append-only ledger in Firestore `/loyaltyTransactions`.

#### 17. Beauty Ecommerce Storefront & Inventory (`ProductStorefrontScreen`, `AdminEcommerceScreen`)
* **UI Presentation**:
  * Catalog of bridal beauty products (curated lipsticks, bridal emergency kits, organic skin elixirs).
  * Inventory stock monitor with low-stock warnings and automated re-stock alerts.
* **Under the Hood**:
  * Backed by Cloud Functions `createAuthoritativeProductOrder`, `processInventoryMovement`, `subscribeBackInStockAlert`.

#### 18. Destination Wedding Logistics Planner (`DestinationWeddingPlannerScreen`)
* **UI Presentation**:
  * Dedicated planner for outstation weddings.
  * Inputs: Destination city/palace, number of functions (Mehendi, Sangeet, Haldi, Wedding, Reception), total guests requiring styling, artist team size.
  * Logistics summary: Total vanity travel fee, flight/train ticket budget, hotel room requirements, convoy departure schedule.
* **Under the Hood**:
  * Calculated via Cloud Function `calculateDestinationQuote`.

#### 19. Location Intelligence & Geographic Surcharges (`LocationIntelligenceDashboardScreen`, `LocationOptimizationScreen`)
* **UI Presentation**:
  * Interactive map and metrics comparing performance across Jodhpur, Jaipur, Udaipur, and outstation venues.
  * Dynamic travel surcharge configuration (Base fee + per-km fee beyond 15 km from studio).
* **Under the Hood**:
  * Powered by Cloud Function `manageLocation` and Firestore `/locations`.

#### 20. Marketing Dashboard & Campaign Planner (`MarketingDashboardScreen`, `CampaignPlannerScreen`)
* **UI Presentation**:
  * Promotional coupon code manager (e.g., `RAJPUTI2026` for 10% off bridal packages).
  * Referral code program and seasonal campaign performance metrics (impressions, clicks, conversions, revenue generated).
* **Under the Hood**:
  * Enforced server-side via Cloud Function `validateAndApplyCoupon` and `applyReferralCode`.

#### 21. Reels & Social Video Content Manager (`ReelsManagerScreen`)
* **UI Presentation**:
  * Social content grid showcasing latest Instagram Reels, bride makeover videos, and transformation clips.
  * Video performance stats: Views, saves, inquiries generated.
* **Under the Hood**:
  * Backed by Cloud Function `resolveSocialPlatformUrl` and Firestore `/socialContent`.

#### 22. Content Attribution & 1st-Party Link Tracker (`ContentAttributionScreen`)
* **UI Presentation**:
  * Tracks which Instagram Reel, WhatsApp broadcast, or YouTube short resulted in confirmed bridal bookings.
  * Revenue attribution dashboard calculating ROI per social post.
* **Under the Hood**:
  * Powered by Cloud Function `trackContentAttribution`.

#### 23. Event Media Capture & Privacy Consent (`EventMediaCaptureScreen`)
* **UI Presentation**:
  * Studio media upload interface.
  * **Strict Consent Toggle**: Displays whether the bride has granted consent for: *Full Face Social Media*, *Eyes/Hair Only*, or *Strictly Private (No Public Posting)*.
  * Uploads before/after photos tagged directly to the client's booking file.
* **Under the Hood**:
  * Enforced via Cloud Function `uploadEventMediaAsset`. Blocks public tagging if privacy consent is not verified.

#### 24. AI Content Drafter (`AiContentDrafterScreen`)
* **UI Presentation**:
  * Generates high-engagement Instagram captions, hashtags, and WhatsApp broadcast copy.
  * Includes tone selector: *Royal Rajasthani*, *Modern Luxury*, *Short & Punchy*, *Storytelling*.
  * **Human Approval Gate**: Staff must click `"Approve & Schedule"` before text is published or broadcast.
* **Under the Hood**:
  * Powered by Cloud Function `generateSocialContentDraft` routing through Llama-3.3-70B.

#### 25. Comments & Review Moderation Queue (`ModerationQueueScreen`)
* **UI Presentation**:
  * Moderation list for public customer reviews and website testimonials.
  * Actions: `Approve for Public Website`, `Flag as Inappropriate`, `Reply as Studio`.
* **Under the Hood**:
  * Firestore rules permit public read only where `status == 'Approved'`.

#### 26. WhatsApp Cloud Automation Engine (`WhatsappDashboardScreen`)
* **UI Presentation**:
  * WhatsApp Business API management center.
  * Message templates library: *Booking Inquiry Confirmation*, *Deposit Receipt with PDF*, *48-Hour Wedding Reminder*, *Post-Event Review Request*.
  * Live webhook logs showing sent, delivered, and read receipt statuses.
* **Under the Hood**:
  * Powered by Meta WhatsApp Cloud API via Cloud Function `whatsappWebhook` and `processAiWhatsappInquiry`.

#### 27. WhatsApp AI Copilot (`AdminWhatsappCopilotScreen`)
* **UI Presentation**:
  * Real-time assistant pane next to live WhatsApp chat.
  * Suggests polite, brand-aligned answers to common bride questions (*"Are dates in November open?"*, *"Can you drape Rajputi poshak with aad?"*).
* **Under the Hood**:
  * Generates contextual reply suggestions using Qwen-2.5-Coder with studio business settings loaded in prompt context.

#### 28. AI Safety & Audit Console (`AdminAiSafetyScreen`)
* **UI Presentation**:
  * Security monitoring console auditing all AI tool calls across the platform.
  * Displays: Token usage, latency, detected prompt injection attempts, tool execution logs.
  * Human-in-the-loop pending approval table for any high-risk action.
* **Under the Hood**:
  * Reads from `/aiToolCalls` and `/aiUsage`.

#### 29. Business Intelligence & Capacity Forecasting (`BusinessIntelligenceDashboardScreen`, `ForecastingIntelligenceDashboardScreen`)
* **UI Presentation**:
  * Predictive forecasting charts: Expected monthly revenue, auspicious date capacity utilization %, artist utilization rates.
* **Under the Hood**:
  * Calculated by Cloud Functions `calculateBusinessIntelligence` and `generateForecastAndCapacity`.

#### 30. Team Management & Artist Scorecards (`TeamManagementScreen`, `ArtistPerformanceScorecardScreen`)
* **UI Presentation**:
  * Artist leaderboard: Shows rating (e.g., 4.98/5), SOP checklist completion rate (100%), punctuality record (99.5%), client retention %.
  * Performance Grade Badges: **Platinum**, **Gold**, **Silver**.
* **Under the Hood**:
  * Evaluated via Cloud Function `calculateArtistPerformanceScorecard`.

#### 31. System Health, Disaster Recovery & Production Certification (`SystemHealthScreen`, `DisasterRecoveryScreen`, `ProductionCertificationScreen`, `UniversalAuditCenterScreen`)
* **UI Presentation**:
  * DevOps command center monitoring **9 Platform Subsystems**:
    1. Firestore
    2. Cloud Functions
    3. Payments & UPI
    4. WhatsApp Engine
    5. Next.js Web
    6. FCM Push Notifications
    7. Storage CDN
    8. AI Gateway
    9. Marketplace Settlements
  * **Production Certification Suite**: One-click test runner executing 16 domain test suites, double-booking lock stress tests, and security boundary assertions.
* **Under the Hood**:
  * Powered by Cloud Functions `getPlatformSystemHealth` and `runProductionCertificationSuite`.

---

## 6. Complete Backend Cloud Functions Catalog (71 Microservices)

All backend logic is executed inside `functions/index.js` using the Firebase Admin SDK with strict IAM authentication.

| # | Function Name | Type | Auth / Role Required | Description & Operational Handling |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `onBookingInquirySubmitted` | Firestore Trigger | System Trigger | Fires on new booking doc; validates data, calculates initial quote, logs activity. |
| **2** | `approveBooking` | Callable HTTPS | `admin` \| `owner` | Formally approves provisional booking, generates deposit invoice, notifies bride. |
| **3** | `verifyPaymentWebhook` | HTTP Webhook | Webhook Signature | Receives payment gateway callbacks; performs cryptographic signature verification. |
| **4** | `whatsappWebhook` | HTTP Webhook | Meta Webhook Secret | Handles incoming WhatsApp messages, delivery receipts, and automated chat interactions. |
| **5** | `calculateLeadScore` | Callable HTTPS | Staff | Evaluates inquiry data to generate a 0-100 lead score. |
| **6** | `validateSlotConflictAndCapacity`| Callable HTTPS | Public / Auth | Atomic date conflict validation with travel buffer calculations. |
| **7** | `resolveSocialPlatformUrl` | Callable HTTPS | Staff | Resolves social media video links for Instagram/YouTube reels manager. |
| **8** | `trackContentAttribution` | Callable HTTPS | Public / Auth | Records first-party conversion attribution links from social campaigns. |
| **9** | `validateAndApplyCoupon` | Callable HTTPS | Public / Auth | Validates promo code validity, expiry date, minimum order value, and discount caps. |
| **10** | `applyReferralCode` | Callable HTTPS | Public / Auth | Credits referral bonuses to both referrer and referee on booking completion. |
| **11** | `linkGuestBookingToAccount` | Callable HTTPS | Authenticated | Merges unauthenticated guest bookings to newly created Firebase Auth accounts. |
| **12** | `logCustomerTimelineEvent` | Callable HTTPS | Staff | Appends immutable activity timeline events to a customer profile. |
| **13** | `generateSecureDocumentUrl` | Callable HTTPS | Authenticated | Generates temporary time-limited signed URLs for confidential bridal agreements. |
| **14** | `acceptServiceAgreement` | Callable HTTPS | Authenticated | Records cryptographic SHA-256 digital signature of terms and conditions. |
| **15** | `saveBridalQuestionnaireVersion` | Callable HTTPS | Client / Admin | Saves immutable versions of bride skin, hair, and style questionnaires. |
| **16** | `createAuthoritativeInvoice` | Callable HTTPS | `admin` \| `accountant` | Generates GST-compliant invoice with CGST/SGST/IGST breakdown. |
| **17** | `recordLedgerPayment` | Callable HTTPS | `admin` \| `accountant` | Logs payment transaction into financial ledger and updates booking balance. |
| **18** | `recordBusinessExpense` | Callable HTTPS | `admin` \| `accountant` | Records operating expenses (cosmetics, vanity fuel, hotel stays). |
| **19** | `calculateBookingProfit` | Callable HTTPS | `admin` \| `accountant` | Computes net profit per booking after deducting artist pay and consumables. |
| **20** | `issueRefund` | Callable HTTPS | `owner` \| `accountant` | Processes partial or full customer refunds with ledger audit adjustments. |
| **21** | `lockFinancialPeriod` | Callable HTTPS | `accountant` \| `owner` | Cryptographically locks completed financial months to prevent backdated edits. |
| **22** | `createFinancialAdjustment` | Callable HTTPS | `accountant` | Records audited credit/debit adjustments for closed periods. |
| **23** | `reconcilePayments` | Callable HTTPS | `accountant` | Cross-matches bank statement UTRs against Firestore ledger records. |
| **24** | `generateFinancialExport` | Callable HTTPS | `accountant` | Exports comprehensive CSV/Excel financial summaries for CA filing. |
| **25** | `createAuthoritativeProductOrder`| Callable HTTPS | Authenticated | Creates beauty product order with inventory reservation. |
| **26** | `processInventoryMovement` | Callable HTTPS | Staff | Records inventory in/out movements (Stock Received, Damaged, Sold). |
| **27** | `updateOrderStatus` | Callable HTTPS | Staff | Transitions order status: `Processing` ➔ `Shipped` ➔ `Delivered`. |
| **28** | `processProductReturnAndRefund` | Callable HTTPS | Staff | Handles return requests, restocking, and automated refund triggers. |
| **29** | `earnOrRedeemLoyaltyPoints` | Callable HTTPS | Authenticated | Adds or deducts customer loyalty reward points with balance verification. |
| **30** | `calculateUnifiedCustomerLtv` | Callable HTTPS | Staff | Aggregates all lifetime service and product purchases per customer. |
| **31** | `processAbandonedCartReminders` | Scheduled / Callable | System | Sends automated WhatsApp discount reminders for abandoned booking sessions. |
| **32** | `subscribeBackInStockAlert` | Callable HTTPS | Public | Subscribes customers to notifications when sold-out beauty products return. |
| **33** | `submitVerifiedProductReview` | Callable HTTPS | Authenticated | Validates that review author actually purchased the product before posting. |
| **34** | `assignArtistsToBooking` | Callable HTTPS | `admin` \| `owner` | Assigns lead makeup artist, hair stylist, and poshak drapist to a booking. |
| **35** | `updateArtistAvailability` | Callable HTTPS | Artist / Admin | Sets custom artist working hours, leave dates, and outstation permissions. |
| **36** | `calculateArtistEarningsAndCommissions` | Callable HTTPS | Staff | Computes commission splits and overtime travel allowances. |
| **37** | `assignStudioResource` | Callable HTTPS | Staff | Allocates vanity stations, bridal dressing suites, and airbrush kits. |
| **38** | `generateCustomerBeautyRecommendation` | Callable HTTPS | Public / Auth | Generates AI personalized beauty recommendations based on skin undertone. |
| **39** | `executeAdminCopilotQuery` | Callable HTTPS | Staff | Natural language AI query engine answering questions about bookings and revenue. |
| **40** | `generateSocialContentDraft` | Callable HTTPS | Staff | AI engine generating Instagram captions, hashtags, and promotional copy. |
| **41** | `processAiWhatsappInquiry` | Callable HTTPS | System / Staff | AI assistant drafting contextual replies to bride inquiries on WhatsApp. |
| **42** | `calculateBusinessIntelligence` | Callable HTTPS | Management | Computes macro BI metrics, gross margins, and customer acquisition costs. |
| **43** | `generateForecastAndCapacity` | Callable HTTPS | Management | Predictive forecasting engine projecting revenue and slot availability. |
| **44** | `getBusinessAnalyticsSummary` | Callable HTTPS | Management | High-level summary of month-over-month growth and service popularity. |
| **45** | `validateAnalyticsDataHealth` | Callable HTTPS | Staff | Data integrity checker detecting missing foreign keys or calculation anomalies. |
| **46** | `calculateDestinationQuote` | Callable HTTPS | Public / Auth | Comprehensive quote generator for outstation destination weddings. |
| **47** | `manageLocation` | Callable HTTPS | Admin | Manages multi-city hubs (Jaipur, Jodhpur, Udaipur) and distance rate cards. |
| **48** | `registerOrganizationTenant` | Callable HTTPS | Authenticated | Registers external beauty studios/salons into the multi-tenant marketplace. |
| **49** | `processMarketplaceSettlement` | Callable HTTPS | Admin / System | Computes and disburses artist and tenant payouts minus platform commission. |
| **50** | `sendMarketplaceMessage` | Callable HTTPS | Authenticated | Sends real-time chat messages between brides and verified marketplace artists. |
| **51** | `getPlatformSystemHealth` | Callable HTTPS | Admin / DevOps | Real-time health check across all 9 platform subsystems. |
| **52** | `processPrivacyDataRequest` | Callable HTTPS | Authenticated | DPDP/GDPR data export and cryptographic account deletion pipeline. |
| **53** | `evaluateMarketplaceRisk` | Callable HTTPS | Risk Officer | Scored risk engine identifying anomalous transaction amounts and duplicate UTRs. |
| **54** | `runProductionCertificationSuite`| Callable HTTPS | Admin / Owner | Runs full verification suite across 16 domain categories. |
| **55** | `updateEventDayStatus` | Callable HTTPS | Artist / Admin | Real-time wedding day stage tracker and SOP checklist updater. |
| **56** | `scheduleBridalTrialSession` | Callable HTTPS | Staff | Schedules trial sessions, saves look formulations, records client approval. |
| **57** | `executeGlobalSearch` | Callable HTTPS | Staff | High-speed unified search across Customers, Bookings, Orders, and Documents. |
| **58** | `createSupportTicket` | Callable HTTPS | Authenticated | Creates customer support ticket with automated priority assignment. |
| **59** | `getRemoteConfigAndFlags` | Callable HTTPS | Public | Delivers dynamic feature flags and announcement banners to clients. |
| **60** | `getUnifiedCustomerTimeline` | Callable HTTPS | Staff | Consolidates bookings, WhatsApp chats, payments, and tickets into one stream. |
| **61** | `scheduleUniversalConsultation`| Callable HTTPS | Staff | Reusable consultation scheduler for virtual, studio, and paid trial sessions. |
| **62** | `uploadEventMediaAsset` | Callable HTTPS | Staff | Uploads wedding media after strictly verifying client media privacy consent. |
| **63** | `requestBookingReschedule` | Callable HTTPS | Authenticated | Processes customer self-service date change requests. |
| **64** | `subscribeBookingWaitlist` | Callable HTTPS | Public / Auth | Enrolls brides into a waitlist for fully booked dates. |
| **65** | `executeAutomationRule` | Callable HTTPS | Admin / Owner | Event-driven rule engine (Trigger ➔ Condition ➔ Action) for automated alerts. |
| **66** | `calculateCustomerExperienceMetrics` | Callable HTTPS | Management | Computes CSAT (Customer Satisfaction) and NPS (Net Promoter Score). |
| **67** | `predictCustomerRepeatAndChurnRisk` | Callable HTTPS | Management | Predictive model computing customer repeat probability and churn risk. |
| **68** | `assessNoShowAndDelayRisk` | Callable HTTPS | Staff | Evaluates booking risk score (0-100) based on deposit delay and distance. |
| **69** | `calculateSupportSlaAnalytics` | Callable HTTPS | Management | Evaluates ticket resolution times, SLA compliance, and category breakdown. |
| **70** | `calculateArtistPerformanceScorecard` | Callable HTTPS | Management | Computes artist ratings, SOP completion %, and punctuality scorecards. |
| **71** | `executeDisasterRecoveryDrill` | Callable HTTPS | Admin / DevOps | Simulates database restoration and isolated failover verification. |

---

## 7. Data Architecture & Firestore Security Rules

The database uses Cloud Firestore with strict document validation and role-based access control configured in `firestore.rules`.

### 7.1 Firestore Collections Directory
```
/databases/(default)/documents/
├── bookings/                     # Master service bookings and lifecycle status
├── availability/                 # Date capacity and booked slot records
├── blockedDates/                 # Manually blocked days (holidays, personal leave)
├── services/                     # Service catalog, packages, add-ons
├── packages/                     # Multi-service bundled packages
├── addons/                       # Individual service add-ons
├── settings/                     # System configs, travel rate rules, studio info
├── bridalQuestionnaires/         # Client style preferences, allergies, skin type
├── consultationVersions/         # Immutable records of consultation notes
├── customerProfiles/             # Extended customer details and preferences
├── customers/                    # CRM customer records and unified LTV
├── invoices/                     # GST tax invoices
├── payments/                     # Payment records and ledger entries
├── expenses/                     # Operating and travel expense logs
├── financialPeriods/             # Monthly financial lock records
├── financialAuditEvents/         # Append-only audit logs for financial events
├── adjustments/                  # Credit/debit adjustments for closed periods
├── paymentReconciliations/       # Bank statement reconciliation runs
├── products/                     # Beauty ecommerce inventory
├── orders/                       # Ecommerce product orders
├── inventoryMovements/           # Stock movements (in/out/damaged)
├── returns/                      # Customer product return requests
├── wishlists/                    # Client saved items
├── loyaltyAccounts/              # Points balances and tier status
├── loyaltyTransactions/          # Append-only loyalty point history
├── artists/                      # Artist profiles, specialties, contact info
├── bookingAssignments/           # Mapping of artists to specific bookings
├── artistAvailability/           # Artist schedule overrides
├── artistEarnings/               # Commission calculations and payout logs
├── studioResources/              # Dressing rooms, vanity chairs, airbrush kits
├── resourceBookings/             # Resource reservation schedule
├── aiConversations/              # Chat history with AI concierge and copilot
├── aiToolCalls/                  # Audit trail of all tool execution requests
├── contentDrafts/                # Drafted social captions and broadcast copy
├── aiUsage/                      # Token consumption and cost tracking
├── analyticsDaily/               # Pre-aggregated daily metrics
├── analyticsMonthly/             # Pre-aggregated monthly financial metrics
├── businessAlerts/               # Operational notifications and alerts
├── forecastSnapshots/            # Historical forecast predictions
├── locations/                    # City hubs and distance calculation rules
├── destinationWeddings/          # Detailed destination wedding logistics plans
├── organizations/                # Tenant salon and studio profiles
├── organizationMemberships/      # Staff membership in organizations
├── artistSettlements/            # Marketplace artist settlement batches
├── marketplaceConversations/     # Marketplace customer-artist chat threads
├── marketplaceMessages/          # Individual chat messages
├── systemHealth/                 # Real-time subsystem health logs
├── riskAssessments/              # Transaction risk scores
├── privacyRequests/              # DPDP data export and account erasure requests
├── productionCertifications/     # Production readiness test reports
├── eventDaySessions/             # Real-time event-day tracking and checklists
├── bridalTrialSessions/          # Makeup trial formulations and look approval
├── supportTickets/               # Customer support ticketing
├── remoteConfig/                 # Dynamic app configuration without rebuilds
├── featureFlags/                 # Live feature toggles
├── consultationAppointments/     # Universal consultation appointments
├── eventMediaAssets/             # Event photos/videos with consent flags
├── rescheduleRequests/           # Date reschedule requests
├── waitlistSubscriptions/        # Waitlist requests for booked dates
├── privateCustomerFeedback/      # Post-event private CSAT/NPS survey submissions
├── customerExperienceMetrics/    # Aggregated CSAT and NPS metrics
├── customerRiskPredictions/      # Predictive repeat and churn scores
├── bookingRiskScores/            # Pre-event no-show risk scores
└── artistScorecards/             # Staff performance leaderboard records
```

### 7.2 Security Enforcement Rules Logic
* **No Unauthenticated Writes**: Anonymous users cannot write to any administrative, financial, or private customer collection.
* **Deterministic Inquiries**: Unauthenticated or client users can only create booking inquiries where `status == 'awaitingApproval'` and `commercials.depositPaid == 0`.
* **Append-Only Ledgers**: Collections like `financialAuditEvents`, `loyaltyTransactions`, and `aiToolCalls` have `allow write: if false;` — they can only be appended to by the Firebase Admin SDK inside Cloud Functions.
* **Accounting Protection**: Financial collections (`invoices`, `payments`, `expenses`, `financialPeriods`) are restricted to users with `request.auth.token.role == 'accountant'` or `'owner'`.
* **Customer Isolation**: Brides can only read documents where `resource.data.customerId == request.auth.uid` or where the customer email matches their authenticated token.

---

## 8. Deterministic Business Rules & Safety Guardrails

### 8.1 Anti-Double Booking Guarantee
To eliminate double bookings on auspicious dates:
1. When a client begins the booking process, a temporary lock is written to `/availability/{date}` with an expiration timestamp (`expiresAt = now + 15 minutes`).
2. When the deposit is submitted, the lock becomes permanent through an atomic Firestore transaction.
3. If two clients submit simultaneously, Firestore's optimistic concurrency control guarantees only one transaction commits; the other receives an immediate conflict error with an invitation to join the waitlist.

### 8.2 UTR Hash Deduplication
To prevent fraudulent payment screenshots:
1. Every submitted UTR (Unique Transaction Reference) is cleaned of whitespace and converted to uppercase.
2. A deterministic document key `paymentUtrIndex/UTR_<CLEAN_UTR>` is checked atomically.
3. If the UTR already exists for any prior booking, the submission is rejected immediately with HTTP 409 Conflict.

### 8.3 AI Safety & Human-in-the-Loop Gate
To prevent hallucinated data corruption:
1. AI models operate strictly as read, analyze, summarize, and draft engines.
2. AI models have **zero direct write access** to Firestore financial or booking records.
3. Any action recommended by an AI copilot (e.g., *"Approve booking"*, *"Issue 10% refund"*) creates a pending proposal in `/aiToolCalls`.
4. The action is only executed when a human staff member reviews and approves the proposal in the `AdminAiSafetyScreen`.

---

## 9. Summary & Operational Readiness

| Capability Dimension | Coverage Status | Verification Level |
| :--- | :--- | :--- |
| **Customer Web Experience** | Next.js 14 App Router, dynamic UPI QR, live tracking, AI Concierge | Production Certified (Code & Integration) |
| **Admin Operations App** | Flutter 31-Feature Suite, Desktop & Mobile responsive UI, BLoC state | Production Certified (Code & Integration) |
| **Multi-Tenant Marketplace** | Public artist directory, multi-tenant studio portal, escrow settlements | Production Certified (Code & Integration) |
| **Cloud Microservices** | 71 Authoritative Cloud Functions handling all business logic server-side | Production Certified (Code & Integration) |
| **Data Integrity & Security** | 27 Firestore security domains, append-only ledgers, period locking | Production Certified (Code & Integration) |
| **AI Reliability** | Multi-model routing (Qwen/Llama), multimodal vision, human-in-the-loop gate | Production Certified (Code & Integration) |
| **DPDP Compliance** | Self-service data export, account erasure, strict media privacy consent | Production Certified (Code & Integration) |
| **Live External Channels** | Real phone WhatsApp delivery & real live card/UPI settlement drills | Pending Live Production Drills |

*This document serves as the permanent single source of truth for the Makeovers by Prachi software ecosystem.*
