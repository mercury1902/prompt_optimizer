// Prompt Quality Evaluation Utilities
// Provides objective metrics to evaluate optimized prompt quality

export interface QualityMetrics {
  structureCompleteness: number; // 0-1: Has all required sections
  specificity: number; // 0-1: Uses specific terms vs vague language
  contextRichness: number; // 0-1: Includes tech stack, constraints
  actionability: number; // 0-1: Can be executed immediately
  overall: number; // 0-1: Weighted average
}

export interface QualityReport {
  metrics: QualityMetrics;
  suggestions: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
}

// Thresholds for passing
const QUALITY_THRESHOLDS = {
  minimumOverall: 0.6, // 60% to pass
  goodOverall: 0.8, // 80% for grade A
};

/**
 * Evaluate prompt quality based on multiple metrics
 */
export function evaluatePromptQuality(
  optimizedPrompt: string,
  originalInput: string
): QualityReport {
  const metrics: QualityMetrics = {
    structureCompleteness: calculateStructureCompleteness(optimizedPrompt),
    specificity: calculateSpecificity(optimizedPrompt),
    contextRichness: calculateContextRichness(optimizedPrompt),
    actionability: calculateActionability(optimizedPrompt),
    overall: 0,
  };

  // Calculate weighted overall score
  metrics.overall = calculateOverallScore(metrics);

  // Generate suggestions for improvement
  const suggestions = generateSuggestions(metrics, optimizedPrompt);

  // Determine grade
  const grade = determineGrade(metrics.overall);

  return {
    metrics,
    suggestions,
    grade,
    passed: metrics.overall >= QUALITY_THRESHOLDS.minimumOverall,
  };
}

/**
 * Check if prompt has all required sections
 */
function calculateStructureCompleteness(prompt: string): number {
  const requiredSections = [
    { pattern: /implement|build|create|add|fix|refactor/i, weight: 0.25 },
    { pattern: /requirements?:|features?:|should|must|need/i, weight: 0.25 },
    { pattern: /using|with|tech|stack|framework|library/i, weight: 0.25 },
    { pattern: /test|validate|ensure|check/i, weight: 0.25 },
  ];

  let score = 0;
  requiredSections.forEach((section) => {
    if (section.pattern.test(prompt)) {
      score += section.weight;
    }
  });

  return Math.min(score, 1);
}

/**
 * Calculate specificity based on concrete terms vs vague words
 */
function calculateSpecificity(prompt: string): number {
  // Specific technical terms that indicate clarity
  const specificTerms = [
    /typescript|javascript|python|react|vue|angular|svelte/i,
    /component|function|hook|api|endpoint|database/i,
    /tailwind|bootstrap|css|scss|styled-components/i,
    /localstorage|sessionstorage|cookie|jwt|oauth/i,
    /validation|error.handling|loading.state|async/i,
  ];

  // Vague terms that reduce specificity
  const vagueTerms = [
    /something|somehow|whatever|etc|and so on/i,
    /good|nice|better|improve|optimize/i, // Without specifics
    /maybe|perhaps|possibly|might|could/i,
  ];

  const specificMatches = specificTerms.filter((pattern) =>
    pattern.test(prompt)
  ).length;
  const vagueMatches = vagueTerms.filter((pattern) => pattern.test(prompt)).length;

  // Calculate ratio
  const totalTerms = specificMatches + vagueMatches;
  if (totalTerms === 0) return 0.5; // Neutral if no terms found

  return Math.min(specificMatches / (totalTerms * 0.5), 1);
}

/**
 * Check context richness (tech stack, constraints mentioned)
 */
function calculateContextRichness(prompt: string): number {
  const contextIndicators = [
    { pattern: /react|vue|angular|svelte|next\.?js|astro/i, weight: 0.2 },
    { pattern: /typescript|javascript|python|go|rust/i, weight: 0.2 },
    { pattern: /tailwind|bootstrap|material.ui|chakra/i, weight: 0.15 },
    { pattern: /node\.?js|express|fastapi|django/i, weight: 0.15 },
    { pattern: /postgresql|mysql|mongodb|redis/i, weight: 0.15 },
    { pattern: /docker|kubernetes|aws|vercel|netlify/i, weight: 0.15 },
  ];

  let score = 0;
  contextIndicators.forEach((indicator) => {
    if (indicator.pattern.test(prompt)) {
      score += indicator.weight;
    }
  });

  return Math.min(score, 1);
}

/**
 * Check if prompt is actionable (can be executed)
 */
function calculateActionability(prompt: string): number {
  const actionablePatterns = [
    { pattern: /\d+\.|step \d|first|then|next|finally/i, weight: 0.3 },
    { pattern: /create file|add component|implement function/i, weight: 0.3 },
    { pattern: /should (have|include|support|handle)/i, weight: 0.2 },
    { pattern: /for example|e\.g\.|such as/i, weight: 0.2 },
  ];

  let score = 0;
  actionablePatterns.forEach((pattern) => {
    if (pattern.pattern.test(prompt)) {
      score += pattern.weight;
    }
  });

  return Math.min(score, 1);
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(metrics: QualityMetrics): number {
  const weights = {
    structureCompleteness: 0.3,
    specificity: 0.25,
    contextRichness: 0.25,
    actionability: 0.2,
  };

  return (
    metrics.structureCompleteness * weights.structureCompleteness +
    metrics.specificity * weights.specificity +
    metrics.contextRichness * weights.contextRichness +
    metrics.actionability * weights.actionability
  );
}

/**
 * Generate suggestions for improvement based on metrics
 */
function generateSuggestions(metrics: QualityMetrics, prompt: string): string[] {
  const suggestions: string[] = [];

  if (metrics.structureCompleteness < 0.7) {
    suggestions.push('Thêm phần "Requirements" hoặc "Must-have features" rõ ràng hơn');
  }

  if (metrics.specificity < 0.6) {
    suggestions.push('Thay thế các từ mơ hồ bằng tên công nghệ/framework cụ thể');
  }

  if (metrics.contextRichness < 0.5) {
    suggestions.push('Thêm context về tech stack (React/Vue, TypeScript, v.v.)');
  }

  if (metrics.actionability < 0.6) {
    suggestions.push('Thêm các bước cụ thể hoặc ví dụ để dễ thực thi');
  }

  // Check prompt length
  if (prompt.length < 100) {
    suggestions.push('Prompt quá ngắn - thêm chi tiết về requirements');
  }

  return suggestions;
}

/**
 * Determine grade based on overall score
 */
function determineGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 0.9) return 'A';
  if (score >= 0.8) return 'B';
  if (score >= 0.7) return 'C';
  if (score >= 0.6) return 'D';
  return 'F';
}

/**
 * Format quality report for display
 */
export function formatQualityReport(report: QualityReport): string {
  const parts: string[] = [
    `📊 **Quality Score: ${Math.round(report.metrics.overall * 100)}%** (Grade: ${report.grade})`,
    '',
    '| Metric | Score |',
    '|--------|-------|',
    `| Structure | ${Math.round(report.metrics.structureCompleteness * 100)}% |`,
    `| Specificity | ${Math.round(report.metrics.specificity * 100)}% |`,
    `| Context | ${Math.round(report.metrics.contextRichness * 100)}% |`,
    `| Actionability | ${Math.round(report.metrics.actionability * 100)}% |`,
  ];

  if (report.suggestions.length > 0) {
    parts.push('', '💡 **Suggestions:**');
    report.suggestions.forEach((suggestion, index) => {
      parts.push(`${index + 1}. ${suggestion}`);
    });
  }

  return parts.join('\n');
}

/**
 * Store user feedback for continuous improvement
 */
export interface UserFeedback {
  promptId: string;
  originalInput: string;
  optimizedPrompt: string;
  rating: 'thumbs-up' | 'thumbs-down' | 'neutral';
  commandUsed: string | null;
  timestamp: string;
}

const FEEDBACK_STORAGE_KEY = 'claudekit-prompt-feedback';

export function storeUserFeedback(feedback: UserFeedback): void {
  if (typeof localStorage === 'undefined') return;

  const existing: UserFeedback[] = JSON.parse(
    localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]'
  );
  existing.push(feedback);

  // Keep only last 100 feedbacks
  const trimmed = existing.slice(-100);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(trimmed));
}

export function getUserFeedback(): UserFeedback[] {
  if (typeof localStorage === 'undefined') return [];

  return JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
}

/**
 * Calculate aggregate statistics from user feedback
 */
export function calculateFeedbackStats(): {
  total: number;
  positiveRate: number;
  topCommands: string[];
} {
  const feedbacks = getUserFeedback();

  if (feedbacks.length === 0) {
    return { total: 0, positiveRate: 0, topCommands: [] };
  }

  const positive = feedbacks.filter((f) => f.rating === 'thumbs-up').length;
  const positiveRate = positive / feedbacks.length;

  // Count command usage
  const commandCounts: Record<string, number> = {};
  feedbacks.forEach((f) => {
    if (f.commandUsed) {
      commandCounts[f.commandUsed] = (commandCounts[f.commandUsed] || 0) + 1;
    }
  });

  const topCommands = Object.entries(commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cmd]) => cmd);

  return {
    total: feedbacks.length,
    positiveRate,
    topCommands,
  };
}
