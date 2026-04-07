# Project Overview & Product Development Requirements

**Project:** ClaudeKit Chat  
**Version:** 0.0.1  
**Date:** 2026-04-07  

---

## Vision

ClaudeKit Chat is an AI-powered assistant that helps developers and marketers leverage Claude Code commands effectively. It bridges the gap between user intent and the right ClaudeKit command through intelligent prompt optimization, command recommendations, and predefined workflows.

### Core Value Proposition
- **Prompt Optimization**: Transform vague ideas into professional, actionable prompts
- **Command Discovery**: Find the right ClaudeKit command without memorizing 62+ options
- **Workflow Guidance**: Follow structured multi-step processes for complex tasks
- **Vibe Coding Ready**: Optimized for modern AI-assisted development workflows

---

## Target Users

| Persona | Role | Primary Use Case |
|---------|------|------------------|
| Developer | Software engineer | Find engineering commands, optimize technical prompts |
| Marketer | Growth/PMM | Access marketing commands, content workflows |
| Tech Lead | Engineering manager | Guide team through complex multi-step tasks |
| Content Creator | Writer/Designer | Optimize content prompts, access creative workflows |

---

## Key Features

### 1. AI Chat with SSE Streaming
| Requirement | Status | Notes |
|-------------|--------|-------|
| Real-time streaming responses | Implemented | Server-Sent Events with Fireworks AI |
| Session persistence | Implemented | SQLite/PostgreSQL with graceful fallback |
| Message history | Implemented | CRUD operations via /api/sessions |
| Error handling | Implemented | Graceful degradation when DB unavailable |

### 2. Prompt Optimizer
| Requirement | Status | Notes |
|-------------|--------|-------|
| AI-powered optimization | Implemented | Fireworks AI with structured output |
| Template system | Implemented | 14 templates across 4 categories |
| Command suggestions | Implemented | AI suggests appropriate ClaudeKit commands |
| Tabbed results | Implemented | Optimized/Command/Compare tabs |

### 3. Command System (62 Commands)
| Requirement | Status | Notes |
|-------------|--------|-------|
| Engineer kit (28 commands) | Implemented | /ck:cook, /ck:fix, /ck:plan, etc. |
| Marketing kit (34 commands) | Implemented | /ck:marketing:* namespace |
| Command browser | Implemented | Search + kit filtering |
| Favorites | Implemented | localStorage persistence |
| Recent commands | Implemented | Session history tracking |

### 4. Workflow System (18 Workflows)
| Requirement | Status | Notes |
|-------------|--------|-------|
| Predefined workflows | Implemented | 12 declarative workflow definitions |
| Gateway steps | Implemented | Required checkpoints (e.g., /clear) |
| Difficulty levels | Implemented | Beginner/Intermediate/Advanced |
| Time estimates | Implemented | Per-workflow duration guidance |

### 5. Glassmorphism UI
| Requirement | Status | Notes |
|-------------|--------|-------|
| Glassmorphism design | Implemented | 5 depth layers, backdrop blur |
| Framer Motion animations | Implemented | Page transitions, list animations |
| Dark mode | Implemented | One Dark Pro theme |
| Accessibility | Implemented | ARIA labels, reduced motion support |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Chat UI   │  │ Command     │  │   Prompt Optimizer  │  │
│  │  (React)    │  │ Browser     │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Astro SSR (Node.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ /api/chat   │  │ /api/session│  │   Static Pages        │  │
│  │ (SSE)       │  │   (CRUD)    │  │                       │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
└─────────┼────────────────┼───────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                  │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   SQLite (native)    │  │   Fireworks AI (FirePass)   │  │
│  │   node:sqlite        │  │   Kimi K2.5 Turbo           │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Stack Justification

### Astro 6 with SSR
- **Why**: Partial hydration with React islands reduces bundle size
- **Benefit**: 29KB vs 112KB (Next.js equivalent)
- **Trade-off**: Less ecosystem than Next.js

### React 19
- **Why**: Latest React features, concurrent rendering
- **Benefit**: Improved performance and developer experience

### Tailwind CSS v4
- **Why**: CSS-first configuration, no build-step required
- **Benefit**: Faster builds, smaller CSS output

### Native SQLite (Node 22.12.0+)
- **Why**: Zero external dependencies, built-in since Node 22.12.0
- **Benefit**: No PostgreSQL setup for local development
- **Trade-off**: Limited to single-node deployments

### Fireworks AI (FirePass)
- **Why**: Kimi K2.5 Turbo model optimized for coding tasks
- **Benefit**: Fast, affordable, good at following structured output

---

## Non-Functional Requirements

| Category | Requirement | Status |
|----------|-------------|--------|
| Performance | First contentful paint < 1s | Met |
| Performance | Time to interactive < 2s | Met |
| Scalability | Handle 100 concurrent sessions | Implemented |
| Reliability | Graceful DB failure handling | Implemented |
| Accessibility | WCAG 2.1 AA compliance | Partial |
| Security | Input validation | Partial (Phase 4 stub) |
| Security | Rate limiting | Stub (Phase 4) |
| Security | CORS headers | Basic (Phase 4 stub) |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Command discovery success | 80% users find command in <30s | TBD |
| Prompt optimization usage | 50% of chats use optimizer | TBD |
| Workflow completion rate | 60% of started workflows completed | TBD |
| User satisfaction | 4.0/5.0 rating | TBD |

---

## Future Roadmap

See [project-roadmap.md](./project-roadmap.md) for detailed phases.

### Phase 4 (In Progress)
- Rate limiting implementation
- True LRU prompt cache
- Circuit breaker for provider failover
- Security middleware hardening

### Phase 5 (Planned)
- Tool execution (Tavily Search, E2B Code Execution)
- Multi-provider fallback
- User authentication
- Cloud deployment optimization

---

## Dependencies

### Production (19 packages)
- astro ^6.1.3
- @astrojs/react ^5.0.2
- @astrojs/node ^10.0.4
- react ^19.2.4
- tailwindcss ^4.2.2
- framer-motion ^12.38.0
- lucide-react ^1.7.0
- cmdk ^1.1.1
- sonner ^2.0.7
- postgres ^3.4.9

### Development (11 packages)
- vitest ^4.1.2
- drizzle-orm ^0.30.10
- @testing-library/react ^16.3.0
- happy-dom ^20.8.9

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.0.1 | 2026-04-07 | Initial release with 62 commands, 18 workflows, prompt optimizer |

