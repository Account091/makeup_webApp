# V5.0 AI Provider Configuration & Hugging Face Integration

## Environment Variables

Server-only configuration (`customer-web/.env.local` or environment secrets):

```env
HF_TOKEN=hf_**********************************
HF_PROVIDER=auto
AI_PRIMARY_PROVIDER=huggingface
AI_FALLBACK_PROVIDER=huggingface
AI_DEFAULT_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
AI_FALLBACK_MODEL=meta-llama/Llama-3.3-70B-Instruct
AI_MAX_INPUT_TOKENS=4096
AI_MAX_OUTPUT_TOKENS=1024
AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
AI_ENABLED=true
```

## Firestore Central Settings

Document path: `settings/ai`

```json
{
  "enabled": true,
  "provider": "huggingface",
  "providerPolicy": "auto",
  "defaultModel": "Qwen/Qwen2.5-Coder-32B-Instruct",
  "fallbackModel": "meta-llama/Llama-3.3-70B-Instruct",
  "maxOutputTokens": 1024,
  "temperature": 0.7,
  "timeoutMs": 30000,
  "maxRetries": 2
}
```

## Hugging Face Production Routing Strategy
- **Phase 1 (Current)**: Hugging Face Inference Providers via `@huggingface/inference` SDK with automatic or explicit provider selection.
- **Phase 2 (Dedicated Scaling)**: Hugging Face Inference Endpoints using managed vLLM/TGI infrastructure when volume or latency SLA requires dedicated resources.
