"use client";

import { useState } from "react";
import type { Era, EraPortrait } from "@/types";
import { ERA_LABELS } from "@/types";
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

const ERAS: Era[] = ["present", "fifty-years", "hundred-years", "ancient"];

const ERA_EMOJI: Record<Era, string> = {
  present: "🌆",
  "fifty-years": "📻",
  "hundred-years": "🎩",
  ancient: "🏺",
};

export default function TimePortalPage() {
  return (
    <AuthGate>
      <TimePortalContent />
    </AuthGate>
  );
}

function TimePortalContent() {
  const { destination } = useDestination();
  const [era, setEra] = useState<Era>("present");
  const [loadedFor, setLoadedFor] = useState<string>("");
  const [portraits, setPortraits] = useState<Partial<Record<Era, EraPortrait>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canOpen = destination.trim().length >= 2;
  const portrait = loadedFor === destination ? portraits[era] : undefined;

  const openEra = async (targetEra: Era) => {
    setEra(targetEra);
    setError(null);

    // New destination invalidates previously loaded eras.
    const cache = loadedFor === destination ? portraits : {};
    if (loadedFor !== destination) {
      setPortraits({});
      setLoadedFor(destination);
    }
    if (cache[targetEra]) return;

    setLoading(true);
    try {
      const data = await postJson<EraPortrait>("/api/time-portal", {
        destination,
        era: targetEra,
      });
      setPortraits((prev) => ({ ...prev, [targetEra]: data }));
    } catch (err) {
      setError(
        err instanceof ClientApiError
          ? err.message
          : "The portal flickered. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="Feature 03 — Time Portal"
        title="Stand in the same place, in four different centuries"
        lede="Choose a destination, then step through its eras — what people ate, feared, built, and celebrated — reconstructed from real history."
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <DestinationField />
          <Button onClick={() => openEra(era)} disabled={!canOpen} loading={loading}>
            Open the portal
          </Button>
        </div>
      </Card>

      <div
        role="tablist"
        aria-label="Choose an era"
        className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {ERAS.map((e) => (
          <button
            key={e}
            role="tab"
            aria-selected={era === e}
            disabled={!canOpen || loading}
            onClick={() => openEra(e)}
            className={`rounded-lg border px-3 py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              era === e
                ? "border-ember-500 bg-ember-500/15 text-ember-300"
                : "border-ink-700 bg-ink-800 text-parchment-300 hover:border-ember-500/40"
            }`}
          >
            <span aria-hidden="true" className="mr-1.5">
              {ERA_EMOJI[e]}
            </span>
            {ERA_LABELS[e]}
          </button>
        ))}
      </div>

      <section aria-label="Era portrait" className="mt-6">
        {error && <ErrorBanner message={error} onRetry={() => openEra(era)} />}

        {loading && (
          <LoadingRegion label={`Reconstructing ${ERA_LABELS[era]}`}>
            <SkeletonCard lines={8} />
          </LoadingRegion>
        )}

        {!loading && !portrait && !error && (
          <EmptyState
            emoji="⏳"
            title="The portal is closed"
            hint="Enter a destination and choose an era. Each era is reconstructed live — grounded in real history, honest about what is known and what is legend."
          />
        )}

        {!loading && portrait && (
          <Card className="animate-fade-up space-y-6 px-6 py-7 sm:px-9">
            <header>
              <h2 className="font-display text-2xl text-parchment-50">
                {destination} — {portrait.eraLabel}
              </h2>
              <p className="mt-1 text-sm uppercase tracking-widest text-ember-400">
                {portrait.approximatePeriod}
              </p>
            </header>

            <p className="border-l-2 border-ember-500/60 pl-4 font-display text-lg italic leading-relaxed text-parchment-100">
              {portrait.sceneSetting}
            </p>

            <PortraitSection title="Daily life">
              <p className="leading-relaxed text-parchment-100/90">{portrait.dailyLife}</p>
            </PortraitSection>

            <PortraitSection title="Cultural practices">
              <ul className="list-disc space-y-1.5 pl-5 text-parchment-100/90">
                {portrait.culturalPractices.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </PortraitSection>

            <PortraitSection title="Major events">
              <ol className="space-y-2">
                {portrait.majorEvents.map((ev) => (
                  <li key={`${ev.year}-${ev.event.slice(0, 24)}`} className="flex gap-3">
                    <span className="shrink-0 font-semibold text-ember-300">{ev.year}</span>
                    <span className="text-parchment-100/90">{ev.event}</span>
                  </li>
                ))}
              </ol>
            </PortraitSection>

            <PortraitSection title="Land & environment">
              <p className="leading-relaxed text-parchment-100/90">{portrait.environment}</p>
            </PortraitSection>

            <div className="rounded-lg border border-sage-500/30 bg-sage-500/10 p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-sage-300">
                What survives today
              </h3>
              <p className="text-sm leading-relaxed text-parchment-100/90">
                {portrait.whatSurvivesToday}
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

function PortraitSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ember-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
