import type { Command } from "../data/commands";

export type KitFilter = "all" | "engineer" | "marketing";

export interface FilterOptions {
  kit: KitFilter;
  searchQuery: string;
}

/**
 * Filter commands by kit category and search query
 * Searches through name, description, and keywords
 */
export function filterCommands(
  commands: Command[],
  options: FilterOptions
): Command[] {
  return commands.filter((cmd) => {
    // Kit filter - case-insensitive comparison
    if (options.kit !== "all") {
      const cmdCategory = cmd.category.toLowerCase();
      if (cmdCategory !== options.kit) {
        return false;
      }
    }

    // Search filter (name, description, keywords)
    if (options.searchQuery.trim()) {
      const query = options.searchQuery.toLowerCase().trim();
      const nameMatch = cmd.name.toLowerCase().includes(query);
      const descMatch = cmd.description.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords.some((k) =>
        k.toLowerCase().includes(query)
      );
      const useCaseMatch = cmd.useCases.some((u) =>
        u.toLowerCase().includes(query)
      );

      return nameMatch || descMatch || keywordMatch || useCaseMatch;
    }

    return true;
  });
}

/**
 * Get command counts grouped by kit category
 */
export function getCommandCounts(commands: Command[]): {
  all: number;
  engineer: number;
  marketing: number;
} {
  return {
    all: commands.length,
    engineer: commands.filter((c) => c.category.toLowerCase() === "engineer")
      .length,
    marketing: commands.filter(
      (c) => c.category.toLowerCase() === "marketing"
    ).length,
  };
}

/**
 * Sort commands by complexity (ascending or descending)
 */
export function sortCommandsByComplexity(
  commands: Command[],
  direction: "asc" | "desc" = "asc"
): Command[] {
  return [...commands].sort((a, b) => {
    return direction === "asc"
      ? a.complexity - b.complexity
      : b.complexity - a.complexity;
  });
}

/**
 * Group commands by category
 */
export function groupCommandsByCategory(
  commands: Command[]
): Record<string, Command[]> {
  return commands.reduce((groups, cmd) => {
    const category = cmd.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(cmd);
    return groups;
  }, {} as Record<string, Command[]>);
}
