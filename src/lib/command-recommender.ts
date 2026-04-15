import type { Command } from "../data/commands";
import { getCommandUsageScoreBoost } from "./local-command-usage-telemetry";

export interface MatchResult {
  command: Command;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

interface RecommendationResult {
  primary: MatchResult | null;
  alternatives: MatchResult[];
  confidence: number;
}

// High-confidence direct intent mappings
const INTENT_MAPPINGS: Record<string, string[]> = {
  // Engineer Core commands
  "/ck:cook": ["implement", "feature", "tạo", "build", "code", "làm", "thêm", "cook"],
  "/ck:fix": ["sửa", "lỗi", "bug", "error", "broken", "issue", "problem", "fix"],
  "/ck:plan": ["kế hoạch", "thiết kế", "architecture", "plan", "lập kế hoạch", "lập"],
  "/ck:bootstrap": ["bootstrap", "new project", "khởi tạo", "init", "dự án mới", "start"],
  "/ck:scout": ["scout", "explore", "tìm", "search", "find", "locate"],
  "/ck:debug": ["debug", "gỡ lỗi", "trace", "investigate", "deep debug", "analyze bug"],
  "/ck:ask": ["hỏi", "ask", "question", "explain", "giải thích"],
  "/ck:test": ["test", "kiểm thử", "run test", "testing"],
  "/ck:research": ["research", "nghiên cứu", "study", "learn", "investigate"],
  "/ck:ship": ["ship", "release", "deploy", "publish", "launch"],
  "/clear": ["clear", "wipe", "reset", "clean", "fresh start"],
  "/plan": ["quick plan", "simple plan", "fast plan"],

  // Fix variants
  "/ck:fix:types": ["typescript", "type error", "tsc", "type check"],
  "/ck:fix:ui": ["ui", "css", "layout", "style", "responsive"],
  "/ck:fix:ci": ["github actions", "pipeline", "ci/cd", "deployment"],
  "/ck:fix:test": ["jest", "vitest", "failing test", "test fail"],
  "/ck:fix:logs": ["logs", "log file", "stack trace"],
  "/ck:fix:parallel": ["multiple issues", "parallel fix", "many bugs", "fix parallel"],
  "/ck:fix:hard": ["complex", "architecture", "refactor", "system-wide"],
  "/ck:fix:fast": ["quick fix", "simple", "small bug"],
  "/ck:docs:init": ["docs init", "init docs", "documentation init"],
  "/ck:git:cm": ["commit", "git commit", "save", "stage", "cm"],
  "/git:cm": ["git cm", "commit shorthand", "quick commit"],

  // Marketing commands
  "/content/good": ["content", "write", "blog", "article", "good"],
  "/content/fast": ["content", "fast", "quick", "rapid"],
  "/content/cro": ["cro", "conversion", "optimize"],
  "/content/blog": ["content blog", "blog content", "content creation blog"],
  "/write/blog": ["blog", "write", "seo"],
  "/write/good": ["write", "copy", "creative"],
  "/seo/keywords": ["seo", "keywords", "research"],
  "/design/good": ["design", "ui", "creative"],
  "/social": ["social", "twitter", "linkedin", "post"],
  "/campaign/create": ["campaign", "launch", "marketing"],
  "/brainstorm": ["brainstorm", "ideas", "creative"],
};

export function detectIntent(input: string): { command: string; confidence: number } | null {
  const inputLower = input.toLowerCase();

  for (const [command, keywords] of Object.entries(INTENT_MAPPINGS)) {
    for (const keyword of keywords) {
      if (inputLower.includes(keyword.toLowerCase())) {
        return { command, confidence: 0.9 };
      }
    }
  }

  return null;
}

function extractKeywords(input: string): string[] {
  const normalized = input.toLowerCase()
    .replace(/[^\w\s\u00C0-\u1FFF\u2C00-\uD7FF]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1);

  return [...new Set(normalized)];
}

function matchPatterns(input: string, patterns: string[]): number {
  let score = 0;
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern, "i");
      const matches = input.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    } catch (e) {
      // Invalid regex, skip
    }
  }
  return score;
}

function scoreCommandAgainstInput(input: string, inputLower: string, command: Command): MatchResult | null {
  let score = 0;
  const matchedKeywords: string[] = [];

  // Keyword matching
  for (const keyword of command.keywords) {
    if (inputLower.includes(keyword.toLowerCase())) {
      score += 1;
      matchedKeywords.push(keyword);
    }
  }

  // Pattern matching (higher weight)
  score += matchPatterns(input, command.patterns);

  // Use case matching
  for (const useCase of command.useCases) {
    if (inputLower.includes(useCase.toLowerCase())) {
      score += 1.5;
    }
  }

  // Lightweight fuzzy matching on normalized tokens to reduce false positives
  const searchable = `${command.id} ${command.name} ${command.description}`.toLowerCase();
  const inputTokens = extractKeywords(inputLower);
  const searchableTokens = extractKeywords(searchable);
  const hasFuzzyTokenMatch = inputTokens.some(
    (token) =>
      token.length >= 3 &&
      searchableTokens.some((searchToken) => searchToken === token || searchToken.startsWith(token))
  );
  if (hasFuzzyTokenMatch) {
    score += 0.5;
  }

  // Complexity boost (prefer simpler commands for simple queries)
  if (score > 0 && command.complexity <= 2) {
    score += 0.5;
  }

  if (score <= 0) {
    return null;
  }

  const reason = matchedKeywords.length > 0
    ? `Phát hiện: ${matchedKeywords.join(", ")}`
    : `Pattern match cho ${command.category}`;

  return {
    command,
    score,
    matchedKeywords,
    reason,
  };
}

export function rankCommandsByIntent(
  input: string,
  commands: Command[],
  limit = 12
): MatchResult[] {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    return [];
  }

  const inputLower = normalizedInput.toLowerCase();
  const matches: MatchResult[] = [];

  for (const command of commands) {
    const scored = scoreCommandAgainstInput(normalizedInput, inputLower, command);
    if (scored) {
      matches.push(scored);
    }
  }

  // Direct intent match gets explicit boost and reason
  const directIntent = detectIntent(normalizedInput);
  if (directIntent) {
    const normalizedIntent = directIntent.command.replace(/^\//, "");
    const intentIndex = matches.findIndex(
      (m) =>
        m.command.id === normalizedIntent ||
        m.command.name === directIntent.command
    );

    if (intentIndex >= 0) {
      matches[intentIndex] = {
        ...matches[intentIndex],
        score: matches[intentIndex].score + directIntent.confidence * 3,
        reason: `Khớp intent trực tiếp`,
      };
    } else {
      const fallback = commands.find(
        (command) =>
          command.id === normalizedIntent || command.name === directIntent.command
      );
      if (fallback) {
        matches.push({
          command: fallback,
          score: directIntent.confidence * 5,
          matchedKeywords: [],
          reason: "Khớp intent trực tiếp",
        });
      }
    }
  }

  const adjustedMatches = matches.map((match) => {
    const usageBoost = getCommandUsageScoreBoost(match.command.name || match.command.id);
    if (usageBoost === 0) {
      return match;
    }

    const usageHint =
      usageBoost > 0
        ? "Ưu tiên theo usage thực tế"
        : "Giảm nhẹ do tỷ lệ thành công thấp";

    return {
      ...match,
      score: Math.max(0.1, match.score + usageBoost),
      reason: `${match.reason} • ${usageHint}`,
    };
  });

  adjustedMatches.sort((a, b) => b.score - a.score);
  return adjustedMatches.slice(0, Math.max(1, limit));
}

export function recommendCommands(
  input: string,
  commands: Command[]
): RecommendationResult {
  const matches = rankCommandsByIntent(input, commands, 4);

  const primary = matches[0] || null;
  const alternatives = matches.slice(1, 4);

  // Calculate confidence
  const confidence = primary
    ? Math.min(primary.score / 5, 1.0)
    : 0;

  return {
    primary,
    alternatives,
    confidence,
  };
}

export function validateCommand(
  suggestedCommand: string,
  userInput: string,
  commands: Command[]
): { valid: boolean; corrected?: string; reason: string } {
  const command = commands.find(c => c.id === suggestedCommand || c.name === suggestedCommand);

  if (!command) {
    const rec = recommendCommands(userInput, commands);
    return {
      valid: false,
      corrected: rec.primary?.command.id,
      reason: `Lệnh ${suggestedCommand} không tồn tại. Gợi ý: ${rec.primary?.command.id}`,
    };
  }

  const rec = recommendCommands(userInput, commands);
  const isRecommended = rec.primary?.command.id === command.id;

  if (!isRecommended && rec.primary && rec.confidence > 0.6) {
    return {
      valid: true,
      reason: `Lệnh hợp lệ, nhưng ${rec.primary.command.id} có thể phù hợp hơn`,
    };
  }

  return {
    valid: true,
    reason: "Lệnh phù hợp với intent",
  };
}

// Get related commands based on category and variants
export function getRelatedCommands(command: Command, commands: Command[]): Command[] {
  const related: Command[] = [];

  // Same category
  const sameCategory = commands.filter(
    c => c.category === command.category && c.id !== command.id
  );
  related.push(...sameCategory.slice(0, 2));

  // Variants if exist
  if (command.variants) {
    for (const variant of command.variants) {
      const variantCmd = commands.find(c => c.name === variant);
      if (variantCmd && !related.find(r => r.id === variantCmd.id)) {
        related.push(variantCmd);
      }
    }
  }

  return related.slice(0, 4);
}
