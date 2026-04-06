import type { Tool, ToolDefinition, ToolParameter } from "./tool-system-types";

const TavilySearchParameters: Record<string, ToolParameter> = {
  query: {
    name: "query",
    type: "string",
    description: "The search query to execute",
    required: true,
  },
  max_results: {
    name: "max_results",
    type: "number",
    description: "Maximum number of search results to return (1-10)",
    required: false,
  },
  include_answer: {
    name: "include_answer",
    type: "boolean",
    description: "Include an AI-generated answer summarizing the search results",
    required: false,
  },
  search_depth: {
    name: "search_depth",
    type: "string",
    description: "Search depth: 'basic' or 'advanced'",
    required: false,
    enum: ["basic", "advanced"],
  },
};

const TavilyToolDefinition: ToolDefinition = {
  name: "web_search",
  description:
    "Search the web for current information. Use this when you need up-to-date facts, news, or information not in your training data.",
  parameters: {
    type: "object",
    properties: TavilySearchParameters,
    required: ["query"],
  },
};

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
  response_time: number;
}

async function executeTavilySearch(
  args: Record<string, unknown>
): Promise<TavilySearchResponse> {
  const apiKey = import.meta.env.PUBLIC_TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY not configured");
  }

  const query = args.query as string;
  const maxResults = (args.max_results as number) || 5;
  const includeAnswer = (args.include_answer as boolean) ?? true;
  const searchDepth = (args.search_depth as string) || "basic";

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.min(Math.max(maxResults, 1), 10),
      include_answer: includeAnswer,
      search_depth: searchDepth,
      include_images: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as TavilySearchResponse;
  return data;
}

export const tavilyWebSearchTool: Tool = {
  definition: TavilyToolDefinition,
  execute: executeTavilySearch,
};
