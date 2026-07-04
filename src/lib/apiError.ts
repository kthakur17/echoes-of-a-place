import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Typed error that maps directly to an HTTP response. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = (msg = "Sign in required.") =>
  new ApiError(401, "unauthorized", msg);

export const rateLimited = () =>
  new ApiError(429, "rate_limited", "Too many requests. Please wait a moment and try again.");

export const upstreamAiError = (msg = "The AI service is temporarily unavailable. Please try again.") =>
  new ApiError(502, "upstream_ai_error", msg);

/**
 * Convert any thrown value into a safe JSON error response.
 * Internal details are logged server-side, never leaked to the client.
 */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    const detail = err.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return NextResponse.json(
      { error: { code: "invalid_request", message: `Invalid request — ${detail}` } },
      { status: 400 },
    );
  }
  console.error("[api] unhandled error:", err);
  return NextResponse.json(
    { error: { code: "internal", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}
