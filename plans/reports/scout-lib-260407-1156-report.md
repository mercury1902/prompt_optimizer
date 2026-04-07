# src/lib Library Code Analysis Report

**Report ID:** scout-lib-260407-1156-report.md  
**Generated:** 2026-04-07  
**Scope:** All modules in src/lib/ directory

---

## Executive Summary

The src/lib directory contains 21 modules organized into 4 categories:
- **Core AI/LLM Client Modules (4):** FirePass integration, Vision, Provider Fallback
- **Recommendation Engines (4):** Command & Workflow recommendation systems
- **Infrastructure (5):** Database, Rate limiting, Caching, Utils, Animations
- **Tool System (8):** Plugin architecture with Tavily Search and E2B Code Execution

---

## 1. Core AI/LLM Client Modules

### 1.1 firepass-client.ts (511 lines)
**Purpose:** Primary LLM client for prompt optimization using Fireworks AI API.

**Key Exports:**
| Export | Type | Description |
|--------|------|-------------|
| optimizePrompt | Function | Standard JSON response optimization |
| optimizePromptWithImage | Function | Vision-capable optimization |
| optimizePromptStream | AsyncGenerator | Streaming with partial results |
| optimizePromptStreaming | Function | Callback-based streaming API |
| isStreamingSupported | Function | Environment capability check |
| OptimizeResult | Interface | Structured optimization output |
| StreamCallbacks | Interface | Streaming callback definitions |

**Dependencies:**
- Environment: PUBLIC_FIREPASS_API_KEY, PUBLIC_FIREPASS_MODEL, PUBLIC_FIREPASS_BASE_URL
- Native APIs: fetch, ReadableStream, TextDecoder

**Architecture Patterns:**
- System Prompt Pattern: 177-line embedded SYSTEM_PROMPT
- Streaming SSE Parser: Custom Server-Sent Events parser
- Environment-based Configuration with defaults
- JSON response format enforcement

---

### 1.2 vision-client.ts (173 lines)
**Purpose:** Image analysis and vision-capable prompt optimization.

**Key Exports:**
| Export | Type | Description |
|--------|------|-------------|
| analyzeImage | Function | AI-powered image analysis |
| optimizeWithVision | Function | Hybrid text+image optimization |
| fileToDataUrl | Function | File to base64 conversion |
| compressImage | Function | Canvas-based compression |
| VisionResult | Interface | Extended OptimizeResult with image metadata |
| ImageAttachment | Interface | File attachment structure |

**Dependencies:**
- firepass-client.ts (dynamic import fallback)
- Browser APIs: FileReader, Image, Canvas

**Architecture Patterns:**
- Dynamic Import Fallback pattern
- Client-side image compression before upload
- MIME type preservation during compression

---

### 1.3 multi-provider-fallback-with-circuit-breaker.ts (48 lines)
**Purpose:** Provider failover system (stub for Phase 4).

**Key Exports:**
- tryProviders(prompt, options?) - Sequential provider attempts
- Provider - Provider abstraction interface
- ProviderResult - Execution result with timing

**Dependencies:** firepass-client.ts

**Architecture Patterns:**
- Registry Pattern with availability checks
- Sequential Fallback strategy
- Circuit Breaker stub (Phase 4 placeholder)

---

### 1.4 prompt-cache-with-lru-and-ttl.ts (47 lines)
**Purpose:** In-memory prompt result caching (stub for Phase 4).

**Key Exports:**
- getCachedPrompt(prompt) - Retrieve cached result
- setCachedPrompt(prompt, result) - Store with timestamp

**Architecture Patterns:**
- TTL-based expiration (5 minutes)
- Simple string hashing for keys
- FIFO eviction at 1000 entries (not true LRU)

---

## 2. Recommendation Engines

### 2.1 command-recommender.ts (218 lines)
**Purpose:** Intent detection and command recommendation.

**Key Exports:**
| Export | Description |
|--------|-------------|
| detectIntent(input) | Direct keyword-to-command mapping |
| recommendCommands(input, commands) | Scored command ranking |
| validateCommand(suggestedCommand, userInput, commands) | Validation with alternatives |
| getRelatedCommands(command, commands) | Category/variant relationships |

**Architecture Patterns:**
- Intent Mapping Dictionary (44 keyword patterns)
- Multi-factor Scoring: keywords=1x, patterns=2x, useCases=1.5x, complexity=0.5x
- Confidence thresholding (0.6 for alternatives)
- Unicode-aware tokenization for Vietnamese

---

### 2.2 workflow-recommendation-engine.ts (141 lines)
**Purpose:** Task complexity analysis and workflow recommendation.

**Key Exports:**
| Export | Description |
|--------|-------------|
| analyzeTaskComplexity(input) | simple/medium/complex classification |
| getSmartRecommendation(input, commands) | Workflow vs Command decision |
| getAlternativeWorkflows(input, excludeId?) | Related suggestions |
| formatWorkflowForDisplay(workflow) | UI-friendly formatting |
| SmartRecommendation | Union type (Workflow or CommandSequence) |

**Architecture Patterns:**
- Complexity heuristics via keyword signals
- Fixed 0.85 confidence for workflows
- Bilingual support (English/Vietnamese)

---

### 2.3 workflows.ts (621 lines)
**Purpose:** Predefined workflow definitions and matching.

**Key Exports:**
| Export | Description |
|--------|-------------|
| workflows | Array of 12 workflow definitions |
| getWorkflowsByKit(kit) | Kit filtering |
| findMatchingWorkflows(input) | Score-based matching |
| needsWorkflow(input) | Complexity detection |
| getPrimaryWorkflow(input) | Top recommendation |
| Workflow, WorkflowStep | Interface definitions |

**Architecture Patterns:**
- Declarative Workflow DSL
- Gateway Pattern for required checkpoints
- Scoring: keywords=2pts, useCases=3pts, ID=5pts
- Kit classification: engineer/marketing/both

---

### 2.4 command-filtering-by-kit-and-keywords.ts (92 lines)
**Purpose:** Command filtering and sorting for UI.

**Key Exports:**
- filterCommands(commands, options) - Multi-criteria filtering
- getCommandCounts(commands) - Category counting
- sortCommandsByComplexity(commands, direction?) - Complexity sort
- groupCommandsByCategory(commands) - Category grouping
- KitFilter, FilterOptions - Type definitions

---

### 2.5 workflow-filtering-by-complexity-and-search.ts (142 lines)
**Purpose:** Workflow filtering with difficulty and search.

**Key Exports:**
- filterWorkflows(workflows, options) - Kit + difficulty + search
- getWorkflowCounts(workflows) - Kit counting
- getWorkflowDifficultyCounts(workflows) - Difficulty distribution
- sortWorkflowsByDifficulty(workflows, direction?) - Beginner to Advanced
- sortWorkflowsByStepCount(workflows, direction?) - Step count sort
- DifficultyFilter - Type definition


---

## 3. Infrastructure Modules

### 3.1 utils.ts (54 lines)
**Purpose:** General utility functions.

**Key Exports:**
- cn(...inputs) - Tailwind + clsx class merging
- generateId() - UUID with crypto.randomUUID fallback
- formatDate(date) - Intl.DateTimeFormat wrapper
- truncate(text, maxLength) - Ellipsis truncation
- isServer() / isClient() - Environment detection

**Dependencies:** clsx, tailwind-merge

---

### 3.2 rate-limiter.ts (27 lines)
**Purpose:** API rate limiting (stub for Phase 4).

**Key Exports:**
- checkRateLimit(identifier, config) - Always-allow stub
- getClientIdentifier(request) - IP from X-Forwarded-For
- RateLimitInfo - Interface

---

### 3.3 animation-variants-for-framer-motion.ts (135 lines)
**Purpose:** Predefined Framer Motion animations.

**Key Exports:**
| Export | Description |
|--------|-------------|
| fadeInUp | Bottom-to-fade entrance |
| fadeIn | Simple opacity fade |
| scaleIn | Modal scale entrance |
| slideInRight / slideInLeft | Drawer slide animations |
| staggerContainer | Parent stagger wrapper |
| staggerItem | Child stagger element |
| toastSlideUp | Toast notification animation |
| shimmer | Skeleton loading shimmer |
| pulseDot(delay) | Loading dots factory |
| springTransition | Spring physics preset |
| smoothTransition | Standard easing preset |
| bounceTransition | Playful bounce preset |

**Dependencies:** framer-motion (Types only)

---

## 4. Database Layer (src/lib/db/)

### 4.1 native-sqlite-database-client.ts (194 lines)
**Purpose:** Native Node.js SQLite client (node:sqlite, Node 22.12.0+).

**Key Exports:**
| Export | Description |
|--------|-------------|
| query(sql, params?) / queryOne(sql, params?) | SELECT helpers |
| run(sql, params?) | INSERT/UPDATE/DELETE |
| createSession(session) / getSession(id) / getSessions(limit?, offset?) | Session CRUD |
| updateSessionTimestamp(id) / deleteSession(id) | Session management |
| createMessage(message) / getMessagesBySession(sessionId, limit?) | Message CRUD |
| updateMessageContent(id, content) / deleteMessage(id) | Message updates |
| searchMessages(query, limit?) | Content search with join |
| closeDatabase() / isDatabaseAvailable() | Lifecycle |
| db | Raw DatabaseSync instance |

**Dependencies:** node:sqlite, node:fs, node:path

**Architecture Patterns:**
- Zero external dependencies (native Node.js)
- JSON serialization for tool data
- Cascading deletes (ON DELETE CASCADE)
- 4 indexes for query optimization
- Unix epoch timestamps stored as INTEGER

---

### 4.2 schema.ts (109 lines)
**Purpose:** TypeScript types and Drizzle-compatible schemas.

**Key Exports:**
| Export | Description |
|--------|-------------|
| ChatSession / Message | Entity interfaces |
| ToolCallData / ToolResultData | Tool structures |
| MessageRole | Type: user/assistant/system/tool |
| sqlSchema | CREATE TABLE statements |
| chatSessions / messages | Drizzle table placeholders |
| insert/select*Schema | Validation stubs |

**Architecture Patterns:**
- Drizzle ORM compatibility patterns
- Validation placeholder stubs
- Foreign keys with cascade delete

---

### 4.3 index.ts (152 lines)
**Purpose:** Database facade with Drizzle-like ORM interface.

**Key Exports:**
| Export | Description |
|--------|-------------|
| db | Drizzle-compatible query interface (null if unavailable) |
| migrationClient | Raw database access |
| All schema types and CRUD functions | Re-exports from other modules |

**Architecture Patterns:**
- Facade Pattern over native SQLite
- Null Object Pattern (returns null when unavailable)
- Snake_case to camelCase translation
- Date object transformation from epoch

---

## 5. Tool System (src/lib/tools/)

### 5.1 tool-system-types.ts (50 lines)
**Purpose:** Core type definitions for tool architecture.

**Key Exports:**
| Export | Description |
|--------|-------------|
| ToolParameter | Parameter schema definition |
| ToolDefinition | Tool metadata for LLM |
| ToolCall | LLM invocation structure |
| ToolResult | Execution result |
| ToolExecution | State tracking |
| Tool | Combined definition + execute function |
| ToolRegistry | Map alias |

**Architecture Patterns:**
- OpenAPI-like JSON Schema parameters
- State machine (pending->running->completed/error)
- Structured error handling

---

### 5.2 tool-registry-manager.ts (96 lines)
**Purpose:** Tool registration and execution management.

**Key Exports:**
| Export | Description |
|--------|-------------|
| registerTool(tool) / getTool(name) / getAllTools() | Registry access |
| getToolDefinitions() | LLM-compatible format |
| hasTool(name) | Existence check |
| executeTool(toolCall) | Single execution with timing |
| executeToolsConcurrently(toolCalls) | Parallel execution |
| createToolExecution(toolCall) / updateToolExecution(execution, updates) | State management |
| registry | Direct Map access |

**Dependencies:** tool-system-types, tavily/e2b implementations

**Architecture Patterns:**
- Registry Pattern (Map storage)
- Auto-registration at module load
- Concurrent Promise.all execution
- Execution timing tracking
- Immutable state updates

---

### 5.3 tavily-web-search-tool-implementation.ts (100 lines)
**Purpose:** Web search tool using Tavily API.

**Key Exports:**
- tavilyWebSearchTool - Registered Tool instance
- TavilySearchResult - Single result structure
- TavilySearchResponse - API response format

**Dependencies:** None (native fetch)

**Architecture Patterns:**
- Function Tool Pattern (OpenAI compatible)
- Parameter schema with enums
- Bearer token authentication
- Input clamping (1-10 results)

---

### 5.4 e2b-code-execution-tool-implementation.ts (133 lines)
**Purpose:** Sandboxed code execution via E2B.

**Key Exports:**
- e2bCodeExecutionTool - Registered Tool instance
- CodeExecutionResult - stdout, stderr, exitCode, timing

**Dependencies:** None (native fetch)

**Architecture Patterns:**
- Language template mapping (10 languages)
- Cloud sandbox execution
- 60s timeout enforcement
- Templates: python-3.11, node-20, go-1.21, rust-1.75, etc.

---

### 5.5 Additional Tool Files

| File | Purpose |
|------|---------|
| tool-registry.ts (98 lines) | Alternative registry (appears to be older version) |
| tavily-web-search-tool.ts (99 lines) | Alternative Tavily implementation |
| e2b-code-execution-tool.ts (133 lines) | Alternative E2B implementation |
| types.ts (50 lines) | Re-export of tool-system-types |
| index.ts (33 lines) | Barrel exports |


---

## 6. Dependency Graph

```
workflow-recommendation-engine.ts
  -> workflows.ts
  -> ../data/commands.ts

command-recommender.ts
  -> ../data/commands.ts

command-filtering-by-kit-and-keywords.ts
  -> ../data/commands.ts

workflow-filtering-by-complexity-and-search.ts
  -> workflows.ts

workflows.ts
  -> ../data/commands.ts (type only)

multi-provider-fallback-with-circuit-breaker.ts
  -> firepass-client.ts

db/index.ts
  -> db/native-sqlite-database-client.ts
  -> db/schema.ts

tools/tool-registry-manager.ts
  -> tools/tool-system-types.ts
  -> tools/tavily-web-search-tool-implementation.ts
  -> tools/e2b-code-execution-tool-implementation.ts
```

---

## 7. Architecture Patterns Summary

| Pattern | Modules | Description |
|---------|---------|-------------|
| Registry Pattern | tool-registry-manager, multi-provider | Map-based storage with lookup |
| Facade Pattern | db/index.ts | Simplified interface over complex subsystem |
| Strategy Pattern | command-recommender | Scoring algorithm with multiple factors |
| Factory Pattern | animation-variants | Parameterized variant generation |
| Stub Pattern | rate-limiter, prompt-cache | Placeholder implementations for Phase 4 |
| Streaming Parser | firepass-client | Custom SSE chunk processing |
| Gateway Pattern | workflows.ts | Required checkpoint steps (e.g., /clear) |
| Declarative DSL | workflows.ts | JSON-like workflow definitions |
| Circuit Breaker | multi-provider (stub) | Resilience pattern placeholder |
| LRU Cache | prompt-cache (stub) | Cache eviction placeholder |

---

## 8. External Dependencies

### NPM Packages
- clsx - Conditional className utility
- tailwind-merge - Tailwind class deduplication
- framer-motion - Animation library (types only)

### Node.js Built-in Modules
- node:sqlite - Native SQLite (Node 22.12.0+)
- node:fs - File system operations
- node:path - Path utilities

### External APIs
- Fireworks AI (FirePass) - LLM optimization
- Tavily - Web search API
- E2B - Code execution sandbox

---

## 9. Module Statistics

| Category | Modules | Total Lines |
|----------|---------|-------------|
| Core AI/LLM | 4 | 779 |
| Recommendation | 5 | 1,274 |
| Infrastructure | 3 | 216 |
| Database | 3 | 455 |
| Tools | 8 | 778 |
| **Total** | **23** | **3,502** |

---

## 10. Unresolved Questions

1. **Rate Limiter Implementation:** Currently stub returning always-allow. Will it use Redis or SQLite for production?

2. **Prompt Cache LRU:** Current FIFO eviction at 1000 entries - should implement true LRU with Map ordering?

3. **Circuit Breaker:** Stub exists but no actual circuit breaker logic implemented for provider failover.

4. **Tool Registry Duplication:** Both tool-registry.ts and tool-registry-manager.ts exist - need consolidation?

5. **Streaming Error Handling:** Firepass streaming has basic error handling - need retry logic for failed chunks?

6. **Database Fallback:** When node:sqlite unavailable, db returns null - need alternative storage?

7. **Vision Model Configuration:** Uses kimik2p5-turbo for both text and vision - should separate vision model config?

---

**End of Report**
