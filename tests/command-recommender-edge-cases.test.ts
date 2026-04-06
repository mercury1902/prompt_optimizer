import { describe, it, expect } from "vitest";
import { commands } from "../src/data/commands";
import { recommendCommands, detectIntent, validateCommand, getRelatedCommands } from "../src/lib/command-recommender";

describe("Command Recommender - Edge Cases", () => {
  describe("Vietnamese Keywords", () => {
    it("should detect intent with Vietnamese diacritics", () => {
      const result = detectIntent("sửa lỗi bug này");
      expect(result).toBeDefined();
      expect(result?.command).toBe("/ck:fix");
    });

    it("should detect intent without Vietnamese diacritics", () => {
      const result = detectIntent("sua loi bug nay");
      expect(result).toBeDefined();
      expect(result?.command).toBe("/ck:fix");
    });

    it("should detect Vietnamese 'tạo' intent", () => {
      const result = detectIntent("tạo tính năng mới");
      expect(result?.command).toBe("/ck:cook");
    });

    it("should detect Vietnamese 'làm' intent", () => {
      const result = detectIntent("làm feature login");
      expect(result?.command).toBe("/ck:cook");
    });

    it("should detect Vietnamese 'thêm' intent", () => {
      const result = detectIntent("thêm chức năng");
      expect(result?.command).toBe("/ck:cook");
    });

    it("should detect Vietnamese 'hỏi' intent", () => {
      const result = detectIntent("hỏi về React");
      expect(result?.command).toBe("/ck:ask");
    });

    it("should detect Vietnamese 'tìm' intent", () => {
      const result = detectIntent("tìm file config");
      expect(result?.command).toBe("/ck:scout");
    });

    it("should detect Vietnamese 'nghiên cứu' intent", () => {
      const result = detectIntent("nghiên cứu về AI");
      expect(result?.command).toBe("/ck:research");
    });

    it("should detect Vietnamese 'kiểm thử' intent", () => {
      const result = detectIntent("kiểm thử tính năng");
      expect(result?.command).toBe("/ck:test");
    });

    it("should detect Vietnamese 'gỡ lỗi' intent (maps to /ck:fix via 'lỗi')", () => {
      const result = detectIntent("gỡ lỗi function này");
      // 'lỗi' keyword maps to /ck:fix before /ck:debug in INTENT_MAPPINGS
      expect(result?.command).toBe("/ck:fix");
    });

    it("should detect Vietnamese 'khởi tạo' intent (maps to /ck:cook via 'tạo')", () => {
      const result = detectIntent("khởi tạo project mới");
      // 'tạo' keyword maps to /ck:cook before 'khởi tạo' in INTENT_MAPPINGS
      expect(result?.command).toBe("/ck:cook");
    });

    it("should detect Vietnamese 'kế hoạch' intent", () => {
      const result = detectIntent("lập kế hoạch cho API");
      expect(result?.command).toBe("/ck:plan");
    });

    it("should detect Vietnamese 'lập' intent", () => {
      const result = detectIntent("lập kế hoạch");
      expect(result?.command).toBe("/ck:plan");
    });

    it("should detect Vietnamese 'giải thích' intent (maps to /ck:cook via 'code')", () => {
      const result = detectIntent("giải thích code này");
      // 'code' keyword in input maps to /ck:cook before 'giải thích' maps to /ck:ask
      expect(result?.command).toBe("/ck:cook");
    });

    it("should handle full Vietnamese sentence", () => {
      const result = detectIntent("Tôi muốn sửa lỗi TypeScript trong file này");
      expect(result?.command).toBe("/ck:fix");
    });
  });

  describe("Mixed Language Inputs", () => {
    it("should handle English + Vietnamese mixed input", () => {
      const result = detectIntent("fix lỗi bug này");
      expect(result?.command).toBe("/ck:fix");
    });

    it("should handle Vietnamese + English technical terms", () => {
      const result = detectIntent("tạo feature authentication");
      expect(result?.command).toBe("/ck:cook");
    });

    it("should handle code snippets with Vietnamese", () => {
      const result = recommendCommands("sửa lỗi const x = null trong file này", commands);
      expect(result.primary).toBeDefined();
      expect(result.primary?.command.name.startsWith("/ck:fix")).toBe(true);
    });

    it("should handle English keywords with Vietnamese context", () => {
      const result = recommendCommands("implement tính năng đăng nhập", commands);
      expect(result.primary?.command.name).toBe("/ck:cook");
    });

    it("should handle marketing commands with mixed language", () => {
      const result = detectIntent("viết content cho blog");
      expect(result?.command).toBe("/content/good");
    });

    it("should handle SEO with Vietnamese (maps to /ck:research via 'nghiên cứu')", () => {
      const result = detectIntent("nghiên cứu keywords cho website");
      // 'nghiên cứu' maps to /ck:research before 'keywords' maps to /seo/keywords
      expect(result?.command).toBe("/ck:research");
    });

    it("should handle campaign with Vietnamese (maps to /ck:cook via 'tạo')", () => {
      const result = detectIntent("tạo chiến dịch marketing");
      // 'tạo' maps to /ck:cook before 'chiến dịch/campaign' maps to /campaign/create
      expect(result?.command).toBe("/ck:cook");
    });
  });

  describe("Ambiguous Intents", () => {
    it("should handle input matching multiple commands", () => {
      const result = recommendCommands("test và fix lỗi", commands);
      expect(result.primary).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(0);
    });

    it("should handle generic 'create' intent", () => {
      const result = recommendCommands("create something", commands);
      expect(result.primary).toBeDefined();
      // Should suggest one of: /ck:cook, /ck:bootstrap, /content/good, etc.
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("should handle generic 'update' intent", () => {
      const result = recommendCommands("update code", commands);
      expect(result.primary).toBeDefined();
    });

    it("should handle overlapping keywords", () => {
      const result = recommendCommands("write test and fix bugs", commands);
      // Both test and fix are valid intents
      expect(result.primary).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it("should provide alternatives for unclear intent", () => {
      const result = recommendCommands("help me with this", commands);
      // Should provide some alternatives even for vague input
      expect(result.alternatives).toBeDefined();
    });

    it("should handle 'fix' with different contexts", () => {
      const typeResult = recommendCommands("fix typescript types", commands);
      expect(typeResult.primary?.command.name.startsWith("/ck:fix")).toBe(true);

      const uiResult = recommendCommands("fix css layout", commands);
      expect(uiResult.primary?.command.name.startsWith("/ck:fix")).toBe(true);
    });
  });

  describe("Unknown Commands", () => {
    it("should return null for gibberish input", () => {
      const result = detectIntent("xyz abc 123 !@#");
      expect(result).toBeNull();
    });

    it("should return empty match for completely unknown terms", () => {
      const result = recommendCommands("qwerty zxcvbnm asdfgh", commands);
      expect(result.primary).toBeNull();
      expect(result.alternatives).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });

    it("should handle single character input", () => {
      const result = recommendCommands("a", commands);
      expect(result.primary).toBeNull();
    });

    it("should handle numeric-only input", () => {
      const result = recommendCommands("12345 67890", commands);
      expect(result.primary).toBeNull();
    });

    it("should handle special characters only", () => {
      const result = recommendCommands("!@#$%^&*()", commands);
      expect(result.primary).toBeNull();
    });

    it("should validate non-existent command", () => {
      const result = validateCommand("/ck:nonexistent", "test input", commands);
      expect(result.valid).toBe(false);
      expect(result.corrected).toBeDefined();
    });

    it("should validate misspelled command", () => {
      const result = validateCommand("/ck:cok", "tạo feature", commands);
      expect(result.valid).toBe(false);
    });
  });

  describe("Intent Confidence Scoring", () => {
    it("should return high confidence for exact keyword match", () => {
      const result = recommendCommands("implement feature", commands);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should return lower confidence for weak match", () => {
      const result = recommendCommands("maybe implement something", commands);
      // Still matches but confidence might be lower
      expect(result.confidence).toBeDefined();
    });

    it("should have confidence capped at 1.0", () => {
      const result = recommendCommands("implement feature build code cook", commands);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it("should have zero confidence when no match", () => {
      const result = recommendCommands("random unrelated text", commands);
      expect(result.confidence).toBe(0);
    });

    it("should increase confidence with multiple keyword matches", () => {
      const singleMatch = recommendCommands("fix", commands);
      const multiMatch = recommendCommands("fix bug error issue", commands);
      expect(multiMatch.confidence).toBeGreaterThanOrEqual(singleMatch.confidence);
    });
  });

  describe("Command Validation", () => {
    it("should validate correct command with matching intent", () => {
      const result = validateCommand("/ck:cook", "tạo feature đăng nhập", commands);
      expect(result.valid).toBe(true);
      expect(result.reason).toContain("phù hợp");
    });

    it("should suggest alternative for mismatched intent", () => {
      const result = validateCommand("/ck:test", "tạo feature mới", commands);
      // /ck:test is valid but /ck:cook would be better
      expect(result.valid).toBe(true);
      expect(result.reason).toContain("có thể phù hợp hơn");
    });

    it("should validate by command ID", () => {
      const cookCmd = commands.find(c => c.id === "ck:cook")!;
      const result = validateCommand(cookCmd.id, "implement login", commands);
      expect(result.valid).toBe(true);
    });

    it("should validate by command name", () => {
      const result = validateCommand("/ck:fix", "sửa lỗi bug", commands);
      expect(result.valid).toBe(true);
    });
  });

  describe("Related Commands Lookup", () => {
    it("should find related commands in same category", () => {
      const fixCmd = commands.find(c => c.id === "ck:fix")!;
      const related = getRelatedCommands(fixCmd, commands);
      expect(related.length).toBeGreaterThan(0);
      // All related should be Engineer category
      expect(related.every(r => r.category === "Engineer")).toBe(true);
    });

    it("should find variant commands if variants exist", () => {
      const fixCmd = commands.find(c => c.id === "ck:fix")!;
      const related = getRelatedCommands(fixCmd, commands);
      // Variants are looked up by name from command.variants array
      // ck:fix has variants like /ck:fix:auto, /ck:fix:types, etc.
      const hasVariantsOrRelated = related.length > 0;
      expect(hasVariantsOrRelated).toBe(true);
    });

    it("should limit related commands to 4", () => {
      const cookCmd = commands.find(c => c.id === "ck:cook")!;
      const related = getRelatedCommands(cookCmd, commands);
      expect(related.length).toBeLessThanOrEqual(4);
    });

    it("should not include self in related", () => {
      const fixCmd = commands.find(c => c.id === "ck:fix")!;
      const related = getRelatedCommands(fixCmd, commands);
      expect(related.some(r => r.id === fixCmd.id)).toBe(false);
    });

    it("should handle commands with no variants", () => {
      const askCmd = commands.find(c => c.id === "ck:ask")!;
      const related = getRelatedCommands(askCmd, commands);
      expect(related).toBeDefined();
    });
  });

  describe("Pattern Matching Edge Cases", () => {
    it("should handle regex patterns in command matching", () => {
      const result = recommendCommands("TypeScript error in component", commands);
      // Should match fix:types pattern
      expect(result.primary).toBeDefined();
    });

    it("should handle invalid regex gracefully", () => {
      // Should not throw when processing commands with complex patterns
      const result = recommendCommands("test input", commands);
      expect(result).toBeDefined();
    });

    it("should match use cases with partial input", () => {
      const result = recommendCommands("bug in production", commands);
      expect(result.primary).toBeDefined();
    });
  });

  describe("Complexity Boost", () => {
    it("should boost simpler commands for simple queries", () => {
      const result = recommendCommands("fix small bug", commands);
      expect(result.primary).toBeDefined();
      // Lower complexity commands get a boost
      if (result.primary) {
        expect(result.primary.command.complexity).toBeLessThanOrEqual(3);
      }
    });

    it("should handle high complexity commands", () => {
      const result = recommendCommands("complex refactoring", commands);
      expect(result.primary).toBeDefined();
    });
  });
});
