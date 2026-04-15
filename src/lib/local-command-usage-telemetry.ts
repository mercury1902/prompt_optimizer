export type CommandTelemetryEvent = "shown" | "clicked" | "run" | "success";

interface CommandTelemetryCounter {
  shown: number;
  clicked: number;
  run: number;
  success: number;
  lastUpdatedAt: number;
}

interface CommandTelemetryStore {
  version: 1;
  commands: Record<string, CommandTelemetryCounter>;
}

const TELEMETRY_STORAGE_KEY = "claudekit:command-telemetry:v1";
const FALLBACK_STORE: CommandTelemetryStore = { version: 1, commands: {} };

function normalizeCommandToken(commandToken: string): string {
  const token = commandToken.trim();
  if (!token) return "";
  const normalized = token.startsWith("/") ? token.slice(1) : token;
  return normalized.toLowerCase();
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeReadStore(): CommandTelemetryStore {
  if (!canUseStorage()) {
    return FALLBACK_STORE;
  }

  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (!raw) return FALLBACK_STORE;
    const parsed = JSON.parse(raw) as Partial<CommandTelemetryStore>;
    if (parsed?.version !== 1 || typeof parsed.commands !== "object" || !parsed.commands) {
      return FALLBACK_STORE;
    }
    return {
      version: 1,
      commands: parsed.commands,
    };
  } catch {
    return FALLBACK_STORE;
  }
}

function safeWriteStore(store: CommandTelemetryStore): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota and private mode failures.
  }
}

function ensureCounter(
  existing: CommandTelemetryCounter | undefined,
  now: number
): CommandTelemetryCounter {
  if (!existing) {
    return { shown: 0, clicked: 0, run: 0, success: 0, lastUpdatedAt: now };
  }

  return {
    shown: Math.max(0, Number(existing.shown) || 0),
    clicked: Math.max(0, Number(existing.clicked) || 0),
    run: Math.max(0, Number(existing.run) || 0),
    success: Math.max(0, Number(existing.success) || 0),
    lastUpdatedAt: Number(existing.lastUpdatedAt) || now,
  };
}

function incrementEvent(counter: CommandTelemetryCounter, event: CommandTelemetryEvent): void {
  counter[event] += 1;
  counter.lastUpdatedAt = Date.now();
}

export function trackCommandTelemetryEvent(
  event: CommandTelemetryEvent,
  commandToken: string
): void {
  const normalized = normalizeCommandToken(commandToken);
  if (!normalized) return;

  const now = Date.now();
  const store = safeReadStore();
  const counter = ensureCounter(store.commands[normalized], now);
  incrementEvent(counter, event);
  store.commands[normalized] = counter;
  safeWriteStore(store);
}

export function trackCommandShownEvents(commandTokens: string[]): void {
  if (commandTokens.length === 0) return;

  const now = Date.now();
  const store = safeReadStore();
  for (const commandToken of commandTokens) {
    const normalized = normalizeCommandToken(commandToken);
    if (!normalized) continue;

    const counter = ensureCounter(store.commands[normalized], now);
    incrementEvent(counter, "shown");
    store.commands[normalized] = counter;
  }
  safeWriteStore(store);
}

function toRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.min(Math.max(numerator / denominator, 0), 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getCommandUsageScoreBoost(commandToken: string): number {
  const normalized = normalizeCommandToken(commandToken);
  if (!normalized) return 0;

  const store = safeReadStore();
  const counter = store.commands[normalized];
  if (!counter) return 0;

  const shown = Math.max(counter.shown, counter.clicked);
  const clicked = Math.max(counter.clicked, counter.run);
  const run = Math.max(counter.run, counter.success);
  const success = counter.success;

  if (shown === 0 && run === 0) return 0;

  const ctr = toRatio(clicked, shown);
  const runRate = toRatio(run, clicked || shown);
  const successRate = toRatio(success, run);
  const usageSignal = 0.2 * ctr + 0.3 * runRate + 0.5 * successRate;
  const confidence = clamp(Math.log2(run + 1) / 4, 0, 1);
  const trend = (usageSignal - 0.45) * 1.8;
  const frequency = clamp(Math.log1p(run) * 0.12, 0, 0.35);
  const failurePenalty = (1 - successRate) * toRatio(run, shown || run) * 0.9;

  return clamp(trend * confidence + frequency - failurePenalty * confidence, -0.8, 1.2);
}

export function __unsafeClearLocalCommandTelemetryForTests(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(TELEMETRY_STORAGE_KEY);
}

export function __unsafeGetLocalCommandTelemetryForTests(): CommandTelemetryStore {
  return safeReadStore();
}
