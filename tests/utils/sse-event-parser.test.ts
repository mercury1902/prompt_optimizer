import { describe, expect, it } from "vitest";
import { appendChunkAndExtractSseEvents, extractDataPayloadFromSseEvent } from "../../src/utils/sse-event-parser";

describe("sse-event-parser", () => {
  it("parses CRLF-delimited events", () => {
    const chunk = 'data: {"type":"chunk","content":"hello"}\r\n\r\n';
    const parsed = appendChunkAndExtractSseEvents("", chunk);

    expect(parsed.events).toHaveLength(1);
    expect(parsed.remainder).toBe("");
    expect(extractDataPayloadFromSseEvent(parsed.events[0])).toBe('{"type":"chunk","content":"hello"}');
  });

  it("joins multiline data fields into one payload", () => {
    const eventBlock = 'data: {"a":1,\n' + 'data: "b":2}';
    const payload = extractDataPayloadFromSseEvent(eventBlock);

    expect(payload).toBe('{"a":1,\n"b":2}');
  });

  it("keeps incomplete data in remainder until delimiter arrives", () => {
    const first = appendChunkAndExtractSseEvents("", 'data: {"type":"chunk"');
    expect(first.events).toHaveLength(0);
    expect(first.remainder).toBe('data: {"type":"chunk"');

    const second = appendChunkAndExtractSseEvents(first.remainder, ',"content":"ok"}\r\n\r\n');
    expect(second.events).toHaveLength(1);
    expect(second.remainder).toBe("");
    expect(extractDataPayloadFromSseEvent(second.events[0])).toBe('{"type":"chunk","content":"ok"}');
  });
});
