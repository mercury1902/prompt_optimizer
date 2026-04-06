import type { Tool, ToolRegistry, ToolExecution, ToolCall, ToolResult } from "./tool-system-types";
import { tavilyWebSearchTool } from "./tavily-web-search-tool-implementation";
import { e2bCodeExecutionTool } from "./e2b-code-execution-tool-implementation";

const registry: ToolRegistry = new Map();

export function registerTool(tool: Tool): void {
  registry.set(tool.definition.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return registry.get(name);
}

export function getAllTools(): Tool[] {
  return Array.from(registry.values());
}

export function getToolDefinitions() {
  return getAllTools().map((tool) => tool.definition);
}

export function hasTool(name: string): boolean {
  return registry.has(name);
}

export async function executeTool(
  toolCall: ToolCall
): Promise<ToolResult> {
  const tool = getTool(toolCall.name);

  if (!tool) {
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: null,
      error: `Tool "${toolCall.name}" not found`,
    };
  }

  const startTime = Date.now();

  try {
    const result = await tool.execute(toolCall.arguments);
    const duration = Date.now() - startTime;

    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: null,
      error: errorMessage,
      duration,
    };
  }
}

export async function executeToolsConcurrently(
  toolCalls: ToolCall[]
): Promise<ToolResult[]> {
  const executions = toolCalls.map((toolCall) => executeTool(toolCall));
  return Promise.all(executions);
}

export function createToolExecution(
  toolCall: ToolCall
): ToolExecution {
  return {
    toolCall,
    status: "pending",
  };
}

export function updateToolExecution(
  execution: ToolExecution,
  updates: Partial<ToolExecution>
): ToolExecution {
  return {
    ...execution,
    ...updates,
  };
}

registerTool(tavilyWebSearchTool);
registerTool(e2bCodeExecutionTool);

export { registry };
