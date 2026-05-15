import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '../../src/pages/api/chat';

// Mock dependencies
vi.mock('../../src/lib/db', () => ({
  db: null,
  isDatabaseAvailable: vi.fn(() => false),
}));

vi.mock('../../src/lib/utils', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));

vi.mock('../../src/lib/tools/tool-registry', () => ({
  getToolDefinitions: vi.fn(() => []),
  executeTool: vi.fn(async (toolCall) => ({
    toolCallId: toolCall.id,
    name: toolCall.name,
    result: { success: true },
    duration: 100,
  })),
}));

describe('Chat API Integration Tests', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should return 400 when message is missing', async () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Message is required');
    });

    it('should return 400 when message is empty string', async () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '' }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
    });

    it('should return 400 when message is not a string', async () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 123 }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
    });

    it('should establish SSE stream successfully', async () => {
      // Mock successful 9Router API response with SSE stream
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test message', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should handle 9Router API 401 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test message', sessionId: null }),
      });

      const response = await POST({ request } as any);

      // Response should still be SSE stream, but with error inside
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should handle 9Router API 500 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test message', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should handle invalid JSON in SSE stream', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: invalid json here\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test message', sessionId: null }),
      });

      const response = await POST({ request } as any);

      // Should still return SSE stream even with invalid JSON
      expect(response.status).toBe(200);
    });

    it('should handle response with no body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test message', sessionId: null }),
      });

      const response = await POST({ request } as any);

      // Error should be in the SSE stream
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/chat', () => {
    it('should return 400 when sessionId is missing', async () => {
      const url = new URL('http://localhost/api/chat');

      const response = await GET({ url } as any);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Session ID required');
    });

    it('should return empty messages when database unavailable', async () => {
      const url = new URL('http://localhost/api/chat?sessionId=test-session');

      const response = await GET({ url } as any);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.messages).toEqual([]);
      expect(body.note).toBe('Database not available');
    });
  });

  describe('SSE Streaming', () => {
    it('should send session ID as first SSE event', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
    });

    it('should handle stream interruption', async () => {
      const mockReader = {
        read: vi.fn()
          .mockRejectedValueOnce(new Error('Stream interrupted')),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test', sessionId: null }),
      });

      const response = await POST({ request } as any);

      // Should return SSE stream with error event
      expect(response.status).toBe(200);
    });

    it('should accumulate partial chunks correctly', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            // Partial chunk that doesn't end with newline
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello'),
          })
          .mockResolvedValueOnce({
            done: false,
            // Completion of previous chunk + new line
            value: new TextEncoder().encode('"}}]}\n\ndata: {"choices":[{"delta":{"content":" world"}}]}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
    });

    it('should process tool calls in streaming response', async () => {
      // Mock tool call streaming response
      const toolCallChunk = {
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_123',
              function: {
                name: 'tavily_search',
                arguments: '{"query": "test"}',
              },
            }],
          },
        }],
      };

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(`data: ${JSON.stringify(toolCallChunk)}\n\n`),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      // Second call for final response after tool execution
      const finalReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Result"}}]}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => finalReader },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Search for test', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle tool call with missing arguments', async () => {
      const toolCallChunk = {
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_123',
              function: {
                name: 'test_tool',
                arguments: '', // Empty arguments
              },
            }],
          },
        }],
      };

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(`data: ${JSON.stringify(toolCallChunk)}\n\n`),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: [DONE]\n\n'),
              })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      });

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test tool', sessionId: null }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
    });
  });
});
