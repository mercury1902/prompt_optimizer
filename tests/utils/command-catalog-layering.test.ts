import { describe, expect, it } from "vitest";
import { commands } from "../../src/data/commands";
import {
  getProgressiveRevealMatches,
  getRawPoolCount,
} from "../../src/lib/command-catalog-layering";

describe("command-catalog-layering", () => {
  it("keeps first interactions curated-only", () => {
    const result = getProgressiveRevealMatches({
      input: "fix type error in typescript",
      curatedCommands: commands,
      interactionCount: 1,
    });

    expect(result.curatedMatches.length).toBeGreaterThan(0);
    expect(result.shouldRevealRaw).toBe(false);
    expect(result.rawMatches).toHaveLength(0);
  });

  it("reveals raw commands with guardrails after confidence gate passes", () => {
    const result = getProgressiveRevealMatches({
      input: "plan parallel architecture rollout",
      curatedCommands: commands,
      interactionCount: 5,
    });

    expect(result.shouldRevealRaw).toBe(true);
    expect(result.rawMatches.length).toBeLessThanOrEqual(3);

    const curatedTokens = new Set(
      commands.flatMap((command) => [command.id.toLowerCase(), command.name.toLowerCase()])
    );

    for (const match of result.rawMatches) {
      expect(curatedTokens.has(match.command.id.toLowerCase())).toBe(false);
      expect(curatedTokens.has(match.command.name.toLowerCase())).toBe(false);
      expect(match.sourceRepo.length).toBeGreaterThan(0);
    }
  });

  it("does not reveal raw commands when intent confidence is low", () => {
    const result = getProgressiveRevealMatches({
      input: "zzzz qqqq 1234",
      curatedCommands: commands,
      interactionCount: 8,
    });

    expect(result.confidence).toBeLessThan(0.72);
    expect(result.shouldRevealRaw).toBe(false);
    expect(result.rawMatches).toHaveLength(0);
  });

  it("loads full raw pool snapshot", () => {
    expect(getRawPoolCount()).toBe(125);
  });
});
