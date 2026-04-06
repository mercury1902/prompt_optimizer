# Research Report: Chat History System Architecture for Local Docker Deployment

**Date:** 2026-04-07  
**Researcher:** Claude Code Research Agent  
**Work Context:** d:/project/Clone/ck/claudekit-chatbot-astro  

---

## Executive Summary

This report outlines architecture recommendations for implementing a local Docker-based chat history system for the ClaudeKit chatbot. Analysis of the current codebase reveals stubbed database implementation with Drizzle ORM and PostgreSQL targets. For LOCAL deployment, **SQLite with LiteFS** or **single-container PostgreSQL** are recommended approaches.

Key recommendation: **Use SQLite for zero-config local deployment** - single file, no container dependencies, automatic backups via volume mounts. For multi-user scenarios, PostgreSQL in Docker Compose provides better concurrency.

---

## Table of Contents

1. [Database Options Analysis](#1-database-options-analysis)
2. [Session Management](#2-session-management)
3. [Message Persistence Patterns](#3-message-persistence-patterns)
4. [History Retrieval UX](#4-history-retrieval-ux)
5. [Docker Configuration](#5-docker-configuration)
6. [Offline-First Strategy](#6-offline-first-strategy)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Database Options Analysis

### 1.1 SQLite (Recommended for Single-User Local)

| Aspect | Details |
|--------|---------|
| **Storage** | Single `.db` file |
| **Setup** | Zero configuration |
| **Docker** | No separate container needed |
| **Backup** | File copy/snapshot |
| **Migration** | SQL scripts or Drizzle |
| **Best For** | Single user, local development |

**Pros:**
- No container overhead
- Instant setup
- Portable (file-based)
- ACID compliant
- Drizzle ORM supports via `drizzle-orm/better-sqlite3`

**Cons:**
- Limited concurrent writes
- No built-in user management
- Single file can grow large

**Docker volume mount:**
```yaml
volumes:
  - ./data/chat.db:/app/data/chat.db
```

### 1.2 PostgreSQL with Docker Compose

| Aspect | Details |
|--------|---------|
| **Storage** | Container volume |
| **Setup** | Docker Compose required |
| **Docker** | Separate service container |
| **Backup** | `pg_dump` or volume snapshot |
| **Migration** | Drizzle Kit, node-pg-migrate |
| **Best For** | Multi-user, production-scale |

**Pros:**
- Excellent concurrent access
- Rich feature set (JSON, full-text search)
- Established migration tooling
- Better for large datasets

**Cons:**
- Additional container overhead
- More complex backup/restore
- Requires connection management

### 1.3 Recommendation Matrix

| Use Case | Database | Rationale |
|----------|----------|-----------|
| Single user, local dev | **SQLite** | Simplicity, zero config |
| Multi-user, shared | **PostgreSQL** | Concurrency, features |
| Quick prototype | **SQLite** | Fastest to implement |
| Long-term storage | **PostgreSQL** | Better tooling |

---

## 2. Session Management

### 2.1 UUID Generation Strategy

Current implementation uses `generateId()` from `src/lib/utils.ts`. Recommended approach:

```typescript
// Option 1: crypto.randomUUID() - built-in, no deps
export function generateId(): string {
  return crypto.randomUUID();
}

// Option 2: nanoid if shorter IDs preferred
import { nanoid } from 'nanoid';
export function generateId(): string {
  return nanoid(12); // 12 chars = ~1% collision at 10M IDs
}
```

### 2.2 Session Metadata Schema

```typescript
interface ChatSession {
  id: string;           // UUID primary key
  title: string;      // Auto-generated or user-edited
  createdAt: Date;    // Timestamp
  updatedAt: Date;    // For sorting recent sessions
  messageCount: number; // Cached count for UI
  model?: string;     // Which model was used
}
```

### 2.3 Auto-Titling Implementation

From first user message:

```typescript
function generateTitle(message: string): string {
  // Truncate to 50 chars, add ellipsis if needed
  const clean = message.replace(/\s+/g, ' ').trim();
  if (clean.length <= 50) return clean;
  return clean.slice(0, 47) + '...';
}

// Advanced: Use LLM to generate concise title
async function generateSmartTitle(message: string): Promise<string> {
  // Call lightweight model for summarization
  // Fallback to truncated message
}
```

### 2.4 Session Limits & Cleanup

```typescript
const SESSION_LIMIT = 100; // Keep last 100 sessions

async function enforceSessionLimit(db: Database): Promise<void> {
  const sessions = await db.query.chatSessions.findMany({
    orderBy: desc(chatSessions.updatedAt),
    offset: SESSION_LIMIT,
  });
  
  for (const session of sessions) {
    await db.delete(chatSessions).where(eq(chatSessions.id, session.id));
  }
}
```

---

## 3. Message Persistence Patterns

### 3.1 Streaming Message Handling

**Current implementation:** Saves after stream completes. 
**Risk:** Data loss if crash during streaming.

**Recommended incremental approach:**

```typescript
// Buffer chunks, save periodically
class StreamingMessageBuffer {
  private buffer: string = '';
  private lastSave: number = Date.now();
  private readonly SAVE_INTERVAL = 5000; // 5 seconds
  
  async append(chunk: string): Promise<void> {
    this.buffer += chunk;
    
    if (Date.now() - this.lastSave > this.SAVE_INTERVAL) {
      await this.saveToDatabase();
    }
  }
  
  async finalize(): Promise<void> {
    await this.saveToDatabase(true); // Mark as complete
  }
  
  private async saveToDatabase(final = false): Promise<void> {
    // Upsert message with current buffer content
    // Set `isComplete` flag when final=true
  }
}
```

### 3.2 Database Schema (Drizzle ORM)

```typescript
// src/lib/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { pgTable, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

// SQLite version
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  model: text("model"),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system", "tool"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  toolCalls: text("tool_calls", { mode: "json" }), // JSON array
  toolResults: text("tool_results", { mode: "json" }), // JSON array
  isComplete: integer("is_complete", { mode: "boolean" }).default(1),
});

// PostgreSQL version (for Docker Compose)
export const chatSessionsPg = pgTable("chat_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  model: varchar("model", { length: 100 }),
});

export const messagesPg = pgTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 })
    .notNull()
    .references(() => chatSessionsPg.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  toolCalls: jsonb("tool_calls"),
  toolResults: jsonb("tool_results"),
  isComplete: integer("is_complete").default(1),
});
```

### 3.3 Tool Call Storage

Store as JSON arrays:

```typescript
interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ToolResultData {
  toolCallId: string;
  name: string;
  result: unknown;
  error?: string;
  duration?: number;
}

// In message row:
// toolCalls: JSON.stringify(toolCallDataArray)
// toolResults: JSON.stringify(toolResultDataArray)
```

### 3.4 Indexing Strategy

```sql
-- Essential indexes for performance
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_sessions_updated_at ON chat_sessions(updated_at DESC);

-- For full-text search (PostgreSQL)
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));
```

---

## 4. History Retrieval UX

### 4.1 Sidebar Session List

**Requirements:**
- Display last N sessions (e.g., 20)
- Sort by `updatedAt` descending (most recent first)
- Show title + timestamp + message count
- Click to load session

**API endpoint:**
```typescript
// GET /api/sessions?limit=20&offset=0
export const GET: APIRoute = async ({ url }) => {
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  
  const sessions = await db.query.chatSessions.findMany({
    orderBy: desc(chatSessions.updatedAt),
    limit,
    offset,
  });
  
  return new Response(JSON.stringify({ sessions }));
};
```

### 4.2 Search Implementation

**SQLite (basic LIKE):**
```typescript
const searchResults = await db.query.messages.findMany({
  where: like(messages.content, `%${query}%`),
  limit: 20,
});
```

**PostgreSQL (full-text search):**
```typescript
import { sql } from "drizzle-orm";

const searchResults = await db.execute(sql`
  SELECT * FROM messages 
  WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
  LIMIT 20
`);
```

### 4.3 Pagination Strategy

**Cursor-based (preferred for real-time):**
```typescript
// Client requests: GET /api/sessions?cursor=lastSessionId&limit=20
// Server returns: { sessions, nextCursor: string | null }
```

**Offset-based (simpler):**
```typescript
// GET /api/sessions?offset=20&limit=20
```

---

## 5. Docker Configuration

### 5.1 SQLite Setup (Recommended)

**Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Create data directory
RUN mkdir -p /app/data

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  chatbot:
    build: .
    ports:
      - "4321:4321"
    environment:
      - DATABASE_URL=sqlite:///app/data/chat.db
      - PUBLIC_FIREPASS_API_KEY=${PUBLIC_FIREPASS_API_KEY}
    volumes:
      - chat-data:/app/data
    restart: unless-stopped

volumes:
  chat-data:
    driver: local
```

### 5.2 PostgreSQL Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: chatbot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: claudekit
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatbot"]
      interval: 5s
      timeout: 5s
      retries: 5

  chatbot:
    build: .
    ports:
      - "4321:4321"
    environment:
      - DATABASE_URL=postgresql://chatbot:${DB_PASSWORD}@db:5432/claudekit
      - PUBLIC_FIREPASS_API_KEY=${PUBLIC_FIREPASS_API_KEY}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres-data:
```

### 5.3 Backup Strategy

**SQLite (simple file copy):**
```bash
# Backup script
#!/bin/bash
docker cp chatbot-container:/app/data/chat.db ./backups/chat-$(date +%Y%m%d).db
```

**PostgreSQL:**
```bash
# Automated backup via cron
docker exec chatbot-db-1 pg_dump -U chatbot claudekit > backups/dump-$(date +%Y%m%d).sql
```

**Volume backup (both):**
```bash
docker run --rm -v chatbot_chat-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/data-$(date +%Y%m%d).tar.gz -C /data .
```

### 5.4 Environment Variables

```bash
# .env file
DATABASE_URL=sqlite:///app/data/chat.db
# OR for PostgreSQL:
# DATABASE_URL=postgresql://chatbot:password@db:5432/claudekit

PUBLIC_FIREPASS_API_KEY=your_api_key
PUBLIC_FIREPASS_MODEL=accounts/fireworks/routers/kimi-k2p5-turbo
PUBLIC_FIREPASS_BASE_URL=https://api.fireworks.ai/inference/v1

# Optional
MAX_SESSIONS=100
MESSAGE_PAGE_SIZE=50
```

---

## 6. Offline-First Strategy

### 6.1 Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client UI     │────▶│  localStorage   │────▶│  Sync Queue     │
│                 │     │  (Drafts/Cache) │     │  (Background)   │
└─────────────────┘     └─────────────────┘     └───────┬─────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐             │
│   SQLite DB     │◀────│  Docker Server  │◀────────────┘
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

### 6.2 localStorage Schema

```typescript
// Types for localStorage
interface LocalSession {
  id: string;
  title: string;
  messages: LocalMessage[];
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'error';
}

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  serverId?: string; // Set after sync
}

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: 'ck:sessions',
  DRAFT: 'ck:draft',
  SYNC_QUEUE: 'ck:syncQueue',
  LAST_SYNC: 'ck:lastSync',
} as const;
```

### 6.3 Sync Implementation

```typescript
class OfflineSyncManager {
  private dbAvailable: boolean = false;
  
  async init(): Promise<void> {
    // Check server connectivity
    this.dbAvailable = await this.checkServerHealth();
    
    if (this.dbAvailable) {
      await this.syncToServer();
    }
  }
  
  // Save message locally first, then sync
  async saveMessage(sessionId: string, message: LocalMessage): Promise<void> {
    // 1. Save to localStorage immediately
    const sessions = this.getLocalSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = Date.now();
      session.syncStatus = 'pending';
      this.setLocalSessions(sessions);
    }
    
    // 2. Try to sync if online
    if (this.dbAvailable) {
      await this.syncMessage(sessionId, message);
    }
  }
  
  // Background sync
  async syncToServer(): Promise<void> {
    const sessions = this.getLocalSessions()
      .filter(s => s.syncStatus === 'pending');
    
    for (const session of sessions) {
      try {
        // Create/update session on server
        await fetch('/api/sessions', {
          method: 'POST',
          body: JSON.stringify(session),
        });
        session.syncStatus = 'synced';
      } catch {
        session.syncStatus = 'error';
      }
    }
    
    this.setLocalSessions(sessions);
  }
  
  // Periodic sync every 30 seconds
  startSyncInterval(): void {
    setInterval(() => this.syncToServer(), 30000);
  }
}
```

### 6.4 Conflict Resolution

**Strategy:** Last-write-wins with timestamp check

```typescript
interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge';
  timestamp: number;
}

function resolveConflict(
  localMessage: LocalMessage,
  serverMessage: Message
): Message {
  // Prefer server version if newer
  if (serverMessage.createdAt.getTime() > localMessage.createdAt) {
    return serverMessage;
  }
  
  // Otherwise keep local (will be synced on next round)
  return {
    ...serverMessage,
    content: localMessage.content,
  };
}
```

---

## 7. Implementation Roadmap

### Phase 1: Database Foundation
1. Implement SQLite schema with Drizzle ORM
2. Create migration scripts
3. Update `src/lib/db/index.ts` with real connection
4. Add database health check endpoint

### Phase 2: API Completion
1. Implement real database queries in `/api/chat.ts`
2. Add pagination to `/api/sessions`
3. Implement search endpoint
4. Add session limit enforcement

### Phase 3: Docker Setup
1. Create `docker-compose.yml` with SQLite
2. Add volume configuration
3. Test backup/restore scripts
4. Document environment variables

### Phase 4: Client Integration
1. Add session sidebar component
2. Implement localStorage fallback
3. Add sync indicator UI
4. Test offline mode

---

## Appendix A: Database Migration Script

```typescript
// scripts/migrate.ts - Updated for SQLite
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../src/lib/db/schema";

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || './data/chat.db';

async function migrate() {
  console.log("Running SQLite migrations...");
  
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });
  
  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      model TEXT
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      tool_calls TEXT,
      tool_results TEXT,
      is_complete INTEGER DEFAULT 1
    );
    
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON chat_sessions(updated_at);
  `);
  
  console.log("Migrations completed!");
  sqlite.close();
}

migrate();
```

---

## Appendix B: Package Dependencies

```json
{
  "dependencies": {
    "drizzle-orm": "^0.30.10",
    "better-sqlite3": "^9.4.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.14",
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

---

## Unresolved Questions

1. **Storage limit:** Should there be a per-session message limit or total storage cap?
2. **Export functionality:** Should users be able to export chat history (JSON/Markdown)?
3. **Multi-device sync:** Is there a need for synchronization across multiple local instances?
4. **Encryption:** Should sensitive chat data be encrypted at rest?

---

**Status:** DONE  
**Report Location:** d:/project/Clone/ck/claudekit-chatbot-astro/plans/reports/researcher-260407-chat-history-system.md
