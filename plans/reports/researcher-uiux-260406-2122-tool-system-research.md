# Tool System Research Report - Phase 3

**Research Date:** 2026-04-06  
**Scope:** Web search providers, code execution sandboxing, tool UI patterns  
**Researcher:** researcher-uiux

---

## 1. Web Search Providers Comparison

### 1.1 SerpAPI

| Aspect | Details |
|--------|---------|
| **Pricing** | Free (250/mo), Starter $25/1K, Developer $75/5K, Production $150/15K, Big Data $275/30K |
| **Rate Limits** | Free: 50/hour, paid tiers scale up |
| **Coverage** | 50+ search engines: Google, Bing, DuckDuckGo, Amazon, YouTube, Maps, News, Images |
| **Best For** | SEO analysis, e-commerce, multi-engine coverage |

**Pros:**
- Broad search engine support
- Only successful searches counted (cached/errored don't count)
- Rich structured data output
- SDKs for 10+ languages

**Cons:**
- Pricier for high volume
- Not AI-optimized output format

**Integration Pattern:**
```typescript
const searchTool = tool({
  description: 'Search the web for current information',
  parameters: z.object({
    query: z.string().describe('Search query'),
    engine: z.enum(['google', 'bing']).default('google'),
  }),
  execute: async ({ query, engine }) => {
    const response = await fetch(`https://serpapi.com/search?q=${query}&engine=${engine}&api_key=${process.env.SERP_API_KEY}`);
    return response.json();
  },
});
```

---

### 1.2 Tavily

| Aspect | Details |
|--------|---------|
| **Pricing** | Free tier available, paid via /pricing page |
| **Performance** | 100M+ monthly requests, 99.99% uptime, 180ms p50 latency |
| **Features** | Real-time search, content extraction, crawling, research |
| **Security** | PII blocking, prompt injection prevention, malicious source filtering |

**Pros:**
- Built specifically for AI agents/RAG
- Content extraction and chunking included
- Fast (180ms p50)
- Free tier available
- Drop-in LLM integration (OpenAI, Anthropic, Groq)

**Cons:**
- Narrower than SerpAPI (focused on web search only)
- Pricing not fully transparent on main page

**Integration Pattern:**
```typescript
const tavilySearch = tool({
  description: 'Search and extract web content for AI context',
  parameters: z.object({
    query: z.string(),
    search_depth: z.enum(['basic', 'advanced']).default('basic'),
    max_results: z.number().max(10).default(5),
  }),
  execute: async ({ query, search_depth, max_results }) => {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.TAVILY_API_KEY}` },
      body: JSON.stringify({ query, search_depth, max_results }),
    });
    return response.json();
  },
});
```

---

### 1.3 Perplexity API

| Aspect | Details |
|--------|---------|
| **Search API** | $5.00 per 1K requests (raw web results) |
| **Sonar API** | Token + request fees based on context depth (Low/Medium/High) |
| **Models** | Sonar ($1/$1 per 1M tokens), Sonar Pro ($3/$15), Sonar Reasoning Pro ($2/$8) |
| **Features** | Citations, multi-step reasoning, deep research |

**Pros:**
- Native citations included
- Deep research capabilities
- Multi-step reasoning
- Enterprise AWS Marketplace option

**Cons:**
- Complex pricing (tokens + requests + context fees)
- More expensive for simple searches
- Search API separate from chat API

**Integration Pattern:**
```typescript
const perplexitySearch = tool({
  description: 'Search with citations and reasoning',
  parameters: z.object({
    query: z.string(),
    model: z.enum(['sonar', 'sonar-pro', 'sonar-reasoning-pro']).default('sonar'),
  }),
  execute: async ({ query, model }) => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: query }],
      }),
    });
    return response.json();
  },
});
```

---

### 1.4 Recommendation

| Use Case | Recommended Provider |
|----------|---------------------|
| **Budget-conscious startup** | Tavily (free tier, AI-optimized) |
| **SEO/marketing focus** | SerpAPI (multi-engine, structured data) |
| **Research/citations needed** | Perplexity (native citations, reasoning) |
| **High volume production** | Tavily (99.99% uptime, 180ms latency) |

---

## 2. Code Execution Sandboxing

### 2.1 E2B (Recommended)

| Aspect | Details |
|--------|---------|
| **Pricing** | Hobby: free ($100 credits), Pro: $150/mo, Enterprise: custom |
| **Compute** | CPU: $0.000014/s (1 vCPU) to $0.000112/s (8 vCPUs) |
| **Memory** | $0.0000045/GiB/s (512 MiB - 8 GiB) |
| **Storage** | 10 GiB free (Hobby), 20 GiB (Pro) |

**Architecture:**
- Linux VM Sandbox
- Template-based environment definitions
- Desktop sandboxes available for GUI automation

**Security:**
- Isolated environment per execution
- Enterprise-grade data protection
- Used by Perplexity, Manus, Hugging Face

**Integration Pattern:**
```typescript
import { Sandbox } from 'e2b';

const codeExecutionTool = tool({
  description: 'Execute code in a secure sandbox',
  parameters: z.object({
    code: z.string().describe('Code to execute'),
    language: z.enum(['python', 'javascript', 'typescript']).default('python'),
    timeout: z.number().max(300).default(30),
  }),
  execute: async ({ code, language, timeout }) => {
    const sandbox = await Sandbox.create();
    try {
      const result = await sandbox.commands.run(
        `echo '${Buffer.from(code).toString('base64')}' | base64 -d | ${language === 'python' ? 'python3' : 'node'}`,
        { timeout }
      );
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } finally {
      await sandbox.kill();
    }
  },
});
```

**Pros:**
- True sandbox isolation (Linux VM)
- Pay-per-second compute
- Desktop environment support
- Strong security guarantees
- Well-documented SDK

**Cons:**
- Higher cost for continuous usage
- Cold start latency (~1-2s)

---

### 2.2 CodeSandbox

| Aspect | Details |
|--------|---------|
| **Type** | Cloud development environment |
| **Best For** | Prototyping, collaborative coding |
| **API** | Limited programmatic execution API |

**Assessment:** Not ideal for AI agent code execution. Better for human developers.

---

### 2.3 Docker (Self-hosted)

| Aspect | Details |
|--------|---------|
| **Cost** | Infrastructure only |
| **Control** | Full |
| **Complexity** | High (orchestration, security, scaling) |

**Use when:**
- Need complete control
- Have DevOps resources
- High volume makes SaaS too expensive

**Security considerations:**
- Use gVisor or Kata Containers for extra isolation
- Network egress restrictions
- Resource limits (CPU, memory, disk)
- Image scanning for vulnerabilities

---

### 2.4 Recommendation

| Scenario | Solution |
|----------|----------|
| **Production AI agent** | E2B (security + ease) |
| **High volume / budget constrained** | Self-hosted Docker + gVisor |
| **Prototyping** | E2B Hobby tier |
| **Enterprise with compliance** | E2B Enterprise or self-hosted |

---

## 3. Tool UI Patterns

### 3.1 Vercel AI SDK Tool Calling Architecture

**Tool Structure:**
```typescript
import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
  description: 'Tool description for LLM',
  parameters: z.object({
    param1: z.string(),
  }),
  execute: async ({ param1 }, { toolCallId, messages, abortSignal }) => {
    // Tool implementation
    return result;
  },
  // Optional: Require user approval
  needsApproval: true,
});
```

**Tool Choice Control:**
- `'auto'` - Model decides (default)
- `'required'` - Must call a tool
- `{ type: 'tool', toolName: 'search' }` - Force specific tool

**Multi-step Tool Calling:**
```typescript
const result = await streamText({
  model,
  messages,
  tools: { search, calculator },
  stopWhen: ['no-more-tool-calls'], // Auto-chain until done
});
```

---

### 3.2 Message Parts for Tool Display

Vercel AI SDK 4.0+ uses `message.parts` instead of `content`:

```typescript
interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<
    | { type: 'text'; text: string }
    | { type: 'tool-invocation'; toolInvocation: ToolInvocation }
    | { type: 'tool-approval-request'; approvalRequestId: string }
  >;
}

type ToolInvocation = {
  toolName: string;
  args: unknown;
  state: 'partial-call' | 'call' | 'output-available' | 'output-error';
  result?: unknown;
  errorText?: string;
};
```

---

### 3.3 Tool UI Component Patterns

**Basic Tool Display:**
```tsx
function ToolInvocationDisplay({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const { toolName, args, state, result } = toolInvocation;

  return (
    <div className="my-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
      {/* Header with tool name and status */}
      <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
        {state === 'partial-call' && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === 'call' && <Wrench className="h-4 w-4" />}
        {state === 'output-available' && <CheckCircle className="h-4 w-4 text-green-600" />}
        {state === 'output-error' && <XCircle className="h-4 w-4 text-red-600" />}
        <span>{toolName}</span>
      </div>

      {/* Arguments (collapsible) */}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-gray-600">Arguments</summary>
        <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify(args, null, 2)}
        </pre>
      </details>

      {/* Result or Error */}
      {state === 'output-available' && result && (
        <div className="mt-2 rounded bg-white p-2 text-sm">
          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
      {state === 'output-error' && (
        <div className="mt-2 text-sm text-red-600">
          {toolInvocation.errorText || 'Tool execution failed'}
        </div>
      )}
    </div>
  );
}
```

**Approval Flow UI:**
```tsx
function ToolApprovalRequest({ request, onApprove, onReject }: ApprovalProps) {
  return (
    <div className="my-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm font-medium text-yellow-800">
        Tool <code>{request.toolName}</code> requires approval
      </p>
      <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs">
        {JSON.stringify(request.args, null, 2)}
      </pre>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onApprove(request.approvalRequestId)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(request.approvalRequestId)}
          className="rounded bg-gray-200 px-3 py-1 text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
```

---

### 3.4 Client-Side Tool Handling

```typescript
// Client tool that renders UI
const useChatConfig = {
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  onToolCall: async ({ toolCall }) => {
    if (toolCall.toolName === 'askUser') {
      // Return immediately, UI will handle
      addToolOutput({
        toolCallId: toolCall.toolCallId,
        output: { status: 'waiting_for_user' },
      });
      return;
    }
    // Auto-execute other tools
    const result = await executeTool(toolCall);
    addToolOutput({ toolCallId: toolCall.toolCallId, output: result });
  },
};
```

---

## 4. Implementation Recommendations

### 4.1 Phase 3 Architecture

```
Tool System
├── Tool Registry (server/tools/index.ts)
│   ├── webSearch: Tavily integration
│   ├── codeExecute: E2B sandbox
│   └── calculator: Local math
├── Tool UI Components
│   ├── ToolInvocationDisplay (generic)
│   ├── WebSearchResult (custom rendering)
│   ├── CodeExecutionResult (terminal output)
│   └── ToolApprovalDialog
└── Tool API Route
    └── /api/chat with tools configuration
```

### 4.2 Recommended Packages

| Package | Purpose |
|---------|---------|
| `ai` | Core SDK for tool definitions |
| `zod` | Input schema validation |
| `e2b` | Code sandboxing |
| `@tavily/core` (if available) or fetch | Web search |

### 4.3 Security Checklist

- [ ] E2B API key stored securely (env var)
- [ ] Tavily/Perplexity keys server-side only
- [ ] Tool execution timeouts configured
- [ ] Rate limiting on tool endpoints
- [ ] Approval flow for destructive tools
- [ ] PII filtering enabled (Tavily)
- [ ] Resource limits on E2B sandboxes

---

## Unresolved Questions

1. **Tool Approval UX**: Should approval be inline in chat or modal dialog?
2. **Tool Result Persistence**: Store tool results in database or regenerate on load?
3. **Parallel Tools**: Support multiple simultaneous tool calls?
4. **Custom Tool Builder**: Allow users to define custom tools via UI?
5. **Tool Cost Tracking**: Display API costs to users per tool call?
6. **Fallback Strategy**: What happens when Tavily/E2B rate limited?
