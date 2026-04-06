# Research Report: Phase 3 Tool System

**Date:** 2026-04-06
**Researcher:** researcher-deployment
**For:** ClaudeKit Chatbot Phase 3 Implementation

---

## Executive Summary

Phase 3 requires three tool categories: web search, code execution, and tool UI patterns. Recommendations:

1. **Web Search:** Tavily for most use cases (fastest, AI-optimized) or Perplexity Sonar for built-in reasoning
2. **Code Execution:** E2B for server-side secure sandboxing or StackBlitz WebContainers for client-side
3. **Tool UI:** Vercel AI SDK `parts` API with status states (`submitted` → `streaming` → `ready`)

---

## 1. Web Search Providers Comparison

### Side-by-Side Matrix

| Provider | Free Tier | Paid Pricing | Latency | AI-Optimized | Best For |
|----------|-----------|--------------|---------|--------------|----------|
| **Tavily** | 1,000 calls/mo | Usage-based | 180ms p50 | Yes (built for RAG) | General chat, research agents |
| **Perplexity Sonar** | Limited | $1-3/1M tokens + $5-14/1K calls | Unknown | Yes (built-in reasoning) | Complex queries requiring synthesis |
| **SerpAPI** | 250 searches | $25-275/mo | Variable | No (raw SERP) | SEO tools, marketing apps |
| **Exa** | 1,000 requests | $7-15/1K requests | 180ms-1s | Yes (content extraction) | Research, content-heavy apps |

### Tavily

**Strengths:**
- Fastest (180ms p50)
- Purpose-built for AI agents and RAG
- 99.99% uptime
- 100M+ monthly request capacity
- Native LLM provider integrations (OpenAI, Anthropic, Groq)

**Endpoints:**
- `/search` - Fast web search
- `/research` - Deep research analysis
- `/extract` - Content extraction
- `/crawl` - Site crawling
- `/map` - Site mapping

**Authentication:** Bearer token, X-Project-ID header for tracking

```typescript
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: 'latest AI news' })
});
```

### Perplexity Sonar

**Models:**
| Model | Input | Output | Request Fee | Features |
|-------|-------|--------|-------------|----------|
| Sonar | $1/1M | $1/1M | $5-12/1K | Basic web search |
| Sonar Pro | $3/1M | $15/1M | $6-14/1K | Multi-step, Pro Search |
| Sonar Reasoning Pro | $2/1M | $8/1M | $6-14/1K | Logical analysis |
| Sonar Deep Research | $2/1M | $8/1M | Variable | Citations, deep research |

**Key Features:**
- Pro Search with multi-step tool usage
- Three modes: fast, pro, auto
- Built-in reasoning and synthesis
- Citations support

### SerpAPI

**Pricing Tiers:**
| Tier | Price | Searches | Throughput |
|------|-------|----------|------------|
| Free | $0 | 250/mo | 50/hr |
| Starter | $25 | 1,000/mo | 200/hr |
| Developer | $75 | 5,000/mo | 1,000/hr |
| Production | $150 | 15,000/mo | 3,000/hr |
| Big Data | $275 | 30,000/mo | 6,000/hr |

**Search Engines:** Google (Search, Images, Maps, News, Shopping), Bing, DuckDuckGo, YouTube, Amazon, 50+ total

**Note:** Not AI-optimized. Returns raw SERP data requiring parsing.

### Exa

**Pricing:**
- Search: $7/1K requests
- Deep Search: $12/1K
- Deep-Reasoning Search: $15/1K
- Contents extraction: $1/1K pages
- Answer generation: $5/1K

**Features:**
- Sub-200ms search for coding agents
- Webhook monitoring
- Token-efficient page contents
- Real-time data with livecrawl policies
- Structured outputs

---

## 2. Code Execution Sandboxing

### Side-by-Side Matrix

| Provider | Execution | Languages | Security | Pricing | Best For |
|----------|-----------|-----------|----------|---------|----------|
| **E2B** | Cloud VMs | Python, JS/TS, Linux | Isolated VMs | Usage-based ($0.000014/s) | Server-side, multi-language |
| **WebContainers** | Browser | Node.js only | Browser tab isolation | Free (OSS) | Client-side, fast startup |
| **CodeSandbox** | Cloud | Multiple | Sandboxed | Freemium | Full IDE experience |
| **Docker** | Self-hosted | Any | Container isolation | Self-managed | Enterprise, full control |

### E2B (Recommended for Server-Side)

**Architecture:**
- **Sandbox:** Ephemeral execution environment
- **Template:** Pre-configured startup state
- Runs in secure Linux VMs

**Pricing:**
| Tier | Price | Session | Instances |
|------|-------|---------|-----------|
| Free | $0 + $100 credits | 60 min | 20 |
| Pro | $150/mo | 24 hr | 100 (expandable to 1100) |

**Compute Rates:**
- 1 core: $0.000014/s
- 8 cores: Higher rate (varies)
- Memory: $0.0000045/GiB/s
- Storage: 10GB free, 20GB Pro

**SDK Example:**
```typescript
import { Sandbox } from '@e2b/sdk';

const sandbox = await Sandbox.create({
  apiKey: process.env.E2B_API_KEY
});

const result = await sandbox.commands.run('python script.py');
console.log(result.stdout);

await sandbox.close();
```

**Use Cases:**
- AI code execution with security
- CI/CD pipelines
- Testing and validation
- AI code reviews

### WebContainers (Recommended for Client-Side)

**Architecture:**
- Node.js runs natively in browser
- No cloud VMs = no per-minute costs
- Everything contained in browser tab

**Pricing:**
- Free for open source
- Commercial licensing available

**Security:**
- Browser tab isolation
- No bitcoin miners, malware, or phishing risks
- Client-side only (no server execution)

**Performance:**
- Millisecond environment startup
- Faster than localhost (no network latency)
- Offline capable

**Limitations:**
- Node.js only (no Python, Ruby, etc.)
- Browser-dependent
- Cannot run system-level commands

**Use Cases:**
- AI coding assistants (client-side)
- Interactive tutorials
- Browser-based IDEs
- Next-gen documentation

### Docker

**Self-Hosted Option:**
- Full control over environment
- Any language/runtime
- Container isolation
- Requires infrastructure management

**API:** RESTful Docker Engine API with Go/Python SDKs

---

## 3. Tool UI Patterns

### Vercel AI SDK Tool Display Pattern

**Message Parts Structure:**
```typescript
interface UIMessage {
  parts: Array<
    | { type: 'text'; text: string }
    | { type: 'tool-invocation'; toolInvocation: ToolInvocation }
    | { type: 'tool-result'; toolResult: ToolResult }
  >;
}
```

**Tool Status States:**
| State | Meaning | UI Pattern |
|-------|---------|------------|
| `submitted` | Tool call sent to LLM | Disable inputs, show spinner |
| `streaming` | Receiving response | Show progress indicator |
| `ready` | Tool complete | Display result |
| `error` | Tool failed | Show error message |

### Tool Call Display Components

**Progressive Disclosure Pattern:**
```
┌─────────────────────────────────────────┐
│ 🔍 Searching the web...                 │ ← Collapsed (in progress)
├─────────────────────────────────────────┤
│ 🔍 Web Search                             │ ← Expanded (complete)
│ Query: "latest AI news"                 │
│ Results: 5 sources found                  │
│ [Source 1] [Source 2] [Source 3]          │
└─────────────────────────────────────────┘
```

**Recommended UI States:**
1. **Pending:** Animated spinner + tool name
2. **In Progress:** Progress bar or step indicators
3. **Complete:** Collapsible result panel with summary
4. **Error:** Error icon + retry button

### Anthropic Tool Use Pattern

**Two Execution Models:**

| Type | Execution | Use Case |
|------|-----------|----------|
| **Client Tools** | Your app executes | Custom integrations, database queries |
| **Server Tools** | Anthropic executes | web_search, code_execution, web_fetch |

**Server Tools Available:**
- `web_search` - Built-in web search
- `code_execution` - Code execution on Anthropic infrastructure
- `web_fetch` - URL fetching
- `tool_search` - Tool discovery

**Tool Use Token Costs (System Prompt):**
| Model | Tool Choice | Tokens |
|-------|-------------|--------|
| Claude Opus 4.6 | auto/none | 346 |
| Claude Opus 4.6 | any/tool | 313 |
| Claude Sonnet 4.6 | auto/none | 346 |
| Claude Haiku 4.5 | auto/none | 346 |

**Strict Mode:**
Add `strict: true` to tool definitions for guaranteed schema conformance.

---

## 4. Implementation Recommendations

### Web Search: Tavily (Primary)

**Rationale:**
- Fastest latency (180ms)
- AI-optimized responses (no parsing needed)
- Generous free tier (1,000/mo)
- Built for RAG workflows
- Simple API

**Fallback:** Perplexity Sonar for complex reasoning tasks

### Code Execution: Hybrid Approach

**Server-side (E2B):**
- Use when: Multi-language support needed, heavy compute, security critical
- Integrate with: Python data analysis, complex scripts

**Client-side (WebContainers):**
- Use when: JavaScript/Node.js only, fast feedback loops, offline capability
- Integrate with: Quick code previews, frontend demos

### Tool UI Architecture

```typescript
// Tool call component structure
interface ToolCallUI {
  // Status indicator
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  
  // Tool metadata
  toolName: string;
  toolIcon: string;
  toolDescription: string;
  
  // Display data
  input: Record<string, any>;      // Tool arguments
  output: any;                      // Tool result
  duration: number;               // Execution time
  
  // UI state
  isExpanded: boolean;
  isCollapsible: boolean;
}
```

**Recommended Libraries:**
- `ai` (Vercel AI SDK) - Core tool handling
- `react-markdown` - Result rendering
- `lucide-react` - Tool icons

---

## 5. Integration Code Examples

### Tavily Search Tool

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const webSearchTool = tool({
  description: 'Search the web for current information',
  parameters: z.object({
    query: z.string().describe('The search query'),
    searchDepth: z.enum(['basic', 'advanced']).optional()
  }),
  execute: async ({ query, searchDepth = 'basic' }) => {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        search_depth: searchDepth,
        include_answer: true,
        max_results: 5
      })
    });
    return response.json();
  }
});
```

### E2B Code Execution Tool

```typescript
import { Sandbox } from '@e2b/sdk';
import { tool } from 'ai';
import { z } from 'zod';

const codeExecutionTool = tool({
  description: 'Execute Python code in a secure sandbox',
  parameters: z.object({
    code: z.string().describe('Python code to execute'),
    timeout: z.number().optional().default(30)
  }),
  execute: async ({ code, timeout }) => {
    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY
    });
    
    try {
      const result = await sandbox.commands.run(
        `python -c "${code}"`,
        { timeout }
      );
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode
      };
    } finally {
      await sandbox.close();
    }
  }
});
```

### Tool UI Component

```tsx
function ToolInvocationDisplay({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const { toolName, state, args, result } = toolInvocation;
  
  const icons = {
    web_search: '🔍',
    code_execution: '💻',
    file_read: '📄',
    file_write: '✍️'
  };
  
  return (
    <div className="tool-call">
      <div className="tool-header">
        <span>{icons[toolName] || '🔧'}</span>
        <span className="tool-name">{toolName}</span>
        {state === 'call' && <Spinner />}
        {state === 'result' && <CheckIcon />}
      </div>
      
      {state === 'result' && result && (
        <div className="tool-result">
          <ReactMarkdown>{formatResult(result)}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Cost Estimates

### Low Usage (Prototype/Personal)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Tavily | Free | $0 |
| E2B | Free ($100 credits) | $0 |
| Perplexity | Sonar basic | $0-10 |
| **Total** | | **$0-10** |

### Medium Usage (Small Team)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Tavily | Pay-as-you-go | ~$20-50 |
| E2B | Pro | $150 |
| Perplexity | Sonar Pro | $30-50 |
| **Total** | | **$200-250** |

### High Usage (Production)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Tavily | Enterprise | $100+ |
| E2B | Pro (scaled) | $300+ |
| Perplexity | Enterprise | $200+ |
| **Total** | | **$600+** |

---

## 7. Security Considerations

### Code Execution

| Provider | Security Model | Risk Level |
|----------|---------------|------------|
| E2B | Isolated Linux VMs | Low |
| WebContainers | Browser tab sandbox | Very Low |
| Self-hosted Docker | Your responsibility | Variable |

**Best Practices:**
- Always use sandboxed execution for user code
- Set timeouts to prevent infinite loops
- Limit network access for untrusted code
- Monitor resource usage

### API Keys

- Store in environment variables
- Rotate regularly
- Use separate keys per environment
- Monitor usage for anomalies

---

## 8. Decision Matrix

### Choose Tavily If:
- Need fast, AI-optimized search results
- Building RAG workflows
- Want simple integration
- Need generous free tier

### Choose Perplexity If:
- Need built-in reasoning/synthesis
- Complex queries requiring multi-step analysis
- Citations are important
- Budget allows for higher cost

### Choose E2B If:
- Need multi-language support
- Running server-side code
- Security is critical
- Need persistent environments

### Choose WebContainers If:
- JavaScript/Node.js only
- Want fastest startup
- Client-side execution acceptable
- Free solution preferred

---

## Unresolved Questions

1. **Tavily exact rate limits:** Documentation references 100M+ monthly capacity but doesn't specify per-minute/hour limits
2. **Perplexity latency benchmarks:** No official p50/p95 latency metrics published
3. **CodeSandbox API:** Could not retrieve current API documentation for programmatic sandbox creation
4. **Anthropic server tool pricing:** Exact per-search/per-execution costs not clearly documented
5. **E2B enterprise features:** Advanced security/compliance features not fully documented

---

## Sources & References

- Tavily API: https://docs.tavily.com/documentation/api-reference/introduction
- Tavily Pricing: https://tavily.com/#pricing
- Perplexity API: https://docs.perplexity.ai/guides/pricing
- E2B Docs: https://e2b.dev/docs
- E2B Pricing: https://e2b.dev/pricing
- WebContainers: https://webcontainers.io/guides/introduction
- SerpAPI Pricing: https://serpapi.com/pricing
- Exa AI: https://exa.ai/pricing
- Anthropic Tool Use: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
- Vercel AI SDK: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot

---

**Report saved to:** `D:/project/Clone/ck/claudekit-chatbot-astro/plans/reports/researcher-tool-system.md`
