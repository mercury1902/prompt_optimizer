# System Architecture

**Version:** 0.0.2  
**Last Updated:** 2026-04-15

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │   Chat Page     │  │  Guide Pages    │  │      Prompt Optimizer       │  │
│  │   (/chat)       │  │  (/guide/*)     │  │     (/guide/prompt-opt)     │  │
│  └────────┬────────┘  └────────┬────────┘  └───────────────┬─────────────┘  │
│           │                      │                          │                │
│           └──────────────────────┼──────────────────────────┘                │
│                                  ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     React Islands (client:load)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ ChatFrame    │  │ Command      │  │ Prompt       │  │ Workflow │ │  │
│  │  │              │  │ Browser      │  │ Optimizer    │  │ Browser  │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │  │
│  └─────────┼────────────────┼─────────────────┼───────────────┼───────┘  │
└────────────┼────────────────┼─────────────────┼───────────────┼──────────┘
             │                │                 │               │
             ▼                ▼                 ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Astro SSR Layer (Node.js)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         API Routes                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │  │
│  │  │ POST       │  │ GET/POST   │  │    GET     │  │     POST     │ │  │
│  │  │ /api/chat  │  │ /api/sess  │  │ /api/health│  │/api/test-*   │ │  │
│  │  │ (SSE)      │  │ (CRUD)     │  │            │  │              │ │  │
│  │  └──────┬─────┘  └──────┬─────┘  └─────┬──────┘  └──────┬───────┘ │  │
│  └─────────┼───────────────┼──────────────┼────────────────┼─────────┘  │
└────────────┼───────────────┼──────────────┼────────────────┼────────────┘
             │               │              │                │
             ▼               ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Firepass Client   │  │   Database Layer    │  │   Tool System       │  │
│  │   (Fireworks AI)    │  │   (SQLite/PostgreSQL)│  │   (Tavily/E2B)      │  │
│  │                     │  │                     │  │                     │  │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │
│  │  │ Prompt Opt    │  │  │  │ Native SQLite │  │  │  │ Web Search    │  │  │
│  │  │ Streaming     │  │  │  │ Drizzle ORM   │  │  │  │ (Tavily)      │  │  │
│  │  │ Vision        │  │  │  │ Fallback Mode │  │  │  │ Code Exec     │  │  │
│  │  └───────────────┘  │  │  └───────────────┘  │  │  │ (E2B)         │  │  │
│  └─────────────────────┘  │  └─────────────────────┘  │  └───────────────┘  │  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Chat Message Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│  ChatFrame   │────▶│  /api/chat   │────▶│  Firepass    │
│  Input   │     │  Component   │ POST │  (SSE)       │     │  API         │
└──────────┘     └──────────────┘     └──────────────┘     └───────┬──────┘
     │                                                             │
     │         ┌──────────────┐     ┌──────────────┐              │
     └────────▶│  MessageList │◀────│  SSE Stream  │◀─────────────┘
       Render  │  Component   │     │  (chunks)    │
               └──────────────┘     └──────────────┘
                      │
                      ▼
               ┌──────────────┐
               │   Database   │
               │   (SQLite)   │
               └──────────────┘
```

### Session Persistence Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Session   │────▶│ /api/sess    │────▶│  Database    │────▶│  chat_session│
│   Action    │     │ (GET/POST)   │     │  Facade      │     │  table       │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                              │
                                              ▼
                                        ┌──────────────┐
                                        │   messages   │
                                        │    table     │
                                        └──────────────┘
```

---

## Component Relationships

### Chat Component Hierarchy

```
ChatFrameWithGlassmorphismAndVietnamese
├── ChatHeaderWithStatus
│   └── StatusIndicator
├── ChatBody
│   ├── MessageBubbleUserSimple (map)
│   └── MessageBubbleAssistantWithActions (map)
│       ├── MessageContent
│       │   ├── ReactMarkdown
│       │   └── CodeBlockWithCopyButton
│       └── ActionToolbar (copy, regenerate)
├── ChatInputWithKeyboardShortcuts
│   ├── TextArea (auto-resize)
│   ├── CommandIndicator
│   └── SendButton / StopButton
└── CommandPaletteWithCmdk
    ├── SearchInput
    ├── EngineerKitGroup
    └── MarketingKitGroup
```

### Command Guide Component Hierarchy

```
GuidePage
├── DecisionTreeWithRecommendations
│   ├── QuestionNode
│   ├── AnswerButton
│   └── RecommendationCard
├── CommandBrowserWithKitFilterAndSearch
│   ├── KitFilterTabs (All/Engineer/Marketing)
│   ├── SearchInput
│   └── CommandCard (map)
│       ├── FavoriteButton
│       └── ComplexityIndicator
└── QuickAccessSidebarWithTabs
    ├── FavoritesTab
    └── RecentTab
```

### Prompt Optimizer Component Hierarchy

```
PromptOptimizerPage
└── PromptOptimizerChat
    ├── TemplateSelector (14 templates)
    │   ├── CategoryTabs (Dev/UI/UX/DevOps/DB)
    │   └── TemplateGrid
    ├── InputArea
    │   ├── PromptTextarea
    │   └── QuickExampleButtons
    └── OptimizedPromptResultView
        ├── TabBar (Optimized/Command/Compare)
        ├── OptimizedPromptTab
        │   └── SyntaxHighlighter
        ├── SuggestedCommandTab
        └── ComparisonTab
```

---

## Tool System Architecture

### Registry Pattern

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Tool Registry Manager                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  Tavily Search   │  │  E2B Code Exec   │  │  Future Tools...    │  │
│  │                  │  │                  │  │                     │  │
│  │  - name          │  │  - name          │  │  - registerTool()   │  │
│  │  - parameters    │  │  - parameters    │  │  - getTool()        │  │
│  │  - execute()     │  │  - execute()     │  │  - executeTools()   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └─────────────────────┘  │
│           │                      │                                      │
│           └──────────────────────┼──────────────────────────────────────┘
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Tool Execution Flow                           │  │
│  │                                                                   │  │
│  │  1. LLM detects need for tool                                     │  │
│  │  2. API sends tool_calls[]                                        │  │
│  │  3. Registry looks up tool by name                                │  │
│  │  4. Tool.execute() called with arguments                          │  │
│  │  5. Result returned as tool_result                                │  │
│  │  6. LLM continues with context                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Tool Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    LLM      │────▶│  tool_calls  │────▶│   Registry   │────▶│    Tool      │
│   Request   │     │   (JSON)     │     │   Manager    │     │  Execution   │
└─────────────┘     └──────────────┘     └──────────────┘     └───────┬──────┘
                                                                      │
                                                                      ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    LLM      │◀────│  Assistant   │◀────│  tool_result │◀────│   Result     │
│  Response   │     │   Response   │     │    (JSON)    │     │   Format     │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Note:** Tools are currently disabled in production (commented out in chat.ts) pending Phase 4 implementation.

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│   ChatSession    │         │     Message      │
├──────────────────┤         ├──────────────────┤
│ PK id: TEXT      │◀────────┤ FK sessionId: TEXT
│    title: TEXT   │    1:M  │ PK id: TEXT      │
│    createdAt: INT│         │    role: TEXT    │
│    updatedAt: INT│         │    content: TEXT │
│    model: TEXT   │         │    createdAt: INT│
└──────────────────┘         │    toolCalls: TXT│
                             │    toolResults: T│
                             │    isComplete: INT│
                             └──────────────────┘
```

### Schema Details

#### ChatSession Table
```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  model TEXT
);

CREATE INDEX idx_sessions_updated_at ON chat_sessions(updated_at DESC);
```

#### Message Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  tool_calls TEXT,
  tool_results TEXT,
  is_complete INTEGER,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### JSON Serialization
Tool data is serialized as JSON for storage:

```typescript
interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ToolResultData {
  callId: string;
  result: unknown;
  duration: number;
  status: 'completed' | 'error';
}
```

---

## State Management Architecture

### Chat Context (Global State)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ChatContext Provider                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  State:                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  messages   │  │   status    │  │   error     │  │   input     │        │
│  │  UIMessage[]│  │ ChatStatus  │  │  Error|null │  │   string    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Actions:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SEND_MESSAGE | APPEND_CHUNK | SET_STATUS | SET_ERROR               │   │
│  │ STOP_STREAMING | SET_INPUT                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Reducer:                                                                   │
│  (state, action) => newState                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Hook-Based State (Local State)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Custom Hooks                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  useAstroChat()                                                             │
│  ├─ messages, input, status, error                                          │
│  ├─ handleSubmit(), stop()                                                  │
│  └─ SSE streaming management                                                │
│                                                                             │
│  useCommandSearchWithDebounce()                                            │
│  ├─ searchQuery, kitFilter, filteredCommands                                │
│  ├─ setSearchQuery(), setKitFilter()                                        │
│  └─ 150ms debounce                                                          │
│                                                                             │
│  useFavoritesWithLocalStoragePersistence()                                  │
│  ├─ favorites, toggleFavorite(), isFavorite()                              │
│  └─ localStorage: claudekit:favorites                                       │
│                                                                             │
│  useRecentCommandsWithSessionHistory()                                      │
│  ├─ recents, addRecent(), clearRecents()                                   │
│  └─ localStorage: claudekit:recents (max 20)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Patterns Summary

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| Registry Pattern | `tools/tool-registry-manager.ts` | Tool registration and lookup |
| Facade Pattern | `db/index.ts` | Simplified database interface |
| Reducer Pattern | `contexts/ChatContext.tsx` | Action-based state management |
| Gateway Pattern | `workflows.ts` | Workflow checkpoint validation |
| Declarative DSL | `workflows.ts` | JSON workflow definitions |
| Circuit Breaker | `multi-provider-fallback-with-circuit-breaker.ts` | Provider failover (stub) |
| LRU Cache | `prompt-cache-with-lru-and-ttl.ts` | Result caching (stub) |
| Composition | Component hierarchy | Complex UI from simple parts |

---

## External Dependencies

### APIs
| Service | Purpose | Endpoint |
|---------|---------|----------|
| Fireworks AI | LLM provider | https://api.fireworks.ai/inference/v1 |
| Tavily | Web search | https://api.tavily.com |
| E2B | Code execution | https://api.e2b.dev |

### Libraries
| Library | Purpose | Version |
|---------|---------|---------|
| astro | Framework | 6.1.3 |
| react | UI | 19.2.4 |
| framer-motion | Animation | 12.38.0 |
| tailwindcss | Styling | 4.2.2 |
| cmdk | Command palette | 1.1.1 |
| sonner | Toast notifications | 2.0.7 |

