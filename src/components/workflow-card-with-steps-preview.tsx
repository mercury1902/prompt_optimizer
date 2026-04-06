import { cn } from "../lib/utils";
import type { Workflow, WorkflowStep } from "../lib/workflows";

// ===== Types =====
interface WorkflowCardProps {
  workflow: Workflow;
  onClick: () => void;
  onViewDetails?: () => void;
}

// ===== SVG Icons =====
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

const IconInfo = ({ className = "w-4 h-4" }: { className?: string }) => (
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
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
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
 * Step Preview Bar - visual representation of workflow steps
 * Shows progress bar style with gateway steps highlighted
 */
function StepPreviewBar({ steps }: { steps: WorkflowStep[] }) {
  const displaySteps = steps.slice(0, 5);
  const remainingCount = steps.length - 5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5 flex-1">
        {displaySteps.map((step) => (
          <div
            key={step.step}
            className={cn(
              "h-1.5 flex-1 rounded-full min-w-[4px]",
              step.gateway
                ? "bg-purple-500 dark:bg-purple-400"
                : step.required
                  ? "bg-blue-500 dark:bg-blue-400"
                  : "bg-gray-300 dark:bg-gray-600"
            )}
            title={`${step.step}. ${step.command}${step.gateway ? " (Gateway)" : ""}`}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

/**
 * Kit Badge - displays which kit this workflow belongs to
 */
function KitBadge({ kit }: { kit: Workflow["kit"] }) {
  const kitConfig = {
    engineer: {
      icon: "⚙️",
      label: "Engineer",
      className: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    marketing: {
      icon: "📢",
      label: "Marketing",
      className: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300",
    },
    both: {
      icon: "🔀",
      label: "Both",
      className: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    },
  };

  const config = kitConfig[kit];

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
        config.className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Workflow Card - displays workflow info with step preview
 * Features:
 * - Name with difficulty badge
 * - Description
 * - Step count and time estimate
 * - Visual step preview (progress bar style)
 * - Gateway steps highlighted
 */
export function WorkflowCard({
  workflow,
  onClick,
  onViewDetails,
}: WorkflowCardProps) {
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl border cursor-pointer",
        "bg-white dark:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
        "hover:border-purple-300 dark:hover:border-purple-700",
        "hover:shadow-md",
        "transition-all"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Header: Name + Difficulty + Info Button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <IconWorkflow className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {workflow.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <DifficultyBadge difficulty={workflow.difficulty} />
          {onViewDetails && (
            <button
              onClick={handleDetailsClick}
              className={cn(
                "p-1 rounded",
                "text-gray-400 hover:text-purple-500",
                "hover:bg-purple-50 dark:hover:bg-purple-900/20",
                "transition-colors",
                "opacity-0 group-hover:opacity-100",
                "focus:opacity-100"
              )}
              aria-label="View workflow details"
              title="View details"
            >
              <IconInfo className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {workflow.description}
      </p>

      {/* Stats: Steps, Time, Kit */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <IconSteps className="w-3.5 h-3.5" />
            {workflow.steps.length} steps
          </span>
          <span className="flex items-center gap-1">
            <IconClock className="w-3.5 h-3.5" />
            {workflow.timeEstimate}
          </span>
        </div>
        <KitBadge kit={workflow.kit} />
      </div>

      {/* Step Preview */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <StepPreviewBar steps={workflow.steps} />
      </div>
    </div>
  );
}
