# Research Report: Phase 3 - Tool System for Chatbot

Generated: 2026-04-06
Project: claudekit-chatbot-astro
Focus: Tool System (web search, code execution, tool UI)

---

## Executive Summary

Phase 3 adds tool capabilities to the chatbot: web search integration and code execution. Three web search providers evaluated (SerpAPI, Tavily, Perplexity). Code execution via E2B sandbox. Tool UI follows Vercel AI SDK patterns with typed tool parts and state transitions.

**Recommendation:**
- **Web search:** Tavily (free tier, 180ms latency, AI-optimized)
- **Code execution:** E2B (free $100 credits, Firecracker sandbox, LLM-agnostic)
- **Tool UI:** Vercel AI SDK patterns with `tool`, `execute`, state visualization

---

## 1. Web Search Providers

### 1.1 Comparison Matrix

| Provider | Free Tier | Pricing | Latency | Best For |
|----------|-----------|---------|---------|----------|
| **Tavily** | Yes ($0) | Paid plans | 180ms p50 | AI agents, RAG |
| **SerpAPI** | 250/mo | $25-275/mo | Varies | Google Search API |
| **Perplexity** | Limited | Token + request fees | Fast | Complex queries |

### 1.2 Tavily (Recommended)

**Pricing:**
- Free tier available ($0 entry)
- Paid plans via application portal

**Features:**
- REST API with `/search` and `/research` endpoints
- 180ms p50 latency (fastest on market)
- Content extraction, crawling, site mapping
- Real-time search optimized for AI agents
- Handle thousands of queries in seconds
- 99.99% uptime SLA
- Drop-in integration with OpenAI, Anthropic, Groq

**Security:**
- Safeguards against PII leakage
- Prompt injection protection
- Malicious source filtering

**Integration Example:**
```typescript
const searchTool = tool({
  description: 'Search the web for current information',
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TAVILY_API_KEY}` },
      body: JSON.stringify({ query, search_depth: 'basic' })
    });
    const data = await response.json();
    return {
      results: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content
      }))
    };
  }
});
```

### 1.3 SerpAPI

**Pricing:**
| Plan | Price | Searches |
|------|-------|----------|
| Free | $0 | 250/mo |
| Starter | $25 | 1,000 |
| Developer | $75 | 5,000 |
| Production | $150 | 15,000 |
| Big Data | $275 | 30,000 |

**Features:**
- Google Search API + Bing, DuckDuckGo, Yahoo, Baidu, Yandex
- Only successful searches counted
- Throughput: 50-6,000 hourly by tier
- ZeroTrace Mode (privacy)
- Ludicrous Speed options
- X-Ray parsing
- 11 language libraries (Python, JS, Go, Rust, etc.)
- Cached searches free

**API Endpoint:**
```
https://serpapi.com/search?engine=google&q={query}
```

### 1.4 Perplexity

**Pricing Model:**
- **Agent API:** Direct rates (no markup) + tool fees
  - `web_search`: $0.005 per invocation
  - `fetch_url`: $0.0005 per invocation
- **Search API:** $5.00 per 1K requests (no token cost)
- **Sonar APIs:** Token + request fees
  - Standard Sonar: $1 per 1M tokens + $5-12 per 1K requests
  - Sonar Deep Research: Additional citation/reasoning costs

**Features:**
- Pro Search with multi-step tool usage
- Fast/Pro/Auto classification modes
- AWS Marketplace billing available

---

## 2. Code Execution Sandboxing

### 2.1 E2B (Recommended)

**Pricing:**
| Tier | Price | Features |
|------|-------|----------|
| **Hobby** | Free | $100 credits, 1-hour sessions, 20 concurrent |
| **Pro** | $150/mo | 24-hour sessions, 100 concurrent, custom CPU/RAM |

**Compute Pricing:**
- CPU: $0.000014/s (1 vCPU) to $0.000112/s (8 vCPUs)
- RAM: $0.0000045/GiB/s
- Storage: 10 GiB free (Hobby), 20 GiB (Pro)

**Technical Specs:**
- Firecracker microVM (AWS Lambda tech)
- Launch: <200ms (80ms quick start)
- Session length: Up to 24 hours
- Languages: Python, JavaScript, Ruby, C++
- Full Linux environment with terminal, browser, filesystem

**Security:**
- Full isolation per sandbox
- No cold starts
- BYOC, on-prem, or self-hosted options

**Integration:**
```typescript
import { Sandbox } from '@e2b/code-interpreter';

const codeTool = tool({
  description: 'Execute code in sandbox environment',
  parameters: z.object({
    code: z.string(),
    language: z.enum(['python', 'javascript'])
  }),
  execute: async ({ code, language }) => {
    const sandbox = await Sandbox.create();
    const result = await sandbox.runCode(code, { language });
    await sandbox.close();
    return {
      output: result.stdout,
      errors: result.stderr,
      exitCode: result.exitCode
    };
  }
});
```

**Case Studies:**
- Perplexity: Advanced data analysis
- Manus: Virtual computers for agents

### 2.2 Alternatives Not Researched

| Option | Notes |
|--------|-------|
| **CodeSandbox** | API documentation unavailable |
| **Docker** | Self-managed, more setup required |
| **GitHub Codespaces** | Developer-focused, not agent-optimized |

---

## 3. Tool UI Patterns (Vercel AI SDK)

### 3.1 Tool Definition Structure

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get current weather for a location',
  parameters: z.object({
    location: z.string().describe('City name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  execute: async ({ location, unit }) => {
    // Tool implementation
    return { temperature: 22, condition: 'sunny' };
  }
});
```

### 3.2 Tool Execution Patterns

| Pattern | When to Use | Implementation |
|---------|-------------|----------------|
| **Automatic Server** | Safe, idempotent operations | Include `execute` function |
| **Automatic Client** | UI-driven tools | `onToolCall` callback + `addToolOutput` |
| **Interactive** | Sensitive operations requiring approval | `needsApproval: true` |

### 3.3 Tool Part States

Tool calls progress through typed states:

```
input-streaming → input-available → output-available/output-error
```

**State Visualization:**
```typescript
message.parts.map(part => {
  if (part.type === 'tool-askForConfirmation') {
    switch (part.state) {
      case 'input-streaming':
        return <ToolLoading toolName={part.toolName} />;
      case 'input-available':
        return <ToolConfirm toolCall={part} onConfirm={() => addToolOutput(...)} />;
      case 'output-available':
        return <ToolResult result={part.result} />;
      case 'output-error':
        return <ToolError error={part.error} />;
    }
  }
});
```

### 3.4 Interactive Tool Approval

```typescript
// Server-side: Require approval
const sensitiveTool = tool({
  description: 'Delete user data',
  parameters: z.object({ userId: z.string() }),
  needsApproval: true, // Creates approval-requested state
  execute: async ({ userId }) => { /* ... */ }
});

// Client-side: Handle approval
const { addToolApprovalResponse } = useChat({
  onToolCall: ({ toolCall, addToolOutput, addToolApprovalResponse }) => {
    if (toolCall.needsApproval) {
      showConfirmationDialog({
        onConfirm: () => addToolApprovalResponse({ approved: true }),
        onCancel: () => addToolApprovalResponse({ approved: false })
      });
    }
  }
});
```

### 3.5 Auto-Submission Pattern

```typescript
useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  // Automatically continues conversation when all tool results ready
});
```

### 3.6 Multi-Step Tool Calls

Enable agentic behavior with step limits:

```typescript
const result = await streamText({
  model: openai('gpt-4o'),
  messages,
  tools: { search: searchTool, calculator: calcTool },
  stopWhen: stepCountIs(5), // Allow up to 5 tool call iterations
  // or: stopWhen: toolResultsPresent(['search'])
});
```

### 3.7 Tool Choice Control

```typescript
streamText({
  model,
  messages,
  tools,
  toolChoice: 'auto' // Let model decide
  // toolChoice: 'required' // Must use at least one tool
  // toolChoice: 'none' // No tools allowed
  // toolChoice: { type: 'tool', toolName: 'search' } // Force specific tool
});
```

---

## 4. Implementation Architecture

### 4.1 Tool Registry Pattern

```typescript
// lib/tools/index.ts
import { searchTool } from './search';
import { codeTool } from './code';
import { fileTool } from './file';

export const tools = {
  search: searchTool,
  executeCode: codeTool,
  readFile: fileTool
};

export type ToolName = keyof typeof tools;
```

### 4.2 API Route with Tools

```typescript
// src/pages/api/chat.ts
import { streamText } from 'ai';
import { tools } from '../../lib/tools';

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools,
    maxSteps: 5, // Enable multi-step tool calls
    toolChoice: 'auto'
  });

  return result.toDataStreamResponse();
};
```

### 4.3 Tool Visualization Components

```typescript
// components/ToolCall.tsx
interface ToolCallProps {
  part: ToolPart;
}

export function ToolCall({ part }: ToolCallProps) {
  return (
    <div className="tool-call border rounded-lg p-3 my-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <ToolIcon name={part.toolName} />
        <span className="font-medium">{part.toolName}</span>
        <StatusBadge state={part.state} />
      </div>

      {part.state === 'input-streaming' && (
        <div className="mt-2 text-gray-500 text-sm">
          Generating parameters...
        </div>
      )}

      {part.state === 'input-available' && (
        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
          {JSON.stringify(part.args, null, 2)}
        </pre>
      )}

      {part.state === 'output-available' && (
        <div className="mt-2 border-t pt-2">
          <ToolResultRenderer toolName={part.toolName} result={part.result} />
        </div>
      )}

      {part.state === 'output-error' && (
        <div className="mt-2 text-red-600 text-sm">
          Error: {part.error}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Cost Estimation

### 5.1 Web Search Costs (10K searches/month)

| Provider | Monthly Cost |
|----------|-------------|
| Tavily Free | $0 |
| SerpAPI Starter | $25 |
| Perplexity Search API | $50 |

### 5.2 Code Execution Costs (E2B Hobby)

| Usage | Cost |
|-------|------|
| 1-hour sessions x 100 | ~$2.50 |
| 1000 10-second executions | ~$1.40 |
| Free tier | $100 credits |

**Recommendation:** Start with E2B Hobby ($0) + Tavily Free ($0).

---

## 6. Security Considerations

### 6.1 Tool Approval Levels

| Tool | Approval Required | Reason |
|------|-------------------|--------|
| Web search | No | Read-only, safe |
| Read file | No | Read-only |
| Code execution | Yes | Can modify system |
| Delete file | Yes | Destructive |
| API calls | Yes | External effects |

### 6.2 Sandbox Security (E2B)

- Firecracker microVM isolation
- No network egress by default (configurable)
- CPU/memory limits enforced
- Automatic cleanup after session

### 6.3 API Key Management

```typescript
// Never expose in client
const TAVILY_API_KEY = import.meta.env.TAVILY_API_KEY; // Server-only
const E2B_API_KEY = import.meta.env.E2B_API_KEY; // Server-only
```

---

## 7. Implementation Roadmap

### Phase 3a: Tool Infrastructure
1. Create `lib/tools/` directory structure
2. Define tool registry with Zod schemas
3. Update `/api/chat.ts` to accept tools parameter
4. Add `maxSteps` for multi-step calls

### Phase 3b: Web Search Tool
1. Sign up Tavily (free tier)
2. Implement `searchTool` with error handling
3. Add search result rendering component
4. Test with various query types

### Phase 3c: Code Execution Tool
1. Sign up E2B (free $100 credits)
2. Implement `codeTool` with sandbox lifecycle
3. Add code block + run button UI
4. Implement output display (terminal style)

### Phase 3d: Tool UI Polish
1. Create `ToolCall` visualization component
2. Implement state-based rendering
3. Add tool approval flow for sensitive tools
4. Auto-scroll to tool results

---

## 8. Resources

### Documentation
- [Vercel AI SDK Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Vercel AI SDK Tool UI](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)
- [Tavily Docs](https://docs.tavily.com)
- [E2B Docs](https://e2b.dev/docs)
- [SerpAPI Docs](https://serpapi.com/docs)

### SDKs
- `@e2b/code-interpreter` - Node.js/Python
- `ai` - Vercel AI SDK
- `zod` - Schema validation

---

## Unresolved Questions

1. Should web search be automatic or require confirmation?
2. Code execution timeout limit? (Default: 60s?)
3. Support for file upload to sandbox?
4. Persistent sandbox sessions across messages?
5. Rate limiting on tools separately from chat?
6. Tool result caching strategy?
7. Support for custom user-defined tools?
8. Tool usage analytics/tracking needed?
