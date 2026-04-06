export interface OptimizeResult {
  optimizedPrompt: string;
  suggestedCommand: string;
  commandReason: string;
  alternativeCommands: string[];
  confidence: number;
  // Workflow support
  needsWorkflow?: boolean;
  suggestedWorkflow?: {
    id: string;
    name: string;
    description: string;
    steps: Array<{
      step: number;
      command: string;
      description: string;
      flags?: string[];
      required?: boolean;
      gateway?: boolean;
      note?: string;
    }>;
    difficulty: string;
    timeEstimate: string;
  };
  workflowReason?: string;
}

// Streaming support types
export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (result: OptimizeResult) => void;
  onError?: (error: Error) => void;
}

export interface StreamingOptimizeResult extends OptimizeResult {
  isComplete: boolean;
  rawChunks: string[];
}

const SYSTEM_PROMPT = `Bạn là Prompt Engineer chuyên nghiệp cho ClaudeKit - hệ thống vibe coding với 150+ lệnh.

NHIỆM VỤ: Analyze prompt → Optimize → Gợi ý lệnh HOẶC workflow phù hợp.

## QUY TẮC QUAN TRỌNG

1. Đơn giản (1 lỗi, 1 câu hỏi) → Gợi ý 1 lệnh
2. Phức tạp (feature, launch, campaign) → Gợi ý WORKFLOW nhiều bước
3. Luôn giải thích TẠI SAO chọn lệnh/workflow đó

## DANH SÁCH LỆNH ENGINEER (Core)

### Feature Development
- /ck:cook - Implement feature (ALWAYS use first for coding)
- /ck:plan - Create implementation plan
- /ck:bootstrap - New project setup
- /ck:scout - Explore codebase

### Fix & Debug
- /ck:fix - Smart routing to fix issues
- /ck:fix:types - TypeScript errors
- /ck:fix:ui - UI/CSS issues
- /ck:fix:ci - CI/CD issues
- /ck:fix:test - Test failures
- /ck:fix:fast - Quick fixes
- /ck:debug - Debug complex issues

### Quality & Ship
- /ck:test - Run tests
- /ck:code-review - Code review
- /ck:ship - Ship to production
- /ck:deploy - Deploy to platforms
- /ck:git:cp - Commit & push

### Research & Team
- /ck:research - Technical research
- /ck:ask - Technical consultation
- /ck:team - Multi-agent orchestration
- /ck:worktree - Git worktree isolation

## DANH SÁCH LỆNH MARKETING (Core)

### Content Creation
- /content/good - High-quality content
- /content/fast - Quick content
- /content/cro - Optimize for conversion
- /write/blog - SEO blog posts
- /write/good - Creative copy (GOOD mode)
- /write/fast - Quick copy (FAST mode)

### SEO
- /seo/keywords - Keyword research
- /seo/optimize - On-page optimization
- /seo/schema - JSON+LD schema

### Design
- /design/good - Immersive designs
- /design/fast - Quick designs
- /design/generate - AI image generation
- /design/screenshot - Verify implementation

### Campaign & Social
- /campaign/create - Create campaign
- /campaign/analyze - Analyze performance
- /social - Generate social content
- /social/schedule - Schedule posts
- /email/sequence - Email sequences

### Video
- /video/script/create - Video scripts
- /video/storyboard/create - Storyboards
- /video/create - Produce videos

## WORKFLOW PHỔ BIẾN (Gợi ý khi task phức tạp)

### 1. New Feature Development (Intermediate, 2-4h)
1. /ck:plan "feature" --auto → Tạo plan
2. /clear (BẮT BUỘC) → Xóa context
3. /ck:cook plan.md --auto → Implement
4. /ck:test → Verify
5. /ck:git:cp → Commit

### 2. Content Creation (Intermediate, 1-2h)
1. /seo/keywords → Research
2. /content/good → Write
3. /content/cro → Optimize
4. /write/audit → Audit

### 3. Campaign Launch (Advanced, 4-8h)
1. /brainstorm → Ideas
2. /campaign/create → Setup
3. /funnel → Design funnel
4. /email/sequence → Emails
5. /social → Social content
6. /social/schedule → Publish

### 4. Bug Fix (Beginner, 15-45m)
1. /ck:scout → Find issue
2. /ck:fix → Auto-fix
3. /ck:test → Verify
4. /ck:git:cp → Commit

### 5. New Project Bootstrap (Beginner, 30-60m)
1. /ck:bootstrap --auto → Setup
2. /ck:docs init → Docs
3. /ck:git:cm → Commit

## OUTPUT FORMAT (JSON)

For simple tasks:
{
  "optimizedPrompt": "Prompt chuyên nghiệp",
  "suggestedCommand": "/xxx",
  "commandReason": "Giải thích ngắn",
  "alternativeCommands": ["/yyy", "/zzz"],
  "confidence": 0.0-1.0,
  "needsWorkflow": false
}

For complex tasks (NEEDS workflow):
{
  "optimizedPrompt": "Prompt chuyên nghiệp",
  "suggestedCommand": "/ck:plan",
  "commandReason": "Task phức tạp cần workflow",
  "alternativeCommands": [],
  "confidence": 0.9,
  "needsWorkflow": true,
  "suggestedWorkflow": {
    "id": "new-feature",
    "name": "New Feature Development",
    "description": "Complete workflow...",
    "steps": [{"step": 1, "command": "/ck:plan", "description": "Tạo plan"}],
    "difficulty": "Intermediate",
    "timeEstimate": "2-4 hours"
  },
  "workflowReason": "Task này cần 5 bước để hoàn thành đúng cách"
}`;

export async function optimizePrompt(rawPrompt: string): Promise<OptimizeResult> {
  const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
  const model = import.meta.env.PUBLIC_FIREPASS_MODEL || "accounts/fireworks/routers/kimi-k2p5-turbo";
  const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || "https://api.fireworks.ai/inference/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Prompt cần optimize: "${rawPrompt}"` }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Firepass API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Firepass API");
  }

  return JSON.parse(content) as OptimizeResult;
}

export async function optimizePromptWithImage(rawPrompt: string, imageBase64: string): Promise<OptimizeResult> {
  const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
  const model = import.meta.env.PUBLIC_FIREPASS_VISION_MODEL || import.meta.env.PUBLIC_FIREPASS_MODEL || "accounts/fireworks/models/kimi-k2p5-turbo";
  const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || "https://api.fireworks.ai/inference/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: `Prompt cần optimize: "${rawPrompt}"` },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Firepass API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Firepass API");
  }

  return JSON.parse(content) as OptimizeResult;
}

/**
 * Stream-based prompt optimization for real-time responses.
 * Yields partial results as they arrive from the API.
 */
export async function* optimizePromptStream(
  rawPrompt: string
): AsyncGenerator<StreamingOptimizeResult, void, unknown> {
  const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
  const model = import.meta.env.PUBLIC_FIREPASS_MODEL || "accounts/fireworks/routers/kimi-k2p5-turbo";
  const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || "https://api.fireworks.ai/inference/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Prompt cần optimize: "${rawPrompt}"` }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      stream: true, // Enable streaming
    }),
  });

  if (!response.ok) {
    throw new Error(`Firepass API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("No response body available for streaming");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const chunks: string[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process SSE format: data: {...}\n\n
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and [DONE] marker
        if (!trimmed || trimmed === "data: [DONE]") {
          continue;
        }

        // Parse data lines
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6); // Remove "data: " prefix

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";

            if (content) {
              chunks.push(content);

              // Try to parse accumulated content as partial result
              const accumulatedContent = chunks.join("");
              let partialResult: Partial<OptimizeResult> = {};

              try {
                partialResult = JSON.parse(accumulatedContent);
              } catch {
                // Partial JSON, use what we have
              }

              yield {
                optimizedPrompt: partialResult.optimizedPrompt || accumulatedContent,
                suggestedCommand: partialResult.suggestedCommand || "",
                commandReason: partialResult.commandReason || "",
                alternativeCommands: partialResult.alternativeCommands || [],
                confidence: partialResult.confidence || 0,
                needsWorkflow: partialResult.needsWorkflow,
                suggestedWorkflow: partialResult.suggestedWorkflow,
                workflowReason: partialResult.workflowReason,
                isComplete: false,
                rawChunks: [...chunks],
              };
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim() && buffer.startsWith("data: ")) {
      const data = buffer.slice(6);
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) {
          chunks.push(content);
        }
      } catch {
        // Ignore parsing errors in final buffer
      }
    }

    // Yield final complete result
    const finalContent = chunks.join("");
    const finalResult = JSON.parse(finalContent) as OptimizeResult;

    yield {
      ...finalResult,
      isComplete: true,
      rawChunks: chunks,
    };

  } finally {
    reader.releaseLock();
  }
}

/**
 * Streaming prompt optimization with callback-based API.
 * Provides real-time updates via callbacks.
 */
export async function optimizePromptStreaming(
  rawPrompt: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
  const model = import.meta.env.PUBLIC_FIREPASS_MODEL || "accounts/fireworks/routers/kimi-k2p5-turbo";
  const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || "https://api.fireworks.ai/inference/v1";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Prompt cần optimize: "${rawPrompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firepass API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body available for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const chunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";

              if (content) {
                chunks.push(content);
                callbacks.onChunk?.(content);
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      // Process final buffer
      if (buffer.trim() && buffer.startsWith("data: ")) {
        const data = buffer.slice(6);
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            chunks.push(content);
            callbacks.onChunk?.(content);
          }
        } catch {
          // Ignore
        }
      }

      // Parse and return final result
      const finalContent = chunks.join("");
      const finalResult = JSON.parse(finalContent) as OptimizeResult;
      callbacks.onComplete?.(finalResult);

    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Utility to check if streaming is supported in the current environment.
 */
export function isStreamingSupported(): boolean {
  return typeof ReadableStream !== "undefined" &&
         typeof Response !== "undefined" &&
         "body" in Response.prototype;
}
