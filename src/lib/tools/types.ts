export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required?: boolean;
  enum?: string[];
  items?: {
    type: string;
  };
  properties?: Record<string, ToolParameter>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  error?: string;
  duration?: number;
}

export interface ToolExecution {
  toolCall: ToolCall;
  status: "pending" | "running" | "completed" | "error";
  result?: ToolResult;
  startTime?: Date;
  endTime?: Date;
}

export interface Tool {
  definition: ToolDefinition;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export type ToolRegistry = Map<string, Tool>;
