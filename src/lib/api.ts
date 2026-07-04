"use client";

import { clientAuth } from "@/lib/firebase/client";

/**
 * Client-side API helpers. Every call attaches the caller's Firebase ID
 * token; the server verifies it before touching Gemini or Firestore.
 */

export class ClientApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const user = clientAuth().currentUser;
  if (!user) throw new ClientApiError(401, "unauthorized", "Please sign in first.");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function parseError(res: Response): Promise<never> {
  let message = "Something went wrong. Please try again.";
  let code = "unknown";
  try {
    const body = await res.json();
    if (body?.error?.message) {
      message = body.error.message;
      code = body.error.code ?? code;
    }
  } catch {
    // non-JSON error body — keep the generic message
  }
  throw new ClientApiError(res.status, code, message);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) await parseError(res);
  const json = await res.json();
  return json.data as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeader() });
  if (!res.ok) await parseError(res);
  const json = await res.json();
  return json.data as T;
}

/**
 * POST that streams a text response, invoking onChunk as prose arrives.
 * Used by the Cultural Story Engine.
 */
export async function postStream(
  path: string,
  body: unknown,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) await parseError(res);
  if (!res.body) throw new ClientApiError(502, "no_stream", "No response stream received.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
