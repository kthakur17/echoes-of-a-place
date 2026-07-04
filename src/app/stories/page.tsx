"use client";

import { useId, useRef, useState } from "react";
import { postStream, ClientApiError } from "@/lib/api";
import { useDestination } from "@/lib/destinationContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DestinationField } from "@/components/ui/DestinationField";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";

const FOCUS_OPTIONS = [
  { value: "all", label: "The whole tapestry" },
  { value: "history", label: "History" },
  { value: "legends", label: "Legends & myths" },
  { value: "traditions", label: "Living traditions" },
  { value: "folklore", label: "Folklore" },
] as const;

export default function StoriesPage() {
  return (
    <AuthGate>
      <StoriesContent />
    </AuthGate>
  );
}

function StoriesContent() {
  const focusId = useId();
  const { destination } = useDestination();
  const [focus, setFocus] = useState<(typeof FOCUS_OPTIONS)[number]["value"]>("all");
  const [story, setStory] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canTell = destination.trim().length >= 2;

  const tellStory = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming(true);
    setError(null);
    setStory("");
    try {
      await postStream(
        "/api/story",
        { destination, focus },
        (chunk) => setStory((prev) => prev + chunk),
        controller.signal,
      );
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError(
          err instanceof ClientApiError
            ? err.message
            : "The narrator lost the thread. Please try again.",
        );
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="Feature 02 — Cultural Story Engine"
        title="Every place has a story it has been waiting to tell you"
        lede="Not an encyclopedia entry — a narration. Watch the story of your destination being written for you, sentence by sentence, live."
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <DestinationField />
          <div className="flex flex-col gap-1.5">
            <label htmlFor={focusId} className="text-sm font-medium text-parchment-300">
              Focus
            </label>
            <select
              id={focusId}
              value={focus}
              onChange={(e) => setFocus(e.target.value as typeof focus)}
              className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-parchment-50"
            >
              {FOCUS_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={tellStory} disabled={!canTell} loading={streaming}>
            {streaming ? "The narrator speaks…" : "Tell me the story"}
          </Button>
        </div>
      </Card>

      <section aria-label="Cultural story" className="mt-8">
        {error && <ErrorBanner message={error} onRetry={tellStory} />}

        {!story && !streaming && !error && (
          <EmptyState
            emoji="🕯️"
            title="The storyteller is waiting"
            hint="Name a place above — Varanasi, Fez, Kyoto, Cusco — and its history, legends, and living traditions will be narrated for you in real time."
          />
        )}

        {(story || streaming) && (
          <Card className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
            <article aria-live="polite" aria-busy={streaming} className="font-body text-[1.05rem]">
              <Markdown text={story} />
              {streaming && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-5 w-2 animate-pulse bg-ember-400 align-text-bottom"
                />
              )}
            </article>
          </Card>
        )}
      </section>
    </div>
  );
}
