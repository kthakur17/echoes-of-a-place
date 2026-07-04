/**
 * Extract a JSON value from raw model output.
 *
 * Gemini with `responseMimeType: application/json` normally returns clean
 * JSON, but this guards against markdown code fences and leading prose so a
 * single stray token doesn't break the request.
 */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  // Fast path: already valid JSON.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to recovery paths
  }

  // Strip ```json ... ``` fences.
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim());
  }

  // Last resort: take the outermost {...} or [...] span.
  const start = trimmed.search(/[[{]/);
  if (start >= 0) {
    const open = trimmed[start];
    const close = open === "{" ? "}" : "]";
    const end = trimmed.lastIndexOf(close);
    if (end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
  }

  throw new SyntaxError("Model output contained no parseable JSON");
}
