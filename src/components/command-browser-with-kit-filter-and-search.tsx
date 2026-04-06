import { useCallback, useMemo } from "react";
import type { Command } from "../data/commands";
import { type KitFilter } from "../lib/command-filtering-by-kit-and-keywords";
import { useCommandSearchWithDebounce } from "../hooks/use-command-search-with-debounce";

// ===== Types =====
interface CommandBrowserProps {
  commands: Command[];
  onSelectCommand: (command: Command) => void;
  onViewDetails?: (command: Command) => void;
  initialKit?: KitFilter;
  placeholder?: string;
}

interface KitFilterTabsProps {
  activeKit: KitFilter;
  onChange: (kit: KitFilter) => void;
  counts: { all: number; engineer: number; marketing: number };
}

interface CommandCardProps {
  command: Command;
  onClick: () => void;
  onViewDetails?: () => void;
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

const IconCommand = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
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
                ? "text-blue-600 dark:text-blue-400"
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
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }
          `}
          >
            {tab.count}
          </span>
          {activeKit === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
          )}
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
  placeholder = "Search commands...",
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
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
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
 * Complexity Indicator - displays 1-5 bolts based on complexity level
 */
function ComplexityIndicator({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Complexity: ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconBolt
          key={i}
          className={`
            w-3 h-3
            ${i < level ? "text-yellow-500" : "text-gray-200 dark:text-gray-700"}
          `}
        />
      ))}
    </div>
  );
}

/**
 * Command Card - displays command info with complexity and keywords
 */
function CommandCard({ command, onClick, onViewDetails }: CommandCardProps) {
  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewDetails?.();
    },
    [onViewDetails]
  );

  return (
    <div
      onClick={onClick}
      className="
        group p-3 rounded-lg border cursor-pointer
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
        hover:border-blue-300 dark:hover:border-blue-700
        hover:shadow-sm
        transition-all
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Header: Name + Complexity + Info Button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">
            {command.name}
          </code>
          <ComplexityIndicator level={command.complexity} />
        </div>
        {onViewDetails && (
          <button
            onClick={handleDetailsClick}
            className="
              p-1 rounded
              text-gray-400 hover:text-blue-500
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              transition-colors
              opacity-0 group-hover:opacity-100
              focus:opacity-100
            "
            aria-label="View command details"
            title="View details"
          >
            <IconInfo className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
        {command.description}
      </p>

      {/* Keywords/Tags */}
      {command.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {command.keywords.slice(0, 4).map((keyword) => (
            <span
              key={keyword}
              className="
                text-xs px-1.5 py-0.5 rounded
                bg-gray-100 dark:bg-gray-700
                text-gray-600 dark:text-gray-400
              "
            >
              {keyword}
            </span>
          ))}
          {command.keywords.length > 4 && (
            <span className="text-xs px-1.5 py-0.5 text-gray-400 dark:text-gray-500">
              +{command.keywords.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Empty State - displayed when no commands match filters
 */
function EmptyState({
  searchQuery,
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
        <IconCommand className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        No commands found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-3">
        {searchQuery
          ? `No commands match "${searchQuery}". Try different keywords or filters.`
          : "No commands match the selected filters."}
      </p>
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="
            text-sm text-blue-600 dark:text-blue-400
            hover:text-blue-700 dark:hover:text-blue-300
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
 * Command Browser - Browse and search commands with kit filters
 * Features:
 * - Kit filter tabs (All | Engineer | Marketing) with count badges
 * - Real-time search with 150ms debounce
 * - Command cards with complexity indicator
 * - Empty state with suggestions
 */
export function CommandBrowserWithKitFilterAndSearch({
  commands,
  onSelectCommand,
  onViewDetails,
  initialKit = "all",
  placeholder = "Search commands...",
}: CommandBrowserProps) {
  const {
    searchQuery,
    setSearchQuery,
    kitFilter,
    setKitFilter,
    filteredCommands,
    counts,
    hasResults,
    clearSearch,
  } = useCommandSearchWithDebounce(commands, { initialKit });

  const handleSelectCommand = useCallback(
    (command: Command) => {
      onSelectCommand(command);
    },
    [onSelectCommand]
  );

  const handleViewDetails = useCallback(
    (command: Command) => {
      onViewDetails?.(command);
    },
    [onViewDetails]
  );

  const handleClearAll = useCallback(() => {
    setKitFilter("all");
    clearSearch();
  }, [setKitFilter, clearSearch]);

  const hasActiveFilters = kitFilter !== "all" || searchQuery !== "";

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Kit Filter Tabs */}
      <KitFilterTabs
        activeKit={kitFilter}
        onChange={setKitFilter}
        counts={counts}
      />

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={placeholder}
          resultsCount={filteredCommands.length}
          onClear={clearSearch}
        />
      </div>

      {/* Command List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {hasResults ? (
          filteredCommands.map((command) => (
            <CommandCard
              key={command.id}
              command={command}
              onClick={() => handleSelectCommand(command)}
              onViewDetails={
                onViewDetails ? () => handleViewDetails(command) : undefined
              }
            />
          ))
        ) : (
          <EmptyState
            searchQuery={searchQuery}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearAll}
          />
        )}
      </div>

      {/* Footer - Results count */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredCommands.length} of {counts.all} commands
      </div>
    </div>
  );
}
