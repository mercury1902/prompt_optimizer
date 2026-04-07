/**
 * Conversation Export Utilities
 * Format and export chat conversations to various formats
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export interface ExportOptions {
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
}

/**
 * Export messages to Markdown format
 */
export function exportToMarkdown(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const { includeTimestamps = true } = options;

  const header = `# ClaudeKit Chat Export\n\n**Ngày:** ${new Date().toLocaleString('vi-VN')}\n**Số tin nhắn:** ${messages.length}\n\n---\n\n`;

  const body = messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'Bạn' : 'ClaudeKit';
      const time = includeTimestamps && msg.createdAt
        ? ` (${new Date(msg.createdAt).toLocaleString('vi-VN')})`
        : '';
      return `## ${role}${time}\n\n${msg.content}`;
    })
    .join('\n\n---\n\n');

  return header + body;
}

/**
 * Export messages to JSON format
 */
export function exportToJSON(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const { includeMetadata = true } = options;

  const exportData = {
    ...(includeMetadata && {
      exportedAt: new Date().toISOString(),
      application: 'ClaudeKit Chat',
      version: '1.0',
    }),
    messageCount: messages.length,
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      ...(msg.createdAt && { createdAt: msg.createdAt.toISOString() }),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download content as file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with error handling
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(format: 'markdown' | 'json'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const extension = format === 'markdown' ? 'md' : 'json';
  return `claudekit-chat-${timestamp}.${extension}`;
}
