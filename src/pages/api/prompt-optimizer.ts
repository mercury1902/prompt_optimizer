import type { APIRoute } from 'astro';
import { parseAIJSON } from '../../lib/utils';
import type {
  InputLanguagePreference,
  MultilingualOptimizedPromptResult,
  OutputLanguageMode,
  PromptOptimizerApiRequest,
  PromptOptimizerApiResponse,
} from '../../types/prompt-optimizer-multilingual';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 24;
const RATE_LIMIT_MAX_TRACKED_KEYS = 2_000;
const MAX_MODEL_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 24_000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const inMemoryRateLimitStore = new Map<string, RateLimitEntry>();

const MULTILINGUAL_SYSTEM_PROMPT = `You are ClaudeKit Prompt Optimizer.

Goal:
- Turn raw input into production-ready prompts for Claude Code.
- Always return BOTH versions every request:
  - optimizedPromptEn (English)
  - optimizedPromptVi (Vietnamese)
- Suggest one best ClaudeKit command.
- Keep short actionable explanation.
- Preserve conversation context from previous turns.

Hard rules:
- Return ONLY valid JSON object.
- No markdown wrappers, no tables.
- Keep command concise (example: /ck:cook).
- Respect user intent from latest input, but keep technical specificity.

Exact output JSON schema:
{
  "optimizedPromptEn": "string",
  "optimizedPromptVi": "string",
  "suggestedCommand": "string",
  "explanation": "string",
  "detectedInputLanguage": "vi|en|mixed"
}`;

function getClientKey(request: Request): string {
  const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cloudflareIp) return cloudflareIp;

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) return firstHop;
  }

  return 'unknown-ip';
}

function pruneRateLimitStore(now: number): void {
  const expirationCutoff = now - RATE_LIMIT_WINDOW_MS * 2;

  for (const [key, entry] of inMemoryRateLimitStore.entries()) {
    if (entry.windowStart < expirationCutoff) {
      inMemoryRateLimitStore.delete(key);
    }
  }

  if (inMemoryRateLimitStore.size <= RATE_LIMIT_MAX_TRACKED_KEYS) {
    return;
  }

  const oldestEntries = [...inMemoryRateLimitStore.entries()]
    .sort((a, b) => a[1].windowStart - b[1].windowStart)
    .slice(0, inMemoryRateLimitStore.size - RATE_LIMIT_MAX_TRACKED_KEYS);

  for (const [key] of oldestEntries) {
    inMemoryRateLimitStore.delete(key);
  }
}

function checkAndConsumeRateLimit(clientKey: string, now: number): { limited: boolean; retryAfterSec: number } {
  pruneRateLimitStore(now);
  const previous = inMemoryRateLimitStore.get(clientKey);
  if (!previous || now - previous.windowStart >= RATE_LIMIT_WINDOW_MS) {
    inMemoryRateLimitStore.set(clientKey, { count: 1, windowStart: now });
    return { limited: false, retryAfterSec: 0 };
  }

  if (previous.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = Math.max(previous.windowStart + RATE_LIMIT_WINDOW_MS - now, 0);
    return { limited: true, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
  }

  inMemoryRateLimitStore.set(clientKey, { ...previous, count: previous.count + 1 });
  return { limited: false, retryAfterSec: 0 };
}

function parseJsonObjectFromModelContent(content: string): Record<string, unknown> | null {
  return parseAIJSON<Record<string, unknown>>(content);
}

function normalizePromptResult(raw: Record<string, unknown>, rawContent: string): MultilingualOptimizedPromptResult {
  const optimizedPromptEn = String(raw.optimizedPromptEn ?? raw.optimized_prompt_en ?? '').trim();
  const optimizedPromptVi = String(raw.optimizedPromptVi ?? raw.optimized_prompt_vi ?? '').trim();
  const suggestedCommand = String(raw.suggestedCommand ?? raw.command ?? '').trim();
  const explanation = String(raw.explanation ?? raw.reason ?? '').trim();
  const detectedInputLanguage = String(raw.detectedInputLanguage ?? 'mixed').trim().toLowerCase();

  return {
    optimizedPromptEn,
    optimizedPromptVi,
    suggestedCommand,
    explanation,
    detectedInputLanguage:
      detectedInputLanguage === 'vi' || detectedInputLanguage === 'en' || detectedInputLanguage === 'mixed'
        ? detectedInputLanguage
        : 'mixed',
    rawContent,
  };
}

function buildPreferenceContext(
  inputLanguagePreference: InputLanguagePreference,
  outputLanguageMode: OutputLanguageMode,
): string {
  return [
    'User preferences (for context only):',
    `- inputLanguagePreference: ${inputLanguagePreference}`,
    `- outputLanguageMode: ${outputLanguageMode}`,
    '- even when outputLanguageMode is single-language, still generate BOTH EN and VI prompts in JSON.',
  ].join('\n');
}

function sanitizeModelMessages(
  modelMessages: PromptOptimizerApiRequest['modelMessages'],
): { messages: Array<{ role: 'user' | 'assistant'; content: string }>; tooLargeReason?: string } {
  if (!Array.isArray(modelMessages)) {
    return { messages: [] };
  }

  const sanitizedMessages = modelMessages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: String(message.content ?? '').trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_MODEL_MESSAGES);

  const exceedsSingleMessageLimit = sanitizedMessages.some((message) => message.content.length > MAX_MESSAGE_CHARS);
  if (exceedsSingleMessageLimit) {
    return { messages: [], tooLargeReason: `Each message must be <= ${MAX_MESSAGE_CHARS} characters` };
  }

  const totalChars = sanitizedMessages.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return { messages: [], tooLargeReason: `Total content must be <= ${MAX_TOTAL_CHARS} characters` };
  }

  return { messages: sanitizedMessages };
}

function logTelemetry(event: string, payload: Record<string, unknown>): void {
  console.info(`[PromptOptimizerTelemetry] ${JSON.stringify({ event, ...payload })}`);
}

function normalizeInputLanguagePreference(value: unknown): InputLanguagePreference {
  if (value === 'vi' || value === 'en' || value === 'auto') {
    return value;
  }
  return 'auto';
}

function normalizeOutputLanguageMode(value: unknown): OutputLanguageMode {
  if (value === 'vi' || value === 'en' || value === 'both') {
    return value;
  }
  return 'both';
}

export const POST: APIRoute = async ({ request }) => {
  const startedAt = Date.now();
  const clientKey = getClientKey(request);

  try {
    const now = Date.now();
    const rateLimitState = checkAndConsumeRateLimit(clientKey, now);
    if (rateLimitState.limited) {
      logTelemetry('rate_limited', { clientKey, retryAfterSec: rateLimitState.retryAfterSec });
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfterSec: rateLimitState.retryAfterSec }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitState.retryAfterSec),
        },
      });
    }

    const body = (await request.json()) as Partial<PromptOptimizerApiRequest>;
    const inputLanguagePreference = normalizeInputLanguagePreference(body.inputLanguagePreference);
    const outputLanguageMode = normalizeOutputLanguageMode(body.outputLanguageMode);
    const sanitizedMessages = sanitizeModelMessages(body.modelMessages ?? []);
    const modelMessages = sanitizedMessages.messages;

    if (sanitizedMessages.tooLargeReason) {
      return new Response(JSON.stringify({ error: sanitizedMessages.tooLargeReason }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (modelMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'modelMessages is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = import.meta.env.NINEROUTER_API_KEY || import.meta.env.PUBLIC_NINEROUTER_API_KEY;
    const model =
      import.meta.env.NINEROUTER_MODEL ||
      import.meta.env.PUBLIC_NINEROUTER_MODEL ||
      'claude-3-5-sonnet-20240620';
    const baseUrl =
      import.meta.env.NINEROUTER_BASE_URL ||
      import.meta.env.PUBLIC_NINEROUTER_BASE_URL ||
      'http://localhost:20128/v1';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing NINEROUTER_API_KEY (or PUBLIC_NINEROUTER_API_KEY)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        stream: false,
        messages: [
          { role: 'system', content: MULTILINGUAL_SYSTEM_PROMPT },
          { role: 'system', content: buildPreferenceContext(inputLanguagePreference, outputLanguageMode) },
          ...modelMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown optimizer upstream error');
      logTelemetry('upstream_error', {
        clientKey,
        status: response.status,
        outputLanguageMode,
        inputLanguagePreference,
      });
      return new Response(JSON.stringify({ error: `Upstream API ${response.status}`, details: errorText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle both streaming and non-streaming responses from upstream
    let assistantContent = '';
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      const text = await response.text();
      const chunks: string[] = [];
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) chunks.push(delta);
          } catch { /* skip malformed */ }
        }
      }
      assistantContent = chunks.join('').trim();
    } else {
      const data = await response.json();
      assistantContent = String(data?.choices?.[0]?.message?.content ?? '').trim();
    }
    const parsedObject = parseJsonObjectFromModelContent(assistantContent);
    if (!parsedObject) {
      logTelemetry('parse_error', {
        clientKey,
        outputLanguageMode,
        inputLanguagePreference,
      });
      return new Response(JSON.stringify({ error: 'Model response is not valid JSON', rawContent: assistantContent }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = normalizePromptResult(parsedObject, assistantContent);
    if (!result.optimizedPromptEn || !result.optimizedPromptVi || !result.suggestedCommand) {
      return new Response(JSON.stringify({ error: 'Model response missing required fields', rawContent: assistantContent }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (result.optimizedPromptEn.trim().toLowerCase() === result.optimizedPromptVi.trim().toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Model response did not return true bilingual content', rawContent: assistantContent }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: PromptOptimizerApiResponse = { result };
    logTelemetry('success', {
      clientKey,
      latencyMs: Date.now() - startedAt,
      inputLanguagePreference,
      outputLanguageMode,
      detectedInputLanguage: result.detectedInputLanguage,
    });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logTelemetry('internal_error', {
      clientKey,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'unknown-error',
    });
    return new Response(JSON.stringify({ error: 'Failed to optimize prompt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
