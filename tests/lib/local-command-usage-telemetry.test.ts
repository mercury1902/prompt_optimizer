import { beforeEach, describe, expect, it } from "vitest";
import {
  __unsafeClearLocalCommandTelemetryForTests,
  __unsafeGetLocalCommandTelemetryForTests,
  getCommandUsageScoreBoost,
  trackCommandShownEvents,
  trackCommandTelemetryEvent,
} from "../../src/lib/local-command-usage-telemetry";

describe("local-command-usage-telemetry", () => {
  beforeEach(() => {
    __unsafeClearLocalCommandTelemetryForTests();
  });

  it("stores shown/clicked/run/success counters", () => {
    trackCommandShownEvents(["/ck:fix", "/ck:fix"]);
    trackCommandTelemetryEvent("clicked", "/ck:fix");
    trackCommandTelemetryEvent("run", "/ck:fix");
    trackCommandTelemetryEvent("success", "/ck:fix");

    const store = __unsafeGetLocalCommandTelemetryForTests();
    expect(store.commands["ck:fix"]).toMatchObject({
      shown: 2,
      clicked: 1,
      run: 1,
      success: 1,
    });
  });

  it("returns positive boost for command with consistent success", () => {
    for (let i = 0; i < 12; i += 1) {
      trackCommandShownEvents(["/ck:plan"]);
      trackCommandTelemetryEvent("clicked", "/ck:plan");
      trackCommandTelemetryEvent("run", "/ck:plan");
      trackCommandTelemetryEvent("success", "/ck:plan");
    }

    expect(getCommandUsageScoreBoost("/ck:plan")).toBeGreaterThan(0);
  });

  it("returns negative boost for command with repeated failed runs", () => {
    for (let i = 0; i < 12; i += 1) {
      trackCommandShownEvents(["/ck:debug"]);
      trackCommandTelemetryEvent("clicked", "/ck:debug");
      trackCommandTelemetryEvent("run", "/ck:debug");
    }

    expect(getCommandUsageScoreBoost("/ck:debug")).toBeLessThan(0);
  });
});
