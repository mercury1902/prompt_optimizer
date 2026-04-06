# Chat Backend API

## Overview
Phase 2 implementation provides a complete chat backend with:
- SSE streaming for real-time AI responses
- Session management with persistence
- Message history storage
- Graceful degradation when database is unavailable

## API Endpoints

### POST /api/chat
Main chat endpoint with SSE streaming.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "session", "sessionId": "abc123"}

data: {"type": "chunk", "content": "Hello"}

data: {"type": "chunk", "content": "!"}

data: {"type": "done", "messageId": "msg456"}
```

### GET /api/chat?sessionId=xxx
Get messages for a session.

### GET /api/sessions
List all chat sessions.

### POST /api/sessions
Create a new session.

### DELETE /api/sessions?id=xxx
Delete a session and its messages.

## Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb claudekit_chatbot`
3. Add to `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/claudekit_chatbot
   ```

### Option 2: Neon (Serverless)
1. Sign up at https://neon.tech
2. Create a project
3. Copy the connection string to `.env`

### Running Migrations
```bash
# Install dependencies first
npm install

# Run migrations
npx tsx scripts/migrate.ts
```

## Environment Variables

Add these to your `.env` file:

```env
# Required for chat
PUBLIC_FIREPASS_API_KEY=your_api_key
PUBLIC_FIREPASS_MODEL=accounts/fireworks/routers/kimi-k2p5-turbo
PUBLIC_FIREPASS_BASE_URL=https://api.fireworks.ai/inference/v1

# Optional - for persistence
DATABASE_URL=postgresql://username:password@host:5432/database
```

## Fallback Mode

When DATABASE_URL is not set, the API works in memory-only mode:
- Sessions are created with IDs but not persisted
- Messages are streamed but not saved
- Chat functionality works normally
- No history available after refresh

## Architecture

```
Client -> POST /api/chat -> SSE Stream
  |
  v
Database (optional) <-> Session/Message Storage
  |
  v
Firepass API -> Streaming Response
```

## Testing

```bash
# Run all tests
npm test

# Test chat endpoint specifically
npm test -- chat.test.ts
```
