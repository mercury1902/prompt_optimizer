export interface ParsedPromptResult {
  optimizedPrompt: string;
  optimizedPromptEn?: string;
  optimizedPromptVi?: string;
  suggestedCommand: string;
  explanation: string;
  rawContent: string;
  detectedInputLanguage?: 'vi' | 'en' | 'mixed';
}

/**
 * Parse AI response into structured sections
 * Expected format:
 * ✅ **Prompt đã tối ưu:**
 * [content]
 *
 * 💡 **Command đề xuất:**
 * [content]
 *
 * 🎯 **Lý do chọn command:**
 * [content]
 */
export function parsePromptResult(content: string): ParsedPromptResult {
  const jsonParsedResult = parseJsonPromptResult(content);
  if (jsonParsedResult) {
    return jsonParsedResult;
  }

  const result: ParsedPromptResult = {
    optimizedPrompt: '',
    suggestedCommand: '',
    explanation: '',
    rawContent: content,
  };

  if (!content) return result;

  // Find section markers
  const optimizedMarker = content.indexOf('✅');
  const commandMarker = content.indexOf('💡');
  const explanationMarker = content.indexOf('🎯');

  // Extract Optimized Prompt (between ✅ and 💡)
  if (optimizedMarker !== -1 && commandMarker !== -1) {
    const start = optimizedMarker;
    const end = commandMarker;
    let section = content.slice(start, end).trim();
    // Remove the marker and title line
    section = section.replace(/^✅\s*\*?\*?Prompt đã tối ưu:?\*?\*?\s*:?\s*/i, '');
    section = section.replace(/^✅\s*\*?\*?.*\*?\*?\s*/, '');
    result.optimizedPrompt = section.trim();
  } else if (optimizedMarker !== -1) {
    // Only optimized section exists
    let section = content.slice(optimizedMarker).trim();
    section = section.replace(/^✅\s*\*?\*?.*\*?\*?\s*/, '');
    result.optimizedPrompt = section.trim();
  }

  // Extract Command (between 💡 and 🎯)
  if (commandMarker !== -1 && explanationMarker !== -1) {
    const start = commandMarker;
    const end = explanationMarker;
    let section = content.slice(start, end).trim();
    section = section.replace(/^💡\s*\*?\*?Command đề xuất:?\*?\*?\s*:?\s*/i, '');
    section = section.replace(/^💡\s*\*?\*?.*\*?\*?\s*/, '');
    result.suggestedCommand = section.trim();
  } else if (commandMarker !== -1 && explanationMarker === -1) {
    // Command is the last section
    let section = content.slice(commandMarker).trim();
    section = section.replace(/^💡\s*\*?\*?.*\*?\*?\s*/, '');
    result.suggestedCommand = section.trim();
  }

  // Extract Explanation (after 🎯)
  if (explanationMarker !== -1) {
    let section = content.slice(explanationMarker).trim();
    section = section.replace(/^🎯\s*\*?\*?Lý do chọn command:?\*?\*?\s*:?\s*/i, '');
    section = section.replace(/^🎯\s*\*?\*?.*\*?\*?\s*/, '');
    result.explanation = section.trim();
  }

  return result;
}

function parseJsonPromptResult(content: string): ParsedPromptResult | null {
  const raw = extractJsonObject(content);
  if (!raw) return null;

  const optimizedPromptEn = String(raw.optimizedPromptEn ?? '').trim();
  const optimizedPromptVi = String(raw.optimizedPromptVi ?? '').trim();
  const fallbackPrompt = String(raw.optimizedPrompt ?? '').trim();
  const suggestedCommand = String(raw.suggestedCommand ?? raw.command ?? '').trim();
  const explanation = String(raw.explanation ?? raw.reason ?? '').trim();
  const detectedInputLanguage = String(raw.detectedInputLanguage ?? 'mixed').trim().toLowerCase();

  if (!suggestedCommand || (!optimizedPromptEn && !optimizedPromptVi && !fallbackPrompt)) {
    return null;
  }

  const normalizedEn = optimizedPromptEn || fallbackPrompt || optimizedPromptVi;
  const normalizedVi = optimizedPromptVi || fallbackPrompt || optimizedPromptEn;

  return {
    optimizedPrompt: normalizedEn,
    optimizedPromptEn: normalizedEn,
    optimizedPromptVi: normalizedVi,
    suggestedCommand,
    explanation,
    rawContent: content,
    detectedInputLanguage:
      detectedInputLanguage === 'vi' || detectedInputLanguage === 'en' || detectedInputLanguage === 'mixed'
        ? detectedInputLanguage
        : 'mixed',
  };
}

function extractJsonObject(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(withoutFence) as Record<string, unknown>;
  } catch {
    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    try {
      return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

/**
 * Check if content follows the expected structured format
 */
export function isStructuredFormat(content: string): boolean {
  if (content.includes('✅') && content.includes('💡')) {
    return true;
  }

  const jsonObject = extractJsonObject(content);
  if (!jsonObject) return false;
  return typeof jsonObject.suggestedCommand === 'string';
}

/**
 * Extract just the command without explanation
 * e.g., "/ck:cook --feature" from a longer text
 */
export function extractCommand(text: string): string {
  // Look for /ck: commands
  const match = text.match(/(\/ck:[a-zA-Z0-9-]+(?::[a-zA-Z0-9-]+)*(?:\s+--?[\w-]+)*)/);
  return match ? match[1] : text;
}

/**
 * Format optimized prompt for display
 */
export function formatOptimizedPrompt(prompt: string): string {
  return prompt
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Store optimized prompt in session storage for use in chat
 */
export function storePromptForChat(prompt: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('optimizedPrompt', prompt);
  }
}

/**
 * Retrieve stored prompt from session storage
 */
export function getStoredPrompt(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('optimizedPrompt');
  }
  return null;
}

/**
 * Clear stored prompt from session storage
 */
export function clearStoredPrompt(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('optimizedPrompt');
  }
}
