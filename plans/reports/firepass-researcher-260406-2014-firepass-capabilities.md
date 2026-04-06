# Firepass AI Capabilities Research Report

**Research Date:** 2026-04-06  
**Researcher:** firepass-researcher  
**Target:** https://docs.fireworks.ai/firepass

---

## Executive Summary

Fire Pass is Fireworks AI's subscription service for **personal agentic coding**, providing exclusive access to Kimi K2.5 Turbo at a flat weekly rate. It differs from standard Fireworks inference by offering zero per-token costs for specific models and is strictly for individual development use.

---

## 1. Available Models in Fire Pass

### Exclusive Fire Pass Model
| Model ID | Description | Context Window | Pricing |
|----------|-------------|----------------|---------|
| `accounts/fireworks/routers/kimi-k2p5-turbo` | Faster Kimi K2.5 serverless API (Private Preview) | 256K | $7/week after first free week |

### Regular Fireworks Models (Per-Token Pricing)
Fire Pass subscribers can also use standard Fireworks models with normal per-token charges:

| Model Family | Examples |
|--------------|----------|
| **Kimi K2** | `accounts/fireworks/models/kimi-k2-instruct-0905` |
| **Llama** | 1, 2, 3, 3.1, 4 |
| **Qwen** | Qwen2, Qwen2.5, Qwen2.5-VL, Qwen3 |
| **DeepSeek** | V1, V2, V3 |
| **Mistral** | Mistral & Mixtral |
| **Vision** | LLaVA, Idefics3, Phi-3V, Vision Llama |

---

## 2. Multi-Modal Capabilities

| Capability | Status | Details |
|------------|--------|---------|
| **Images** | YES | Supported via Vision-Language Models (VLMs). Formats: PNG, JPG, JPEG, GIF, BMP, TIFF, PPM. Max 30 images per request. Base64 payload under 10MB, URLs under 5MB (1.5s download timeout). |
| **Files (PDF/Text)** | PARTIAL | PDFs must be converted to images first. Text files can be processed as input text. |
| **Audio** | YES | Supported via Qwen3 Omni model. Format: OGG (Opus). Base64-encoded, max 10MB. Requires dedicated deployment (not serverless). |
| **Video** | YES | Supported via Qwen3 Omni, Molmo2-4B, Molmo2-8B. Format: MP4. Base64-encoded, max 10MB, 60 seconds recommended. Requires dedicated deployment. |

### Multi-Modal Models
| Model | Audio | Video | Text | Deployment |
|-------|-------|-------|------|------------|
| Qwen3 Omni 30B A3B Instruct | YES | YES | YES | Dedicated only |
| Molmo2-4B | NO | YES | YES | Dedicated only |
| Molmo2-8B | NO | YES | YES | Dedicated only |
| Kimi K2.5 | NO | NO | YES | Serverless |
| Llama 3.2 Vision | NO | YES | YES | Serverless |

---

## 3. API Features

### Core Chat Completion Features
| Feature | Support | Notes |
|---------|---------|-------|
| **Streaming** | YES | Server-Sent Events (SSE). Set `stream: true`. |
| **Function Calling (Tools)** | YES | OpenAI-compatible. Supports `tools`, `tool_choice` (auto/none/required/specific). Parallel tool calling supported on some models. |
| **JSON Mode** | YES | Set `response_format: "json_object"`. Must explicitly instruct model to output JSON in prompt. |
| **JSON Schema** | YES | Set `response_format: "json_schema"` with schema definition. |
| **Grammar Mode** | YES | BNF grammar support via `response_format: "grammar"`. |
| **Reasoning Models** | YES | `reasoning_effort` parameter (low/medium/high/none). `reasoning_history` for historical content. |
| **Anthropic-compatible** | YES | Endpoint at `https://api.fireworks.ai/inference` with `thinking` configuration. |

### Embeddings & Reranking
| Feature | Support | Details |
|---------|---------|---------|
| **Embeddings API** | YES | Endpoint: `POST /v1/embeddings`. Models: Qwen3 Embeddings (8B, 4B, 0.6B), nomic-embed-text-v1.5, any LLM as embedding model. |
| **Variable Dimensions** | YES | Use `dimensions` parameter (min 1). Supported on nomic-embed-text-v1.5+. |
| **Reranking** | YES | Qwen3 Reranker series available. `/rerank` endpoint or `/embeddings` with `return_logits`. |

### Additional Features
| Feature | Description |
|---------|-------------|
| **Speculative Decoding** | `speculation` parameter for faster inference |
| **Performance Metrics** | `perf_metrics_in_response` for token counts and server timing |
| **Context Length Handling** | `context_length_exceeded_behavior` (truncate or error) |

---

## 4. Fire Pass vs Regular Fireworks

| Aspect | Fire Pass | Regular Fireworks |
|--------|-----------|-------------------|
| **Pricing Model** | Flat $7/week | Per-token usage |
| **Included Models** | Kimi K2.5 Turbo only | All models |
| **Token Costs** | Zero for turbo model | Standard pricing |
| **Use Case** | Personal agentic coding only | Production, team, any use |
| **Best For** | Individual devs, experimentation | Production workloads |
| **Auto-renewal** | Enabled (not guaranteed) | N/A |

---

## 5. Recommendations for Chatbot Enhancement

### Immediate Opportunities

1. **Enable Streaming**
   - Current implementation uses non-streaming mode
   - Set `stream: true` for better UX with real-time responses
   - SSE format: tokens sent incrementally

2. **Add Multi-Modal Support**
   - Kimi K2.5 Turbo supports images (based on config showing "Supports Images: Enabled")
   - Add image upload capability to chatbot
   - Use base64 or URL format in message content

3. **Implement Function Calling**
   - Define tools for command suggestions (replace static command list)
   - Enable dynamic workflow generation
   - Example: Tool to query available commands from database

4. **Add JSON Schema Validation**
   - Current implementation manually parses JSON
   - Use `response_format: { type: "json_schema", schema: {...} }` for guaranteed structure

### Code Examples

#### Streaming Request
```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: true, // Enable streaming
  }),
});
// Handle SSE response
```

#### Function Calling
```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages,
    tools: [{
      type: "function",
      function: {
        name: "suggest_command",
        description: "Suggest appropriate ClaudeKit command",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string" },
            reason: { type: "string" }
          },
          required: ["command", "reason"]
        }
      }
    }],
    tool_choice: "auto",
  }),
});
```

#### Image Input
```typescript
const messages = [{
  role: "user",
  content: [
    { type: "text", text: "Analyze this image" },
    { type: "image_url", image_url: { url: "data:image/jpeg;base64,/9j/4AAQ..." } }
  ]
}];
```

---

## 6. Current Implementation Analysis

**File:** `src/lib/firepass-client.ts`

### What's Working
- Uses Fire Pass model: `accounts/fireworks/routers/kimi-k2p5-turbo`
- JSON mode with schema enforcement
- Temperature and max_tokens configured
- OpenAI-compatible endpoint

### Limitations
- Non-streaming (slower perceived response)
- No tool/function calling (static command list in prompt)
- No multi-modal support (images not utilized)
- Manual JSON parsing instead of schema validation
- No retry logic for API failures

---

## Unresolved Questions

1. **Does Fire Pass include embeddings access at zero cost?** Documentation unclear on whether embeddings API is included in the $7/week plan.

2. **What is the exact rate limit for Kimi K2.5 Turbo?** No specific RPM/TPM limits documented for Fire Pass users.

3. **Does the Fire Pass model support parallel function calling?** Documentation mentions "some models" support this but doesn't specify which.

4. **Are there vision capabilities in Kimi K2.5 Turbo specifically?** Configuration shows "Supports Images: Enabled" but model documentation focuses on text.

---

## Sources

- Fire Pass Documentation: https://docs.fireworks.ai/firepass.md
- Chat Completions API: https://docs.fireworks.ai/api-reference/post-chatcompletions.md
- Function Calling: https://docs.fireworks.ai/guides/function-calling.md
- Structured Outputs: https://docs.fireworks.ai/structured-responses/structured-response-formatting.md
- Vision Models: https://docs.fireworks.ai/guides/querying-vision-language-models.md
- Video/Audio: https://docs.fireworks.ai/guides/video-audio-inputs.md
- Embeddings: https://docs.fireworks.ai/guides/querying-embeddings-models.md
- API Index: https://docs.fireworks.ai/llms.txt
