import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CommandPalette } from "../../src/components/chat/command-palette-with-cmdk";
import {
  __unsafeClearLocalCommandTelemetryForTests,
  __unsafeGetLocalCommandTelemetryForTests,
} from "../../src/lib/local-command-usage-telemetry";

describe("CommandPalette", () => {
  beforeEach(() => {
    __unsafeClearLocalCommandTelemetryForTests();
  });

  it("prioritizes intent-ranked suggestions and hides static catalog sections for intent query", async () => {
    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        contextInput="sửa lỗi typescript trong component bị crash"
        interactionCount={4}
      />
    );

    await screen.findByText("Gợi ý theo intent (curated)");

    expect(screen.queryByText("Engineer Kit")).not.toBeInTheDocument();
    expect(screen.queryByText("Marketing Kit")).not.toBeInTheDocument();
    expect(screen.getByText(/\d+ curated \+ \d+ raw/i)).toBeInTheDocument();
  });

  it("shows full curated catalog sections when input starts with slash", async () => {
    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        contextInput="/"
        interactionCount={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Engineer Kit")).toBeInTheDocument();
      expect(screen.getByText("Marketing Kit")).toBeInTheDocument();
    });

    expect(screen.queryByText("Gợi ý theo intent (curated)")).not.toBeInTheDocument();
  });

  it("falls back to curated catalog when intent ranking misses", async () => {
    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        contextInput="qwerty zxcvbnm no-intent"
        interactionCount={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Engineer Kit")).toBeInTheDocument();
      expect(screen.getByText("Marketing Kit")).toBeInTheDocument();
    });
  });

  it("prefills slash query without slash prefix for curated filtering", async () => {
    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        contextInput="/seo"
        interactionCount={0}
      />
    );

    const input = await screen.findByLabelText("Tìm kiếm command");
    expect(input).toHaveValue("seo");
    expect(screen.getByText("Engineer Kit")).toBeInTheDocument();
  });

  it("tracks shown telemetry for visible commands", async () => {
    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        contextInput="/"
        interactionCount={0}
      />
    );

    await screen.findByText("Engineer Kit");

    const telemetry = __unsafeGetLocalCommandTelemetryForTests();
    expect(telemetry.commands["ck:cook"]?.shown).toBeGreaterThan(0);
  });

  it("tracks clicked telemetry when selecting a command", async () => {
    const onSelect = vi.fn();

    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
        contextInput="/"
        interactionCount={0}
      />
    );

    await screen.findByText("Engineer Kit");
    const commandLabel = screen.getAllByText("/ck:cook")[0];
    fireEvent.click(commandLabel);

    expect(onSelect).toHaveBeenCalledWith("/ck:cook");
    const telemetry = __unsafeGetLocalCommandTelemetryForTests();
    expect(telemetry.commands["ck:cook"]?.clicked).toBe(1);
  });
});
