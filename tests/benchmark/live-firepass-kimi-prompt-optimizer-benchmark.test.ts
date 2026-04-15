import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

interface LiveBenchmarkScenario {
  name: string;
  prompt: string;
  acceptedCommands: string[];
}

interface FirepassOptimizeResponse {
  optimizedPrompt: string;
  suggestedCommand: string;
  commandReason: string;
  alternativeCommands?: string[];
  confidence?: number;
  needsWorkflow?: boolean;
  suggestedWorkflow?: unknown;
}

function loadSystemPromptFromApp(): string {
  const filePath = resolve(process.cwd(), "src/lib/firepass-client.ts");
  if (!existsSync(filePath)) {
    return "Bạn là prompt optimizer của ClaudeKit. Trả về JSON object có optimizedPrompt, suggestedCommand, commandReason.";
  }

  const source = readFileSync(filePath, "utf-8");
  const match = source.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
  if (!match?.[1]) {
    return "Bạn là prompt optimizer của ClaudeKit. Trả về JSON object có optimizedPrompt, suggestedCommand, commandReason.";
  }

  return match[1];
}

function readRuntimeEnv(key: string): string | undefined {
  const processValue = process.env[key];
  if (processValue && processValue.trim().length > 0) {
    return processValue;
  }

  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const viteValue = viteEnv?.[key];
  if (viteValue && viteValue.trim().length > 0) {
    return viteValue;
  }

  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
    const matchedLine = lines.find((line) => line.startsWith(`${key}=`));
    if (matchedLine) {
      const rawValue = matchedLine.slice(key.length + 1).trim();
      const sanitized = rawValue.replace(/^['"]|['"]$/g, "");
      if (sanitized.length > 0) {
        return sanitized;
      }
    }
  }

  return undefined;
}

const shouldRunLiveBenchmark = process.env.RUN_LIVE_BENCHMARK === "1";
const apiKey = readRuntimeEnv("PUBLIC_FIREPASS_API_KEY");
const model = readRuntimeEnv("PUBLIC_FIREPASS_MODEL") || "accounts/fireworks/routers/kimi-k2p5-turbo";
const baseUrl = readRuntimeEnv("PUBLIC_FIREPASS_BASE_URL") || "https://api.fireworks.ai/inference/v1";
const timeoutMs = Number(process.env.BENCHMARK_TIMEOUT_MS || "45000");
const systemPrompt = loadSystemPromptFromApp();

const liveScenarios: LiveBenchmarkScenario[] = [
  {
    name: "Engineer feature request",
    prompt: "Làm tính năng đăng nhập OAuth cho app Astro, cần rollout an toàn",
    acceptedCommands: ["/ck:cook", "/ck:plan", "/ck:scout"],
  },
  {
    name: "Fix TypeScript issue",
    prompt: "Sửa lỗi TypeScript generic mismatch ở React component",
    acceptedCommands: ["/ck:fix", "/ck:fix:types"],
  },
  {
    name: "SEO content request",
    prompt: "Viết blog SEO về prompt engineering cho developer",
    acceptedCommands: ["/write/blog", "/content/good", "/content/blog", "/seo/keywords"],
  },
  {
    name: "Campaign launch request",
    prompt: "Lên kế hoạch launch campaign cho sản phẩm mới tuần sau",
    acceptedCommands: ["/campaign/create", "/brainstorm", "/ck:plan"],
  },
];

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

function stripCodeFences(payload: string): string {
  return payload
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeCommandToken(value: string): string {
  return value.trim().replace(/^\//, "").toLowerCase();
}

function isAcceptedSuggestion(suggestedCommand: string, acceptedCommands: string[]): boolean {
  const suggested = normalizeCommandToken(suggestedCommand);
  if (!suggested) return false;

  return acceptedCommands.some((accepted) => {
    const normalizedAccepted = normalizeCommandToken(accepted);
    return (
      suggested === normalizedAccepted ||
      suggested.startsWith(`${normalizedAccepted}:`) ||
      normalizedAccepted.startsWith(`${suggested}:`)
    );
  });
}

async function optimizePromptLive(prompt: string): Promise<FirepassOptimizeResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: `Prompt cần optimize: "${prompt}"` },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Firepass API error ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Missing response content from Firepass");
  }

  return JSON.parse(stripCodeFences(content)) as FirepassOptimizeResponse;
}

const liveSuite = shouldRunLiveBenchmark && apiKey ? describe : describe.skip;

liveSuite("benchmark: live FirePass Kimi prompt optimizer", () => {
  it("passes practical quality thresholds on real API", async () => {
    const latenciesMs: number[] = [];
    let schemaPass = 0;
    let commandMatch = 0;

    for (const scenario of liveScenarios) {
      const startedAt = performance.now();
      const result = await optimizePromptLive(scenario.prompt);
      latenciesMs.push(performance.now() - startedAt);

      const hasValidStructure =
        typeof result.optimizedPrompt === "string" &&
        result.optimizedPrompt.trim().length >= 20 &&
        typeof result.suggestedCommand === "string" &&
        result.suggestedCommand.trim().length > 0 &&
        typeof result.commandReason === "string" &&
        result.commandReason.trim().length > 0;

      if (hasValidStructure) {
        schemaPass += 1;
      }

      if (isAcceptedSuggestion(result.suggestedCommand, scenario.acceptedCommands)) {
        commandMatch += 1;
      }
    }

    const total = liveScenarios.length;
    const schemaPassRate = schemaPass / total;
    const commandMatchRate = commandMatch / total;
    const p95LatencyMs = percentile(latenciesMs, 0.95);

    expect(schemaPassRate).toBeGreaterThanOrEqual(1);
    expect(commandMatchRate).toBeGreaterThanOrEqual(0.6);
    expect(p95LatencyMs).toBeLessThan(20000);
  }, 180000);
});
