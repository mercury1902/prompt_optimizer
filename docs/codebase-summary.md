# Codebase Summary

**Generated:** 2026-04-07  
**Total Files:** 50+ source files  
**Total Lines:** 3,502+ (lib modules only)

---

## Directory Structure

```
D:/project/Clone/ck/claudekit-chatbot-astro/
├── src/
│   ├── components/           # 39 React components
│   │   ├── chat/            # 8 glassmorphism chat components
│   │   ├── command-browser/ # 4 command browser components
│   │   ├── command-guide/   # 5 command guide components
│   │   ├── shared/          # 3 shared UI components
│   │   ├── ui/              # 5 UI/UX enhancement components
│   │   ├── workflow/        # 3 workflow components
│   │   └── *.tsx            # 11 core chat components
│   ├── contexts/            # 1 context (ChatContext)
│   ├── data/                # 2 data files (commands, catalog)
│   ├── hooks/               # 5 custom hooks
│   ├── lib/                 # 23 library modules
│   │   ├── db/              # 3 database modules
│   │   └── tools/           # 8 tool system modules
│   ├── middleware/          # 1 security middleware stub
│   ├── pages/               # 5 Astro pages + 4 API routes
│   ├── styles/              # 1 global CSS file
│   └── types/               # 2 TypeScript definition files
├── docs/                    # Documentation
├── plans/                   # Plans and reports
├── public/                  # Static assets
├── tests/                   # Test files
├── .env.example             # Environment template
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vitest.config.ts         # Vitest configuration
```

---

## Component Inventory (39 Total)

### 1. Core Chat Components (11)

| Component | Purpose | Lines | Location |
|-----------|---------|-------|----------|
| ChatBot.tsx | Main chat interface | ~150 | src/components/ |
| ChatContainer.tsx | Chat state container | ~50 | src/components/ |
| ChatInput.tsx | Auto-resize textarea input | ~60 | src/components/ |
| MessageList.tsx | Message list with auto-scroll | ~50 | src/components/ |
| UserMessage.tsx | User message bubble | ~30 | src/components/ |
| AssistantMessage.tsx | Assistant message with typing indicator | ~40 | src/components/ |
| MessageContent.tsx | Markdown + code rendering | ~70 | src/components/ |
| CodeBlock.tsx | Syntax highlighted code | ~50 | src/components/ |
| TypingIndicator.tsx | Animated typing dots | ~20 | src/components/ |
| ToolCallVisualizer.tsx | Tool execution display | ~80 | src/components/ |
| ToolResultDisplay.tsx | Tool results (search/code) | ~90 | src/components/ |

### 2. Glassmorphism Chat Components (8)

| Component | Purpose | Location |
|-----------|---------|----------|
| chat-frame-with-glassmorphism-and-vietnamese.tsx | Main chat frame | src/components/chat/ |
| chat-frame-with-glassmorphism-and-demo.tsx | Demo chat frame | src/components/chat/ |
| message-bubble-user-simple.tsx | User message bubble | src/components/chat/ |
| message-bubble-assistant-with-actions.tsx | Assistant with actions | src/components/chat/ |
| chat-input-with-keyboard-shortcuts.tsx | Keyboard shortcut input | src/components/chat/ |
| chat-header-with-status.tsx | Status header | src/components/chat/ |
| command-palette-with-cmdk.tsx | Command palette | src/components/chat/ |
| code-block-with-copy-button.tsx | Copy-enabled code | src/components/chat/ |

### 3. Command Browser Components (4)

| Component | Purpose | Location |
|-----------|---------|----------|
| command-browser-with-kit-filter-and-search.tsx | Kit filter + search | src/components/command-browser/ |
| command-detail-view-with-tabs-and-copy.tsx | Detail modal | src/components/command-browser/ |
| command-usage-examples-with-variants.tsx | Usage examples | src/components/command-browser/ |
| related-commands-suggestions.tsx | Related suggestions | src/components/command-browser/ |

### 4. Command Guide Components (5)

| Component | Purpose | Location |
|-----------|---------|----------|
| command-browser-with-search.tsx | Search browser | src/components/command-guide/ |
| decision-tree-with-recommendations.tsx | Interactive decision tree | src/components/command-guide/ |
| prompt-optimizer-chat.tsx | Prompt optimizer UI | src/components/command-guide/ |
| optimized-prompt-result-view.tsx | Results display | src/components/command-guide/ |
| prompt-templates.ts | 14 template definitions | src/components/command-guide/ |

### 5. UI/UX Enhancement Components (5)

| Component | Purpose | Location |
|-----------|---------|----------|
| favorite-button-with-toggle-animation.tsx | Animated favorite button | src/components/ui/ |
| skeleton-loader-for-command-cards.tsx | Loading skeletons | src/components/ui/ |
| toast-notification-system.tsx | Toast notifications | src/components/ui/ |
| quick-access-sidebar-with-tabs.tsx | Favorites/Recents sidebar | src/components/ui/ |
| enhanced-typing-indicator-with-dots-animation.tsx | Typing animations | src/components/ui/ |

### 6. Workflow Components (3)

| Component | Purpose | Location |
|-----------|---------|----------|
| workflow-card-with-steps-preview.tsx | Workflow card | src/components/workflow/ |
| workflow-detail-view-with-step-guide.tsx | Step-by-step guide | src/components/workflow/ |
| workflow-browser-with-search-and-filter.tsx | Workflow browser | src/components/workflow/ |

### 7. Shared/UI Components (3)

| Component | Purpose | Location |
|-----------|---------|----------|
| glass-card-with-depth-layer.tsx | Glassmorphism cards | src/components/shared/ |
| animated-border-with-gradient.tsx | Gradient borders | src/components/shared/ |
| glass-button-neumorphic.tsx | Glass buttons | src/components/shared/ |

---

## Library Modules (23 Total)

### 1. Core AI/LLM Client (4 modules, 779 lines)

| Module | Purpose | Lines |
|--------|---------|-------|
| firepass-client.ts | Fireworks AI client | 511 |
| vision-client.ts | Image analysis | 173 |
| multi-provider-fallback-with-circuit-breaker.ts | Provider failover | 48 |
| prompt-cache-with-lru-and-ttl.ts | Result caching | 47 |

### 2. Recommendation Engines (5 modules, 1,214 lines)

| Module | Purpose | Lines |
|--------|---------|-------|
| command-recommender.ts | Intent detection | 218 |
| workflow-recommendation-engine.ts | Workflow matching | 141 |
| workflows.ts | 18 workflow definitions | 621 |
| command-filtering-by-kit-and-keywords.ts | Command filtering | 92 |
| workflow-filtering-by-complexity-and-search.ts | Workflow filtering | 142 |

### 3. Infrastructure (3 modules, 216 lines)

| Module | Purpose | Lines |
|--------|---------|-------|
| utils.ts | General utilities | 54 |
| rate-limiter.ts | Rate limiting stub | 27 |
| animation-variants-for-framer-motion.ts | Animation presets | 135 |

### 4. Database Layer (3 modules, 455 lines)

| Module | Purpose | Lines |
|--------|---------|-------|
| db/native-sqlite-database-client.ts | Native SQLite client | 194 |
| db/schema.ts | TypeScript schemas | 109 |
| db/index.ts | Database facade | 152 |

### 5. Tool System (8 modules, 778 lines)

| Module | Purpose | Lines |
|--------|---------|-------|
| tools/tool-system-types.ts | Core type definitions | 50 |
| tools/tool-registry-manager.ts | Tool registration | 96 |
| tools/tavily-web-search-tool-implementation.ts | Web search tool | 100 |
| tools/e2b-code-execution-tool-implementation.ts | Code execution tool | 133 |
| tools/tool-registry.ts | Alternative registry | 98 |
| tools/tavily-web-search-tool.ts | Alternative Tavily | 99 |
| tools/e2b-code-execution-tool.ts | Alternative E2B | 133 |
| tools/index.ts | Barrel exports | 33 |
| tools/types.ts | Re-export types | 50 |

---

## API Routes (5 Total)

| Route | Methods | Purpose | Lines |
|-------|---------|---------|-------|
| /api/chat | POST, GET | SSE streaming chat | 509 |
| /api/sessions | GET, POST, DELETE | Session CRUD | 104 |
| /api/health | GET | Health check | 39 |
| /api/test-firepass-api-connection | POST | API diagnostic | 90 |

---

## Data Structures

### Commands (62 Total)

```typescript
interface Command {
  id: string;                    // e.g., "ck:cook"
  name: string;                  // e.g., "/ck:cook"
  category: "Engineer" | "Marketing";
  complexity: 1 | 2 | 3 | 4 | 5;
  description: string;
  keywords: string[];              // Multilingual search terms
  patterns: string[];             // Regex patterns
  useCases: string[];
  args?: string;
  variants?: string[];
}
```

| Kit | Count | Complexity Range |
|-----|-------|------------------|
| Engineer | 28 | 1-5 |
| Marketing | 34 | 1-5 |

### Workflows (18 Total)

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  kit: "engineer" | "marketing" | "both";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeEstimate: string;
  steps: WorkflowStep[];
  useCases: string[];
  keywords: string[];
}

interface WorkflowStep {
  step: number;
  command: string;
  description: string;
  flags?: string[];
  required?: boolean;
  gateway?: boolean;
  note?: string;
}
```

| Category | Count | Examples |
|----------|-------|----------|
| Engineer | 6 | new-feature, bootstrap-project, bug-fix |
| Marketing | 5 | content-creation, campaign-launch |
| Hybrid | 7 | fullstack-feature, analytics-dashboard |

### Prompt Templates (14 Total)

| Category | Count | Templates |
|----------|-------|-----------|
| Development | 4 | Implement Feature, Refactor Code, Debug Issue, Code Review |
| UI/UX | 4 | Create Component, Design Page, Add Animations, Responsive Design |
| DevOps | 3 | Deploy Config, Docker Setup, CI/CD Pipeline |
| Database | 3 | Database Schema, Optimize Query, Migration |

### Database Schema

**ChatSession Table**
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT PRIMARY KEY | UUID |
| title | TEXT | Session title |
| createdAt | INTEGER | Unix epoch |
| updatedAt | INTEGER | Unix epoch |
| model | TEXT | LLM model used |

**Message Table**
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT PRIMARY KEY | UUID |
| sessionId | TEXT FK | Parent session |
| role | TEXT | user/assistant/system/tool |
| content | TEXT | Message content |
| createdAt | INTEGER | Unix epoch |
| toolCalls | TEXT (JSON) | Tool execution data |
| toolResults | TEXT (JSON) | Tool results |
| isComplete | INTEGER | Completion flag |

---

## Type Definitions

### Chat Types (src/types/chat.ts)

| Type | Purpose |
|------|---------|
| UIMessage | UI message structure |
| ToolExecution | Tool call tracking |
| ChatState | React state container |
| ChatStatus | State machine: idle/submitted/streaming/error |
| ChatAction | Reducer actions |

### Database Types (src/types/database.ts)

| Type | Purpose |
|------|---------|
| ChatSession | Session entity |
| Message | Message entity |
| MessageRole | Role enum |
| ToolCallData | Tool call storage |
| ToolResultData | Tool result storage |

---

## Configuration Files

| File | Purpose |
|------|---------|
| astro.config.mjs | Astro SSR + React integration |
| tsconfig.json | Strict TypeScript |
| vitest.config.ts | Vitest + happy-dom |
| package.json | Dependencies (19 prod + 11 dev) |
| .env.example | Environment template |

---

## Architecture Patterns

| Pattern | Modules | Description |
|---------|---------|-------------|
| Registry Pattern | tools/tool-registry-manager | Map-based tool storage |
| Facade Pattern | db/index.ts | Simplified DB interface |
| Reducer Pattern | ChatContext.tsx | Action-based state |
| Strategy Pattern | command-recommender.ts | Multi-factor scoring |
| Gateway Pattern | workflows.ts | Required checkpoints |
| Declarative DSL | workflows.ts | JSON workflow definitions |
| Circuit Breaker | multi-provider-fallback.ts | Provider failover (stub) |
| LRU Cache | prompt-cache-with-lru-and-ttl.ts | Result caching (stub) |

