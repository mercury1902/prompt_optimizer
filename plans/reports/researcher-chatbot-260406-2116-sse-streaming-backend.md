# Research Report: Chat Backend SSE Streaming for Astro + React

Generated: 2026-04-06
Project: claudekit-chatbot-astro
Focus: Phase 2 - API Backend with SSE Streaming

---

## Executive Summary

Current chatbot uses buffer-based Firepass API calls. Phase 2 requires migrating to Server-Sent Events (SSE) streaming for real-time UX improvements. Astro supports streaming via standard Web Streams API in API routes. React 19 provides built-in streaming support with Suspense boundaries.

**Key recommendation:** Implement SSE endpoint in Astro API route, use ReadableStream with TransformStream for buffering, consume with EventSource on client.

---

## 1. Current State Analysis

### 1.1 Existing Architecture

```
Client (React) → firepass-client.ts → Firepass API (buffered)
```

**Issues:**
- Full response buffered before display
- No real-time progress indication
- Poor UX for long workflows
- Memory overhead for large responses

### 1.2 Firepass Client Current Implementation

```typescript
// Current: Buffered response
const aiResult = await optimizePrompt(input); // waits for full response
setMessages(prev => [...prev, assistantMessage]); // then displays
```

**Missing:**
- onChunk callback not wired to UI
- No streaming state management
- Message renders after completion only

---

## 2. SSE Streaming Architecture

### 2.1 Target Architecture

```
Client (React + EventSource)
  ↕ SSE connection
Astro API Route (/api/chat.ts)
  ↕ streams chunks
Firepass API (streaming mode)
  ↕ streams
Kimi K2.5 Turbo
```

### 2.2 Astro API Route Pattern

```typescript
// src/pages/api/chat.ts
export const prerender = false; // Server endpoint

export const POST: APIRoute = async ({ request }) => {
  const { messages, prompt } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Stream from Firepass
      await optimizePromptStreaming(prompt, {
        onChunk: (chunk) => {
          const sseMessage = `data: ${JSON.stringify({ chunk })}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        },
        onComplete: () => controller.close(),
        onError: (err) => controller.error(err)
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    }
  });
};
```

### 2.3 Client-Side EventSource Pattern

```typescript
// React hook for SSE
export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = async (prompt: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setStreamingContent(prev => prev + data.chunk);
        }
      }
    }
  };

  return { messages, streamingContent, sendMessage };
}
```

---

## 3. Firepass Streaming Integration

### 3.1 Firepass API Streaming Support

Firepass API supports streaming via `stream: true` parameter:

```typescript
// lib/firepass-client.ts
export async function optimizePromptStreaming(
  prompt: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(FIREPASS_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      model: 'kimi-k2-5-turbo',
      stream: true, // Enable streaming
      system_prompt: SYSTEM_PROMPT
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) {
      callbacks.onComplete?.();
      break;
    }

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          callbacks.onChunk?.(data.choices?.[0]?.delta?.content || '');
        } catch {
          // Handle partial JSON
        }
      }
    }
  }
}
```

### 3.2 Stream Transformation

```typescript
// Transform Firepass chunks to SSE format
class FirepassTransformStream extends TransformStream {
  constructor() {
    super({
      transform(chunk, controller) {
        const sseData = `data: ${JSON.stringify({ chunk })}\n\n`;
        controller.enqueue(new TextEncoder().encode(sseData));
      }
    });
  }
}
```

---

## 4. Message Persistence Architecture

### 4.1 Storage Options Comparison

| Storage | Pros | Cons | Best For |
|---------|------|------|----------|
| **LocalStorage** | Simple, no backend | 5MB limit, per-device | Single-user prototype |
| **IndexedDB** | Larger capacity, structured | Complex API, no sync | Offline-first apps |
| **PostgreSQL** | Relational, scalable | Requires backend | Multi-user production |
| **Redis** | Fast, pub/sub | Volatile, extra service | Session cache |
| **Vercel KV** | Serverless, easy | Vendor lock-in | Vercel deployments |

### 4.2 Recommended: PostgreSQL + Prisma

```typescript
// prisma/schema.prisma
model Message {
  id        String   @id @default(cuid())
  role      String   // 'user' | 'assistant'
  content   String
  metadata  Json?    // workflow, commands, etc.
  sessionId String
  createdAt DateTime @default(now())

  @@index([sessionId, createdAt])
}

model Session {
  id        String   @id @default(cuid())
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  Message[]
}
```

### 4.3 Astro API Route with Persistence

```typescript
// src/pages/api/chat.ts
export const POST: APIRoute = async ({ request }) => {
  const { prompt, sessionId } = await request.json();

  // Save user message
  await prisma.message.create({
    data: { role: 'user', content: prompt, sessionId }
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullContent = '';

      await optimizePromptStreaming(prompt, {
        onChunk: (chunk) => {
          fullContent += chunk;
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ chunk })}\n\n`
          ));
        },
        onComplete: async () => {
          // Save assistant response
          await prisma.message.create({
            data: { role: 'assistant', content: fullContent, sessionId }
          });
          controller.close();
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
};
```

---

## 5. Rate Limiting Strategies

### 5.1 Tiered Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

const cache = new LRUCache<string, number[]>({ max: 1000 });

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - 60 * 1000; // 1 minute window

  const requests = cache.get(identifier) || [];
  const recentRequests = requests.filter(t => t > windowStart);

  if (recentRequests.length >= config.requestsPerMinute) {
    const oldestRequest = recentRequests[0];
    const retryAfter = Math.ceil((oldestRequest + 60 * 1000 - now) / 1000);
    return { allowed: false, retryAfter };
  }

  recentRequests.push(now);
  cache.set(identifier, recentRequests);
  return { allowed: true };
}
```

### 5.2 Astro Middleware Integration

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname === '/api/chat') {
    const ip = context.request.headers.get('x-forwarded-for') || 'unknown';

    const { allowed, retryAfter } = checkRateLimit(ip, {
      requestsPerMinute: 10,
      tokensPerMinute: 10000
    });

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter)
        }
      });
    }
  }

  return next();
});
```

---

## 6. Error Handling Patterns

### 6.1 SSE Error Propagation

```typescript
// Error as SSE event
function sendError(controller: ReadableStreamController, error: Error) {
  const encoder = new TextEncoder();
  const errorEvent = `event: error\ndata: ${JSON.stringify({
    message: error.message,
    code: error.name
  })}\n\n`;
  controller.enqueue(encoder.encode(errorEvent));
}

// Client-side error handling
evtSource.addEventListener('error', (event) => {
  if (event.data) {
    const error = JSON.parse(event.data);
    setError(error.message);
  }
});
```

### 6.2 Retry with Exponential Backoff

```typescript
async function sendWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await sleep(parseInt(retryAfter || '5') * 1000);
        continue;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 7. Production Checklist

### 7.1 Security

- [ ] API key stored in server-side env only
- [ ] Rate limiting per IP + user
- [ ] Input validation (max length, sanitization)
- [ ] CORS configuration for production domain
- [ ] Request logging for audit trail
- [ ] Error messages don't leak stack traces

### 7.2 Performance

- [ ] HTTP/2 enabled (6 SSE limit per HTTP/1.1 domain)
- [ ] Connection keep-alive configured
- [ ] Message pagination (100 messages/page)
- [ ] Lazy loading for conversation history
- [ ] CDN for static assets

### 7.3 Reliability

- [ ] Circuit breaker for Firepass API
- [ ] Connection timeout handling (30s)
- [ ] Automatic reconnection on disconnect
- [ ] Database connection pooling
- [ ] Health check endpoint

---

## 8. Implementation Roadmap

### Phase 2a: Basic Streaming
1. Create `/api/chat.ts` with SSE endpoint
2. Add streaming support to `firepass-client.ts`
3. Update React component with EventSource
4. Add typing indicator during streaming

### Phase 2b: Persistence
1. Add PostgreSQL + Prisma
2. Create Message/Session models
3. Save messages on stream completion
4. Add conversation history endpoint

### Phase 2c: Hardening
1. Implement rate limiting
2. Add error boundaries
3. Setup retry logic
4. Add monitoring/health checks

---

## 9. Code Examples

### Complete Astro API Route

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { optimizePromptStreaming } from '../../lib/firepass-client';
import { checkRateLimit } from '../../lib/rate-limit';
import { prisma } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(ip, { rpm: 10, tpm: 10000 });

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  // Parse request
  const { prompt, sessionId } = await request.json();
  if (!prompt || prompt.length > 10000) {
    return new Response(
      JSON.stringify({ error: 'Invalid prompt' }),
      { status: 400 }
    );
  }

  // Create stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullContent = '';

      try {
        await optimizePromptStreaming(prompt, {
          onChunk: (chunk) => {
            fullContent += chunk;
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`
            ));
          },
          onComplete: async () => {
            // Persist message
            if (sessionId) {
              await prisma.message.create({
                data: {
                  role: 'assistant',
                  content: fullContent,
                  sessionId
                }
              });
            }

            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'done' })}\n\n`
            ));
            controller.close();
          },
          onError: (error) => {
            controller.enqueue(encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
            ));
            controller.close();
          }
        });
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
```

### React Hook for Streaming

```typescript
// hooks/useChatStream.ts
import { useState, useCallback, useRef } from 'react';

interface StreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function useChatStream(sessionId?: string) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (prompt: string) => {
    // Add user message
    const userMessage: StreamMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt
    };
    setMessages(prev => [...prev, userMessage]);

    // Add streaming placeholder
    const assistantMessage: StreamMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);

    // Start SSE connection
    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId }),
        signal: abortRef.current.signal
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'chunk') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            } else if (data.type === 'done') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, isStreaming: false }
                    : m
                )
              );
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: `Error: ${error.message}`, isStreaming: false }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }, [sessionId]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, sendMessage, cancel, isStreaming };
}
```

---

## Unresolved Questions

1. Firepass API streaming format - need to verify exact SSE format
2. Session management - anonymous vs authenticated users
3. Message retention policy - how long to keep history
4. Multi-device sync - needed for user accounts
5. Real-time collaboration - multiple users in same session
6. Message pagination - load more on scroll vs all at once
7. File attachment support - images, documents in messages
8. Offline queue - save pending messages when disconnected
