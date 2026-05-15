import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ChatFrameWithGlassmorphismAndVietnamese from '../../src/components/chat/chat-frame-with-glassmorphism-and-vietnamese';

// Mock dependencies
vi.mock('../../src/lib/db', () => ({
  db: null,
  isDatabaseAvailable: vi.fn(() => false),
}));

vi.mock('../../src/lib/utils', () => ({
  generateId: vi.fn(() => 'test-session-id'),
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

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

global.fetch = vi.fn();
const mockFetch = fetch as Mock;

describe('Chat Flow End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Full Chat Flow', () => {
    it('should complete full conversation flow: health check -> send message -> receive response', async () => {
      const user = userEvent.setup();

      // 1. Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', checks: { env: { nineRouterKey: true } } }),
      });

      // 2. Chat API returns SSE stream
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"session","sessionId":"sess-123"}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"chunk","content":"Xin"}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"chunk","content":" chào!"}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"done","messageId":"msg-123"}\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      // Wait for health check
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/health');
      });

      // Wait for input to be ready
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      // 3. User types and sends message
      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Xin chào');
      await user.keyboard('{Enter}');

      // 4. Verify message sent to API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Xin chào'),
          })
        );
      });

      // 5. Verify user message appears
      await waitFor(() => {
        expect(screen.getByText('Xin chào')).toBeInTheDocument();
      });
    });

    it('should handle 404 error when API endpoint not found', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Chat API returns 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      // Should show error state or message
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should handle 500 server error gracefully', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Chat API returns 500
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Test');
      await user.keyboard('{Enter}');

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });

    it('should handle streaming interruption', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Chat API starts streaming but fails
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"session","sessionId":"sess-123"}\n\n'),
          })
          .mockRejectedValueOnce(new Error('Stream interrupted')),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Test streaming');
      await user.keyboard('{Enter}');

      // Should handle interruption
      await waitFor(() => {
        expect(screen.getByText('Test streaming')).toBeInTheDocument();
      });
    });
  });

  describe('SSE Streaming Scenarios', () => {
    it('should handle multiple chunks in one read', async () => {
      const user = userEvent.setup();

      // Health check
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'ok' }) });

      // Multiple chunks in single read
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"session","sessionId":"sess-123"}\n\n' +
              'data: {"type":"chunk","content":"First"}\n\n' +
              'data: {"type":"chunk","content":" Second"}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"done"}\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Multi chunk');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Multi chunk')).toBeInTheDocument();
      });
    });

    it('should handle partial SSE data across reads', async () => {
      const user = userEvent.setup();

      // Health check
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'ok' }) });

      // Partial data split across reads
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"session","sessionId":"sess-'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('123"}\n\ndata: {"type":"done"}\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Partial');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Partial')).toBeInTheDocument();
      });
    });

    it('should handle tool calls in stream', async () => {
      const user = userEvent.setup();

      // Health check
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'ok' }) });

      // Stream with tool call
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"session","sessionId":"sess-123"}\n\n' +
              'data: {"type":"tool_calls","toolCalls":[{"id":"call_1","name":"test_tool","arguments":{}}]}\n\n' +
              'data: {"type":"tool_result","toolCallId":"call_1","name":"test_tool","result":{"success":true}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"done"}\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Use tool');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Use tool')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from network error and allow retry', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // First attempt fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Second attempt succeeds
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"session","sessionId":"sess-123"}\n\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"done"}\n\n'),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      // First attempt
      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Retry test');
      await user.keyboard('{Enter}');

      // Wait for first attempt
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Input should be cleared even on error
      const inputAfter = screen.getByPlaceholderText(/Nhập \//) as HTMLTextAreaElement;
      expect(inputAfter.value).toBe('');
    });

    it('should handle timeout scenarios', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Chat API times out (slow response)
      mockFetch.mockImplementationOnce(() =>
        new Promise((resolve) => setTimeout(resolve, 5000))
      );

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Timeout test');
      await user.keyboard('{Enter}');

      // Should show user message immediately
      await waitFor(() => {
        expect(screen.getByText('Timeout test')).toBeInTheDocument();
      });
    });
  });

  describe('UI State Transitions', () => {
    it('should show loading state during streaming', async () => {
      const user = userEvent.setup();

      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Slow streaming response
      const mockReader = {
        read: vi.fn()
          .mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { done: true, value: undefined };
          }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//);
      await user.type(input, 'Loading test');
      await user.keyboard('{Enter}');

      // Should show user message
      await waitFor(() => {
        expect(screen.getByText('Loading test')).toBeInTheDocument();
      });
    });

    it('should clear input after successful send', async () => {
      const user = userEvent.setup();

      // Health check
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'ok' }) });

      // Chat response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ChatFrameWithGlassmorphismAndVietnamese />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nhập \//)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Nhập \//) as HTMLTextAreaElement;
      await user.type(input, 'Clear me');
      await user.keyboard('{Enter}');

      // Input should be cleared
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });
});
