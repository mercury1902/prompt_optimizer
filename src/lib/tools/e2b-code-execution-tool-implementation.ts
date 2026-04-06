import type { Tool, ToolDefinition, ToolParameter } from "./tool-system-types";

const CodeExecutionParameters: Record<string, ToolParameter> = {
  code: {
    name: "code",
    type: "string",
    description: "The code to execute",
    required: true,
  },
  language: {
    name: "language",
    type: "string",
    description: "Programming language (python, javascript, typescript, bash, sh, go, rust, java, cpp, c)",
    required: true,
    enum: [
      "python",
      "javascript",
      "typescript",
      "bash",
      "sh",
      "go",
      "rust",
      "java",
      "cpp",
      "c",
    ],
  },
  timeout: {
    name: "timeout",
    type: "number",
    description: "Execution timeout in seconds (max 60)",
    required: false,
  },
};

const CodeExecutionToolDefinition: ToolDefinition = {
  name: "execute_code",
  description:
    "Execute code in a secure sandbox environment. Use this for calculations, data processing, or running scripts. Supports Python, JavaScript, TypeScript, Bash, and other languages.",
  parameters: {
    type: "object",
    properties: CodeExecutionParameters,
    required: ["code", "language"],
  },
};

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
  executionTime: number;
}

async function executeCodeInSandbox(
  args: Record<string, unknown>
): Promise<CodeExecutionResult> {
  const apiKey = import.meta.env.PUBLIC_E2B_API_KEY;

  if (!apiKey) {
    throw new Error("E2B_API_KEY not configured");
  }

  const code = args.code as string;
  const language = (args.language as string) || "python";
  const timeout = Math.min((args.timeout as number) || 30, 60);

  const template = getLanguageTemplate(language);

  try {
    const response = await fetch("https://api.e2b.dev/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template,
        code,
        timeout,
        environment_variables: {},
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`E2B API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      stdout: string;
      stderr: string;
      exit_code: number;
      error?: string;
      execution_time: number;
    };

    return {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      exitCode: data.exit_code,
      error: data.error,
      executionTime: data.execution_time,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Code execution failed: ${String(error)}`);
  }
}

function getLanguageTemplate(language: string): string {
  const templateMap: Record<string, string> = {
    python: "python-3.11",
    javascript: "node-20",
    typescript: "node-20-ts",
    bash: "bash",
    sh: "bash",
    go: "go-1.21",
    rust: "rust-1.75",
    java: "java-21",
    cpp: "cpp-14",
    c: "c-14",
  };

  return templateMap[language.toLowerCase()] || "python-3.11";
}

export const e2bCodeExecutionTool: Tool = {
  definition: CodeExecutionToolDefinition,
  execute: executeCodeInSandbox,
};
