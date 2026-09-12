# V5.0 AI Gateway Architecture Specification

## Overview
The **V5.0 AI Gateway** provides a unified, secure, server-side interface for all artificial intelligence capabilities across the Makeovers by Prachi platform (`customer-web` Next.js frontend and `makeup_webapp` Flutter Admin portal).

```text
┌─────────────────────────┐
│  Client (Web / Flutter) │
└────────────┬────────────┘
             │ (HTTPS POST)
             ▼
┌─────────────────────────┐
│     AI Gateway API      │
│  /api/ai/chat           │
│  /api/ai/concierge      │
│  /api/ai/admin-copilot  │
│  /api/ai/content-draft  │
│  /api/ai/analyze        │
├─────────────────────────┤
│ 1. Rate Limiting        │
│ 2. Safety Guard         │
│ 3. Context Builder      │
│ 4. Capability Router    │
│ 5. Tool Registry        │
│ 6. Response Guard       │
│ 7. Audit Logger         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Model Provider Layer    │
│ (Hugging Face / OpenAI) │
└─────────────────────────┘
```

## Deterministic Business Logic Boundary
AI models **NEVER** modify database records or financial figures directly.
- **Pricing & Quotes**: Server-authoritative API.
- **Deposit & Expiry**: Server-authoritative `expiresAt` & `calendarReservations/{id}` hold lock.
- **Payment Verification**: Deterministic `paymentUtrIndex/UTR_<HASH>` transaction lock.
- **AI Role**: Read, analyze, summarize, recommend, draft, classify, and generate text/vision insights. Mutation recommendations require human approval before triggering authorized Cloud Functions.

## Capability Routing Table
| Feature | Primary Model | Fallback Model | Purpose |
| :--- | :--- | :--- | :--- |
| `CUSTOMER_CONCIERGE` | `Qwen/Qwen2.5-Coder-32B-Instruct` | `Llama-3.3-70B-Instruct` | Bridal consultation & package recommendations |
| `ADMIN_COPILOT` | `meta-llama/Llama-3.3-70B-Instruct` | `Qwen2.5-Coder-32B-Instruct` | CRM summaries, support assistance, risk identification |
| `CONTENT_DRAFTER` | `meta-llama/Llama-3.3-70B-Instruct` | `Qwen2.5-Coder-32B-Instruct` | Instagram captions, WhatsApp copy, SEO metadata |
| `WHATSAPP_ASSISTANT` | `Qwen/Qwen2.5-Coder-32B-Instruct` | `Llama-3.3-70B-Instruct` | Direct client communication drafting |
| `VISION_ANALYSIS` | `Qwen/Qwen2-VL-7B-Instruct` | `Qwen2-VL-7B-Instruct` | Multimodal skin tone & bridal style analysis |
