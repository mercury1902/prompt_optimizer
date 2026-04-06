import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chatSessions, messages } from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function migrate() {
  console.log("Running migrations...");

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  // Create tables using raw SQL since we don't have drizzle-kit set up
  await client`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id VARCHAR(255) PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await client`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // Create index for faster queries
  await client`
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
  `;

  await client`
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  `;

  await client`
    CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON chat_sessions(updated_at);
  `;

  console.log("Migrations completed successfully!");
  await client.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
