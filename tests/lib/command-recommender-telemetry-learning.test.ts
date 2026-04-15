import { beforeEach, describe, expect, it } from "vitest";
import type { Command } from "../../src/data/commands";
import { rankCommandsByIntent } from "../../src/lib/command-recommender";
import {
  __unsafeClearLocalCommandTelemetryForTests,
  trackCommandShownEvents,
  trackCommandTelemetryEvent,
} from "../../src/lib/local-command-usage-telemetry";

const baselineCommands: Command[] = [
  {
    id: "ck:alpha-fix",
    name: "/ck:alpha-fix",
    category: "Engineer",
    complexity: 2,
    description: "Fix command alpha",
    keywords: ["fix", "bug"],
    patterns: [],
    useCases: ["Fix bug"],
  },
  {
    id: "ck:beta-fix",
    name: "/ck:beta-fix",
    category: "Engineer",
    complexity: 2,
    description: "Fix command beta",
    keywords: ["fix", "bug"],
    patterns: [],
    useCases: ["Fix bug"],
  },
];

describe("command recommender telemetry learning", () => {
  beforeEach(() => {
    __unsafeClearLocalCommandTelemetryForTests();
  });

  it("reorders tie matches based on local usage quality", () => {
    for (let i = 0; i < 10; i += 1) {
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

    const ranked = rankCommandsByIntent("fix bug urgent", baselineCommands, 2);
    expect(ranked[0]?.command.name).toBe("/ck:beta-fix");
    expect(ranked[1]?.command.name).toBe("/ck:alpha-fix");
  });
});
