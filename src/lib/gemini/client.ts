import { GoogleGenAI } from "@google/genai";
import type { ZodType } from "zod";
import { extractJson } from "@/lib/gemini/json";
import { upstreamAiError } from "@/lib/apiError";

/**
 * Server-only Gemini access. The API key lives exclusively in server env vars
 * and every generative feature in the app flows through this module — there
 * is no client-side model access anywhere.
 */

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Copy .env.example to .env.local and set it.",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export interface StructuredOptions<T> {
  prompt: string;
  schema: ZodType<T>;
  systemInstruction?: string;
  temperature?: number;
}

/**
 * Generate a JSON response and validate it against a Zod schema.
 * On a parse/validation failure the model gets one corrective retry that
 * includes the validation errors — this recovers the vast majority of
 * malformed outputs without a hard failure.
 */
export async function generateStructured<T>(opts: StructuredOptions<T>): Promise<T> {
  const { prompt, schema, systemInstruction, temperature = 0.8 } = opts;

  let lastFailure = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const fullPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous response was invalid JSON for the required shape. Errors: ${lastFailure}\nRespond again with ONLY valid JSON matching the required structure.`;

    let text: string;
    try {
      const response = await getClient().models.generateContent({
        model: GEMINI_MODEL,
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          temperature,
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      });
      text = response.text ?? "";
    } catch (err) {
      console.error("[gemini] generateContent failed:", err);
      throw upstreamAiError();
    }

    try {
      const parsed = schema.safeParse(extractJson(text));
      if (parsed.success) return parsed.data;
      lastFailure = parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch (err) {
      lastFailure = err instanceof Error ? err.message : "unparseable output";
    }
  }

  console.error("[gemini] structured output failed validation after retry:", lastFailure);
  throw upstreamAiError("The AI returned an unexpected response. Please try again.");
}

export interface NarrationOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}

/**
 * Stream long-form narration (used by the Cultural Story Engine) as a
 * text/plain ReadableStream so the client renders prose as it is written.
 */
export async function generateNarrationStream(
  opts: NarrationOptions,
): Promise<ReadableStream<Uint8Array>> {
  const { prompt, systemInstruction, temperature = 0.9 } = opts;
  const encoder = new TextEncoder();

  let stream: AsyncIterable<{ text?: string }>;
  try {
    stream = await getClient().models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature,
        ...(systemInstruction ? { systemInstruction } : {}),
      },
    });
  } catch (err) {
    console.error("[gemini] generateContentStream failed:", err);
    throw upstreamAiError();
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      } catch (err) {
        console.error("[gemini] stream interrupted:", err);
        controller.error(err);
      }
    },
  });
}

export interface ChatOptions {
  systemInstruction: string;
  history: { role: "user" | "model"; text: string }[];
  message: string;
  temperature?: number;
}

/** Multi-turn chat used by Cultural Companion personas. */
export async function generateChatReply(opts: ChatOptions): Promise<string> {
  const { systemInstruction, history, message, temperature = 0.9 } = opts;

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  try {
    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction, temperature },
    });
    const text = response.text?.trim();
    if (!text) throw new Error("empty chat reply");
    return text;
  } catch (err) {
    console.error("[gemini] chat reply failed:", err);
    throw upstreamAiError();
  }
}
