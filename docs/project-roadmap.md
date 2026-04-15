# Project Roadmap

**Version:** 0.0.2  
**Last Updated:** 2026-04-15  
**Status:** Phase 3 Complete, Phase 4 In Progress

---

## Roadmap Overview

| Phase | Focus | Status | Progress |
|-------|-------|--------|----------|
| Phase 1 | Foundation - Core chat, command system | Completed | 100% |
| Phase 2 | Backend - API, database, streaming | Completed | 100% |
| Phase 3 | UX Enhancement - UI polish, features | Completed | 100% |
| Phase 3.5 | UI Consistency Program - bilingual + design governance | In Progress | 85% |
| Phase 4 | Infrastructure - Security, caching, resilience | In Progress | 35% |
| Phase 5 | Advanced Features - Tools, auth, cloud | Planned | 0% |

---

## Phase 3.5: UI Consistency Program (In Progress - 85%)

### Milestones
- [x] Bilingual language toggle foundation (`vi`/`en`)
- [x] Global accent policy decision locked (brand accent only)
- [x] Legacy neutral chat components marked fully deprecated
- [x] Design guidelines document created
- [x] UI component inventory created
- [x] Vertical navigation sidebar implemented
- [x] Prompt optimizer responsive workspace with adaptive navigation
- [ ] Token compliance checker integrated in CI
- [ ] Accessibility WCAG automation gates
- [ ] Responsive regression matrix automation

### Deliverables
| Feature | Status | Notes |
|---------|--------|-------|
| Bilingual toggle infra | Completed | localStorage + cross-component event sync |
| Core chat bilingual labels | Completed | Sidebar, header, input, empty state |
| Guide/optimizer bilingual page text | Completed | Major headings + supporting copy |
| Global accent normalization | Completed | Primary surfaces updated to brand accent |
| Legacy fallback deprecation | Completed | Removed from public component barrel |
| Vertical navigation | Completed | Sidebar with tabs for favorites/recents |
| Responsive workspace | Completed | Adaptive layout for prompt optimizer |
| Message reactions | Completed | Add reactions to messages |
| Conversation export | Completed | Export chat history |

### Success Metrics
- [x] Design token coverage >= 85%
- [x] Component reuse rate >= 70%
- [ ] Accessibility score >= 95 on core routes
- [x] Mobile layout defects P1/P2 = 0

---

## Phase 1: Foundation (Completed)

### Milestones
- [x] Project setup with Astro 6 + React 19
- [x] Tailwind CSS v4 configuration
- [x] 62 ClaudeKit commands defined (28 Engineer + 34 Marketing)
- [x] Command recommender with keyword matching
- [x] Basic chat UI with prompt optimization
- [x] Glassmorphism design system

### Deliverables
| Feature | Status | Notes |
|---------|--------|-------|
| Astro SSR setup | Completed | @astrojs/node adapter |
| React islands | Completed | client:load hydration |
| Command catalog | Completed | Full 62-command dataset |
| Intent detection | Completed | 44 keyword patterns |
| Firepass client | Completed | Non-streaming + streaming |
| Basic UI components | Completed | ChatBot, CommandBrowser |

### Success Metrics
- [x] Build successful
- [x] All 62 commands searchable
- [x] Chat responds to inputs
- [x] Glassmorphism renders correctly

---

## Phase 2: Backend (Completed)

### Milestones
- [x] SSE streaming chat API
- [x] Session management with persistence
- [x] Native SQLite database (Node 22.12.0+)
- [x] Drizzle ORM compatibility layer
- [x] Message history CRUD
- [x] Health check endpoint

### Deliverables
| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/chat | Completed | SSE streaming |
| GET /api/chat | Completed | Session history |
| /api/sessions | Completed | Full CRUD |
| /api/health | Completed | Environment checks |
| Native SQLite | Completed | node:sqlite module |
| Drizzle facade | Completed | ORM compatibility |

### Database Schema
```
ChatSession (id, title, createdAt, updatedAt, model)
Message (id, sessionId, role, content, createdAt, toolCalls, toolResults, isComplete)
```

### Success Metrics
- [x] Sessions persist across reloads
- [x] Messages stream in real-time
- [x] Graceful degradation when DB unavailable
- [x] Health endpoint returns accurate status

---

## Phase 3: UX Enhancement (Completed)

### Milestones
- [x] 18 predefined workflows
- [x] Workflow recommendation engine
- [x] Favorites and Recent commands
- [x] Command palette (Cmd+K)
- [x] Prompt optimizer with templates
- [x] Glassmorphism 2.0 polish
- [x] Framer Motion animations

### Deliverables
| Feature | Status | Notes |
|---------|--------|-------|
| 18 Workflows | Completed | Declarative DSL definition |
| Workflow browser | Completed | Search + filter |
| Favorites | Completed | localStorage persistence |
| Recent commands | Completed | 20-item history |
| Command palette | Completed | cmdk integration |
| 14 Prompt templates | Completed | 4 categories |
| Tabbed optimizer results | Completed | Optimized/Command/Compare |
| Glassmorphism 2.0 | Completed | 5 depth layers |
| Animations | Completed | Framer Motion |

### Workflow Categories
| Category | Count | Examples |
|----------|-------|----------|
| Engineer | 6 | new-feature, bootstrap-project, bug-fix |
| Marketing | 5 | content-creation, campaign-launch |
| Hybrid | 7 | fullstack-feature, analytics-dashboard |

### Template Categories
| Category | Count |
|----------|-------|
| Development | 4 |
| UI/UX | 4 |
| DevOps | 3 |
| Database | 3 |

### Success Metrics
- [x] Users can favorite commands
- [x] Recent commands tracked accurately
- [x] Prompt optimizer generates useful suggestions
- [x] Animations are smooth (60fps)
- [x] UI is responsive (mobile-friendly)

---

## Phase 4: Infrastructure (In Progress)

### Milestones
- [ ] Rate limiting implementation
- [ ] True LRU prompt cache
- [ ] Circuit breaker for provider failover
- [ ] Security middleware hardening
- [ ] Input validation
- [ ] CORS configuration
- [x] Benchmark suite for command discovery + telemetry + live FirePass evaluation

### Current Status
| Component | Status | Notes |
|-----------|--------|-------|
| Rate limiter | Stub | Always-allow placeholder |
| Prompt cache | Stub | FIFO eviction (not LRU) |
| Circuit breaker | Stub | No actual logic |
| Security middleware | Partial | Basic headers only |
| Input validation | Partial | Empty string check only |
| CORS | Hardcoded | Wildcard allowed origins |

### Implementation Plan

#### Rate Limiter
```typescript
// Current: Always allows
export function checkRateLimit(identifier: string): RateLimitInfo {
  return { allowed: true, remaining: 100, resetTime: Date.now() + 60000 };
}

// Target: Redis-backed or SQLite-backed rate limiting
// - Bucket algorithm (token or leaky)
// - Configurable limits per endpoint
// - IP-based + user-based (when auth added)
```

#### Prompt Cache (True LRU)
```typescript
// Current: Simple Map with FIFO eviction at 1000 entries
const cache = new Map<string, CachedResult>();

// Target: LRU with Map ordering
// - Max 1000 entries
// - TTL 5 minutes
// - O(1) get/set with proper LRU eviction
```

#### Circuit Breaker
```typescript
// Current: No-op stub
export async function tryProviders(prompt: string, options?: ProviderOptions) {
  return firepassClient.optimizePrompt(prompt, options);
}

// Target: Actual circuit breaker
// - 3 failure threshold
// - 30s timeout
// - Half-open state testing
// - Fallback to secondary provider
```

#### Security Middleware
```typescript
// Current: Basic headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
}

// Target: Full security
// - Content Security Policy (CSP)
// - Strict-Transport-Security (HSTS)
// - Proper CORS with origin validation
// - Input length limits
// - CSRF protection
```

### Success Metrics
- [ ] Rate limiting blocks excessive requests
- [ ] Cache hit rate > 50% for repeated prompts
- [ ] Circuit breaker opens on provider failure
- [ ] Security headers pass audit
- [ ] No CORS issues in production

---

## Phase 5: Advanced Features (Planned)

### Milestones
- [ ] Tool execution (Tavily, E2B)
- [ ] Multi-provider fallback
- [ ] User authentication
- [ ] Cloud deployment optimization
- [ ] Real-time collaboration

### Planned Features
| Feature | Priority | Notes |
|---------|----------|-------|
| Tool execution | High | Tavily Search, E2B Code Execution |
| Multi-provider | High | OpenAI, Anthropic fallback |
| Authentication | Medium | OAuth, session management |
| Cloud deploy | Medium | Vercel, Netlify optimization |
| Collaboration | Low | Shared sessions |
| Analytics | Low | Usage tracking |

### Tool System
```typescript
// Target implementation
interface ToolExecution {
  tavilySearch: (query: string) => Promise<SearchResult[]>;
  e2bCodeExecution: (code: string, language: string) => Promise<ExecutionResult>;
}

// Tools will be:
// - Registered in tool-registry-manager.ts
// - Called by LLM when needed
// - Results streamed back to client
```

### Multi-Provider
```typescript
// Target implementation
const providers: Provider[] = [
  { name: 'fireworks', client: firepassClient, priority: 1 },
  { name: 'openai', client: openaiClient, priority: 2 },
  { name: 'anthropic', client: anthropicClient, priority: 3 }
];

// Circuit breaker per provider
// Automatic failover on failure
// Cost-based routing (optional)
```

### Success Metrics
- [ ] Tools execute correctly
- [ ] Provider fallback works seamlessly
- [ ] User accounts functional
- [ ] Deployed to production
- [ ] < 100ms API response time (p95)

---

## Project Statistics

| Metric | Value |
|--------|-------|
| React Components | 46 |
| Library Modules | 28 |
| Custom Hooks | 8 |
| Test Files | 27 |
| Commands | 62 (28 Engineer + 34 Marketing) |
| Workflows | 18 |
| Prompt Templates | 14 |
| API Endpoints | 5 |

## Success Metrics Summary

| Metric | Target | Current |
|--------|--------|---------|
| Feature completeness | 100% | 85% (Phases 1-3.5 done) |
| Code coverage | 80% | 30% |
| API response time (p95) | < 500ms | ~300ms |
| Build time | < 5s | ~2s |
| Bundle size | < 50KB | ~29KB |
| Uptime | 99.9% | N/A (dev) |

---

## Timeline

| Phase | Start | Target Completion | Actual Completion |
|-------|-------|---------------------|-------------------|
| Phase 1 | Jan 2026 | Feb 2026 | Feb 2026 |
| Phase 2 | Feb 2026 | Mar 2026 | Mar 2026 |
| Phase 3 | Mar 2026 | Apr 2026 | Apr 2026 |
| Phase 3.5 | Apr 2026 | Apr 2026 | Apr 2026 (85%) |
| Phase 4 | Apr 2026 | May 2026 | In Progress |
| Phase 5 | May 2026 | Jun 2026 | Not Started |

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Fireworks API changes | High | Low | Abstract client layer |
| Node.js SQLite limitations | Medium | Medium | PostgreSQL fallback |
| Scaling challenges | Medium | Low | Stateless design |
| Tool execution security | High | Medium | Sandboxed execution (E2B) |
| Rate limiter complexity | Low | High | Start simple, iterate |
