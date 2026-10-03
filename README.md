# Makeovers by Prachi — Luxury Bridal & Beauty Platform Ecosystem

An enterprise-grade, luxury bridal beauty ecosystem operating across **Customer Web** (Next.js 14), **Operations & Command Center** (Flutter Desktop & Mobile), and **Serverless Cloud Microservices** (Firebase Cloud Functions, Firestore, Storage, WhatsApp Cloud API, AI Gateway).

📖 **Comprehensive Documentation**:
For the complete architectural breakdown, UI/UX presentation specifications, data models, security guardrails, and feature catalog across all sides, please see:
👉 [PLATFORM_MASTER_SPECIFICATION.md](PLATFORM_MASTER_SPECIFICATION.md)

---

## Ecosystem Overview
* **Customer Web (`customer-web/`)**: Next.js 14 App Router, dynamic NPCI UPI QR code generation, payment proof verification, booking tracker, destination city portals (Jodhpur, Jaipur, Udaipur), and AI Beauty Concierge.
* **Admin Command Center & Mobile App (`lib/`)**: Flutter 3.x with BLoC architecture, 31 operational feature modules, Event-Day SOP checklists, master multi-slot availability calendar, GST 18% tax ledger, and WhatsApp Automation.
* **Multi-Tenant Studio Marketplace**: Independent beauty artist directory, salon onboarding, real-time customer-artist chat, and automated escrow settlements.
* **Backend Microservices (`functions/`)**: 71 authoritative Cloud Functions managing booking lifecycles, atomic double-booking prevention, financial period locks, and AI safety guardrails.

