import { useState, useCallback } from "react";
import type { Command } from "../data/commands";
import { cn } from "../lib/utils";

// ===== SVG Icons =====
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

const IconTerminal = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
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

// ===== Types =====
interface CommandUsageExamplesWithVariantsProps {
  command: Command;
  onCopyVariant?: (variant: string) => void;
}

interface VariantCardProps {
  variant: string;
  description?: string;
  onCopy: (variant: string) => void;
  isCopied: boolean;
}

interface ExampleCardProps {
  example: string;
  description?: string;
  onCopy: (example: string) => void;
  isCopied: boolean;
}

// ===== Components =====

/**
 * Variant Card - displays a command variant with copy button
 */
function VariantCard({ variant, description, onCopy, isCopied }: VariantCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-2 p-3 rounded-lg border transition-all",
        "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:border-blue-300 dark:hover:border-blue-700"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
          {variant}
        </code>
        <button
          onClick={() => onCopy(variant)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all flex-shrink-0",
            isCopied
              ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
          aria-label={isCopied ? "Copied!" : `Copy ${variant}`}
        >
          {isCopied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

/**
 * Example Card - displays a usage example with copy button
 */
function ExampleCard({ example, description, onCopy, isCopied }: ExampleCardProps) {
  return (
    <div
      className={cn(
        "group p-3 rounded-lg border transition-all",
        "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:border-blue-300 dark:hover:border-blue-700"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <IconTerminal className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all block">
              {example}
            </code>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onCopy(example)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs rounded transition-all flex-shrink-0",
            isCopied
              ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
          aria-label={isCopied ? "Copied!" : "Copy example"}
        >
          {isCopied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Generate variant descriptions based on variant name
 */
function getVariantDescription(variant: string): string | undefined {
  if (variant.includes("--fast")) return "Quick execution mode";
  if (variant.includes("--auto")) return "Automatic mode with minimal prompts";
  if (variant.includes("--parallel")) return "Run tasks in parallel";
  if (variant.includes("--hard")) return "Deep analysis and comprehensive output";
  if (variant.includes("--two")) return "Dual approach comparison";
  if (variant.includes("--validate")) return "Validate plan against requirements";
  if (variant.includes("--quick")) return "Quick fix mode";
  if (variant.includes("--review")) return "Includes code review";
  if (variant.includes("--no-test")) return "Skip test generation";
  if (variant.includes(":auto")) return "Automatic execution";
  if (variant.includes(":fast")) return "Fast execution";
  if (variant.includes(":parallel")) return "Parallel processing";
  if (variant.includes(":types")) return "TypeScript-specific fixes";
  if (variant.includes(":ui")) return "UI/UX-specific fixes";
  if (variant.includes(":ci")) return "CI/CD pipeline fixes";
  if (variant.includes(":test")) return "Test-related fixes";
  if (variant.includes(":logs")) return "Log-based debugging";
  return undefined;
}

/**
 * Generate example descriptions based on command and example
 */
function getExampleDescription(command: Command, example: string): string | undefined {
  const input = example.replace(command.name, "").trim();

  if (input.includes("auth")) return "Authentication implementation";
  if (input.includes("database")) return "Database operations";
  if (input.includes("test")) return "Testing specific component";
  if (input.includes("component")) return "UI component creation";
  if (input.includes("API") || input.includes("api")) return "API development";
  if (input.includes("fix") || input.includes("error")) return "Bug fixing scenario";
  if (input.includes("style") || input.includes("CSS")) return "Styling and CSS";
  if (input.includes("migration")) return "Database migration";
  if (input.includes("deploy") || input.includes("ship")) return "Deployment tasks";

  return undefined;
}

/**
 * Command Usage Examples with Variants
 * Displays usage examples and command variants with copy functionality
 */
export function CommandUsageExamplesWithVariants({
  command,
  onCopyVariant,
}: CommandUsageExamplesWithVariantsProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedItem(text);
        onCopyVariant?.(text);
        setTimeout(() => setCopiedItem((prev) => (prev === text ? null : prev)), 2000);
      } catch {
        // Fallback: silently fail
      }
    },
    [onCopyVariant]
  );

  // Generate usage examples based on command type
  const generateExamples = useCallback((cmd: Command): string[] => {
    const examples: string[] = [];
    const baseName = cmd.name;

    // Command-specific examples
    if (cmd.name.includes("cook")) {
      examples.push(
        `${baseName} implement user authentication with JWT`,
        `${baseName} create a responsive navigation component`,
        `${baseName} add email verification to signup flow`,
        `${baseName} implement infinite scroll for product list`
      );
    } else if (cmd.name.includes("fix")) {
      if (cmd.name.includes("types")) {
        examples.push(
          `${baseName} auth.ts type errors`,
          `${baseName} interface mismatch in API response`,
          `${baseName} generic type inference issue`
        );
      } else if (cmd.name.includes("ui")) {
        examples.push(
          `${baseName} mobile layout breaking on iPhone`,
          `${baseName} button alignment in header`,
          `${baseName} dark mode color contrast issues`
        );
      } else if (cmd.name.includes("ci")) {
        examples.push(
          `${baseName} GitHub Actions failing on deploy`,
          `${baseName} build timeout in pipeline`,
          `${baseName} Docker build step failing`
        );
      } else if (cmd.name.includes("test")) {
        examples.push(
          `${baseName} user.service.test.ts timeouts`,
          `${baseName} flaky e2e tests in checkout`,
          `${baseName} mock database connection errors`
        );
      } else {
        examples.push(
          `${baseName} TypeScript errors in auth module`,
          `${baseName} failing tests after dependency update`,
          `${baseName} memory leak in background job`
        );
      }
    } else if (cmd.name.includes("plan")) {
      examples.push(
        `${baseName} migrate from REST to GraphQL`,
        `${baseName} implement real-time notifications`,
        `${baseName} add multi-tenant support`,
        `${baseName} optimize database queries`
      );
    } else if (cmd.name.includes("bootstrap")) {
      examples.push(
        `${baseName} create a SaaS landing page`,
        `${baseName} build an API with authentication`,
        `${baseName} setup a component library with Storybook`
      );
    } else if (cmd.name.includes("test")) {
      examples.push(
        `${baseName} run all unit tests`,
        `${baseName} integration tests for payment flow`,
        `${baseName} e2e tests with Playwright`
      );
    } else if (cmd.name.includes("scout")) {
      examples.push(
        `${baseName} find all API endpoints`,
        `${baseName} locate environment configuration`,
        `${baseName} search for TODO comments`
      );
    } else if (cmd.name.includes("research")) {
      examples.push(
        `${baseName} best practices for error handling`,
        `${baseName} state management patterns`,
        `${baseName} database indexing strategies`
      );
    } else {
      // Generic examples
      examples.push(
        `${baseName} [describe your task]`,
        `${baseName} help with implementation`,
        `${baseName} optimize existing code`
      );
    }

    return examples.slice(0, 4);
  }, []);

  const examples = generateExamples(command);
  const hasVariants = command.variants && command.variants.length > 0;

  return (
    <div className="space-y-6">
      {/* Command Syntax */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
          Command Syntax
        </h3>
        <div className="bg-gray-900 dark:bg-black rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">{command.name}</span>
            {command.args && (
              <span className="text-gray-400">{command.args}</span>
            )}
          </div>
          {command.args && (
            <p className="text-gray-500 text-xs mt-2">
              Arguments are optional. The command works with or without them.
            </p>
          )}
        </div>
      </section>

      {/* Variants */}
      {hasVariants && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
            Available Variants
          </h3>
          <div className="space-y-2">
            {command.variants!.map((variant) => (
              <VariantCard
                key={variant}
                variant={variant}
                description={getVariantDescription(variant)}
                onCopy={handleCopy}
                isCopied={copiedItem === variant}
              />
            ))}
          </div>
        </section>
      )}

      {/* Usage Examples */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">
          Common Usage Examples
        </h3>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <ExampleCard
              key={idx}
              example={example}
              description={getExampleDescription(command, example)}
              onCopy={handleCopy}
              isCopied={copiedItem === example}
            />
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <IconArrowRight className="w-4 h-4" />
          Usage Tips
        </h4>
        <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              Use specific descriptions for better results{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                /ck:cook add JWT auth
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              Try variants for different execution modes{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                --fast
              </code>{" "}
              or{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                --parallel
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Click any example to copy it to your clipboard</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
