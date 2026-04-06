import type { Workflow, WorkflowStep } from "../lib/workflows";

export type DifficultyFilter = "all" | "easy" | "medium" | "hard";
export type KitFilter = "all" | "engineer" | "marketing";

export interface FilterOptions {
  kit: KitFilter;
  difficulty: DifficultyFilter;
  searchQuery: string;
}

/**
 * Map workflow difficulty to standardized filter values
 */
function normalizeDifficulty(
  difficulty: Workflow["difficulty"]
): "easy" | "medium" | "hard" {
  switch (difficulty) {
    case "Beginner":
      return "easy";
    case "Intermediate":
      return "medium";
    case "Advanced":
      return "hard";
    default:
      return "medium";
  }
}

/**
 * Filter workflows by kit, difficulty, and search query
 * Searches through name, description, useCases, keywords, and step commands
 */
export function filterWorkflows(
  workflows: Workflow[],
  options: FilterOptions
): Workflow[] {
  return workflows.filter((wf) => {
    // Kit filter
    if (options.kit !== "all") {
      if (wf.kit !== options.kit && wf.kit !== "both") {
        return false;
      }
    }

    // Difficulty filter
    if (options.difficulty !== "all") {
      const normalizedDifficulty = normalizeDifficulty(wf.difficulty);
      if (normalizedDifficulty !== options.difficulty) {
        return false;
      }
    }

    // Search filter (name, description, useCases, keywords, steps)
    if (options.searchQuery.trim()) {
      const query = options.searchQuery.toLowerCase().trim();
      const nameMatch = wf.name.toLowerCase().includes(query);
      const descMatch = wf.description.toLowerCase().includes(query);
      const useCaseMatch = wf.useCases.some((u) =>
        u.toLowerCase().includes(query)
      );
      const keywordMatch = wf.keywords.some((k) =>
        k.toLowerCase().includes(query)
      );
      const stepMatch = wf.steps.some(
        (s) =>
          s.command.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );

      return nameMatch || descMatch || useCaseMatch || keywordMatch || stepMatch;
    }

    return true;
  });
}

/**
 * Get workflow counts grouped by kit category
 */
export function getWorkflowCounts(workflows: Workflow[]): {
  all: number;
  engineer: number;
  marketing: number;
} {
  return {
    all: workflows.length,
    engineer: workflows.filter(
      (w) => w.kit === "engineer" || w.kit === "both"
    ).length,
    marketing: workflows.filter(
      (w) => w.kit === "marketing" || w.kit === "both"
    ).length,
  };
}

/**
 * Get workflow counts grouped by difficulty
 */
export function getWorkflowDifficultyCounts(workflows: Workflow[]): {
  all: number;
  easy: number;
  medium: number;
  hard: number;
} {
  return {
    all: workflows.length,
    easy: workflows.filter((w) => w.difficulty === "Beginner").length,
    medium: workflows.filter((w) => w.difficulty === "Intermediate").length,
    hard: workflows.filter((w) => w.difficulty === "Advanced").length,
  };
}

/**
 * Sort workflows by difficulty (ascending or descending)
 */
export function sortWorkflowsByDifficulty(
  workflows: Workflow[],
  direction: "asc" | "desc" = "asc"
): Workflow[] {
  const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  return [...workflows].sort((a, b) => {
    const orderA = difficultyOrder[a.difficulty];
    const orderB = difficultyOrder[b.difficulty];
    return direction === "asc" ? orderA - orderB : orderB - orderA;
  });
}

/**
 * Sort workflows by step count
 */
export function sortWorkflowsByStepCount(
  workflows: Workflow[],
  direction: "asc" | "desc" = "asc"
): Workflow[] {
  return [...workflows].sort((a, b) => {
    return direction === "asc"
      ? a.steps.length - b.steps.length
      : b.steps.length - a.steps.length;
  });
}
