import { useCallback, useMemo, useState } from "react";
import type { Workflow } from "../lib/workflows";
import {
  type DifficultyFilter,
  type KitFilter,
  filterWorkflows,
  getWorkflowCounts,
  getWorkflowDifficultyCounts,
} from "../lib/workflow-filtering-by-complexity-and-search";
import { useDebounce } from "../hooks/use-debounce";
import { WorkflowCard } from "./workflow-card-with-steps-preview";

// ===== Types =====
interface WorkflowBrowserProps {
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  onViewDetails?: (workflow: Workflow) => void;
  initialKit?: KitFilter;
  initialDifficulty?: DifficultyFilter;
  placeholder?: string;
}

interface KitFilterTabsProps {
  activeKit: KitFilter;
  onChange: (kit: KitFilter) => void;
  counts: { all: number; engineer: number; marketing: number };
}

interface DifficultyFilterButtonsProps {
  activeDifficulty: DifficultyFilter;
  onChange: (difficulty: DifficultyFilter) => void;
  counts: { all: number; easy: number; medium: number; hard: number };
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount: number;
  onClear?: () => void;
}

interface EmptyStateProps {
  searchQuery: string;
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
}

// ===== SVG Icons =====
const IconSearch = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconX = ({ className = "w-4 h-4" }: { className?: string }) => (
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

const IconWorkflow = ({ className = "w-6 h-6" }: { className?: string }) => (
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

const IconFilter = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ===== Components =====

/**
 * Kit Filter Tabs - All | Engineer | Marketing with count badges
 */
function KitFilterTabs({ activeKit, onChange, counts }: KitFilterTabsProps) {
  const tabs = useMemo(
    () => [
      { id: "all" as KitFilter, label: "All", count: counts.all },
      { id: "engineer" as KitFilter, label: "Engineer", count: counts.engineer },
      { id: "marketing" as KitFilter, label: "Marketing", count: counts.marketing },
    ],
    [counts]
  );

  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-3 py-2 text-sm font-medium transition-colors relative
            ${
              activeKit === tab.id
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }
          `}
          aria-pressed={activeKit === tab.id}
        >
          {tab.label}
          <span
            className={`
            ml-1.5 text-xs px-1.5 py-0.5 rounded-full
            ${
              activeKit === tab.id
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }
          `}
          >
            {tab.count}
          </span>
          {activeKit === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Difficulty Filter Buttons - All | Easy | Medium | Hard
 */
function DifficultyFilterButtons({
  activeDifficulty,
  onChange,
  counts,
}: DifficultyFilterButtonsProps) {
  const buttons = useMemo(
    () => [
      {
        id: "all" as DifficultyFilter,
        label: "All",
        count: counts.all,
        colorClass: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        activeClass: "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100",
      },
      {
        id: "easy" as DifficultyFilter,
        label: "Easy",
        count: counts.easy,
        colorClass: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        activeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
      {
        id: "medium" as DifficultyFilter,
        label: "Medium",
        count: counts.medium,
        colorClass: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        activeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        id: "hard" as DifficultyFilter,
        label: "Hard",
        count: counts.hard,
        colorClass: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        activeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      },
    ],
    [counts]
  );

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mr-1">
        <IconFilter className="w-4 h-4" />
        <span className="text-sm">Difficulty:</span>
      </div>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onChange(button.id)}
          className={`
            px-2 py-1 text-xs font-medium rounded-full transition-all
            ${
              activeDifficulty === button.id
                ? button.activeClass
                : button.colorClass + " hover:opacity-80"
            }
          `}
          aria-pressed={activeDifficulty === button.id}
        >
          {button.label} ({button.count})
        </button>
      ))}
    </div>
  );
}

/**
 * Search Bar with clear button and results count
 */
function SearchBar({
  value,
  onChange,
  placeholder = "Search workflows...",
  resultsCount,
  onClear,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <IconSearch className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-10 py-2 text-sm
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
          transition-all
        "
      />
      {value && (
        <button
          onClick={onClear}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-0.5 rounded-full
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors
          "
          aria-label="Clear search"
        >
          <IconX className="w-4 h-4" />
        </button>
      )}
      {value && (
        <div className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
          {resultsCount} result{resultsCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

/**
 * Empty State - displayed when no workflows match filters
 */
function EmptyState({
  searchQuery,
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
        <IconWorkflow className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        No workflows found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-3">
        {searchQuery
          ? `No workflows match "${searchQuery}". Try different keywords or filters.`
          : "No workflows match the selected filters."}
      </p>
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="
            text-sm text-purple-600 dark:text-purple-400
            hover:text-purple-700 dark:hover:text-purple-300
            font-medium
            transition-colors
          "
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ===== Main Component =====

/**
 * Workflow Browser - Browse and search workflows with kit and difficulty filters
 * Features:
 * - Kit filter tabs (All | Engineer | Marketing) with count badges
 * - Difficulty filter buttons (All | Easy | Medium | Hard)
 * - Real-time search with debounce
 * - Workflow cards with step preview
 * - Empty state with suggestions
 */
export function WorkflowBrowserWithSearchAndFilter({
  workflows,
  onSelectWorkflow,
  onViewDetails,
  initialKit = "all",
  initialDifficulty = "all",
  placeholder = "Search workflows...",
}: WorkflowBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [kitFilter, setKitFilter] = useState<KitFilter>(initialKit);
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>(initialDifficulty);

  // Debounce the search query for performance
  const debouncedQuery = useDebounce(searchQuery, 150);

  // Filter workflows based on kit, difficulty, and search query
  const filteredWorkflows = useMemo(() => {
    return filterWorkflows(workflows, {
      kit: kitFilter,
      difficulty: difficultyFilter,
      searchQuery: debouncedQuery,
    });
  }, [workflows, kitFilter, difficultyFilter, debouncedQuery]);

  // Get counts for each kit tab
  const kitCounts = useMemo(() => getWorkflowCounts(workflows), [workflows]);

  // Get counts for each difficulty
  const difficultyCounts = useMemo(
    () => getWorkflowDifficultyCounts(workflows),
    [workflows]
  );

  // Check if there are any results
  const hasResults = filteredWorkflows.length > 0;

  // Check if currently searching
  const isSearching = searchQuery !== debouncedQuery;

  // Clear search helper
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setKitFilter("all");
    setDifficultyFilter("all");
    clearSearch();
  }, [clearSearch]);

  // Handle workflow selection
  const handleSelectWorkflow = useCallback(
    (workflow: Workflow) => {
      onSelectWorkflow(workflow);
    },
    [onSelectWorkflow]
  );

  // Handle view details
  const handleViewDetails = useCallback(
    (workflow: Workflow) => {
      onViewDetails?.(workflow);
    },
    [onViewDetails]
  );

  const hasActiveFilters =
    kitFilter !== "all" || difficultyFilter !== "all" || searchQuery !== "";

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Kit Filter Tabs */}
      <KitFilterTabs
        activeKit={kitFilter}
        onChange={setKitFilter}
        counts={kitCounts}
      />

      {/* Difficulty Filter Buttons */}
      <DifficultyFilterButtons
        activeDifficulty={difficultyFilter}
        onChange={setDifficultyFilter}
        counts={difficultyCounts}
      />

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={placeholder}
          resultsCount={filteredWorkflows.length}
          onClear={clearSearch}
        />
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          </div>
        ) : hasResults ? (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => handleSelectWorkflow(workflow)}
              onViewDetails={
                onViewDetails ? () => handleViewDetails(workflow) : undefined
              }
            />
          ))
        ) : (
          <EmptyState
            searchQuery={searchQuery}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />
        )}
      </div>

      {/* Footer - Results count */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredWorkflows.length} of {kitCounts.all} workflows
      </div>
    </div>
  );
}
