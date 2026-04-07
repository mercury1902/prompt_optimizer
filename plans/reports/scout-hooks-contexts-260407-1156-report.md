# React Hooks & Contexts Analysis Report

**Generated:** 2026-04-07
**Scope:** src/hooks/*, src/contexts/ChatContext.tsx
**Total Items:** 6 (5 hooks + 1 context)

---

## Hooks Overview

| Hook | Purpose | Core React APIs | Persistence |
|------|---------|-----------------|-------------|
| useAstroChat | Streaming chat management | useState, useCallback, useRef | None |
| useDebounce | Value debouncing | useState, useEffect | None |
| useCommandSearchWithDebounce | Command search/filter | useState, useMemo, useCallback + useDebounce | None |
| useFavoritesWithLocalStoragePersistence | Favorites management | useState, useEffect, useCallback | localStorage |
| useRecentCommandsWithSessionHistory | Recent commands tracking | useState, useEffect, useCallback | localStorage |

---

## Contexts Overview

| Context | State Pattern | Purpose |
|---------|---------------|---------|
| ChatContext | useReducer | Global chat state management with action-based updates |

---

## Detailed Analysis

### 1. useAstroChat.ts
**File:** src/hooks/useAstroChat.ts (109 lines)

**Purpose:**
Manages streaming AI chat interactions with server-sent events. Handles message state, input state, status tracking, and stream aborting.

**Return Interface (UseAstroChatReturn):**
- messages: UIMessage[]
- input: string
- setInput: (input: string) => void
- status: ChatStatus (idle | submitted | streaming | error)
- handleSubmit: (e: React.FormEvent) => Promise<void>
- stop: () => void
- error: Error | null

**Options:**
- apiPath: string (default: /api/chat)
- initialMessages: UIMessage[] (default: [])

**Dependencies:** types/chat.ts, native fetch API, ReadableStream, AbortController

---

### 2. use-debounce.ts
**File:** src/hooks/use-debounce.ts (24 lines)

**Purpose:** Generic debounce hook for delaying value updates. Uses 150ms default delay.

**Signature:** useDebounce<T>(value: T, delay: number = 150): T

**Dependencies:** None (pure React)

---

### 3. use-command-search-with-debounce.ts
**File:** src/hooks/use-command-search-with-debounce.ts (84 lines)

**Purpose:** Command search and filtering with debounced query execution. Filters by kit category (all/engineer/marketing) and search keywords.

**Returns:**
- searchQuery: string
- setSearchQuery: (query: string) => void
- kitFilter: KitFilter
- setKitFilter: (kit: KitFilter) => void
- filteredCommands: Command[]
- counts: { all: number, engineer: number, marketing: number }
- isSearching: boolean
- hasResults: boolean
- clearSearch: () => void

**Dependencies:** use-debounce.ts, data/commands.ts, lib/command-filtering-by-kit-and-keywords.ts

---

### 4. use-favorites-with-local-storage-persistence.ts
**File:** src/hooks/use-favorites-with-local-storage-persistence.ts (53 lines)

**Purpose:** Manages favorite command IDs with localStorage persistence.

**Storage Key:** claudekit:favorites

**Returns:**
- favorites: string[]
- toggleFavorite: (commandId: string) => void
- isFavorite: (commandId: string) => boolean
- clearFavorites: () => void

**SSR Safety:** Checks typeof window !== undefined before localStorage access

**Dependencies:** None (pure React + localStorage)

---

### 5. use-recent-commands-with-session-history.ts
**File:** src/hooks/use-recent-commands-with-session-history.ts (54 lines)

**Purpose:** Tracks recently used commands with timestamps, limited to 20 items.

**Storage Key:** claudekit:recents
**Max Items:** 20

**RecentCommand Interface:**
- commandId: string
- commandName: string
- usedAt: number (Unix timestamp)

**Returns:**
- recents: RecentCommand[]
- addRecent: (commandId: string, commandName: string) => void
- clearRecents: () => void

**Behavior:** Adding existing command moves it to top (recency), new additions prepend to list.

**Dependencies:** None (pure React + localStorage)

---

### 6. ChatContext.tsx
**File:** src/contexts/ChatContext.tsx (88 lines)

**Purpose:** Global chat state management using reducer pattern.

**State (ChatState):**
- messages: UIMessage[]
- status: ChatStatus (idle | submitted | streaming | error)
- error: Error | null
- input: string

**Actions:**
- SEND_MESSAGE: Add user message, clear input, status=submitted
- APPEND_CHUNK: Append streaming chunk to assistant message
- SET_STATUS: Update status
- SET_ERROR: Set error, status=error
- STOP_STREAMING: Set status=idle
- SET_INPUT: Update input value

**Provider:** <ChatProvider>{children}</ChatProvider>
**Consumer Hook:** useChatContext() - throws if outside provider

**Dependencies:** types/chat.ts

---

## Dependencies Map

### File Dependencies
- useAstroChat.ts -> types/chat.ts
- use-command-search-with-debounce.ts -> use-debounce.ts, data/commands.ts, lib/command-filtering-by-kit-and-keywords.ts
- ChatContext.tsx -> types/chat.ts
- use-debounce.ts, use-favorites*, use-recent-commands* -> None (pure React)

### External APIs Used
- crypto.randomUUID() - Message ID generation
- fetch() - Chat API calls
- ReadableStream - Streaming responses
- localStorage - Persistence layer

---

## Summary

| Category | Count |
|----------|-------|
| Chat Hooks | 1 |
| Utility Hooks | 1 |
| Feature Hooks | 3 |
| Contexts | 1 |

**State Management:**
- Local state (hooks): 5 implementations
- Global state (context): 1 implementation (useReducer)

**Storage:**
- localStorage: 2 hooks (favorites, recents)
- Session-only: 3 hooks (chat, debounce, search)
- Context: In-memory only

Unresolved Questions: None.
