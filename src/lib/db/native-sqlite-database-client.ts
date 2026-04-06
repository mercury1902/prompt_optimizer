/**
 * Native Node.js SQLite Database Client
 * Uses node:sqlite module (available in Node.js 22.12.0+)
 * No external dependencies needed - completely native!
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DATABASE_URL?.replace('sqlite://', '') || './data/chat.db';

// Ensure data directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Create database connection
let db: DatabaseSync | null = null;

try {
  db = new DatabaseSync(DB_PATH);
  console.log('[DB] Connected to SQLite:', DB_PATH);

  // Initialize schema
  initializeSchema();
} catch (error) {
  console.error('[DB] Failed to connect:', error);
  db = null;
}

function initializeSchema() {
  if (!db) return;

  // Chat sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      model TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON chat_sessions(updated_at DESC);
  `);

  // Messages table
  db.exec(`
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
  `);

  console.log('[DB] Schema initialized');
}

// Query helpers
export function query(sql: string, params?: unknown[]) {
  if (!db) throw new Error('Database not available');
  return db.prepare(sql).all(...(params || []));
}

export function queryOne(sql: string, params?: unknown[]) {
  if (!db) throw new Error('Database not available');
  return db.prepare(sql).get(...(params || []));
}

export function run(sql: string, params?: unknown[]) {
  if (!db) throw new Error('Database not available');
  return db.prepare(sql).run(...(params || []));
}

// Specific CRUD operations
export function createSession(session: { id: string; title: string; model?: string }) {
  const now = Date.now();
  run(
    'INSERT INTO chat_sessions (id, title, created_at, updated_at, model) VALUES (?, ?, ?, ?, ?)',
    [session.id, session.title, now, now, session.model || null]
  );
  return session.id;
}

export function getSession(id: string) {
  return queryOne('SELECT * FROM chat_sessions WHERE id = ?', [id]);
}

export function updateSessionTimestamp(id: string) {
  run('UPDATE chat_sessions SET updated_at = ? WHERE id = ?', [Date.now(), id]);
}

export function deleteSession(id: string) {
  run('DELETE FROM chat_sessions WHERE id = ?', [id]);
}

export function getSessions(limit = 20, offset = 0) {
  return query(
    'SELECT * FROM chat_sessions ORDER BY updated_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

export function createMessage(message: {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  toolCalls?: unknown[];
  toolResults?: unknown[];
  isComplete?: boolean;
}) {
  run(
    `INSERT INTO messages (id, session_id, role, content, created_at, tool_calls, tool_results, is_complete)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.sessionId,
      message.role,
      message.content,
      Date.now(),
      message.toolCalls ? JSON.stringify(message.toolCalls) : null,
      message.toolResults ? JSON.stringify(message.toolResults) : null,
      message.isComplete !== false ? 1 : 0,
    ]
  );
  return message.id;
}

export function getMessagesBySession(sessionId: string, limit = 50) {
  const rows = query(
    `SELECT id, session_id as sessionId, role, content, created_at as createdAt,
            tool_calls as toolCalls, tool_results as toolResults, is_complete as isComplete
     FROM messages
     WHERE session_id = ?
     ORDER BY created_at ASC
     LIMIT ?`,
    [sessionId, limit]
  );

  // Parse JSON fields
  return rows.map((row: any) => ({
    ...row,
    toolCalls: row.toolCalls ? JSON.parse(row.toolCalls) : undefined,
    toolResults: row.toolResults ? JSON.parse(row.toolResults) : undefined,
    isComplete: row.isComplete === 1,
  }));
}

export function updateMessageContent(id: string, content: string) {
  run('UPDATE messages SET content = ?, is_complete = 1 WHERE id = ?', [content, id]);
}

export function deleteMessage(id: string) {
  run('DELETE FROM messages WHERE id = ?', [id]);
}

export function searchMessages(query: string, limit = 20) {
  const rows = query(
    `SELECT m.*, s.title as sessionTitle
     FROM messages m
     JOIN chat_sessions s ON m.session_id = s.id
     WHERE m.content LIKE ?
     ORDER BY m.created_at DESC
     LIMIT ?`,
    [`%${query}%`, limit]
  );
  return rows;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Connection closed');
  }
}

export function isDatabaseAvailable(): boolean {
  return db !== null;
}

// Export database instance for advanced use
export { db };
