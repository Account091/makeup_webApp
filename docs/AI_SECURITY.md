# V5.0 AI Gateway Security & Isolation Specification

## Security Principles

### 1. Token Isolation
- `HF_TOKEN`, `HUGGINGFACE_API_KEY`, and `OPENAI_API_KEY` are stored exclusively in server environment variables.
- **NEVER** expose provider keys in `NEXT_PUBLIC_*` or client bundles.

### 2. Role-Based Access Control (RBAC) & Scope Isolation
- Customer requests are strictly scoped to documents owned by that authenticated `uid` or `customerId`.
- Admin Copilot features (`ADMIN_COPILOT`) enforce role checks (`ADMIN`, `OWNER`, `MANAGER`, `SUPPORT`). Unauthorized attempts trigger an immediate `AiAuthorizationError` and log a security audit event.

### 3. Multi-Stage AI Safety Layer
Before invoking external model inference providers:
1. **Input Length Validation**: Enforces `AI_MAX_INPUT_TOKENS` limits (default: 4096 tokens).
2. **Prompt Injection Defense**: Filters system prompt override patterns (`"ignore previous instructions"`, `"reveal system prompt"`, `"you are now in developer mode"`).
3. **Context Wrapping**: Wraps user input in `<user_query>` XML boundaries to prevent instruction poisoning.
4. **Deterministic Boundary Checking**: Detects attempts to ask AI to modify financial figures, bypass deposits, or approve UTRs.

### 4. Audit Trail (`aiToolCalls`)
Every invocation logs an audit document to `aiToolCalls/{requestId}` in Firestore:
- `requestId`, `uid`, `userRole`, `feature`, `provider`, `model`, `latencyMs`, `inputTokens`, `outputTokens`, `fallbackUsed`, `promptHash`.
- Raw sensitive prompts are hashed using SHA-256 to preserve PII privacy.
