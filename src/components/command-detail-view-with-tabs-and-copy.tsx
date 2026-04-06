import { useState, useCallback } from "react";
import type { Command } from "../data/commands";
import { cn } from "../lib/utils";

// ===== Types =====
type DetailTab = "overview" | "usage" | "examples";

interface CommandDetailViewProps {
  command: Command | null;
  isOpen: boolean;
  onClose: () => void;
  onUseCommand: (command: Command) => void;
  allCommands?: Command[];
}

interface TabButtonProps {
  tab: DetailTab;
  activeTab: DetailTab;
  onClick: (tab: DetailTab) => void;
}

// ===== SVG Icons =====
const IconX = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconBolt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

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

// ===== Components =====

/**
 * Complexity Indicator - displays 1-5 bolts based on complexity level
 */
function ComplexityIndicator({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Complexity: ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconBolt
          key={i}
          className={cn(
            "w-3 h-3",
            i < level ? "text-yellow-500" : "text-gray-200 dark:text-gray-700"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Copy Button - copies text to clipboard with feedback
 */
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silently fail
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all",
        "border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        copied
          ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
          : "text-gray-700 dark:text-gray-300"
      )}
      aria-label={copied ? "Copied!" : `Copy ${label}`}
    >
      {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

/**
 * Tab Button - individual tab in the tab bar
 */
function TabButton({ tab, activeTab, onClick }: TabButtonProps) {
  const isActive = activeTab === tab;
  const labels: Record<DetailTab, string> = {
    overview: "Overview",
    usage: "Usage",
    examples: "Examples",
  };

  return (
    <button
      onClick={() => onClick(tab)}
      className={cn(
        "px-5 py-3 text-sm font-medium capitalize transition-all relative",
        isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      )}
      aria-pressed={isActive}
    >
      {labels[tab]}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
      )}
    </button>
  );
}

/**
 * Category Badge - displays command category
 */
function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Engineer: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    Marketing: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full",
        colors[category] ?? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      )}
    >
      {category}
    </span>
  );
}

/**
 * Overview Tab - displays description, use cases, and keywords
 */
function OverviewTab({ command }: { command: Command }) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
          Description
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {command.description}
        </p>
      </section>

      {/* Use Cases */}
      {command.useCases.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
            Use Cases
          </h3>
          <ul className="space-y-2">
            {command.useCases.map((useCase, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-500 mt-1.5">•</span>
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Keywords */}
      {command.keywords.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {command.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Usage Tab - displays arguments and variants
 */
function UsageTab({ command }: { command: Command }) {
  return (
    <div className="space-y-6">
      {/* Arguments */}
      {command.args && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
            Arguments
          </h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
            <code className="text-blue-600 dark:text-blue-400">{command.name}</code>
            <span className="text-gray-600 dark:text-gray-400"> {command.args}</span>
          </div>
        </section>
      )}

      {/* Variants */}
      {command.variants && command.variants.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
            Variants
          </h3>
          <div className="space-y-2">
            {command.variants.map((variant) => (
              <div
                key={variant}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
              >
                <code className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {variant}
                </code>
                <CopyButton text={variant} label="Copy variant" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Patterns */}
      {command.patterns.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">
            Pattern Matching
          </h3>
          <div className="space-y-1.5">
            {command.patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 font-mono text-xs text-gray-600 dark:text-gray-400"
              >
                {pattern}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Examples Tab - displays usage examples
 */
function ExamplesTab({ command }: { command: Command }) {
  const generateExamples = (cmd: Command): string[] => {
    const examples: string[] = [];

    // Generate examples based on command type
    if (cmd.name.includes("cook")) {
      examples.push(`${cmd.name} implement user authentication`,
        `${cmd.name} create a React component`,
        `${cmd.name} add database migration`);
    } else if (cmd.name.includes("fix")) {
      examples.push(`${cmd.name} TypeScript errors in auth.ts`,
        `${cmd.name} failing tests in user.service.test.ts`,
        `${cmd.name} CSS layout issues on mobile`);
    } else if (cmd.name.includes("plan")) {
      examples.push(`${cmd.name} implement payment system`,
        `${cmd.name} migrate to new database`,
        `${cmd.name} add OAuth integration`);
    } else if (cmd.name.includes("bootstrap")) {
      examples.push(`${cmd.name} create a Next.js blog`,
        `${cmd.name} build an API server with Express`,
        `${cmd.name} setup a React component library`);
    } else if (cmd.name.includes("test")) {
      examples.push(`${cmd.name} run all unit tests`,
        `${cmd.name} test auth service`,
        `${cmd.name} e2e tests for checkout flow`);
    } else {
      examples.push(`${cmd.name} [your task here]`,
        `${cmd.name} help with specific implementation`,
        `${cmd.name} guidance on best practices`);
    }

    return examples;
  };

  const examples = generateExamples(command);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
          Usage Examples
        </h3>
        <div className="space-y-3">
          {examples.map((example, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
            >
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all pr-4">
                {example}
              </code>
              <CopyButton text={example} label="Copy" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Pro Tip
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          You can use variants for more specific tasks. Try adding flags like {""}
          <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">--fast</code>, {""}
          <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">--auto</code>, or {""}
          <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">--parallel</code>{" "}
          to customize the behavior.
        </p>
      </section>
    </div>
  );
}

/**
 * Related Commands - displays related command suggestions
 */
function RelatedCommands({
  currentCommand,
  allCommands = [],
  onSelect,
}: {
  currentCommand: Command;
  allCommands?: Command[];
  onSelect: (command: Command) => void;
}) {
  const related = allCommands
    .filter((cmd) => {
      if (cmd.id === currentCommand.id) return false;
      // Same category
      if (cmd.category === currentCommand.category) return true;
      // Variant match
      if (currentCommand.variants?.includes(cmd.name)) return true;
      if (cmd.variants?.includes(currentCommand.name)) return true;
      // Keyword overlap
      const sharedKeywords = cmd.keywords.filter((k) =>
        currentCommand.keywords.includes(k)
      );
      return sharedKeywords.length >= 2;
    })
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
        Related Commands
      </h3>
      <div className="flex flex-wrap gap-2">
        {related.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => onSelect(cmd)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5",
              "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
              "hover:bg-blue-100 dark:hover:bg-blue-900/30"
            )}
          >
            {cmd.name}
            <IconArrowRight className="w-3 h-3 opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Command Detail View - Modal with tabs for command details
 * Features:
 * - 3 tabs: Overview | Usage | Examples
 * - Copy-to-clipboard for command and variants
 * - Complexity indicator and category badge
 * - Related commands suggestions
 * - Responsive and dark mode support
 */
export function CommandDetailViewWithTabsAndCopy({
  command,
  isOpen,
  onClose,
  onUseCommand,
  allCommands = [],
}: CommandDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  // Reset tab when modal opens with new command
  useState(() => {
    if (isOpen) {
      setActiveTab("overview");
    }
  });

  const handleUseCommand = useCallback(() => {
    if (command) {
      onUseCommand(command);
    }
  }, [command, onUseCommand]);

  const handleSelectRelated = useCallback((cmd: Command) => {
    // Close and reopen with new command would be handled by parent
    // For now, just trigger use command
    onUseCommand(cmd);
  }, [onUseCommand]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Close on escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  if (!isOpen || !command) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-detail-title"
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ComplexityIndicator level={command.complexity} />
              <CategoryBadge category={command.category} />
            </div>
            <h2
              id="command-detail-title"
              className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono truncate"
            >
              {command.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors flex-shrink-0 ml-4",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-label="Close"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5">
          {(["overview", "usage", "examples"] as DetailTab[]).map((tab) => (
            <TabButton
              key={tab}
              tab={tab}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {activeTab === "overview" && <OverviewTab command={command} />}
          {activeTab === "usage" && <UsageTab command={command} />}
          {activeTab === "examples" && <ExamplesTab command={command} />}

          {/* Related Commands */}
          <RelatedCommands
            currentCommand={command}
            allCommands={allCommands}
            onSelect={handleSelectRelated}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <CopyButton text={command.name} label="Copy command" />
          <button
            onClick={handleUseCommand}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "dark:bg-blue-600 dark:hover:bg-blue-500"
            )}
          >
            <IconBolt className="w-4 h-4" />
            Use This Command
          </button>
        </div>
      </div>
    </div>
  );
}
