# Chat Backend API

**Last Updated:** 2026-04-07

---

## Overview

The chat backend provides a complete AI chat system with:
- **SSE streaming** for real-time AI responses
- **Session management** with persistence (SQLite/PostgreSQL)
- **Message history** with CRUD operations
- **Graceful degradation** when database is unavailable
- **Tool system** architecture (currently disabled pending Phase 4)

---

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Runtime | Node.js >=22.12.0 | Native SQLite support |
| Framework | Astro 6.1.3 | SSR mode |
| Database | SQLite (node:sqlite) | Zero external dependencies |
| ORM Pattern | Drizzle-compatible | Facade over native SQLite |
| LLM | Fireworks AI (FirePass) | Kimi K2.5 Turbo |
| Streaming | Server-Sent Events | Real-time response chunks |

---

## API Endpoints

### POST /api/chat
Main chat endpoint with SSE streaming.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-existing-session-id"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "session", "sessionId": "abc123", "title": "New Chat"}

data: {"type": "chunk", "content": "Hello"}

data: {"type": "chunk", "content": "!"}

data: {"type": "tool_calls", "calls": [...]}

data: {"type": "tool_result", "results": [...]}

data: {"type": "done", "messageId": "msg456"}

data: {"type": "error", "error": "Error message"}
```

**SSE Event Types:**
| Type | Description |
|------|-------------|
| `session` | Session ID and title for new sessions |
| `chunk` | Partial AI response content |
| `tool_calls` | Tool execution requests from LLM |
| `tool_result` | Tool execution results |
| `done` | Stream completion with message ID |
| `error` | Error occurred during streaming |

**Database Flow:**
1. Get or create session in `chatSessions` table
2. Save user message to `messages` table
3. Stream AI response via Fireworks API (SSE)
4. Save assistant message with tool data to DB

**Note:** Tools are currently disabled in production (line 173 in chat.ts commented out) pending Phase 4 implementation.

---

### GET /api/chat?sessionId=xxx
Retrieve all messages for a specific session.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Session UUID |

**Response:**
```json
{
  "sessionId": "abc123",
  "messages": [
    {
      "id": "msg1",
      "role": "user",
      "content": "Hello",
      "createdAt": 1234567890
    },
    {
      "id": "msg2",
      "role": "assistant",
      "content": "Hi there!",
      "createdAt": 1234567891,
      "toolCalls": null,
      "toolResults": null
    }
  ]
}
```

---

### GET /api/sessions
List all chat sessions (max 50, sorted by updatedAt desc).

**Response:**
```json
{
  "sessions": [
    {
      "id": "abc123",
      "title": "Chat about React",
      "createdAt": 1234567890,
      "updatedAt": 1234567891,
      "model": "accounts/fireworks/routers/kimi-k2p5-turbo"
    }
  ]
}
```

---

### POST /api/sessions
Create a new chat session.

**Request:**
```json
{
  "title": "My New Chat"
}
```

**Response:**
```json
{
  "id": "new-session-id",
  "title": "My New Chat",
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

---

### DELETE /api/sessions?id=xxx
Delete a session and all its messages (cascade delete).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Session UUID |

**Response:**
```json
{
  "success": true,
  "deletedSessionId": "abc123"
}
```

---

### GET /api/health
Service health check with environment validation.

**Response (Healthy):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "checks": {
    "api": "ok",
    "env.firepassKey": "ok",
    "env.firepassModel": "ok",
    "env.firepassUrl": "ok"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "checks": {
    "api": "ok",
    "env.firepassKey": "missing",
    "env.firepassModel": "ok",
    "env.firepassUrl": "ok"
  }
}
```

**HTTP Status Codes:**
| Status | Meaning |
|--------|---------|
| 200 | All checks passed |
| 503 | One or more checks failed |

---

### POST /api/test-firepass-api-connection
Diagnostic endpoint to verify Firepass API connectivity.

**Request:**
```json
{
  "prompt": "Hello, this is a test."
}
```

**Response (Success):**
```json
{
  "success": true,
  "model": "accounts/fireworks/routers/kimi-k2p5-turbo",
  "response": "Hello! I received your test message.",
  "latency": 523
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "API key invalid",
  "latency": 0
}
```

---

## Database Setup

### Option 1: SQLite (Default - Recommended)

**Requirements:**
- Node.js >=22.12.0 (native `node:sqlite` module)

**Setup:**
```bash
# In .env
DATABASE_URL=sqlite://./data/chat.db

# Create data directory
mkdir -p data

# Database auto-initializes on first run
```

**Features:**
- Zero external dependencies
- Single file database
- Automatic table creation
- JSON serialization for tool data
- 4 indexes for query optimization

---

### Option 2: PostgreSQL (Production)

**Setup:**
```bash
# In .env
DATABASE_URL=postgresql://username:password@host:5432/database

# Tables auto-create on first run
```

**Migration (if needed):**
```bash
# Install dependencies
npm install

# Run migrations if drizzle-kit configured
npx drizzle-kit push:pg
```

---

## Database Schema

### ChatSession Table
```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at INTEGER NOT NULL,  -- Unix epoch
  updated_at INTEGER NOT NULL,  -- Unix epoch
  model TEXT
);

CREATE INDEX idx_sessions_updated_at ON chat_sessions(updated_at DESC);
```

### Message Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,            -- user/assistant/system/tool
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,   -- Unix epoch
  tool_calls TEXT,               -- JSON serialized
  tool_results TEXT,             -- JSON serialized
  is_complete INTEGER,           -- boolean (0/1)
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## Environment Variables

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_FIREPASS_API_KEY` | Fireworks AI API key | `fw_...` |
| `PUBLIC_FIREPASS_MODEL` | Model identifier | `accounts/fireworks/routers/kimi-k2p5-turbo` |
| `PUBLIC_FIREPASS_BASE_URL` | API endpoint | `https://api.fireworks.ai/inference/v1` |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | Connection string (SQLite/PostgreSQL) |
| `MAX_SESSIONS` | 100 | Max concurrent sessions |
| `MESSAGE_PAGE_SIZE` | 50 | Pagination size |
| `ENABLE_TOOLS` | true | Tool execution (currently disabled) |
| `ENABLE_STREAMING` | true | SSE streaming |

---

## Fallback Mode

When `DATABASE_URL` is not set or database is unavailable:
- Sessions are created with IDs but not persisted
- Messages stream but are not saved
- Chat functionality works normally
- No history available after page refresh

This ensures the chat remains functional even during database issues.

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client    │─────▶│  /api/chat   │─────▶│   LLM API    │
│  (Browser)  │◀─────│   (SSE)      │◀─────│ (Fireworks)  │
└─────────────┘      └──────┬───────┘      └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │  SQLite  │  │ Session  │  │ Message  │
       │  (node:  │  │  Store   │  │  Store   │
       │ sqlite)  │  │          │  │          │
       └──────────┘  └──────────┘  └──────────┘
```

### Key Components
| Component | Purpose | File |
|-----------|---------|------|
| Native SQLite Client | Database operations | `src/lib/db/native-sqlite-database-client.ts` |
| Database Facade | Drizzle-compatible interface | `src/lib/db/index.ts` |
| Schema | TypeScript types and SQL | `src/lib/db/schema.ts` |
| Chat API | SSE endpoint | `src/pages/api/chat.ts` |
| Sessions API | CRUD operations | `src/pages/api/sessions.ts` |

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
npm test -- chat.test.ts
npm test -- sessions.test.ts
```

### Test Coverage
```bash
npm run test:coverage
```

---

## Monitoring

### Health Check
```bash
curl http://localhost:4321/api/health
```

### API Diagnostic
```bash
curl -X POST http://localhost:4321/api/test-firepass-api-connection \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test"}'
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check database file exists (SQLite)
ls -la data/chat.db

# Verify permissions
chmod 755 data/
chmod 644 data/chat.db

# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"
```

### Firepass API Issues
```bash
# Test API key
curl -X POST https://api.fireworks.ai/inference/v1/chat/completions \
  -H "Authorization: Bearer $PUBLIC_FIREPASS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "'"$PUBLIC_FIREPASS_MODEL"'", "messages": [{"role": "user", "content": "Hello"}]}'
```

### SSE Connection Issues
- Check browser console for EventSource errors
- Verify no proxy/firewall blocking SSE
- Ensure proper headers: `Content-Type: text/event-stream`

---

## Future Enhancements

### Phase 4 (In Progress)
- [ ] Rate limiting implementation
- [ ] Input validation middleware
- [ ] CORS configuration
- [ ] Security headers

### Phase 5 (Planned)
- [ ] Tool execution (Tavily Search, E2B Code Execution)
- [ ] Multi-provider fallback
- [ ] Webhook integrations
- [ ] Analytics tracking

