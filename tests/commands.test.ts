import { describe, it, expect } from "vitest";
import { commands, engineerCommands, marketingCommands, getCommandById, getCommandsByCategory } from "../src/data/commands";

describe("Commands Data", () => {
  it("should have 40+ commands total", () => {
    expect(commands.length).toBeGreaterThanOrEqual(40);
  });

  it("should have engineer commands", () => {
    expect(engineerCommands.length).toBeGreaterThan(0);
    expect(engineerCommands.some(c => c.name === "/ck:cook")).toBe(true);
    expect(engineerCommands.some(c => c.name === "/ck:fix")).toBe(true);
  });

  it("should have marketing commands", () => {
    expect(marketingCommands.length).toBeGreaterThan(0);
    // Marketing commands now use /content/good, /write/blog format
    expect(marketingCommands.some(c => c.name.startsWith("/content/") || c.name.startsWith("/write/") || c.name.startsWith("/marketing:"))).toBe(true);
  });

  it("should get command by id", () => {
    const cook = getCommandById("ck:cook");
    expect(cook).toBeDefined();
    expect(cook?.name).toBe("/ck:cook");
  });

  it("should get commands by category", () => {
    const engineerCommands = getCommandsByCategory("Engineer");
    expect(engineerCommands.length).toBeGreaterThan(0);
    expect(engineerCommands.every(c => c.category === "Engineer")).toBe(true);
  });

  it("every command should have required fields", () => {
    for (const cmd of commands) {
      expect(cmd.id).toBeDefined();
      expect(cmd.name).toBeDefined();
      expect(cmd.category).toBeDefined();
      expect(cmd.complexity).toBeGreaterThanOrEqual(1);
      expect(cmd.complexity).toBeLessThanOrEqual(5);
      expect(cmd.keywords.length).toBeGreaterThan(0);
      expect(cmd.patterns.length).toBeGreaterThan(0);
      expect(cmd.useCases.length).toBeGreaterThan(0);
    }
  });
});
