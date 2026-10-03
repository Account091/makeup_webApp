# Makeovers by Prachi — Master Customer Experience Roadmap
## Comprehensive Client-Side Specifications, Behavioral Workflows & Prioritized Execution Plan

> **Version**: 1.0 (Definitive Client Experience Edition)  
> **Brand**: Makeovers by Prachi  
> **Target Audience**: Brides, Families, Grooms, Destination Planners, and Wedding Guests  
> **Core Platforms**: Customer Web (`customer-web` Next.js 14), Mobile PWA, Meta WhatsApp Automation, and Client PDF Generators

---

## 1. Executive Vision & Customer Journey Map

The customer experience for luxury bridal makeup spans from **9 months before the wedding** (initial discovery and auspicious date inquiry) to **years after the wedding** (festival glam, anniversaries, and family weddings).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   THE 5-STAGE BRIDAL LIFECYCLE                                   │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┬─────────────────────────┤
│ 1. Discovery    │ 2. Planning     │ 3. Preparation   │ 4. Wedding Day  │ 5. Lifetime             │
│ & Booking       │ & Commercials   │ & Personalization│ & Emergency     │ & Family Legacy         │
├─────────────────┼─────────────────┼──────────────────┼─────────────────┼─────────────────────────┤
│ • Panchang Date │ • Installments  │ • 90-Day Beauty  │ • Day-Of Prep   │ • 2-Stage Review        │
│   Availability  │ • Group Split   │   Countdown      │   Checklist     │ • "Shop the Look"       │
│ • Reverse-Start │ • Shareable     │ • My Looks Face  │ • Live ETA & SOS│ • Festival & Family     │
│   Calculator    │   Family Quote  │   Chart          │   Hotline       │   Rebooking             │
│ • Look Quiz     │ • Trial Credit  │ • Outfit Palette │ • Family Live   │ • Anniversary &         │
│ • Venue Notes   │ • NRI Payments  │ • Venue Checklist│   Stage Tracker │   Maternity Glam        │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┴─────────────────────────┘
```

---

## 2. Planning Tools That Solve Real Bride Problems

### 2.1 "What Time Should We Start?" Reverse-Timing Calculator
* **The Problem**: Brides and families frequently miscalculate how long hair, makeup, and heavy poshak draping take. If the muhurat is at 10:30 PM, they often guess artist arrival times incorrectly, resulting in rushed draping or late entry to the mandap.
* **The Solution**: An interactive reverse-timing calculator:
  * **Inputs**:
    1. *Target Ready-By Time* (e.g., 10:00 PM for photography before 10:30 PM Varmala).
    2. *Bride Service Type* (Airbrush HD Bridal + Poshak Draping = 2.5 hours).
    3. *Family / Guest Count* (e.g., Mother + 2 Sisters = 3 people @ 45 mins each).
    4. *Venue Transit Time* (e.g., Jodhpur Studio to Gorbandh Palace = 35 mins).
    5. *Safety Buffer* (Recommended: 30 minutes for emergency dupatta re-pinning).
  * **Output**: Exact **Recommended Artist Team Arrival Time** (e.g., "Team must arrive at hotel suite by 05:45 PM").
  * **Export**: Generates a shareable summary card for the wedding planner and photographer.

### 2.2 90-Day Bridal Beauty Countdown & Timeline
* **The Problem**: Brides often try new aggressive skin treatments (e.g., new chemical peels, untested facials) days before the wedding, causing skin irritation or allergic breakouts that disrupt foundation finish.
* **The Solution**: A structured bridal skin & wellness roadmap starting 90 days out:
  * **T-90 Days**: Hydration foundation, dermatology consultation, allergy patch tests.
  * **T-60 Days**: Hair treatment and styling trial; finalize poshak colour swatches.
  * **T-30 Days**: In-person bridal trial session; lock approved look formulation.
  * **T-14 Days**: Final facial treatment; **"Strict Product Freeze" warning** (Do not introduce new serums, retinol, or untested skincare).
  * **T-3 Days**: Threading, brow architecture, and gentle hydrating sheet mask.
  * **T-1 Day**: Wash and dry hair (no heavy oils); hydrate; sleep early.
  * **Notification Controls**: Bride chooses reminder channels (WhatsApp alerts or silent calendar entries).

### 2.3 Auspicious Date ("Abujh Sawa") Panchang Helper
* **The Problem**: High-volume auspicious dates in Rajasthan (*Akshaya Tritiya*, *Dev Uthani Gyaras*, *Basant Panchami*) book out 6 to 9 months in advance. Brides inquiring late face sudden disappointment.
* **The Solution**: Live Hindu Panchang calendar feed embedded on the website:
  * Highlights verified Abujh Sawa dates with honest, real-time availability badges (*Open*, *2 Slots Left*, *Waitlist Only*).
  * No artificial countdown timer tricks or fake scarcity; purely backed by authoritative Firestore `/availability` capacity.

### 2.4 Weather & Humidity-Adaptive Styling Advice
* **The Problem**: A desert wedding in Jodhpur (dry heat) requires vastly different base hydration than a lakeside palace wedding in Udaipur (high humidity causing foundation breakdown).
* **The Solution**: Live weather intelligence tied to the wedding city and date:
  * **Jodhpur (Arid/Dry)**: Recommends deep hyaluronic prep, moisture-lock spray, and dewy finish formulas.
  * **Udaipur (Humid/Lakeside)**: Recommends waterproof setting sealant, oil-control pore primer, and transfer-proof lip formulations.
  * **Winter Weddings (Nov–Jan)**: Wind-resistant poshak pinning advice for palace open-air courtyards.

### 2.5 Hotel & Palace Suite Readiness Checklist
* **The Problem**: Artists arrive at heritage palace suites and encounter inadequate mirror lighting, lack of 3-pin power sockets for hair tools, or broken ACs.
* **The Solution**: A 5-point venue readiness checklist sent to the family 48 hours prior:
  1. [ ] Mirror station with bright, neutral lighting (no yellow-only tungsten sconces).
  2. [ ] Two functional 15A/5A electrical sockets near the mirror for blow dryers and airbrush compressors.
  3. [ ] Functional AC / climate control (cool room temperature prevents sweat during base application).
  4. [ ] Clean counter space for makeup kit and sanitized brush lay-out.
  5. [ ] Room entry access pass cleared at hotel security reception for the artist vehicle.

### 2.6 Run-of-Day PDF Itinerary
* **Features**: A clean, single-page printable PDF generated from the booking file:
  * Details: Bride name, suite number, ready-by time.
  * Artist Roster: Lead artist, drapist, hair stylist, with direct mobile numbers.
  * Function Schedule: Haldi, Mehendi, Sangeet, Pheras.
  * Perfect for sharing with the wedding planner, event coordinator, and family elders.

---

## 3. Payments Made Easier for Families

### 3.1 Group Payments & Split-Billing
* **The Problem**: The bride books for herself, but her mother, sisters, or bridesmaids are paying for their own styling. The bride is burdened with collecting money from everyone.
* **The Solution**: **Group Sub-Links**:
  * The bride enters bridesmaids' phone numbers.
  * Each person receives their own personal payment link for their specific add-on (e.g., *"Simran - Guest Makeup & Hair: ₹4,500"*).
  * The bride's master dashboard displays live badges: `Bride [PAID]`, `Mother [PAID]`, `Sister [PAID]`, `Bridesmaid 1 [PENDING]`.
  * Total booking confirms once the minimum advance deposit threshold is met.

### 3.2 Structured Installment Schedule
* **Schedule Breakdown**:
  * **Milestone 1 (Deposit)**: 25% to 30% advance to lock the calendar date.
  * **Milestone 2 (Trial & Confirmation)**: 25% due upon completion and approval of bridal trial.
  * **Milestone 3 (Final Balance)**: 50% due at **T-14 Days** before the wedding.
* **Automated Reminders**: Gentle WhatsApp notifications sent 3 days before due date with instant payment links (UPI, Cards, NetBanking).

### 3.3 Paid Trial Conversion Credit
* **Conversion Mechanism**:
  * The bride books a standalone paid trial session (e.g., ₹5,000).
  * If the bride confirms her wedding booking within 7 days of the trial, the ₹5,000 trial fee is automatically credited toward her bridal package.
  * Displayed clearly on the invoice: *"Bridal Package: ₹45,000 | Trial Credit Applied: -₹5,000 | Net Balance: ₹40,000"*.

### 3.4 NRI & International Family Payments
* **Features**:
  * Multi-currency view (USD, GBP, AED, EUR, CAD, INR) using live bank conversion rates.
  * Full support for international Visa, Mastercard, and American Express cards via gateway (Razorpay International).
  * Time-zone aware virtual video consultation scheduler (e.g., automatically adjusting between IST, GMT, and EST).

### 3.5 "Gift a Service" / Wedding Registry Gifting
* **Features**:
  * Friends, the groom, or in-laws can contribute toward the bridal package or gift a luxury upgrade (e.g., *"Gift 24K Gold Pre-Bridal Treatment - ₹6,500"*).
  * Generates a royal digital gift card delivered to the bride's WhatsApp with a personalized blessing note.

---

## 4. Looks, Personalization & Trust

### 4.1 "My Looks" Digital Face Chart Profile
* **Features**:
  * Following the trial or consultation, the lead artist documents the approved formulation into the bride's digital profile:
    * *Skin Prep*: Serums and primers used.
    * *Base & Foundation*: Exact brand, formula, and shade code (e.g., Temptu Pro Olive #35 + MAC NC37).
    * *Eye & Brow*: Pigment tones, lash length, brow architecture.
    * *Lips*: Matte lip liner and shade blend codes.
    * *Draping Style*: Single poshak pallu pleating vs double dupatta pinning.
  * Both the bride and the wedding-day assigned artist access the exact same digital face chart, eliminating memory lapses or miscommunication.

### 4.2 Trial vs. Final Before/After Look Slider
* **Features**:
  * Interactive swipe slider comparing the bride's bare skin vs. trial makeup vs. approved jewellery finish.
  * Bride can zoom in to inspect skin texture and leave pin-pointed feedback (e.g., *"Slightly darker liner for night pheras"*).

### 4.3 Outfit Colour & Jewellery Matching Engine
* **Features**:
  * The bride uploads photos of her poshak, lehenga, and jewellery (aad, borla, nath).
  * The system highlights the primary fabric hue and suggests complementary makeup undertones (e.g., crimson poshak ➔ warm antique gold highlighter and deep ruby lip).
  * **Advisory Disclaimer**: Clearly states that suggestions are advisory, and Head Artist Prachi makes the final real-world formulation.

### 4.4 Shared Family Mood Board
* **Features**:
  * Collaborative canvas where the bride, her sister, and mother can pin Instagram links and reference photos.
  * The lead artist pins the single "Authoritative Look" once agreed upon, preventing conflicting last-minute suggestions.

### 4.5 Voice Notes & Video Messaging
* **Features**:
  * Many brides and mothers find typing detailed makeup preferences tedious.
  * Integrated voice note recorder in the booking portal allowing 60-second voice briefs in Hindi or English, archived directly in the client file.

---

## 5. Confidence, Trust & Transparency

### 5.1 "Meet Your Artist" Video & Credentials
* **Features**:
  * 45-second video introduction by the assigned artist.
  * Highlights: Years of experience, academy certifications, languages spoken (Hindi, Marwari, English), and past work at the bride's specific palace venue.

### 5.2 Plain-Language Delay & Emergency Replacement Guarantee
* **Features**:
  * Reassuring legal commitment published transparently before the bride pays her deposit:
    * *Punctuality Guarantee*: Artist arrives at the suite at least 3.5 to 4 hours before ready-by time.
    * *Standby Roster*: If the primary artist faces an emergency, an on-call senior certified artist is dispatched from the city hub with the client's complete digital face chart.
    * *Hygiene Promise*: 100% sanitized brushes, disposable mascara wands, single-use sponge applicators, and clean airbrush equipment.

### 5.3 Honest Social Proof
* **Features**:
  * Shows real verified metrics: *"142 Rajputi & Destination Brides Styled in 2025–2026 Season"*.
  * No manufactured scarcity, fake booking countdowns, or misleading notifications.

---

## 6. Wedding Week, Day-Of & Emergency Support

### 6.1 Bride Wedding-Day Morning Checklist
* **Checklist Items**:
  1. [ ] Wear a front button-up blouse or zip-up robe (avoids disturbing hair and makeup when changing into poshak).
  2. [ ] Wash and fully blow-dry hair the previous evening (do not apply heavy oils or conditioners).
  3. [ ] Clean, moisturized face (do not apply sunscreen with zinc white cast).
  4. [ ] Jewellery, aad, and lehenga ironed, unboxed, and laid out in the dressing area.
  5. [ ] Phone charged and light snacks/water kept in the room.

### 6.2 SOS "Makeup Emergency" Hotline
* **Features**:
  * A prominent red emergency trigger on the day-of dashboard.
  * Routes directly to the Senior Studio Coordinator on call for:
    * Sudden transit delay or road blockage.
    * Accidental makeup smudge from tears or garland friction.
    * Skin allergy or eye watering issue.

### 6.3 Family Live Progress View (Spam-Free)
* **Features**:
  * A shareable, silent status link for the wedding planner, groom, or mother-of-the-bride.
  * Shows milestone progress without sending disruptive WhatsApp pings for every tick:
    * `[06:30 PM] Team Arrived & Set Up` ➔ `[07:45 PM] Base Makeup Done` ➔ `[09:00 PM] Hair & Flowers Set` ➔ `[10:00 PM] Draping Complete & Ready for Photos`.

### 6.4 Studio Lost & Found Tracker
* **Features**:
  * In the whirlwind of palace wedding departures, jewellery pieces or poshak dupattas are occasionally left in the dressing room.
  * Studio coordinators log any recovered items with photos and coordinates safe return with the family.

---

## 7. Post-Wedding Lifetime Relationship

### 7.1 Two-Stage Review & Reputation Shield
* **Workflow**:
  * **Stage 1 (Private Survey)**: Sent 24 hours post-wedding via WhatsApp asking for an internal 1-to-5 star rating and candid feedback on makeup longevity, hair hold, and artist punctuality.
  * **Stage 2 (Public Showcase)**:
    * If the bride rates **5 Stars**: The system invites her to share her experience on Google Reviews and tag the studio on Instagram.
    * If the bride rates **below 4 Stars**: The system immediately escalates the feedback to Studio Management for personal follow-up, keeping resolution private and constructive.

### 7.2 "Shop the Look" & Product Reorder
* **Features**:
  * Displays the exact lip shade, kajal, and setting powder used on her wedding day.
  * Provides direct links or studio purchase options for brides who fell in love with their bridal lip color and want to wear it on dates and honeymoon dinners.

### 7.3 Post-Wedding Skin Aftercare Protocol
* **Features**:
  * Practical guide for safely removing heavy bridal airbrush makeup and poshak spirit gum without damaging skin:
    * Double-cleansing routine (oil-based balm followed by gentle foaming cleanser).
    * Soothing aloe/centella moisture mask to calm skin after long hours in jewellery.

### 7.4 Festival & Occasion Re-Booking
* **Features**:
  * Automated festive styling invites sent prior to major cultural dates:
    * *Karwa Chauth Royal Glam*
    * *Teej & Gangaur Traditional Look*
    * *Diwali & New Year Festivities*
    * *First Wedding Anniversary Photoshoot*
    * *Sister's or Cousin's Upcoming Wedding*
  * The bride's profile, foundation shade, and drape preferences are pre-filled for one-tap booking.

---

## 8. Accessibility, Inclusion & Device Performance

### 8.1 Performance on Mid-Range Android & 4G
* **Features**:
  * Compressed WebP/AVIF imagery with lazy loading.
  * Low-data mode toggle for remote palace locations that loads clean text and layout before high-res video assets.
  * Installable PWA (Progressive Web App) with zero App Store friction.

### 8.2 Elder-Friendly / Parent Mode
* **Features**:
  * High-contrast typography (>9:1 contrast), larger touch targets (minimum 48×48px), and simplified 2-step review screens designed for fathers or elders who manage wedding accounts.

### 8.3 Multilingual Interface
* **Features**:
  * Primary: English and Hindi.
  * Culturally nuanced Rajasthani terms (e.g., *Poshak*, *Aad*, *Borla*, *Muhurat*, *Pheras*, *Varmala*).
  * Expansion ready for Gujarati and Punjabi destination wedding clientele.

---

## 9. Master Customer Feature Matrix & Prioritization

| # | Feature Name | Domain | Priority Tier | Engineering Effort | Primary Surface |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | **Reverse-Start Calculator** | Planning | **Quick Win (P0)** | **S** (1–2 days) | `/my-wedding` & `/book` |
| **2** | **Auspicious Date Panchang Helper** | Discovery | **Quick Win (P0)** | **S** (2 days) | `/` & `/book` |
| **3** | **Run-of-Day PDF Generator** | Day-Of | **Quick Win (P0)** | **S** (2 days) | Cloud Functions / PDF |
| **4** | **Venue Readiness Checklist** | Planning | **Quick Win (P0)** | **S** (1–2 days) | `/my-wedding` |
| **5** | **Emergency Continuity Promise** | Trust | **Quick Win (P0)** | **S** (1 day) | `/my-wedding` & `/services` |
| **6** | **90-Day Beauty Countdown** | Prep | **High Impact (P1)**| **M** (3–4 days) | `/my-wedding` & WhatsApp |
| **7** | **Group Payments & Split Billing** | Payments | **High Impact (P1)**| **M** (4–5 days) | Gateway / `/my-wedding` |
| **8** | **Installment Milestone Schedule** | Payments | **High Impact (P1)**| **M** (3–4 days) | Financial Engine |
| **9** | **Trial Conversion Credit** | Payments | **High Impact (P1)**| **S** (2 days) | Booking / Invoicing |
| **10**| **"My Looks" Digital Face Chart** | Personalization| **High Impact (P1)**| **M** (4 days) | `/my-wedding` & Admin 360 |
| **11**| **Outfit & Jewellery Palette Match**| Personalization| **High Impact (P1)**| **M** (3–4 days) | Vision AI / `/my-wedding` |
| **12**| **Bride Wedding-Day Prep Checklist**| Day-Of | **High Impact (P1)**| **S** (2 days) | `/my-wedding` (Day Mode) |
| **13**| **SOS Makeup Emergency Button** | Emergency | **High Impact (P1)**| **S** (2 days) | `/my-wedding` & WhatsApp |
| **14**| **Family Live Progress View** | Day-Of | **High Impact (P1)**| **S** (2 days) | Public Token Link |
| **15**| **Two-Stage Review & Reputation** | Aftercare | **High Impact (P1)**| **S** (2 days) | Survey / WhatsApp |
| **16**| **"Shop the Look" Product Reorder** | Aftercare | **Later (P2)** | **S** (2 days) | `/my-wedding` |
| **17**| **Shared Family Mood Board** | Personalization| **Later (P2)** | **M** (3–4 days) | Canvas UI |
| **18**| **Voice Note & Audio Briefs** | Comm | **Later (P2)** | **M** (3 days) | Audio Cloud Storage |
| **19**| **Festival & Occasion Rebooking** | Retention | **Later (P2)** | **M** (3 days) | CRM Automation |
| **20**| **Lost & Found Incident Tracker** | Day-Of | **Later (P2)** | **S** (2 days) | Operations Console |

---

## 10. Architectural Safeguards for Customer Features

1. **Explicit AI & AR Disclaimers**: All outfit matching and virtual shade previews carry prominent notices:  
   * *"Color previews are digital simulations. Lighting and screen calibrations vary. Final shades are formulated in person by Head Artist Prachi."*
2. **DPDP Compliance on Bride Photos**: Uploaded outfit and face photos are encrypted at rest, never used for external AI training, and can be permanently purged via the `/privacy` self-service portal.
3. **Limited Permissions on Family Links**: Shared family links allow viewing the function schedule and artist ETA only. Financial ledgers, remaining balances, and private questionnaire notes are hidden from non-authenticated viewers.
4. **Controlled Notification Frequency**: Brides can toggle notification frequency to prevent notification fatigue during peak wedding week.

*This document represents the comprehensive client experience blueprint for Makeovers by Prachi.*
