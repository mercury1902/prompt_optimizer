import type { Command } from "../data/commands";
import {
  rawDiscoveredCommands,
  type RawDiscoveredCommand,
} from "../data/command-discovery-raw-index";
import { rankCommandsByIntent, type MatchResult } from "./command-recommender";

export interface ProgressiveRevealConfig {
  topLimit: number;
  rawLimit: number;
  minimumIntentConfidence: number;
  curatedOnlyInteractions: number;
}

export interface RevealedRawMatch extends MatchResult {
  sourceRepo: RawDiscoveredCommand["sourceRepo"];
  sourcePath: string;
  sourceKind: RawDiscoveredCommand["sourceKind"];
}

export interface ProgressiveRevealResult {
  curatedMatches: MatchResult[];
  rawMatches: RevealedRawMatch[];
  confidence: number;
  shouldRevealRaw: boolean;
}

export const DEFAULT_PROGRESSIVE_REVEAL_CONFIG: ProgressiveRevealConfig = {
  topLimit: 8,
  rawLimit: 3,
  minimumIntentConfidence: 0.72,
  curatedOnlyInteractions: 3,
};

const derivedRawPool: Command[] = rawDiscoveredCommands.map((item) => {
  const keywordTokens = Array.from(
    new Set(
      item.id
        .replace(/[:/]/g, " ")
        .toLowerCase()
        .split(/\s+/)
        .concat(item.category.toLowerCase())
        .filter((token) => token.length > 1)
    )
  );

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    complexity: Math.max(1, Math.min(item.complexity, 5)) as 1 | 2 | 3 | 4 | 5,
    description: item.description,
    keywords: keywordTokens,
    patterns: [],
    useCases: [item.description],
  } satisfies Command;
});

const rawById = new Map(rawDiscoveredCommands.map((item) => [item.id, item]));

function toIntentConfidence(matches: MatchResult[]): number {
  if (matches.length === 0) {
    return 0;
  }
  return Math.min(matches[0].score / 5, 1);
}

function normalizeCommandToken(value: string): string {
  return value.trim().replace(/^\//, "").toLowerCase();
}

export function getProgressiveRevealMatches({
  input,
  curatedCommands,
  interactionCount,
  config = DEFAULT_PROGRESSIVE_REVEAL_CONFIG,
}: {
  input: string;
  curatedCommands: Command[];
  interactionCount: number;
  config?: ProgressiveRevealConfig;
}): ProgressiveRevealResult {
  const curatedMatches = rankCommandsByIntent(input, curatedCommands, config.topLimit);
  const confidence = toIntentConfidence(curatedMatches);

  const shouldRevealRaw =
    interactionCount >= config.curatedOnlyInteractions &&
    confidence >= config.minimumIntentConfidence;

  if (!shouldRevealRaw) {
    return {
      curatedMatches,
      rawMatches: [],
      confidence,
      shouldRevealRaw: false,
    };
  }

  const curatedTokens = new Set(
    curatedCommands.flatMap((command) => [
      normalizeCommandToken(command.id),
      normalizeCommandToken(command.name),
    ])
  );

  const eligibleRaw = derivedRawPool.filter((command) => {
    const tokenFromId = normalizeCommandToken(command.id);
    const tokenFromName = normalizeCommandToken(command.name);
    return !curatedTokens.has(tokenFromId) && !curatedTokens.has(tokenFromName);
  });

  const rankedRaw = rankCommandsByIntent(input, eligibleRaw, config.rawLimit);
  const revealedRaw: RevealedRawMatch[] = rankedRaw
    .map((match) => {
      const provenance = rawById.get(match.command.id);
      if (!provenance) {
        return null;
      }

      return {
        ...match,
        sourceRepo: provenance.sourceRepo,
        sourcePath: provenance.sourcePath,
        sourceKind: provenance.sourceKind,
      };
    })
    .filter((match): match is RevealedRawMatch => Boolean(match));

  return {
    curatedMatches,
    rawMatches: revealedRaw,
    confidence,
    shouldRevealRaw: true,
  };
}

export function getRawPoolCount(): number {
  return derivedRawPool.length;
}
