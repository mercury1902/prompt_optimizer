# Scout Report: Pages & API Routes Analysis

**Report ID:** scout-pages-api-260407-1156-report  
**Date:** 2026-04-07  
**Scope:** All Astro pages, API routes, and layout components

---

## Summary

This report analyzes 10 files comprising the page structure and API layer of ClaudeKit Chat. The application is built on Astro with React islands (client:load), featuring a chat interface with streaming AI responses via Firepass/Fireworks API, a command guide system with decision trees and prompt optimization, and session persistence via Drizzle ORM.

---

## Pages (Astro)

### 1. src/pages/index.astro
**Route:** /

| Aspect | Details |
|--------|---------|
| **Purpose** | Main landing page - primary chat interface with glassmorphism UI |
| **Key Components** | ChatFrameWithGlassmorphismAndVietnamese |
| **Layout** | Fixed header with nav + main chat area |

**Navigation Items:**
- Brand logo CK
- Link to /guide/ (Command Guide)
- Link to /guide/prompt-optimizer (highlighted CTA)

**Data Flow:**
User Input -> ChatFrame Component -> POST /api/chat (SSE stream) -> Session persisted to DB

---

### 2. src/pages/chat.astro
**Route:** /chat

| Aspect | Details |
|--------|---------|
| **Purpose** | Alternative chat entry point - full-screen chat layout |
| **Key Components** | ChatContainer |
| **Props** | apiPath=/api/chat, title=ClaudeKit Chat |

**Layout:** Full viewport height (h-screen), No scroll on body (overflow: hidden)

**Data Flow:** /chat -> ChatContainer -> /api/chat

---

### 3. src/pages/guide/index.astro
**Route:** /guide

| Aspect | Details |
|--------|---------|
| **Purpose** | Command guide hub - decision tree + quick navigation |
| **Key Components** | DecisionTreeWithRecommendations, CommandBrowserWithSearch |

**Quick Links Grid:**
- Decision Tree -> /guide/ (Brand amber)
- Command Browser -> /guide/commands (Blue)
- Prompt Optimizer -> /guide/prompt-optimizer (Purple)

---

### 4. src/pages/guide/commands.astro
**Route:** /guide/commands

| Aspect | Details |
|--------|---------|
| **Purpose** | Browse all available Claude Code commands |
| **Key Components** | CommandBrowserWithSearch |
| **Back Link** | /guide/ |

---

### 5. src/pages/guide/prompt-optimizer.astro
**Route:** /guide/prompt-optimizer

| Aspect | Details |
|--------|---------|
| **Purpose** | AI-powered prompt optimization tool for vibe coding |
| **Key Components** | PromptOptimizerChat |
| **Theme** | Purple/gradient aesthetic |

**Feature Grid:**
1. **Tối ưu tức thì** - Real-time AI prompt analysis
2. **Gợi ý command** - Suggests appropriate Claude Code commands
3. **Vibe coding ready** - Optimized for Claude Code prompts

---

## API Routes

### 6. src/pages/api/chat.ts
**Route:** POST /api/chat, GET /api/chat?sessionId=xxx

| Aspect | Details |
|--------|---------|
| **Purpose** | Core chat API with streaming SSE, tool execution, session management |
| **Methods** | POST (chat), GET (fetch history) |
| **External API** | Firepass/Fireworks API via PUBLIC_FIREPASS_* env vars |

**POST Request Body:** { message: string; sessionId?: string }

**SSE Stream Events:** session, chunk, tool_calls, tool_result, done, error

**Note:** Tools currently disabled (line 173) - commented out for debugging

**Database Flow (POST):**
1. Get/create session in chatSessions table
2. Save user message to messages table
3. Stream AI response with SSE
4. Save assistant message (with tool_calls/tool_results) to DB

---

### 7. src/pages/api/sessions.ts
**Route:** GET|POST|DELETE /api/sessions

| Aspect | Details |
|--------|---------|
| **Purpose** | Session CRUD operations |
| **Database** | Drizzle ORM with chatSessions, messages tables |

**Endpoints:**
| Method | Description |
|--------|-------------|
| GET | List all sessions (50 max, by updatedAt desc) |
| POST | Create new session { title } |
| DELETE | Delete session + cascade messages |

---

### 8. src/pages/api/health.ts
**Route:** GET /api/health

| Aspect | Details |
|--------|---------|
| **Purpose** | Service health monitoring |
| **Checks** | api, env.firepassKey, env.firepassModel, env.firepassUrl |
| **Status** | ok (200) or error (503) |

---

### 9. src/pages/api/test-firepass-api-connection.ts
**Route:** POST /api/test-firepass-api-connection

| Aspect | Details |
|--------|---------|
| **Purpose** | Diagnostic endpoint to verify Firepass API connectivity |
| **Method** | POST (GET returns 405) |

---

## Layout

### 10. src/layouts/Layout.astro
**Usage:** Base layout for all pages

| Aspect | Details |
|--------|---------|
| **Global Styles** | ../styles/global.css |
| **UI Components** | sonner Toaster for notifications |
| **Theme** | Dark mode (bg-[#1e1e1e], text-gray-100) |
| **Meta** | Vietnamese language (lang=vi), responsive viewport |

---

## Data Flow Architecture

User (Browser) -> Astro Page (SSR/SSG) -> React Island (client:load) -> API Routes -> Firepass/Fireworks API + SQLite/Drizzle ORM

---

## Environment Dependencies

- PUBLIC_FIREPASS_API_KEY - Fireworks API key
- PUBLIC_FIREPASS_MODEL - Model identifier
- PUBLIC_FIREPASS_BASE_URL - API endpoint base URL
- Database (SQLite via Drizzle) - optional with graceful fallback

---

## File Inventory

| Path | Type | Route | Lines |
|------|------|-------|-------|
| src/pages/index.astro | Page | / | 42 |
| src/pages/chat.astro | Page | /chat | 19 |
| src/pages/guide/index.astro | Page | /guide | 77 |
| src/pages/guide/commands.astro | Page | /guide/commands | 36 |
| src/pages/guide/prompt-optimizer.astro | Page | /guide/prompt-optimizer | 67 |
| src/pages/api/chat.ts | API | /api/chat | 509 |
| src/pages/api/sessions.ts | API | /api/sessions | 104 |
| src/pages/api/health.ts | API | /api/health | 39 |
| src/pages/api/test-firepass-api-connection.ts | API | /api/test-firepass-api-connection | 90 |
| src/layouts/Layout.astro | Layout | N/A | 29 |

---

## Unresolved Questions

1. What tool definitions are available in lib/tools/tool-registry? (Tools currently disabled in chat.ts)
2. Is the database file-based SQLite or external PostgreSQL?
3. Are there rate limits implemented for the Firepass API calls?
4. What is the generateId() implementation in lib/utils?
