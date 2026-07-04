import { describe, expect, it } from "vitest";
import { extractJson } from "@/lib/gemini/json";

describe("extractJson", () => {
  it("parses clean JSON", () => {
    expect(extractJson('{"a": 1}')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in a markdown code fence", () => {
    const raw = '```json\n{"destinations": []}\n```';
    expect(extractJson(raw)).toEqual({ destinations: [] });
  });

  it("parses a fence without a language tag", () => {
    expect(extractJson('```\n[1, 2]\n```')).toEqual([1, 2]);
  });

  it("recovers JSON preceded by prose", () => {
    const raw = 'Here is your answer:\n{"ok": true}';
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it("parses arrays with surrounding whitespace", () => {
    expect(extractJson('  [{"x": "y"}]  ')).toEqual([{ x: "y" }]);
  });

  it("throws on output with no JSON at all", () => {
    expect(() => extractJson("I cannot answer that.")).toThrow(SyntaxError);
  });
});
