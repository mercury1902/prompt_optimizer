# ClaudeKit Chat - AI-Powered Claude Code Assistant

AI-powered chatbot with prompt optimization, 62 ClaudeKit commands, and 18 predefined workflows. Built with Astro 6, React 19, and Tailwind CSS v4.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Astro | 6.1.3 | Static site generator with SSR |
| React | 19.2.4 | Interactive islands |
| Tailwind CSS | 4.2.2 | CSS-first styling |
| Node.js | >=22.12.0 | Runtime with native SQLite |
| Fireworks AI | FirePass | LLM (Kimi K2.5 Turbo) |

---

## Features

### Core Chat
- **SSE Streaming**: Real-time AI responses with session persistence
- **Glassmorphism UI**: Premium glassmorphism design with Framer Motion animations
- **Bilingual Toggle**: Vietnamese/English UI switching with persisted preference
- **Session Management**: Chat history with SQLite/PostgreSQL storage
- **Favorites & Recent**: localStorage-backed command tracking

### UI Consistency
- **Global Accent Policy**: Single brand-accent system across primary surfaces
- **Legacy UI Deprecation**: Neutral fallback chat components are fully deprecated

### Command System (62 Commands)
| Kit | Count | Examples |
|-----|-------|----------|
| Engineer | 28 | /ck:cook, /ck:fix, /ck:plan, /ck:scout, /ck:debug |
| Marketing | 34 | /ck:marketing:ab-test, /ck:marketing:launch, /ck:marketing:seo |

### Workflow System (18 Workflows)
| Category | Count | Examples |
|----------|-------|----------|
| Engineer | 6 | new-feature, bootstrap-project, bug-fix |
| Marketing | 5 | content-creation, campaign-launch |
| Hybrid | 7 | fullstack-feature, analytics-dashboard |

### Prompt Optimizer
- **14 Templates**: Development, UI/UX, DevOps, Database categories
- **AI-Powered**: Fireworks AI optimization with command suggestions
- **Tabbed Results**: Optimized prompt, suggested command, comparison view

---

## Project Structure

```
src/
├── components/
│   ├── chat/                      # 8 glassmorphism chat components
│   ├── command-guide/             # 5 command guide components
│   ├── command-browser/             # 4 command browser components
│   ├── workflow/                  # 3 workflow components
│   ├── ui/                        # 5 UI/UX enhancement components
│   ├── shared/                    # 3 shared UI components
│   ├── ChatBot.tsx                # Main chat interface
│   ├── ChatContainer.tsx          # Chat state container
│   ├── ChatInput.tsx              # Auto-resize input
│   ├── MessageList.tsx            # Message rendering
│   └── ... (39 total components)
├── contexts/
│   └── ChatContext.tsx            # Global chat state (reducer pattern)
├── data/
│   ├── commands.ts                # 62 ClaudeKit commands
│   └── claudekit-full-commands-catalog.ts
├── hooks/
│   ├── useAstroChat.ts            # Streaming chat hook
│   ├── use-command-search-with-debounce.ts
│   ├── use-favorites-with-local-storage-persistence.ts
│   └── use-recent-commands-with-session-history.ts
├── lib/
│   ├── firepass-client.ts         # Fireworks AI client
│   ├── command-recommender.ts     # Intent detection
│   ├── workflows.ts               # 18 workflow definitions
│   ├── db/                        # Native SQLite database
│   │   ├── native-sqlite-database-client.ts
│   │   ├── schema.ts              # Drizzle-compatible types
│   │   └── index.ts               # Database facade
│   ├── tools/                     # Tool system (Tavily, E2B)
│   └── ... (23 total modules)
├── pages/
│   ├── index.astro                # Main chat page
│   ├── chat.astro                 # Full-screen chat
│   ├── guide/
│   │   ├── index.astro            # Decision tree + browser
│   │   ├── commands.astro         # Command browser
│   │   └── prompt-optimizer.astro # Prompt optimizer
│   └── api/
│       ├── chat.ts                # SSE streaming chat API
│       ├── sessions.ts            # Session CRUD
│       ├── health.ts              # Health check
│       └── test-firepass-api-connection.ts
├── styles/
│   └── global.css                 # Tailwind v4 + glassmorphism
└── types/
    ├── chat.ts                    # Chat system types
    └── database.ts                # Database types
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Fireworks API key

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `PUBLIC_FIREPASS_API_KEY` | Fireworks AI API key |
| `PUBLIC_FIREPASS_MODEL` | Model identifier (default: accounts/fireworks/routers/kimi-k2p5-turbo) |
| `PUBLIC_FIREPASS_BASE_URL` | API endpoint (default: https://api.fireworks.ai/inference/v1) |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL/SQLite connection string |
| `MAX_SESSIONS` | 100 | Max concurrent sessions |
| `MESSAGE_PAGE_SIZE` | 50 | Message pagination size |
| `ENABLE_TOOLS` | true | Enable tool execution |
| `ENABLE_STREAMING` | true | Enable SSE streaming |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | SSE streaming chat |
| GET | /api/chat?sessionId=xxx | Get session messages |
| GET | /api/sessions | List all sessions |
| POST | /api/sessions | Create new session |
| DELETE | /api/sessions?id=xxx | Delete session |
| GET | /api/health | Health check |
| POST | /api/test-firepass-api-connection | API diagnostic |

---

## Build Stats

| Metric | Value |
|--------|-------|
| Components | 39 React components |
| Library Modules | 23 lib modules (3,502 lines) |
| Commands | 62 (28 Engineer + 34 Marketing) |
| Workflows | 18 predefined workflows |
| Templates | 14 prompt optimizer templates |
| API Routes | 5 endpoints |
| Database | SQLite (native node:sqlite) or PostgreSQL |
| Bundle Size | ~29KB (hydrated islands only) |

---

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| dev | `astro dev` | Development server |
| build | `astro build` | Production build |
| preview | `astro preview` | Preview build |
| test | `vitest run` | Run tests |
| benchmark | `npm run benchmark` | Offline benchmark suite (discovery + telemetry learning) |
| benchmark:live | `npm run benchmark:live` | Live FirePass benchmark (requires `RUN_LIVE_BENCHMARK=1`) |
| test:watch | `vitest` | Watch mode |
| test:coverage | `vitest run --coverage` | Coverage report |

---

## Documentation

- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)
- [Project Roadmap](./docs/project-roadmap.md)
- [Benchmark Test Guide](./docs/benchmark-test-guide.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Chat Backend](./docs/chat-backend.md)

---

## License

MIT
