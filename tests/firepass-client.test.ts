import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the fetch API
global.fetch = vi.fn();

describe("Firepass Client - Comprehensive Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("API Request Configuration", () => {
    it("should call Firepass API with correct parameters", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Optimized test prompt",
              suggestedCommand: "/ck:cook",
              commandReason: "Test reason",
              alternativeCommands: ["/ck:fix"],
              confidence: 0.9
            })
          }
        }]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("test prompt");

      expect(result.optimizedPrompt).toBe("Optimized test prompt");
      expect(result.suggestedCommand).toBe("/ck:cook");
      expect(result.confidence).toBe(0.9);
    });

    it("should make POST request to correct endpoint", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test prompt");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
    });

    it("should use correct model in request", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test");

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.model).toBeDefined();
    });

    it("should include system prompt and user prompt in messages", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test prompt");

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe("system");
      expect(requestBody.messages[1].role).toBe("user");
      expect(requestBody.messages[1].content).toContain("test prompt");
    });

    it("should use json_object response format", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test");

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.response_format).toEqual({ type: "json_object" });
    });
  });

  describe("Successful Response", () => {
    it("should return OptimizeResult with all required fields", async () => {
      const mockResult = {
        optimizedPrompt: "Create a new authentication feature with login and signup functionality",
        suggestedCommand: "/ck:cook",
        commandReason: "Task requires feature implementation",
        alternativeCommands: ["/ck:plan"],
        confidence: 0.92
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockResult)
            }
          }]
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("make login feature");

      expect(result.optimizedPrompt).toBe(mockResult.optimizedPrompt);
      expect(result.suggestedCommand).toBe(mockResult.suggestedCommand);
      expect(result.commandReason).toBe(mockResult.commandReason);
      expect(result.alternativeCommands).toEqual(mockResult.alternativeCommands);
      expect(result.confidence).toBe(mockResult.confidence);
    });

    it("should handle workflow recommendation response", async () => {
      const mockResult = {
        optimizedPrompt: "Launch complete marketing campaign",
        suggestedCommand: "/ck:plan",
        commandReason: "Complex task needs workflow",
        alternativeCommands: [],
        confidence: 0.88,
        needsWorkflow: true,
        suggestedWorkflow: {
          id: "campaign-launch",
          name: "Marketing Campaign Launch",
          description: "Complete campaign workflow",
          steps: [
            { step: 1, command: "/brainstorm", description: "Ideas" }
          ],
          difficulty: "Advanced",
          timeEstimate: "4-8 hours"
        },
        workflowReason: "Task requires 8 steps"
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockResult)
            }
          }]
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("launch campaign");

      expect(result.needsWorkflow).toBe(true);
      expect(result.suggestedWorkflow).toBeDefined();
      expect(result.suggestedWorkflow?.id).toBe("campaign-launch");
      expect(result.workflowReason).toBe("Task requires 8 steps");
    });

    it("should handle simple task response without workflow", async () => {
      const mockResult = {
        optimizedPrompt: "Fix typo in header",
        suggestedCommand: "/ck:fix:fast",
        commandReason: "Quick fix needed",
        alternativeCommands: ["/ck:fix"],
        confidence: 0.95,
        needsWorkflow: false
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockResult)
            }
          }]
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("fix typo");

      expect(result.needsWorkflow).toBe(false);
      expect(result.suggestedWorkflow).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should throw error on API failure (401)", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow("Firepass API error: 401");
    });

    it("should throw error on API failure (500)", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow("Firepass API error: 500");
    });

    it("should throw error on empty response content", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {}
          }]
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow("Empty response from Firepass API");
    });

    it("should throw error on network failure", async () => {
      (fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow("Network error");
    });

    it("should handle missing choices array", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: []
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow("Empty response from Firepass API");
    });

    it("should handle malformed JSON response", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: "not valid json"
            }
          }]
        })
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await expect(optimizePrompt("test")).rejects.toThrow(SyntaxError);
    });
  });

  describe("Request Configuration", () => {
    it("should use temperature 0.7", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test");

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.temperature).toBe(0.7);
    });

    it("should use max_tokens 4096", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Test",
              suggestedCommand: "/ck:cook",
              commandReason: "Test",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      await optimizePrompt("test");

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.max_tokens).toBe(4096);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty prompt", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "",
              suggestedCommand: "/ck:ask",
              commandReason: "Empty prompt - asking for help",
              alternativeCommands: [],
              confidence: 0.5
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("");

      expect(result.optimizedPrompt).toBe("");
      expect(result.suggestedCommand).toBe("/ck:ask");
    });

    it("should handle very long prompt", async () => {
      const longPrompt = "a".repeat(10000);
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: longPrompt,
              suggestedCommand: "/ck:plan",
              commandReason: "Complex task",
              alternativeCommands: [],
              confidence: 0.9
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt(longPrompt);

      expect(result.optimizedPrompt).toBe(longPrompt);
    });

    it("should handle Vietnamese prompt", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              optimizedPrompt: "Tạo tính năng đăng nhập",
              suggestedCommand: "/ck:cook",
              commandReason: "Feature implementation in Vietnamese",
              alternativeCommands: ["/ck:plan"],
              confidence: 0.92
            })
          }
        }]
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { optimizePrompt } = await import("../src/lib/firepass-client");
      const result = await optimizePrompt("tạo feature login");

      expect(result.suggestedCommand).toBe("/ck:cook");
      expect(result.confidence).toBe(0.92);
    });
  });

  describe("Streaming Support", () => {
    function createMockStream(chunks: string[]) {
      const encoder = new TextEncoder();
      let index = 0;

      return {
        getReader() {
          return {
            read: async () => {
              if (index >= chunks.length) {
                return { done: true, value: undefined };
              }
              const chunk = chunks[index++];
              return { done: false, value: encoder.encode(chunk) };
            },
            releaseLock: () => {}
          };
        }
      };
    }

    it("should stream chunks via generator", async () => {
      const result = {
        optimizedPrompt: "Test prompt",
        suggestedCommand: "/ck:cook",
        commandReason: "Test",
        alternativeCommands: [],
        confidence: 0.9
      };
      const jsonStr = JSON.stringify(result);
      // Properly escape the content chunks for valid JSON
      const chunks = [
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(jsonStr.slice(0, 10)) + '}}]}\n\n',
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(jsonStr.slice(10, 20)) + '}}]}\n\n',
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(jsonStr.slice(20)) + '}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: createMockStream(chunks)
      });

      const { optimizePromptStream } = await import("../src/lib/firepass-client");
      const generator = optimizePromptStream("test");
      const received: string[] = [];

      for await (const chunk of generator) {
        if (!chunk.isComplete) {
          received.push(...chunk.rawChunks);
        }
      }

      expect(received.length).toBeGreaterThan(0);
    });

    it("should call callbacks during streaming", async () => {
      const result = {
        optimizedPrompt: "Test prompt",
        suggestedCommand: "/ck:cook",
        commandReason: "Test",
        alternativeCommands: [],
        confidence: 0.9
      };
      const jsonStr = JSON.stringify(result);
      // Properly escape the content chunks for valid JSON
      const chunks = [
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(jsonStr.slice(0, 10)) + '}}]}\n\n',
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(jsonStr.slice(10)) + '}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: createMockStream(chunks)
      });

      const { optimizePromptStreaming } = await import("../src/lib/firepass-client");
      const onChunk = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await optimizePromptStreaming("test", { onChunk, onComplete, onError });

      expect(onChunk).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("should enable streaming in request body", async () => {
      const chunks = ['data: [DONE]\n\n'];
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: createMockStream(chunks)
      });

      const { optimizePromptStreaming } = await import("../src/lib/firepass-client");
      await optimizePromptStreaming("test", {});

      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.stream).toBe(true);
    });

    it("should handle streaming API errors", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { optimizePromptStreaming } = await import("../src/lib/firepass-client");
      const onError = vi.fn();

      await optimizePromptStreaming("test", { onError });

      expect(onError).toHaveBeenCalled();
    });

    it("should handle missing response body", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: null
      });

      const { optimizePromptStream } = await import("../src/lib/firepass-client");

      await expect(async () => {
        const gen = optimizePromptStream("test");
        await gen.next();
      }).rejects.toThrow("No response body");
    });

    it("should parse final result from streamed chunks", async () => {
      const result = {
        optimizedPrompt: "Final result",
        suggestedCommand: "/ck:test",
        commandReason: "Testing",
        alternativeCommands: [],
        confidence: 0.85
      };
      // Properly escape the content using JSON.stringify
      const chunks = [
        'data: {"choices":[{"delta":{"content":' + JSON.stringify(JSON.stringify(result)) + '}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: createMockStream(chunks)
      });

      const { optimizePromptStreaming } = await import("../src/lib/firepass-client");
      const onComplete = vi.fn();

      await optimizePromptStreaming("test", { onComplete });

      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
        optimizedPrompt: "Final result",
        suggestedCommand: "/ck:test"
      }));
    });

    it("should skip malformed SSE chunks", async () => {
      const chunks = [
        'data: invalid json\n\n',
        'data: {"choices":[{"delta":{"content":' + JSON.stringify('{"test":1}') + '}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        body: createMockStream(chunks)
      });

      const { optimizePromptStreaming } = await import("../src/lib/firepass-client");
      const onChunk = vi.fn();

      await optimizePromptStreaming("test", { onChunk });

      // Should still receive valid chunks
      expect(onChunk).toHaveBeenCalled();
    });

    it("should check streaming support", async () => {
      const { isStreamingSupported } = await import("../src/lib/firepass-client");
      const supported = isStreamingSupported();
      expect(typeof supported).toBe("boolean");
    });
  });
});
