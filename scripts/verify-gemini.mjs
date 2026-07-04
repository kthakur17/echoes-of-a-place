/**
 * Live smoke test for the Gemini integration.
 * Loads .env.local, then exercises the same SDK calls the app makes:
 * one structured-JSON generation and one streamed narration chunk.
 *
 * Usage: node scripts/verify-gemini.mjs
 */
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

// Minimal .env.local loader (no dependency on dotenv).
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
} catch {
  // no .env.local — rely on the ambient environment
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FAIL: GEMINI_API_KEY is not set (in .env.local or the environment).");
  process.exit(1);
}

const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const ai = new GoogleGenAI({ apiKey });

console.log(`Model: ${model}`);

// 1. Structured JSON — the path used by discover/time-portal/heritage/events/storybook.
const json = await ai.models.generateContent({
  model,
  contents:
    'Respond with ONLY JSON in this exact shape: {"place": "Varanasi", "ok": true}',
  config: { responseMimeType: "application/json", temperature: 0 },
});
const parsed = JSON.parse(json.text ?? "");
if (parsed.ok !== true) throw new Error(`unexpected JSON: ${json.text}`);
console.log("PASS: structured JSON generation");

// 2. Streaming — the path used by the Cultural Story Engine.
const stream = await ai.models.generateContentStream({
  model,
  contents: "In one short sentence, set a scene on the ghats of Varanasi at sunrise.",
});
let chunks = 0;
let text = "";
for await (const chunk of stream) {
  if (chunk.text) {
    chunks++;
    text += chunk.text;
  }
}
if (!text.trim()) throw new Error("stream produced no text");
console.log(`PASS: streaming generation (${chunks} chunk(s))`);
console.log(`Sample: ${text.trim().slice(0, 120)}`);
console.log("\nGemini integration verified.");
