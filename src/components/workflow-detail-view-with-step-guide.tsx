import { useCallback } from "react";
import { cn } from "../lib/utils";
import type { Workflow, WorkflowStep } from "../lib/workflows";

// ===== Types =====
interface WorkflowDetailViewProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkflow?: (workflow: Workflow) => void;
}

interface WorkflowStepCardProps {
  step: WorkflowStep;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}

// ===== SVG Icons =====
const IconX = ({ className = "w-6 h-6" }: { className?: string }) => (
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

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconGateway = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const IconPlay = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconSteps = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
    <circle cx="12" cy="5" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const IconWorkflow = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
);

// ===== Helper Functions =====

/**
 * Get difficulty display config
 */
function getDifficultyConfig(difficulty: Workflow["difficulty"]) {
  switch (difficulty) {
    case "Beginner":
      return {
        label: "Easy",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    case "Intermediate":
      return {
        label: "Medium",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    case "Advanced":
      return {
        label: "Hard",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      };
    default:
      return {
        label: difficulty,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ===== Components =====

/**
 * Difficulty Badge - displays Easy/Medium/Hard with color coding
 */
function DifficultyBadge({ difficulty }: { difficulty: Workflow["difficulty"] }) {
  const config = getDifficultyConfig(difficulty);

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

/**
 * Workflow Step Card - displays individual step with:
 * - Step number indicator (circle)
 * - Command name
 * - Description
 * - Gateway badge (if applicable)
 * - Optional badge
 * - Flags/tags
 * - Note (if applicable)
 */
function WorkflowStepCard({
  step,
  isActive,
  isCompleted,
  stepNumber,
}: WorkflowStepCardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-lg border transition-all",
        isActive && "border-purple-500 bg-purple-50 dark:bg-purple-900/10",
        isCompleted && "border-green-500 bg-green-50 dark:bg-green-900/10 opacity-60",
        !isActive && !isCompleted && "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Step Number Indicator */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0",
          isActive && "bg-purple-600 text-white",
          isCompleted && "bg-green-600 text-white",
          !isActive && !isCompleted && "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        )}
      >
        {isCompleted ? <IconCheck className="w-4 h-4" /> : stepNumber}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        {/* Command Row */}
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <code
            className={cn(
              "px-2 py-0.5 rounded text-sm font-medium",
              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            )}
          >
            {step.command}
          </code>

          {/* Gateway Badge */}
          {step.gateway && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              )}
            >
              <IconGateway className="w-3 h-3" />
              Gateway
            </span>
          )}

          {/* Required/Optional Badge */}
          {step.required ? (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              )}
            >
              Required
            </span>
          ) : (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              )}
            >
              Optional
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {step.description}
        </p>

        {/* Flags */}
        {step.flags && step.flags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {step.flags.map((flag) => (
              <span
                key={flag}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
                )}
              >
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Note */}
        {step.note && (
          <p
            className={cn(
              "mt-2 text-xs",
              "text-gray-500 dark:text-gray-400 italic"
            )}
          >
            💡 {step.note}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Progress Indicator - shows workflow progress at top
 */
function ProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}

/**
 * Workflow Detail View - Modal displaying step-by-step guide
 * Features:
 * - Modal overlay with backdrop
 * - Header with workflow info
 * - Progress indicator
 * - Step-by-step cards with:
 *   - Step numbers
 *   - Gateway highlighting
 *   - Command display
 *   - Flags and notes
 * - Start workflow button in footer
 */
export function WorkflowDetailViewWithStepGuide({
  workflow,
  isOpen,
  onClose,
  onStartWorkflow,
}: WorkflowDetailViewProps) {
  const handleStartWorkflow = useCallback(() => {
    if (workflow && onStartWorkflow) {
      onStartWorkflow(workflow);
    }
  }, [workflow, onStartWorkflow]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !workflow) return null;

  const difficultyConfig = getDifficultyConfig(workflow.difficulty);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm"
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh]",
          "flex flex-col overflow-hidden shadow-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <IconWorkflow className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {workflow.name}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {workflow.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <IconSteps className="w-4 h-4" />
                  {workflow.steps.length} steps
                </span>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <IconClock className="w-4 h-4" />
                  {workflow.timeEstimate}
                </span>
                <DifficultyBadge difficulty={workflow.difficulty} />
              </div>
            </div>

            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg",
                "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "transition-colors flex-shrink-0"
              )}
              aria-label="Close"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <ProgressIndicator currentStep={0} totalSteps={workflow.steps.length} />
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {workflow.steps.map((step, index) => (
            <WorkflowStepCard
              key={step.step}
              step={step}
              stepNumber={index + 1}
              isActive={index === 0}
              isCompleted={false}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleStartWorkflow}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium",
                "bg-purple-600 text-white",
                "hover:bg-purple-700",
                "active:bg-purple-800",
                "transition-colors",
                "flex items-center justify-center gap-2"
              )}
            >
              <IconPlay className="w-5 h-5" />
              Start Workflow
            </button>
            <button
              onClick={onClose}
              className={cn(
                "px-6 py-3 rounded-lg font-medium",
                "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                "hover:bg-gray-300 dark:hover:bg-gray-600",
                "transition-colors"
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
