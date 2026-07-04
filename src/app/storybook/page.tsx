"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import type { JourneyEntry, Storybook } from "@/types";
import { getJson, postJson, ClientApiError } from "@/lib/api";
import { AuthGate } from "@/components/auth/AuthGate";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingRegion, SkeletonCard } from "@/components/ui/Skeleton";

const ENTRY_EMOJI: Record<JourneyEntry["type"], string> = {
  discovery: "🧭",
  story: "📖",
  "time-portal": "⏳",
  "companion-chat": "🫖",
  heritage: "🏺",
  events: "🎎",
};

export default function StorybookPage() {
  return (
    <AuthGate>
      <StorybookContent />
    </AuthGate>
  );
}

function StorybookContent() {
  const nameId = useId();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JourneyEntry[] | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [travelerName, setTravelerName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [past, setPast] = useState<Storybook[]>([]);

  const loadJourney = useCallback(async () => {
    setEntriesError(null);
    try {
      const [journey, books] = await Promise.all([
        getJson<{ entries: JourneyEntry[] }>("/api/journey"),
        getJson<{ storybooks: Storybook[] }>("/api/storybook"),
      ]);
      setEntries(journey.entries);
      setPast(books.storybooks);
    } catch (err) {
      setEntriesError(
        err instanceof ClientApiError ? err.message : "Couldn't load your journey.",
      );
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  const generate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const name = travelerName.trim() || undefined;
      const book = await postJson<Storybook>("/api/storybook", {
        ...(name ? { travelerName: name } : {}),
      });
      setStorybook(book);
      setPast((prev) => [book, ...prev]);
    } catch (err) {
      setGenerateError(
        err instanceof ClientApiError ? err.message : "The memoir writer stumbled. Try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="Feature 07 — Journey Storybook"
        title="Your travels, written as the memoir they deserve"
        lede="Everything you explored on this platform — destinations, stories, eras, conversations, heritage — compiled into a personal travel documentary."
      />

      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="mb-3 font-display text-xl text-parchment-50">
          Your journey so far
        </h2>

        {entriesError && <ErrorBanner message={entriesError} onRetry={loadJourney} />}

        {entries === null && !entriesError && (
          <LoadingRegion label="Loading your journey">
            <SkeletonCard lines={4} />
          </LoadingRegion>
        )}

        {entries !== null && entries.length === 0 && !entriesError && (
          <EmptyState
            emoji="🗺️"
            title="Your journey is still unwritten"
            hint="Discover a destination, hear a story, or step through the time portal — every exploration becomes a page in your storybook."
            action={
              <Link
                href="/discover"
                className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-ember-400"
              >
                Start exploring
              </Link>
            }
          />
        )}

        {entries !== null && entries.length > 0 && (
          <Card>
            <ol className="space-y-3">
              {entries.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg">
                    {ENTRY_EMOJI[e.type]}
                  </span>
                  <div>
                    <p className="text-sm text-parchment-100/90">{e.summary}</p>
                    <p className="text-xs text-parchment-400/70">
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid gap-3 border-t border-ink-700 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="text-sm font-medium text-parchment-300">
                  Traveler&rsquo;s name on the cover
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  maxLength={60}
                  placeholder={user?.displayName ?? "A Traveler"}
                  className="rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-parchment-50 placeholder:text-parchment-400/50"
                />
              </div>
              <Button onClick={generate} loading={generating}>
                {generating ? "Writing your memoir…" : "Write my storybook"}
              </Button>
            </div>
            {generateError && (
              <div className="mt-3">
                <ErrorBanner message={generateError} onRetry={generate} />
              </div>
            )}
          </Card>
        )}
      </section>

      {generating && (
        <div className="mt-8">
          <LoadingRegion label="Writing your storybook">
            <SkeletonCard lines={10} />
          </LoadingRegion>
        </div>
      )}

      {storybook && !generating && <StorybookView book={storybook} />}

      {past.length > 0 && !storybook && !generating && (
        <section aria-labelledby="past-heading" className="mt-10">
          <h2 id="past-heading" className="mb-3 font-display text-xl text-parchment-50">
            Earlier storybooks
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((b) => (
              <button
                key={b.id}
                onClick={() => setStorybook(b)}
                className="rounded-xl border border-ink-700 bg-ink-900/80 p-4 text-left transition-colors hover:border-ember-500/50"
              >
                <p className="font-display text-parchment-50">{b.title}</p>
                <p className="mt-1 text-xs text-parchment-400">
                  {new Date(b.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {b.chapters.length} chapters
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StorybookView({ book }: { book: Storybook }) {
  return (
    <article className="mx-auto mt-10 max-w-3xl animate-fade-up" aria-label={book.title}>
      <Card className="px-6 py-10 sm:px-12">
        <header className="border-b border-ink-700 pb-8 text-center">
          <p aria-hidden="true" className="mb-4 text-4xl">
            📜
          </p>
          <h2 className="font-display text-3xl leading-snug text-parchment-50">{book.title}</h2>
          <p className="mt-4 font-display italic text-parchment-400">{book.dedication}</p>
        </header>

        {book.chapters.map((ch, i) => (
          <section key={ch.heading} className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-400">
              Chapter {i + 1}
            </p>
            <h3 className="mt-1 font-display text-2xl italic text-parchment-50">{ch.heading}</h3>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-parchment-100/90">
              {ch.body}
            </p>
          </section>
        ))}

        <footer className="mt-12 border-t border-ink-700 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-400">
            Epilogue
          </h3>
          <p className="mt-3 font-display text-lg italic leading-relaxed text-parchment-100">
            {book.epilogue}
          </p>
        </footer>
      </Card>
    </article>
  );
}
