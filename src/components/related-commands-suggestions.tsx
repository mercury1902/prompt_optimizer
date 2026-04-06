import { useState, useMemo, useCallback } from "react";
import type { Command } from "../data/commands";
import { cn } from "../lib/utils";

// ===== SVG Icons =====
const IconArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconBolt = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconLightbulb = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2v1" />
    <path d="M12 7a5 5 0 0 1 5 5c0 2.5-2 4-3 5l-2 2-2-2c-1-1-3-2.5-3-5a5 5 0 0 1 5-5z" />
  </svg>
);

// ===== Types =====
interface RelatedCommandsSuggestionsProps {
  currentCommand: Command;
  allCommands: Command[];
  onSelectCommand: (command: Command) => void;
  maxSuggestions?: number;
  showEmptyState?: boolean;
}

interface RelatedCommandCardProps {
  command: Command;
  onSelect: (command: Command) => void;
  relevanceScore: number;
  reason: string;
}

// ===== Helper Functions =====

/**
 * Calculate relevance score between two commands
 * Higher score = more relevant
 */
function calculateRelevance(current: Command, candidate: Command): number {
  let score = 0;

  // Same category (strong signal)
  if (current.category === candidate.category) {
    score += 3;
  }

  // Shared keywords
  const sharedKeywords = current.keywords.filter((k) =>
    candidate.keywords.includes(k)
  );
  score += sharedKeywords.length * 2;

  // Variants relationship
  if (current.variants?.includes(candidate.name)) {
    score += 5;
  }
  if (candidate.variants?.includes(current.name)) {
    score += 5;
  }

  // Name similarity (prefix match)
  const currentBase = current.name.split(":").slice(0, 2).join(":");
  const candidateBase = candidate.name.split(":").slice(0, 2).join(":");
  if (currentBase === candidateBase && current.name !== candidate.name) {
    score += 4;
  }

  // Complexity similarity (prefer similar complexity)
  const complexityDiff = Math.abs(current.complexity - candidate.complexity);
  if (complexityDiff <= 1) {
    score += 1;
  }

  return score;
}

/**
 * Get human-readable reason for relationship
 */
function getRelationshipReason(
  current: Command,
  candidate: Command,
  sharedKeywords: string[]
): string {
  if (current.variants?.includes(candidate.name)) {
    return "Variant";
  }
  if (candidate.variants?.includes(current.name)) {
    return "Parent command";
  }

  const currentBase = current.name.split(":").slice(0, 2).join(":");
  const candidateBase = candidate.name.split(":").slice(0, 2).join(":");
  if (currentBase === candidateBase) {
    return "Same family";
  }

  if (sharedKeywords.length > 0) {
    return `Similar: ${sharedKeywords.slice(0, 2).join(", ")}`;
  }

  if (current.category === candidate.category) {
    return current.category;
  }

  return "Related";
}

// ===== Components =====

/**
 * Complexity Indicator - mini version for related cards
 */
function MiniComplexityIndicator({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5" title={`Complexity: ${level}/5`}>
      {Array.from({ length: level }).map((_, i) => (
        <IconBolt
          key={i}
          className="w-2.5 h-2.5 text-yellow-500"
        />
      ))}
    </div>
  );
}

/**
 * Related Command Card - displays a single related command
 */
function RelatedCommandCard({
  command,
  onSelect,
  relevanceScore,
  reason,
}: RelatedCommandCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(command)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono text-blue-600 dark:text-blue-400 truncate">
              {command.name}
            </code>
            <MiniComplexityIndicator level={command.complexity} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {command.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {reason}
            </span>
            {relevanceScore >= 5 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                Highly relevant
              </span>
            )}
          </div>
        </div>
        <IconArrowRight
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
            isHovered && "translate-x-1 text-blue-500"
          )}
        />
      </div>
    </button>
  );
}

/**
 * Empty State - displayed when no related commands found
 */
function EmptyRelatedState() {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
        <IconLightbulb className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No related commands found
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        This command is unique in its category
      </p>
    </div>
  );
}

/**
 * Related Commands Suggestions
 * Displays related commands based on category, variants, and keyword similarity
 */
export function RelatedCommandsSuggestions({
  currentCommand,
  allCommands,
  onSelectCommand,
  maxSuggestions = 4,
  showEmptyState = true,
}: RelatedCommandsSuggestionsProps) {
  // Calculate and sort related commands
  const relatedCommands = useMemo(() => {
    const scored = allCommands
      .filter((cmd) => cmd.id !== currentCommand.id)
      .map((cmd) => {
        const score = calculateRelevance(currentCommand, cmd);
        const sharedKeywords = currentCommand.keywords.filter((k) =>
          cmd.keywords.includes(k)
        );
        const reason = getRelationshipReason(currentCommand, cmd, sharedKeywords);

        return {
          command: cmd,
          score,
          reason,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);

    return scored;
  }, [currentCommand, allCommands, maxSuggestions]);

  const handleSelect = useCallback(
    (command: Command) => {
      onSelectCommand(command);
    },
    [onSelectCommand]
  );

  // Don't render if no related commands and empty state is hidden
  if (relatedCommands.length === 0 && !showEmptyState) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          Related Commands
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          ({relatedCommands.length} found)
        </span>
      </div>

      {relatedCommands.length > 0 ? (
        <div className="space-y-2">
          {relatedCommands.map(({ command, score, reason }) => (
            <RelatedCommandCard
              key={command.id}
              command={command}
              onSelect={handleSelect}
              relevanceScore={score}
              reason={reason}
            />
          ))}
        </div>
      ) : (
        <EmptyRelatedState />
      )}
    </div>
  );
}

/**
 * Compact version - displays as horizontal chips
 */
interface RelatedCommandsCompactProps {
  currentCommand: Command;
  allCommands: Command[];
  onSelectCommand: (command: Command) => void;
  maxSuggestions?: number;
}

export function RelatedCommandsCompact({
  currentCommand,
  allCommands,
  onSelectCommand,
  maxSuggestions = 5,
}: RelatedCommandsCompactProps) {
  const related = useMemo(() => {
    return allCommands
      .filter((cmd) => cmd.id !== currentCommand.id)
      .map((cmd) => ({
        command: cmd,
        score: calculateRelevance(currentCommand, cmd),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map((item) => item.command);
  }, [currentCommand, allCommands, maxSuggestions]);

  if (related.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {related.map((cmd) => (
        <button
          key={cmd.id}
          onClick={() => onSelectCommand(cmd)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm transition-all",
            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
            "hover:bg-blue-100 dark:hover:bg-blue-900/30"
          )}
        >
          {cmd.name}
        </button>
      ))}
    </div>
  );
}
