import type { APIRoute } from "astro";
import { db, isDatabaseAvailable } from "../../lib/db";
import { chatSessions, messages } from "../../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "../../lib/utils";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dbAvailable = isDatabaseAvailable();
    let session: { id: string; title: string } | null = null;

    if (dbAvailable && db) {
      // Get or create session
      session = sessionId
        ? await db.query.chatSessions.findFirst({
            where: eq(chatSessions.id, sessionId),
          })
        : null;

      if (!session) {
        const newSessionId = generateId();
        await db.insert(chatSessions).values({
          id: newSessionId,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        session = { id: newSessionId, title: message.slice(0, 50) };
      }

      // Save user message
      const userMessageId = generateId();
      await db.insert(messages).values({
        id: userMessageId,
        sessionId: session.id,
        role: "user",
        content: message,
        createdAt: new Date(),
      });

      // Update session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, session.id));
    } else {
      // No database - use memory session
      session = { id: sessionId || generateId(), title: message.slice(0, 50) };
    }

    // Create SSE stream for AI response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const assistantMessageId = generateId();
        let fullContent = "";

        try {
          // Get conversation history for context (only if DB available)
          let conversationContext: Array<{ role: string; content: string }> = [];
          if (dbAvailable && db && sessionId) {
            const history = await db.query.messages.findMany({
              where: eq(messages.sessionId, session.id),
              orderBy: desc(messages.createdAt),
              limit: 10,
            });

            conversationContext = history
              .reverse()
              .map((m) => ({
                role: m.role,
                content: m.content,
              }));
          }

          // Call Firepass API with streaming
          const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
          const model = import.meta.env.PUBLIC_FIREPASS_MODEL;
          const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL;

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                ...conversationContext,
                { role: "user", content: message },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 4096,
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          // Stream the response
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          // Send session ID first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId: session.id })}\n\n`)
          );

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === "" || !line.startsWith("data: ")) continue;

              const data = line.slice(6);
              if (data === "[DONE]") {
                // Save complete message to database (if available)
                if (dbAvailable && db) {
                  await db.insert(messages).values({
                    id: assistantMessageId,
                    sessionId: session.id,
                    role: "assistant",
                    content: fullContent,
                    createdAt: new Date(),
                  });
                }

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "done", messageId: assistantMessageId })}\n\n`)
                );
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "chunk", content })}\n\n`)
                  );
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Get messages for a session
export const GET: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dbAvailable = isDatabaseAvailable();
    if (!dbAvailable || !db) {
      return new Response(
        JSON.stringify({ messages: [], note: "Database not available" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionMessages = await db.query.messages.findMany({
      where: eq(messages.sessionId, sessionId),
      orderBy: desc(messages.createdAt),
      limit: 50,
    });

    return new Response(JSON.stringify({ messages: sessionMessages.reverse() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch messages" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
