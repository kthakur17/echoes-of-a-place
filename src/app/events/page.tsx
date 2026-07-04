"use client";

import { useId, useState } from "react";
import type { CulturalEvent, EventsResponse, EventType } from "@/types";
import { postJson, ClientApiError } from "@/lib/api";
import { useDestination } from "@/lib/destinationContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DestinationField } from "@/components/ui/DestinationField";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingRegion, SkeletonCard } from "@/components/ui/Skeleton";

const TYPE_EMOJI: Record<EventType, string> = {
  festival: "🎆",
  "community-gathering": "🤝",
  exhibition: "🖼️",
  performance: "🎭",
  celebration: "🎊",
  market: "🧺",
  other: "🎎",
};

export default function EventsPage() {
  return (
    <AuthGate>
      <EventsContent />
    </AuthGate>
  );
}

function EventsContent() {
  const startId = useId();
  const endId = useId();
  const { destination } = useDestination();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState<CulturalEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch =
    destination.trim().length >= 2 &&
    !!startDate &&
    !!endDate &&
    Date.parse(endDate) >= Date.parse(startDate);

  const search = async () => {
    setLoading(true);
    setError(null);
    setEvents(null);
    try {
      const data = await postJson<EventsResponse>("/api/events", {
        destination,
        startDate,
        endDate,
      });
      setEvents(data.events);
    } catch (err) {
      setError(
        err instanceof ClientApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="Feature 06 — Cultural Events"
        title="Arrive when the place is most itself"
        lede="Festivals, ceremonies, markets, and gatherings during your travel window — with the significance behind them and the etiquette to be welcome."
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <DestinationField />
          <div className="flex flex-col gap-1.5">
            <label htmlFor={startId} className="text-sm font-medium text-parchment-300">
              From
            </label>
            <input
              id={startId}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-parchment-50 [color-scheme:dark]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={endId} className="text-sm font-medium text-parchment-300">
              To
            </label>
            <input
              id={endId}
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-parchment-50 [color-scheme:dark]"
            />
          </div>
          <Button onClick={search} disabled={!canSearch} loading={loading}>
            Find what&rsquo;s alive
          </Button>
        </div>
      </Card>

      <section aria-label="Cultural events" className="mt-8 space-y-4">
        {error && <ErrorBanner message={error} onRetry={search} />}

        {loading && (
          <LoadingRegion label="Finding cultural events for your dates">
            <div className="space-y-4">
              <SkeletonCard lines={5} />
              <SkeletonCard lines={5} />
            </div>
          </LoadingRegion>
        )}

        {!loading && !events && !error && (
          <EmptyState
            emoji="🎎"
            title="Every season has its ceremonies"
            hint="Pick a destination and your travel dates. We'll find what the community itself will be celebrating while you're there."
          />
        )}

        {events?.map((ev) => (
          <Card key={ev.name} className="animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-display text-xl text-parchment-50">
                <span aria-hidden="true" className="mr-2">
                  {TYPE_EMOJI[ev.type]}
                </span>
                {ev.name}
              </h2>
              <span className="rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-xs text-parchment-300">
                {ev.timing}
              </span>
            </div>

            <p className="mt-3 leading-relaxed text-parchment-100/90">{ev.description}</p>
            <p className="mt-2 text-sm leading-relaxed text-parchment-400">
              <span className="font-semibold text-ember-400">Why it matters: </span>
              {ev.significance}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-ink-800/60 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ember-400">
                  What locals do
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-parchment-100/90">
                  {ev.localCustoms.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-sage-500/30 bg-sage-500/10 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sage-300">
                  Visitor etiquette
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-parchment-100/90">
                  {ev.visitorEtiquette.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
