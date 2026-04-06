import { type Command } from "../data/commands";
import { type Workflow, workflows, findMatchingWorkflows, needsWorkflow, getPrimaryWorkflow } from "./workflows";

export interface WorkflowRecommendation {
  type: "workflow";
  workflow: Workflow;
  confidence: number;
  reason: string;
}

export interface CommandSequenceRecommendation {
  type: "sequence";
  primaryCommand: Command;
  nextSteps: string[];
  workflow?: Workflow;
  confidence: number;
}

export type SmartRecommendation = WorkflowRecommendation | CommandSequenceRecommendation;

// Detect if a task needs multi-step workflow
export function analyzeTaskComplexity(input: string): {
  complexity: "simple" | "medium" | "complex";
  needsWorkflow: boolean;
  suggestedApproach: string;
} {
  const inputLower = input.toLowerCase();

  // Complex task indicators
  const complexSignals = [
    "từ đầu", "end-to-end", "hoàn chỉnh", "complete", "full",
    "bootstrap", "khởi tạo", "launch", "ra mắt", "campaign",
    "chiến dịch", "workflow", "quy trình", "sequence", "nhiều bước"
  ];

  // Medium complexity
  const mediumSignals = [
    "implement", "phát triển", "tạo", "build", "feature",
    "tính năng", "design", "thiết kế", "content", "nội dung"
  ];

  const hasComplex = complexSignals.some(s => inputLower.includes(s));
  const hasMedium = mediumSignals.some(s => inputLower.includes(s));

  if (hasComplex) {
    return {
      complexity: "complex",
      needsWorkflow: true,
      suggestedApproach: "Sử dụng workflow định nghĩa sẵn với nhiều bước"
    };
  }

  if (hasMedium) {
    return {
      complexity: "medium",
      needsWorkflow: false,
      suggestedApproach: "Sử dụng 1-2 lệnh chính có thể đủ"
    };
  }

  return {
    complexity: "simple",
    needsWorkflow: false,
    suggestedApproach: "Lệnh đơn giản như /fix hoặc /ask"
  };
}

// Get smart recommendation based on task
export function getSmartRecommendation(
  input: string,
  commands: Command[]
): SmartRecommendation | null {
  const analysis = analyzeTaskComplexity(input);

  // For complex tasks, suggest workflow
  if (analysis.needsWorkflow || needsWorkflow(input)) {
    const workflow = getPrimaryWorkflow(input);
    if (workflow) {
      return {
        type: "workflow",
        workflow,
        confidence: 0.85,
        reason: `Task phức tạp phù hợp với workflow "${workflow.name}" có ${workflow.steps.length} bước`
      };
    }
  }

  // For simple/medium tasks, suggest command with next steps
  // This will be handled by the existing command recommender
  return null;
}

// Get alternative workflows
export function getAlternativeWorkflows(
  input: string,
  excludeId?: string
): Workflow[] {
  const matches = findMatchingWorkflows(input);
  return matches.filter(w => w.id !== excludeId).slice(0, 3);
}

// Format workflow for display
export function formatWorkflowForDisplay(workflow: Workflow): {
  title: string;
  subtitle: string;
  steps: Array<{
    step: number;
    command: string;
    description: string;
    badge?: string;
    note?: string;
  }>;
  metadata: {
    difficulty: string;
    time: string;
    kit: string;
  };
} {
  return {
    title: workflow.name,
    subtitle: workflow.description,
    steps: workflow.steps.map(s => ({
      step: s.step,
      command: s.command,
      description: s.description,
      badge: s.gateway ? "BẮT BUỘC" : s.required ? "Nên làm" : undefined,
      note: s.note
    })),
    metadata: {
      difficulty: workflow.difficulty,
      time: workflow.timeEstimate,
      kit: workflow.kit === "both" ? "Engineer + Marketing" :
           workflow.kit === "engineer" ? "Engineer Kit" : "Marketing Kit"
    }
  };
}

// Export all for use
export { workflows, findMatchingWorkflows, needsWorkflow, getPrimaryWorkflow };
export type { Workflow, WorkflowStep } from "./workflows";
