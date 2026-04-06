import { describe, it, expect } from "vitest";
import { commands } from "../src/data/commands";
import { recommendCommands, detectIntent, validateCommand, getRelatedCommands } from "../src/lib/command-recommender";

describe("Command Recommender", () => {
  describe("detectIntent", () => {
    it("should detect /ck:fix intent", () => {
      const result = detectIntent("sửa lỗi bug");
      expect(result).toBeDefined();
      expect(result?.command).toBe("/ck:fix");
      expect(result?.confidence).toBe(0.9);
    });

    it("should detect /ck:cook intent", () => {
      const result = detectIntent("tạo feature mới");
      expect(result?.command).toBe("/ck:cook");
    });

    it("should detect /ck:plan intent", () => {
      const result = detectIntent("lập kế hoạch");
      expect(result?.command).toBe("/ck:plan");
    });

    it("should return null for unknown intent", () => {
      const result = detectIntent("random text");
      expect(result).toBeNull();
    });
  });

  describe("recommendCommands", () => {
    it("should recommend fix-related command for TypeScript errors", () => {
      const result = recommendCommands("sửa lỗi typescript", commands);
      expect(result.primary).toBeDefined();
      // Can be /ck:fix (parent) or /ck:fix:types (specific) - both valid
      expect(result.primary?.command.name.startsWith("/ck:fix")).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should recommend /ck:cook for feature implementation", () => {
      const result = recommendCommands("tạo tính năng login", commands);
      expect(result.primary?.command.name).toBe("/ck:cook");
    });

    it("should recommend fix-related command for UI issues", () => {
      const result = recommendCommands("css bị lỗi layout", commands);
      // Can be /ck:fix or /ck:fix:ui
      expect(result.primary?.command.name.startsWith("/ck:fix")).toBe(true);
    });

    it("should recommend bootstrap or cook for new projects", () => {
      const result = recommendCommands("khởi tạo project mới", commands);
      // Can be /ck:bootstrap, /ck:cook, or related init commands
      expect(["/ck:bootstrap", "/ck:cook", "/ck:scout", "/ck:git:pr"]).toContain(result.primary?.command.name);
    });

    it("should provide high confidence for clear intent", () => {
      const result = recommendCommands("implement feature login", commands);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should handle Vietnamese keywords", () => {
      const result = recommendCommands("lập kế hoạch cho API", commands);
      // Should match plan-related command (Engineer category for /ck:plan)
      expect(result.primary?.command.category).toBe("Engineer");
    });
  });

  describe("validateCommand", () => {
    it("should validate correct command", () => {
      const result = validateCommand("/ck:cook", "tạo feature", commands);
      expect(result.valid).toBe(true);
    });

    it("should invalidate non-existent command", () => {
      const result = validateCommand("/nonexistent", "test", commands);
      expect(result.valid).toBe(false);
      expect(result.corrected).toBeDefined();
    });
  });

  describe("getRelatedCommands", () => {
    it("should get related commands for /ck:fix", () => {
      const fix = commands.find(c => c.id === "ck:fix")!;
      const related = getRelatedCommands(fix, commands);
      expect(related.length).toBeGreaterThan(0);
    });
  });
});
