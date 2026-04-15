import { beforeEach, describe, expect, it } from "vitest";
import type { Command } from "../../src/data/commands";
import { rankCommandsByIntent } from "../../src/lib/command-recommender";
import {
  __unsafeClearLocalCommandTelemetryForTests,
  trackCommandShownEvents,
  trackCommandTelemetryEvent,
} from "../../src/lib/local-command-usage-telemetry";

const commandsForLearningBenchmark: Command[] = [
  {
    id: "ck:alpha-fix",
    name: "/ck:alpha-fix",
    category: "Engineer",
    complexity: 2,
    description: "Fix command alpha",
    keywords: ["fix", "bug", "error"],
    patterns: [],
    useCases: ["Fix bug in codebase"],
  },
  {
    id: "ck:beta-fix",
    name: "/ck:beta-fix",
    category: "Engineer",
    complexity: 2,
    description: "Fix command beta",
    keywords: ["fix", "bug", "error"],
    patterns: [],
    useCases: ["Fix bug in codebase"],
  },
];

const intentQueries = [
  "fix bug nhanh",
  "sửa lỗi gấp",
  "bug production cần xử lý",
  "error issue in module",
];

function top1HitRate(expectedTop1: string): number {
  let hits = 0;
  for (const query of intentQueries) {
    const ranked = rankCommandsByIntent(query, commandsForLearningBenchmark, 2);
    if (ranked[0]?.command.name === expectedTop1) {
      hits += 1;
    }
  }
  return hits / intentQueries.length;
}

describe("benchmark: telemetry ranking learning", () => {
  beforeEach(() => {
    __unsafeClearLocalCommandTelemetryForTests();
  });

  it("improves intent ranking after shown/clicked/run/success signals", () => {
    const baselineHitRate = top1HitRate("/ck:beta-fix");

    for (let i = 0; i < 14; i += 1) {
      trackCommandShownEvents(["/ck:beta-fix"]);
      trackCommandTelemetryEvent("clicked", "/ck:beta-fix");
      trackCommandTelemetryEvent("run", "/ck:beta-fix");
      trackCommandTelemetryEvent("success", "/ck:beta-fix");
    }

    for (let i = 0; i < 10; i += 1) {
      trackCommandShownEvents(["/ck:alpha-fix"]);
      trackCommandTelemetryEvent("clicked", "/ck:alpha-fix");
      trackCommandTelemetryEvent("run", "/ck:alpha-fix");
    }

    const learnedHitRate = top1HitRate("/ck:beta-fix");
    const uplift = learnedHitRate - baselineHitRate;

    expect(learnedHitRate).toBeGreaterThanOrEqual(0.75);
    expect(uplift).toBeGreaterThanOrEqual(0.5);
  });
});
