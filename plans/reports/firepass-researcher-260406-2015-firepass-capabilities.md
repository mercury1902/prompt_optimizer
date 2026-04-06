# Firepass AI Capabilities Research Report

**Date:** 2026-04-06  
**Researcher:** firepass-researcher  
**Source:** Fireworks AI Documentation

---

## Executive Summary

Firepass is a subscription service ($7/week after free trial) providing unlimited access to **Kimi K2.5 Turbo** (`accounts/fireworks/routers/kimi-k2p5-turbo`) with zero per-token costs. It is restricted to **personal agentic coding use only** — no production workloads or team usage.

Fireworks AI platform supports 100+ models including text, vision, audio, image, and embeddings. However, **only Kimi K2.5 Turbo is covered by Firepass** — all other models incur standard per-token charges.

---

## Available Models

| Model | ID | Context Window | Firepass Coverage |
|-------|-----|----------------|-------------------|
| **Kimi K2.5 Turbo** | `accounts/fireworks/routers/kimi-k2p5-turbo` | 256k | YES (unlimited) |
| Kimi K2.5 (regular) | `accounts/fireworks/models/kimi-k2-instruct-*` | Varies | NO (per-token cost) |
| Other Fireworks models | Various | Varies | NO (per-token cost) |

**Important:** Only Kimi K2.5 Turbo is covered by Firepass. All other models incur standard per-token charges.

---

## Multi-Modal Capabilities

| Capability | Support | Notes |
|------------|---------|-------|
| **Images** | YES | Vision-language model support for image analysis |
| **PDF/Text Files** | PARTIAL | Via vision API (document understanding) |
| **Audio** | NO | Not mentioned for Kimi K2.5 Turbo |
| **Video** | NO | Not supported |

### Vision/Image Support
- Can analyze images and visual content
- Fine-tuning available for vision-language models
- OpenAI-compatible image input format
- Supports base64 encoded images and image URLs

---

## API Features

| Feature | Support | Implementation Notes |
|---------|---------|---------------------|
| **Streaming** | YES | Responses API supports streaming |
| **Function Calling** | YES | Tool calling with JSON Schema |
| **JSON Mode** | YES | `response_format: { type: "json_object" }` |
| **Structured Outputs** | YES | JSON schema enforcement, custom grammars |
| **Embeddings** | NO* | Available on Fireworks but not via Firepass |
| **Batch Processing** | NO* | Available on Fireworks but not via Firepass |
| **Audio/Speech** | NO* | Available on platform but not with this model |

*These features exist on Fireworks platform but are not covered by Firepass subscription.

---

## Current Implementation Analysis

**File:** `src/lib/firepass-client.ts`

Current implementation uses:
- Model: `accounts/fireworks/routers/kimi-k2p5-turbo`
- JSON mode: YES (`response_format: { type: "json_object" }`)
- Temperature: 0.7
- Max tokens: 4096
- API endpoint: `https://api.fireworks.ai/inference/v1/chat/completions`

**What's NOT implemented:**
- Streaming
- Function calling
- Vision/multi-modal inputs
- Higher max_tokens (can use up to 256k context)

---

## Code Examples

### 1. Current JSON Mode Usage (Already Implemented)
```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "accounts/fireworks/routers/kimi-k2p5-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInput }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },  // JSON mode enabled
  }),
});
```

### 2. Streaming Support
```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "accounts/fireworks/routers/kimi-k2p5-turbo",
    messages: [{ role: "user", content: userInput }],
    stream: true,  // Enable streaming
    temperature: 0.7,
  }),
});

// Handle streaming response
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      const parsed = JSON.parse(data);
      const content = parsed.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
```

### 3. Function Calling
```typescript
const tools = [{
  type: "function",
  function: {
    name: "get_weather",
    description: "Get current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "City name" }
      },
      required: ["location"]
    }
  }
}];

const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "accounts/fireworks/routers/kimi-k2p5-turbo",
    messages: [{ role: "user", content: "What's the weather in SF?" }],
    tools: tools,
    tool_choice: "auto",  // "auto", "none", "required", or specific function name
    temperature: 0.1,  // Low temp for deterministic tool selection
  }),
});

// Handle tool_calls in response
const data = await response.json();
const toolCalls = data.choices[0]?.message?.tool_calls;

// Execute function and send result back
if (toolCalls) {
  const functionResult = await executeFunction(toolCalls[0]);
  messages.push(data.choices[0].message);  // Assistant's tool call
  messages.push({
    role: "tool",
    tool_call_id: toolCalls[0].id,
    content: JSON.stringify(functionResult)
  });
  // Make second API call to get final response
}
```

### 4. Vision/Multi-Modal Input
```typescript
const messages = [{
  role: "user",
  content: [
    { type: "text", text: "What's in this image?" },
    {
      type: "image_url",
      image_url: {
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        // OR remote URL: "https://example.com/image.jpg"
      }
    }
  ]
}];

const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "accounts/fireworks/routers/kimi-k2p5-turbo",
    messages: messages,
    max_tokens: 4096,
  }),
});
```

---

## Recommendations for Chatbot Enhancement

### High Priority (Easy Wins)

1. **Streaming Support**
   - Improves perceived responsiveness
   - Shows output as it's generated
   - Minor API change required
   - Better UX for long responses

2. **Increase Max Tokens**
   - Current: 4096
   - Kimi K2.5 Turbo supports 256k context
   - Can increase to 8192 or 16384 for longer responses
   - Useful for complex workflow explanations

### Medium Priority (Feature Expansion)

3. **Vision/Image Input**
   - Enable users to upload screenshots
   - Useful for debugging UI issues
   - Code review from images
   - OpenAI-compatible format

4. **Function Calling**
   - Enable tool use for external APIs
   - Could integrate with GitHub, file system, etc.
   - More complex implementation
   - Requires tool execution infrastructure

### Low Priority (Nice to Have)

5. **Structured Output Schemas**
   - Move from basic `json_object` to specific JSON schema
   - More reliable parsing
   - Better error handling
   - Use `response_format: { type: "json_schema", json_schema: {...} }`

---

## Limitations to Note

1. **Personal Use Only** — Cannot be used for production workloads
2. **Team/Shared Usage Prohibited** — Individual use only
3. **Single Model** — Only Kimi K2.5 Turbo is covered
4. **No Embeddings** — Would need separate API key for embedding models
5. **No Batch Processing** — Real-time only via Firepass
6. **No Audio Processing** — Not available with Kimi K2.5 Turbo

---

## Compatibility Notes

Fireworks AI maintains compatibility with:
- **OpenAI SDK** — Drop-in replacement, just change base URL
- **Anthropic SDK** — Compatible via `/inference` endpoint
- **Standard HTTP** — REST API with OpenAI-compatible format

Base URLs:
- OpenAI-compatible: `https://api.fireworks.ai/inference/v1`
- Anthropic-compatible: `https://api.fireworks.ai/inference`

---

## Unresolved Questions

1. Does Kimi K2.5 Turbo support parallel function calling?
2. What is the rate limit for Firepass users?
3. Is there a daily/weekly request cap on Firepass?
4. Does streaming support work with JSON mode simultaneously?
5. What image formats are supported (PNG, JPEG, WebP, etc.)?
6. Is there a max image size limit for vision inputs?
7. Does Fireworks AI support tool_choice="required" mode?
8. Are there any temperature recommendations for coding tasks?

---

## Sources

- Fireworks AI Documentation: https://docs.fireworks.ai/firepass
- Fireworks AI API Reference: https://docs.fireworks.ai/api-reference
- Fireworks AI Function Calling Guide: https://docs.fireworks.ai/guides/function-calling
- Fireworks AI LLMs Index: https://docs.fireworks.ai/llms.txt

---

**Status:** DONE  
**Report Location:** `D:\project\Clone\ck\claudekit-chatbot-astro\plans\reports\firepass-researcher-260406-2015-firepass-capabilities.md`
