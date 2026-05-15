import { useState, useRef, useEffect } from "react";
import { commands, categories, getCommandsByCategory, type Command } from "../data/commands";
import { optimizePrompt, optimizePromptWithImage, optimizePromptStream, type OptimizeResult } from "../lib/router-client";
import { recommendCommands, detectIntent, getRelatedCommands } from "../lib/command-recommender";
import { getSmartRecommendation, getAlternativeWorkflows, formatWorkflowForDisplay, type Workflow } from "../lib/workflow-recommendation-engine";
import { workflows } from "../lib/workflows";

// ===== SVG Icon Components (Monochrome Outline Style) =====
const IconBolt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconTool = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconSpeaker = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IconInfo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconAlert = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconLightbulb = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.9.27-1.48.27-2.09A5.5 5.5 0 0 0 5.63 8.5a5.5 5.5 0 0 0-2.62 5.7c.2 1.1.64 1.84 1.43 2.88.47.62.78 1.13.78 1.92h11.56c0-.79.31-1.3.78-1.92.79-1.04 1.23-1.78 1.43-2.88A5.5 5.5 0 0 0 15.09 14z" />
  </svg>
);

const IconStar = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconRefresh = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconClipboard = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const IconBook = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconTarget = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconFileText = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
    <path d="M5.6 5.6l1.4 1.4" />
    <path d="M17 17l1.4 1.4" />
    <path d="M5.6 18.4l1.4-1.4" />
    <path d="M17 7l1.4-1.4" />
  </svg>
);

const IconTag = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconBarChart = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconPalette = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const IconRocket = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconTrendUp = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconFolder = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconPaperclip = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconX = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMenu = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconUpload = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconImage = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

interface WorkflowStepData {
  step: number;
  command: string;
  description: string;
  flags?: string[];
  required?: boolean;
  gateway?: boolean;
  note?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  metadata?: {
    optimizedPrompt?: string;
    suggestedCommand?: string;
    commandReason?: string;
    alternativeCommands?: string[];
    relatedCommands?: string[];
    detectedIntent?: string;
    confidence?: number;
    needsWorkflow?: boolean;
    suggestedWorkflow?: {
      id: string;
      name: string;
      description: string;
      steps: WorkflowStepData[];
      difficulty: string;
      timeEstimate: string;
    };
    workflowReason?: string;
    alternativeWorkflows?: Workflow[];
    taskAnalysis?: {
      complexity: "simple" | "medium" | "complex";
      suggestedApproach: string;
    };
  };
}

interface CommandCardProps {
  command: Command;
  onClick?: () => void;
  isRecommended?: boolean;
  onViewDetails?: (cmd: Command) => void;
}

function CommandCard({ command, onClick, isRecommended, onViewDetails }: CommandCardProps) {
  const complexityLevel = command.complexity;
  const isEngineer = command.category === "Engineer" || (command.id && command.id.startsWith("ck:"));

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isRecommended
          ? "bg-blue-500/10 border-blue-500/50"
          : "bg-gray-800 border-gray-700 hover:border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <code className="text-blue-400 font-mono font-bold text-sm">{command.name}</code>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isEngineer ? "text-blue-400" : "text-purple-400"}`}>
            {isEngineer ? <IconTool className="w-3.5 h-3.5" /> : <IconSpeaker className="w-3.5 h-3.5" />}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: complexityLevel }).map((_, i) => (
              <IconBolt key={i} className="w-3 h-3 text-yellow-500" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2 mb-2">{command.description}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onClick}
          className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
        >
          Dùng lệnh
        </button>
        <button
          onClick={() => onViewDetails?.(command)}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition flex items-center justify-center"
          title="Xem chi tiết"
        >
          <IconInfo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Workflow Step Component with connecting arrow
function WorkflowStep({
  step,
  isLast,
  onInsert
}: {
  step: WorkflowStepData;
  isLast: boolean;
  onInsert: (text: string) => void;
}) {
  const getBadgeColor = () => {
    if (step.gateway) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (step.required) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-gray-700 text-gray-400 border-gray-600";
  };

  return (
    <div className="flex gap-3">
      {/* Step number circle */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {step.step}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gray-700 my-2" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-4">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <code
                  className="text-blue-400 font-mono font-bold cursor-pointer hover:underline"
                  onClick={() => onInsert(`${step.command} ${step.flags?.join(" ") || ""}`)}
                >
                  {step.command}
                </code>
                {step.flags && step.flags.length > 0 && (
                  <span className="text-xs text-gray-500">{step.flags.join(" ")}</span>
                )}
                {step.gateway && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <IconAlert className="w-3 h-3" />
                    BẮT BUỘC
                  </span>
                )}
                {step.required && !step.gateway && (
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Nên làm
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300 mt-1">{step.description}</p>
              {step.note && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <IconLightbulb className="w-3 h-3" />
                  {step.note}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Workflow Card Component
function WorkflowCard({
  workflow,
  isPrimary = false,
  onInsert,
  onSelect
}: {
  workflow: Workflow;
  isPrimary?: boolean;
  onInsert: (text: string) => void;
  onSelect: () => void;
}) {
  const display = formatWorkflowForDisplay(workflow);

  const getDifficultyColor = () => {
    switch (workflow.difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-400";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "Advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-700 text-gray-400";
    }
  };

  const getKitIcon = () => {
    if (workflow.kit === "engineer") return <IconTool className="w-3 h-3" />;
    if (workflow.kit === "marketing") return <IconSpeaker className="w-3 h-3" />;
    return (
      <>
        <IconTool className="w-3 h-3" />
        <IconSpeaker className="w-3 h-3" />
      </>
    );
  };

  const getKitText = () => {
    if (workflow.kit === "engineer") return "Engineer Kit";
    if (workflow.kit === "marketing") return "Marketing Kit";
    return "Engineer + Marketing Kits";
  };

  return (
    <div className={`rounded-lg border overflow-hidden transition-all ${
      isPrimary
        ? "bg-blue-500/5 border-blue-500/30"
        : "bg-gray-800 border-gray-700 hover:border-gray-600"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-gray-200">{display.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor()}`}>
              {workflow.difficulty}
            </span>
            <span className="text-xs text-gray-500">{workflow.timeEstimate}</span>
            {isPrimary && (
              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <IconStar className="w-3 h-3" />
                Phù hợp nhất
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">{display.subtitle}</p>
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          {getKitIcon()}
          <span className="ml-1">{getKitText()}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4">
        <div className="space-y-0">
          {workflow.steps.map((step, index) => (
            <WorkflowStep
              key={step.step}
              step={step}
              isLast={index === workflow.steps.length - 1}
              onInsert={onInsert}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-3 border-t border-gray-700 flex gap-2">
          <button
            onClick={onSelect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            Sử dụng workflow này
          </button>
          <button
            onClick={() => onInsert(workflow.steps.map(s => s.command).join(" → "))}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition"
          >
            Copy commands
          </button>
        </div>
      </div>
    </div>
  );
}

// Workflow Browser Component
function WorkflowBrowser({
  onSelectWorkflow,
  onInsert
}: {
  onSelectWorkflow: (wf: Workflow) => void;
  onInsert: (text: string) => void;
}) {
  const [wfFilter, setWfFilter] = useState<"all" | "engineer" | "marketing">("all");

  const filteredWorkflows = workflows.filter((wf) => {
    if (wfFilter === "all") return true;
    return wf.kit === wfFilter || wf.kit === "both";
  });

  return (
    <div className="flex flex-col h-full">
      {/* Kit Filter */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setWfFilter("all")}
          className={`flex-1 py-2 text-xs font-medium transition ${
            wfFilter === "all" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setWfFilter("engineer")}
          className={`flex-1 py-2 text-xs font-medium transition flex items-center justify-center gap-1 ${
            wfFilter === "engineer" ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <IconTool className="w-3 h-3" />
          Engineer
        </button>
        <button
          onClick={() => setWfFilter("marketing")}
          className={`flex-1 py-2 text-xs font-medium transition flex items-center justify-center gap-1 ${
            wfFilter === "marketing" ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <IconSpeaker className="w-3 h-3" />
          Marketing
        </button>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredWorkflows.map((wf) => (
          <div
            key={wf.id}
            className={`p-3 rounded-lg border transition-all hover:border-gray-600 ${
              wf.kit === "engineer" ? "bg-blue-500/5 border-blue-500/20" :
              wf.kit === "marketing" ? "bg-purple-500/5 border-purple-500/20" :
              "bg-gray-800 border-gray-700"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-200">{wf.name}</h3>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                wf.difficulty === "Beginner" ? "bg-green-500/20 text-green-400" :
                wf.difficulty === "Intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {wf.difficulty}
              </span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{wf.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{wf.timeEstimate}</span>
              <span>{wf.steps.length} bước</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onSelectWorkflow(wf)}
                className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-xs transition"
              >
                Xem chi tiết
              </button>
              <button
                onClick={() => onInsert(wf.steps.map(s => s.command).join(" → "))}
                className="px-2 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Command Detail Modal Component
function CommandDetailModal({
  command,
  onClose,
  onUse
}: {
  command: Command;
  onClose: () => void;
  onUse: (cmd: string) => void;
}) {
  const complexityLevel = command.complexity;
  const isEngineer = command.category === "Engineer" || command.id.startsWith("ck:");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <code className="text-xl font-mono font-bold text-blue-400">{command.name}</code>
              <span className={`text-xs ${isEngineer ? "text-blue-400" : "text-purple-400"}`}>
                {isEngineer ? <IconTool className="w-4 h-4" /> : <IconSpeaker className="w-4 h-4" />}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{command.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Complexity & Category */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <span className="text-xs text-gray-500">Độ phức tạp:</span>
              <span className="ml-2 text-yellow-500 flex items-center gap-0.5 inline-flex">
                {Array.from({ length: complexityLevel }).map((_, i) => (
                  <IconBolt key={i} className="w-4 h-4" />
                ))}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Danh mục:</span>
              <span className="ml-2 text-blue-400">{command.category}</span>
            </div>
          </div>

          {/* Arguments */}
          {command.args && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconFileText className="w-4 h-4" />
                Tham số:
              </h4>
              <code className="text-sm bg-gray-900 px-2 py-1 rounded text-green-400">{command.args}</code>
            </div>
          )}

          {/* Variants */}
          {command.variants && command.variants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconRefresh className="w-4 h-4" />
                Biến thể:
              </h4>
              <div className="flex flex-wrap gap-2">
                {command.variants.map((v) => (
                  <code key={v} className="text-xs bg-gray-900 px-2 py-1 rounded text-blue-400">{v}</code>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <IconTag className="w-4 h-4" />
              Từ khóa:
            </h4>
            <div className="flex flex-wrap gap-1">
              {command.keywords.map((k) => (
                <span key={k} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{k}</span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <IconLightbulb className="w-4 h-4" />
              Ví dụ sử dụng:
            </h4>
            <ul className="space-y-1">
              {command.useCases.map((use, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex gap-2">
          <button
            onClick={() => {
              onUse(command.useCases[0] || command.name);
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          >
            Dùng lệnh này
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [kitFilter, setKitFilter] = useState<"all" | "engineer" | "marketing">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"commands" | "workflows">("commands");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      image: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(true);

    setIsStreaming(true);
    setStreamingContent("");

    const assistantMessageId = crypto.randomUUID();
    let finalResult = null;

    try {
      if (uploadedImage) {
        // Use vision API when image is present (non-streaming)
        finalResult = await optimizePromptWithImage(input.trim(), uploadedImage);
      } else {
        // Use streaming for text-only prompts
        for await (const chunk of optimizePromptStream(input.trim())) {
          setStreamingContent(chunk.optimizedPrompt);

          if (chunk.isComplete && chunk.suggestedCommand) {
            finalResult = {
              optimizedPrompt: chunk.optimizedPrompt,
              suggestedCommand: chunk.suggestedCommand,
              commandReason: chunk.commandReason || "",
              alternativeCommands: chunk.alternativeCommands || [],
              confidence: chunk.confidence || 0,
              needsWorkflow: chunk.needsWorkflow,
              suggestedWorkflow: chunk.suggestedWorkflow,
              workflowReason: chunk.workflowReason,
            };
          }
        }
      }

      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: finalResult
          ? (finalResult.needsWorkflow
              ? `Tôi đề xuất workflow "${finalResult.suggestedWorkflow?.name}" cho task này.`
              : `Dựa trên mô tả của bạn, tôi đề xuất sử dụng: ${finalResult.suggestedCommand}`)
          : streamingContent || "Đang phân tích...",
        metadata: finalResult
          ? {
              optimizedPrompt: finalResult.optimizedPrompt,
              suggestedCommand: finalResult.suggestedCommand,
              commandReason: finalResult.commandReason,
              alternativeCommands: finalResult.alternativeCommands,
              confidence: finalResult.confidence,
              needsWorkflow: finalResult.needsWorkflow,
              suggestedWorkflow: finalResult.suggestedWorkflow,
              workflowReason: finalResult.workflowReason,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const insertExample = (text: string) => {
    setInput(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const selectWorkflow = (workflow: Workflow) => {
    setShowWorkflows(true);
    const workflowMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Workflow: ${workflow.name}`,
      metadata: {
        needsWorkflow: true,
        suggestedWorkflow: workflow as unknown as WorkflowStepData[],
      },
    };
    setMessages((prev) => [...prev, workflowMessage]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isEngineerCommand = (cmd: Command) =>
    cmd.category === "Engineer" ||
    (cmd.id && cmd.id.startsWith("ck:")) ||
    cmd.name.startsWith("/ck:") ||
    cmd.name.startsWith("/design") ||
    cmd.name.startsWith("/frontend") ||
    cmd.name.startsWith("/ui") ||
    cmd.name.startsWith("/code") ||
    cmd.name.startsWith("/debug") ||
    cmd.name.startsWith("/deploy") ||
    cmd.name.startsWith("/test") ||
    cmd.name.startsWith("/doc");

  const isMarketingCommand = (cmd: Command) =>
    cmd.category === "Marketing" ||
    cmd.name.startsWith("/campaign/") ||
    cmd.name.startsWith("/email/") ||
    cmd.name.startsWith("/video/") ||
    cmd.name.startsWith("/brainstorm") ||
    cmd.name.startsWith("/funnel") ||
    cmd.name.startsWith("/lead") ||
    cmd.name.startsWith("/upsell") ||
    cmd.name.startsWith("/continuity") ||
    cmd.name.startsWith("/analytics") ||
    cmd.name.startsWith("/sale") ||
    cmd.name.startsWith("/attraction");

  const filteredCommands = commands.filter((cmd) => {
    if (selectedCategory && cmd.category !== selectedCategory) return false;
    if (kitFilter === "engineer" && !isEngineerCommand(cmd)) return false;
    if (kitFilter === "marketing" && !isMarketingCommand(cmd)) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = cmd.name.toLowerCase().includes(query);
      const matchesDesc = cmd.description.toLowerCase().includes(query);
      const matchesKeywords = cmd.keywords.some(k => k.toLowerCase().includes(query));
      const matchesUseCases = cmd.useCases.some(u => u.toLowerCase().includes(query));
      return matchesName || matchesDesc || matchesKeywords || matchesUseCases;
    }

    return true;
  });

  const engineerCount = commands.filter(isEngineerCommand).length;
  const marketingCount = commands.filter(isMarketingCommand).length;
  const workflowCount = 14;

  return (
    <div className="flex h-screen bg-[#1e1e1e]">
      {/* Sidebar - Command & Workflow Browser */}
      <div className={`${showCommands ? "w-96" : "w-0"} transition-all duration-300 border-r border-gray-800 overflow-hidden flex flex-col bg-[#1e1e1e]`}>
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <IconBook className="w-5 h-5" />
            ClaudeKit Commands
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <IconTool className="w-3 h-3" />
              Engineer: {engineerCount}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <IconSpeaker className="w-3 h-3" />
              Marketing: {marketingCount}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <IconRefresh className="w-3 h-3" />
              Workflows: {workflowCount}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveSidebarTab("commands")}
            className={`flex-1 py-2 text-sm font-medium transition flex items-center justify-center gap-1 ${
              activeSidebarTab === "commands"
                ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <IconClipboard className="w-4 h-4" />
            Commands
          </button>
          <button
            onClick={() => setActiveSidebarTab("workflows")}
            className={`flex-1 py-2 text-sm font-medium transition flex items-center justify-center gap-1 ${
              activeSidebarTab === "workflows"
                ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <IconRefresh className="w-4 h-4" />
            Workflows
          </button>
        </div>

        {activeSidebarTab === "commands" ? (
          <>
            {/* Kit Filter Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setKitFilter("all")}
                className={`flex-1 py-2 text-xs font-medium transition ${
                  kitFilter === "all"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setKitFilter("engineer")}
                className={`flex-1 py-2 text-xs font-medium transition flex items-center justify-center gap-1 ${
                  kitFilter === "engineer"
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                <IconTool className="w-3 h-3" />
                Engineer
              </button>
              <button
                onClick={() => setKitFilter("marketing")}
                className={`flex-1 py-2 text-xs font-medium transition flex items-center justify-center gap-1 ${
                  kitFilter === "marketing"
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                <IconSpeaker className="w-3 h-3" />
                Marketing
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-gray-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm lệnh..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="p-2 border-b border-gray-800">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
              >
                <option value="">
                  <span className="flex items-center gap-1">
                    <IconFolder className="w-3 h-3" />
                    Tất cả categories
                  </span>
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Commands List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Không tìm thấy lệnh</p>
                  <p className="text-xs mt-1">Thử từ khóa khác</p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-500 px-1">
                    {filteredCommands.length} lệnh
                  </div>
                  {filteredCommands.map((cmd) => (
                    <CommandCard
                      key={cmd.id}
                      command={cmd}
                      onClick={() => insertExample(cmd.useCases[0] || `Sử dụng ${cmd.name}`)}
                      onViewDetails={setSelectedCommand}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <WorkflowBrowser onSelectWorkflow={selectWorkflow} onInsert={insertExample} />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-gray-800 flex items-center px-4 gap-4">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="p-2 rounded hover:bg-gray-800 flex items-center justify-center"
            title="Toggle command browser"
          >
            <IconMenu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold">ClaudeKit Prompt Optimizer</h1>
          </div>
          <button
            onClick={() => setMessages([])}
            className="text-xs px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
          >
            Clear
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 max-w-lg mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <IconTarget className="w-6 h-6" />
                  Optimize Prompt cho ClaudeKit
                </h2>
                <p className="text-gray-400">
                  Nhập prompt thô → Nhận prompt chuyên nghiệp + gợi ý lệnh phù hợp
                </p>
                <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                  <IconImage className="w-4 h-4" />
                  <strong>Mới:</strong> Hỗ trợ phân tích ảnh - kéo thả hoặc đính kèm ảnh
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: IconBolt, text: "Tạo tính năng login với NextAuth", cmd: "/ck:cook", workflow: true },
                  { icon: IconTool, text: "Sửa lỗi TypeScript trong auth.ts", cmd: "/ck:fix:types" },
                  { icon: IconBarChart, text: "Lập kế hoạch cho dashboard analytics", cmd: "/ck:plan" },
                  { icon: IconPalette, text: "Design UI cho landing page", cmd: "/design/good" },
                  { icon: IconRocket, text: "Khởi tạo project mới với Astro", cmd: "/ck:bootstrap", workflow: true },
                  { icon: IconTrendUp, text: "Launch chiến dịch marketing Q1", cmd: "/campaign/create", workflow: true },
                ].map((example) => (
                  <button
                    key={example.text}
                    onClick={() => insertExample(example.text)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-left transition"
                  >
                    <span className="text-gray-400">
                      <example.icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1">{example.text}</span>
                    <div className="flex items-center gap-2">
                      {example.workflow && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          workflow
                        </span>
                      )}
                      <code className="text-xs text-blue-400">{example.cmd}</code>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
                <IconLightbulb className="w-3 h-3" />
                Click
                <IconBook className="w-3 h-3" />
                để xem tất cả {commands.length} lệnh và 10+ workflows
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  {/* User message with image */}
                  {msg.role === "user" && msg.image && (
                    <div className="mb-3">
                      <div className="relative inline-block">
                        <img
                          src={msg.image}
                          alt="Uploaded"
                          className="max-w-[280px] max-h-[200px] rounded-lg object-cover border border-white/20"
                        />
                        <div className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur rounded-full p-1">
                          <IconImage className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.content && <p>{msg.content}</p>}

                  {/* Assistant metadata */}
                  {msg.role === "assistant" && msg.metadata && (
                    <div className="mt-4 space-y-4">
                      {/* Task Analysis */}
                      {msg.metadata.taskAnalysis && (
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-sm text-blue-400 font-medium flex items-center gap-2">
                            <IconBarChart className="w-4 h-4" />
                            Phân tích task: {msg.metadata.taskAnalysis.complexity}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {msg.metadata.taskAnalysis.suggestedApproach}
                          </p>
                        </div>
                      )}

                      {/* Detected intent */}
                      {msg.metadata.detectedIntent && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <IconCheck className="w-4 h-4" />
                          Intent phát hiện: {msg.metadata.detectedIntent}
                        </div>
                      )}

                      {/* Optimized Prompt */}
                      {msg.metadata.optimizedPrompt && (
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                              <IconSparkles className="w-4 h-4" />
                              Prompt đã optimize
                            </span>
                            <button
                              onClick={() => copyToClipboard(msg.metadata!.optimizedPrompt!)}
                              className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-gray-950 rounded p-3 overflow-x-auto">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                              {msg.metadata.optimizedPrompt}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Workflow Suggestion */}
                      {msg.metadata.needsWorkflow && msg.metadata.suggestedWorkflow && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-medium flex items-center gap-2">
                              <IconRefresh className="w-4 h-4" />
                              Workflow được đề xuất
                            </span>
                            {msg.metadata.workflowReason && (
                              <span className="text-xs text-gray-500">
                                {msg.metadata.workflowReason}
                              </span>
                            )}
                          </div>

                          <WorkflowCard
                            workflow={msg.metadata.suggestedWorkflow as Workflow}
                            isPrimary={true}
                            onInsert={insertExample}
                            onSelect={() => selectWorkflow(msg.metadata!.suggestedWorkflow as Workflow)}
                          />

                          {/* Alternative workflows */}
                          {msg.metadata.alternativeWorkflows && msg.metadata.alternativeWorkflows.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-400 mb-2">Workflow thay thế:</p>
                              <div className="space-y-2">
                                {msg.metadata.alternativeWorkflows.map((wf) => (
                                  <WorkflowCard
                                    key={wf.id}
                                    workflow={wf}
                                    onInsert={insertExample}
                                    onSelect={() => selectWorkflow(wf)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Single Command Suggestion (when no workflow) */}
                      {!msg.metadata.needsWorkflow && msg.metadata.suggestedCommand && (
                        <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <code className="text-lg font-mono font-bold text-yellow-400">
                                {msg.metadata.suggestedCommand}
                              </code>
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                Gợi ý chính
                              </span>
                            </div>
                            {msg.metadata.confidence && (
                              <span className="text-xs text-gray-500">
                                Confidence: {Math.round(msg.metadata.confidence * 100)}%
                              </span>
                            )}
                          </div>

                          {msg.metadata.commandReason && (
                            <p className="text-sm text-gray-400 mb-3">
                              {msg.metadata.commandReason}
                            </p>
                          )}

                          {/* Alternative commands */}
                          {msg.metadata.alternativeCommands &&
                            msg.metadata.alternativeCommands.length > 0 && (
                              <div className="pt-2 border-t border-gray-700">
                                <span className="text-xs text-gray-500">Lệnh thay thế: </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {msg.metadata.alternativeCommands.map((cmd) => (
                                    <button
                                      key={cmd}
                                      onClick={() => insertExample(cmd)}
                                      className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                                    >
                                      {cmd}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Related commands */}
                      {msg.metadata.relatedCommands &&
                        msg.metadata.relatedCommands.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <span>Lệnh liên quan: </span>
                            {msg.metadata.relatedCommands.map((cmd) => (
                              <button
                                key={cmd}
                                onClick={() => insertExample(cmd)}
                                className="mx-1 text-gray-400 hover:text-white underline"
                              >
                                {cmd}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg px-4 py-3 flex flex-col gap-2 border border-gray-700 max-w-[90%]">
                {isStreaming && streamingContent ? (
                  <div className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                    {streamingContent}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-gray-400 text-sm ml-2">AI đang phân tích workflow...</span>
                  </div>
                )}
                {isStreaming && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>đang stream...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          {/* Drag overlay */}
          <div
            className={`fixed inset-0 bg-blue-600/20 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity ${
              isDragging ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-blue-400 shadow-2xl">
              <IconUpload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium text-center">Thả ảnh vào đây</p>
              <p className="text-gray-400 text-sm text-center mt-1">Hỗ trợ JPG, PNG, GIF (tối đa 5MB)</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={() => setIsDragging(true)}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-400 hover:text-white transition flex items-center justify-center"
              title="Đính kèm ảnh (hoặc kéo thả)"
            >
              <IconImage className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={uploadedImage ? "Mô tả ảnh của bạn..." : "Mô tả task của bạn... (Shift+Enter để xuống dòng, hoặc kéo thả ảnh)"}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none min-h-[56px] max-h-[200px] focus:outline-none focus:border-blue-500"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !uploadedImage) || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Gửi
            </button>
          </form>

          {/* Image preview */}
          {uploadedImage && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="relative">
                <img src={uploadedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                  <IconImage className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 font-medium truncate">Ảnh đã chọn</p>
                <p className="text-xs text-gray-500">Sẵn sàng phân tích</p>
              </div>
              <button
                type="button"
                onClick={clearUploadedImage}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
                title="Xóa ảnh"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
            <span className="flex items-center gap-1">
              <IconTool className="w-3 h-3" />
              {engineerCount} Engineer commands
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <IconSpeaker className="w-3 h-3" />
              {marketingCount} Marketing commands
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <IconRefresh className="w-3 h-3" />
              {workflowCount} workflows
            </span>
          </p>
        </div>
      </div>

      {/* Command Detail Modal */}
      {selectedCommand && (
        <CommandDetailModal
          command={selectedCommand}
          onClose={() => setSelectedCommand(null)}
          onUse={insertExample}
        />
      )}
    </div>
  );
}


