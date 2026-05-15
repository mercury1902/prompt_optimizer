# ClaudeKit Chat - AI-Powered Claude Code Assistant

[![Astro](https://img.shields.io/badge/Astro-6.1.3-BC52EE?logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.2-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js->=22.12.0-339933?logo=nodedotjs)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

AI-powered chatbot with prompt optimization, 62 ClaudeKit commands, and 18 predefined workflows. Built with Astro 6, React 19, and Tailwind CSS v4.

[Live Demo](#) · [Documentation](./docs) · [Report Bug](../../issues) · [Request Feature](../../issues)

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

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/claudekit-chatbot-astro.git
cd claudekit-chatbot-astro

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Fireworks API key

# Start development server
npm run dev
```

## Features

### Core Chat
- **SSE Streaming**: Real-time AI responses with session persistence
- **Glassmorphism UI**: Premium glassmorphism design with Framer Motion animations
- **Bilingual Toggle**: Vietnamese/English UI switching with persisted preference
- **Session Management**: Chat history with SQLite/PostgreSQL storage
- **Favorites & Recent**: localStorage-backed command tracking
- **Message Reactions**: Add reactions to messages
- **Conversation Export**: Export chat history
- **Virtualized List**: Performance-optimized message rendering

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
├── components/          # 46 React components
│   ├── chat/           # 14 chat components (glassmorphism)
│   ├── command-guide/  # 6 command guide components
│   ├── command-browser/# 4 command browser components
│   ├── workflow/       # 3 workflow components
│   ├── ui/             # 4 UI/UX enhancement components
│   ├── shared/         # 3 shared UI components
│   └── *.tsx           # 12 core chat components
├── contexts/
│   └── ChatContext.tsx # Global chat state (reducer pattern)
├── data/
│   ├── commands.ts     # 62 ClaudeKit commands
│   └── claudekit-full-commands-catalog.ts
├── hooks/
│   ├── useAstroChat.ts # Streaming chat hook
│   └── ... (8 total hooks)
├── lib/
│   ├── firepass-client.ts         # Fireworks AI client
│   ├── command-recommender.ts     # Intent detection
│   ├── workflows.ts               # 18 workflow definitions
│   ├── db/                        # Native SQLite database
│   ├── tools/                     # Tool system (Tavily, E2B)
│   └── ... (28 total modules)
├── pages/
│   ├── index.astro     # Main chat page
│   ├── chat.astro      # Full-screen chat
│   ├── guide/          # Guide pages
│   └── api/            # API routes (chat, sessions, health)
├── styles/
│   └── global.css      # Tailwind v4 + glassmorphism
└── types/
    ├── chat.ts         # Chat system types
    └── database.ts     # Database types
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

## Project Stats

| Metric | Value |
|--------|-------|
| Components | 46 React components |
| Library Modules | 28 modules |
| Custom Hooks | 8 hooks |
| Test Files | 27 tests |
| Commands | 62 (28 Engineer + 34 Marketing) |
| Workflows | 18 predefined workflows |
| Templates | 14 prompt optimizer templates |
| API Routes | 5 endpoints |
| Database | SQLite (native node:sqlite) or PostgreSQL |
| Bundle Size | ~29KB (hydrated islands only) |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (http://localhost:4321) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests (Vitest) |
| `npm run benchmark` | Run offline benchmark suite |
| `npm run benchmark:live` | Run live FirePass benchmark |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run E2E tests (Playwright) |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](./docs/project-overview-pdr.md) | Vision, features, and requirements |
| [Codebase Summary](./docs/codebase-summary.md) | Component inventory and architecture |
| [Code Standards](./docs/code-standards.md) | Naming conventions and patterns |
| [System Architecture](./docs/system-architecture.md) | Technical architecture details |
| [Project Roadmap](./docs/project-roadmap.md) | Development phases and milestones |
| [Deployment Guide](./docs/deployment-guide.md) | Deployment options and configuration |
| [Benchmark Guide](./docs/benchmark-test-guide.md) | Testing and benchmarking |
| [Chat Backend](./docs/chat-backend.md) | Chat system implementation |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Code Standards](./docs/code-standards.md) before contributing.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Astro](https://astro.build) and [React](https://react.dev)
- UI powered by [Tailwind CSS](https://tailwindcss.com) and [Framer Motion](https://www.framer.com/motion/)
- AI powered by [Fireworks AI](https://fireworks.ai)
"# prompt_optimizer" 
