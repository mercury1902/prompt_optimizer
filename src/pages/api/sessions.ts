import type { APIRoute } from "astro";
import { db, isDatabaseAvailable } from "../../lib/db";
import { chatSessions, messages } from "../../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "../../lib/utils";

// Get all sessions
export const GET: APIRoute = async () => {
  try {
    const dbAvailable = isDatabaseAvailable();
    if (!dbAvailable || !db) {
      return new Response(
        JSON.stringify({ sessions: [], note: "Database not available" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const sessions = await db.query.chatSessions.findMany({
      orderBy: desc(chatSessions.updatedAt),
      limit: 50,
    });

    return new Response(JSON.stringify({ sessions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch sessions" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Create a new session
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const title = body.title || "New Chat";

    const sessionId = generateId();
    const now = new Date();

    const dbAvailable = isDatabaseAvailable();
    if (dbAvailable && db) {
      await db.insert(chatSessions).values({
        id: sessionId,
        title,
        createdAt: now,
        updatedAt: now,
      });
    }

    return new Response(
      JSON.stringify({
        session: {
          id: sessionId,
          title,
          createdAt: now,
          updatedAt: now,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Delete a session
export const DELETE: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get("id");
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dbAvailable = isDatabaseAvailable();
    if (dbAvailable && db) {
      // Delete messages first (cascade should handle this, but being explicit)
      await db.delete(messages).where(eq(messages.sessionId, sessionId));

      // Delete session
      await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
