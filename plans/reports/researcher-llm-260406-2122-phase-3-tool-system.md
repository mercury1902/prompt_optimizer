# Phase 3: Tool System Research Report

**Date:** 2026-04-06  
**Researcher:** researcher-llm  
**Scope:** Web search providers, code execution sandboxing, tool UI patterns

---

## 1. Web Search Providers

### Tavily (Recommended)

**API Endpoints:**
```
POST https://api.tavily.com/search     - Web search with filters
POST https://api.tavily.com/extract    - Extract webpage content
POST https://api.tavily.com/crawl      - Site exploration
POST https://api.tavily.com/map        - Site structure discovery
POST https://api.tavily.com/research   - Automated research tasks
```

**Features:**
- Domain filtering, date ranges, content depth control
- Markdown extraction
- Guided site crawling with depth parameters
- Structured research outputs

**Integration:**
```bash
npm i @tavily/core
```

```typescript
import { tavily } from '@tavily/core';

const client = tavily({ apiKey: 'tvly-xxx' });

const response = await client.search({
  query: 'latest AI developments',
  search_depth: 'advanced',
  include_domains: ['arxiv.org', 'github.com'],
  max_results: 5
});
```

**Pricing:** API credits system with documented rate limits

---

### Perplexity

**API Endpoints:**
```
POST https://api.perplexity.ai/search   - Raw web search results
POST https://api.perplexity.ai/v1/agent - Third-party models + search
```

**Features:**
- Domain filtering: `"search_domain_filter": ["arxiv.org"]`
- Recency filters: `"search_recency_filter": "month"`
- Structured JSON schema outputs
- Real-time web-wide research

**Integration:**
```typescript
const response = await fetch('https://api.perplexity.ai/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pplx-xxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'quantum computing breakthroughs',
    search_recency_filter: 'week',
    return_sources: true
  })
});
```

---

### SerpAPI

**Pricing Tiers:**
| Plan | Monthly Cost | Searches | Throughput |
|------|-------------|----------|--------------|
| Free | $0 | 250 | 50/hr |
| Starter | $25 | 1,000 | 200/hr |
| Developer | $75 | 5,000 | 1,000/hr |
| Production | $150 | 15,000 | 3,000/hr |
| Big Data | $275 | 30,000 | 6,000/hr |

**Rules:**
- Only successful searches count
- Cached/errored searches free
- 100 results or empty = 1 search

**Integration:**
```typescript
import { getJson } from 'serpapi';

const response = await getJson({
  engine: 'google',
  q: 'coffee shops near me',
  api_key: 'xxx'
});
```

---

## 2. Code Execution Sandboxing

### E2B (Recommended)

**Overview:** "Isolated sandboxes that let agents safely execute code, process data, and run tools" via on-demand Linux VMs.

**SDK Installation:**
```bash
npm i @e2b/code-interpreter dotenv
```

**Core Usage:**
```typescript
import { Sandbox } from '@e2b/code-interpreter';

// Create persistent sandbox session
const sbx = await Sandbox.create();

// Execute code
const execution = await sbx.runCode('print("hello world")');
console.log(execution.logs.stdout);

// File operations
const files = await sbx.files.list('/');

// Upload/download files
await sbx.files.write('/tmp/data.csv', csvContent);
const content = await sbx.files.read('/tmp/results.json');
```

**Features:**
- Customizable templates
- File upload/download
- Desktop sandboxes for AI automation
- Persistent sessions
- Multiple language support (Python, TypeScript)

---

### Docker Sandboxing

**Security Principles:**
- Namespaces provide process isolation
- Control groups (cgroups) enforce resource constraints
- Containers run with reduced capability sets
- Internal root lacks full host privileges

**Best Practices:**
```dockerfile
# Run as non-privileged user
USER appuser

# Read-only root filesystem
FROM scratch
COPY --from=builder /app /app
```

**Runtime Security:**
```bash
docker run \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --user 1000:1000 \
  --memory=512m \
  --cpus=1.0 \
  sandbox-image
```

---

### Comparison

| Provider | Latency | Languages | Persistence | Cost |
|----------|---------|-----------|-------------|------|
| E2B | ~2s | Python, JS | Session-based | Per-minute |
| Docker | ~500ms | Any | Container lifecycle | Infrastructure |
| CodeSandbox | ~3s | JS, TS | Project-based | Per-sandbox |

**Recommendation:** E2B for AI-driven code execution, Docker for self-hosted sandboxing.

---

## 3. Tool UI Patterns

### Vercel AI SDK Tool Integration

**Tool Definition:**
```typescript
import { tool } from 'ai';
import { z } from 'zod';

const searchTool = tool({
  description: 'Search the web for current information',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional()
  }),
  execute: async ({ query, limit }) => {
    const results = await tavily.search({ query, max_results: limit });
    return results;
  }
});
```

**Strict Validation:**
```typescript
const strictTool = tool({
  description: 'Precise tool requiring exact inputs',
  inputSchema: z.object({...}),
  strict: true, // Only valid tool calls generated
  execute: async (input) => { ... }
});
```

---

### Multi-Step Agent Loops

```typescript
import { generateText, stepCountIs } from 'ai';

const result = await generateText({
  model,
  messages,
  tools: { search: searchTool, calculate: calcTool },
  stopWhen: stepCountIs(5), // Max 5 steps
  onStepFinish: ({ stepNumber, text, toolCalls, toolResults }) => {
    console.log(`Step ${stepNumber}: ${toolCalls.length} calls`);
  }
});

// Access all intermediate steps
result.steps.forEach(step => {
  console.log(step.text, step.toolCalls, step.toolResults);
});
```

---

### Human-in-the-Loop Approval

```typescript
const dangerousTool = tool({
  description: 'Execute system command',
  inputSchema: z.object({
    command: z.string(),
    severity: z.number()
  }),
  needsApproval: (toolCall) => toolCall.input.severity > 5,
  // Or: needsApproval: true (always requires approval)
  execute: async ({ command }) => {
    return await executeCommand(command);
  }
});
```

**UI Handling:**
```typescript
// When approval needed, SDK returns tool-approval-request parts
const { addToolApprovalResponse } = useChat();

// Approve or deny
addToolApprovalResponse({
  toolCallId: 'tool_123',
  approved: true
});
```

---

### Tool Result Rendering

**Generative UI Pattern:**
```typescript
const tool = {
  ...toolDefinition,
  toModelOutput: (result) => {
    // Convert multi-modal results to content parts
    return [
      { type: 'text', text: result.summary },
      { type: 'image', image: result.screenshot }
    ];
  }
};
```

**Supported Models:** Anthropic, OpenAI, Gemini 3

---

## 4. Implementation Architecture

### Tool System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Interface                         │
├─────────────────────────────────────────────────────────────┤
│  Tool Call UI  │  Approval Dialog  │  Tool Result View      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Tool Registry                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Web Search   │ │ Code Exec    │ │ File Ops     │         │
│  │ (Tavily)     │ │ (E2B)        │ │ (Custom)     │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Tool Executor                             │
│  • Sanitize inputs                                            │
│  • Rate limiting per tool                                     │
│  • Timeout handling                                           │
│  • Result caching                                             │
└───────────────────────────────────────────────────────────────┘
```

---

### Tool Categories for Implementation

**Phase 3A - Web Tools:**
| Tool | Provider | Use Case |
|------|----------|----------|
| web_search | Tavily | Current information |
| url_extract | Tavily | Read webpage content |
| site_crawl | Tavily | Documentation search |

**Phase 3B - Code Tools:**
| Tool | Provider | Use Case |
|------|----------|----------|
| run_python | E2B | Data analysis |
| run_javascript | E2B | Code testing |
| execute_command | E2B | System operations |

**Phase 3C - Utility Tools:**
| Tool | Function | Use Case |
|------|----------|----------|
| calculate | Math.js | Precise calculations |
| datetime | Native | Time operations |
| file_read/write | E2B | Document processing |

---

## 5. Security Considerations

### Input Sanitization
```typescript
function sanitizeCommand(command: string): string {
  // Block dangerous patterns
  const blocked = ['rm -rf /', '>', '|', '&&', '||'];
  if (blocked.some(p => command.includes(p))) {
    throw new Error('Dangerous command pattern detected');
  }
  return command;
}
```

### Resource Limits
```typescript
const sandbox = await Sandbox.create({
  timeout: 30000, // 30s max
  memory: '512mb',
  cpus: 1
});
```

### Rate Limiting per Tool
```typescript
const toolRateLimiter = new RateLimiter({
  web_search: { rpm: 10 },
  code_execute: { rpm: 5 },
  file_ops: { rpm: 20 }
});
```

---

## 6. Cost Optimization

### Caching Strategy
```typescript
// Cache tool results for identical inputs
const toolCache = new Map<string, { result: any; ttl: number }>();

async function executeWithCache(tool, input) {
  const key = hash({ tool: tool.name, input });
  const cached = toolCache.get(key);
  
  if (cached && Date.now() < cached.ttl) {
    return cached.result;
  }
  
  const result = await tool.execute(input);
  toolCache.set(key, { result, ttl: Date.now() + 60000 });
  return result;
}
```

### Provider Tier Selection
```typescript
const searchTools = {
  quick: tavilyQuickSearch,  // Fast, lower quality
  deep: tavilyDeepSearch,      // Slower, higher quality
  cached: cachedTavilySearch   // Free if cached
};
```

---

## 7. Implementation Priority

### Phase 3A (Week 1)
1. Set up Tavily integration
2. Implement web_search tool
3. Add tool result UI components
4. Basic tool execution flow

### Phase 3B (Week 2)
1. Set up E2B integration
2. Implement code execution tools
3. Add file upload/download tools
4. Human approval workflow

### Phase 3C (Week 3)
1. Tool result caching
2. Rate limiting per tool
3. Error handling & retries
4. Tool usage analytics

---

## Unresolved Questions

1. Should tools execute automatically or always require approval?
2. What is the budget for external API calls (Tavily, E2B)?
3. Should we support custom user-defined tools?
4. Is there a requirement for tool execution history/audit logs?
5. Should tools have different permissions based on user tier (free/paid)?
6. What is the expected concurrent tool execution load?
7. Should tool results be persisted in the database or computed on-demand?
