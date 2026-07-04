"use client";

import { useState } from "react";
import type { HeritageItem, HeritageResponse, HeritageUrgency } from "@/types";
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

const URGENCY_META: Record<HeritageUrgency, { label: string; className: string }> = {
  stable: { label: "Stable", className: "bg-sage-500/15 text-sage-300 border-sage-500/40" },
  declining: {
    label: "Declining",
    className: "bg-ember-500/15 text-ember-300 border-ember-500/40",
  },
  endangered: {
    label: "Endangered",
    className: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  },
  "critically-endangered": {
    label: "Critically endangered",
    className: "bg-red-500/15 text-red-300 border-red-500/40",
  },
};

const CATEGORY_EMOJI: Record<HeritageItem["category"], string> = {
  craft: "🧶",
  music: "🪕",
  "oral-tradition": "🗣️",
  neighborhood: "🏘️",
  ritual: "🪔",
  cuisine: "🥘",
  other: "🏺",
};

export default function HeritagePage() {
  return (
    <AuthGate>
      <HeritageContent />
    </AuthGate>
  );
}

function HeritageContent() {
  const { destination } = useDestination();
  const [items, setItems] = useState<HeritageItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canExplore = destination.trim().length >= 2;

  const explore = async () => {
    setLoading(true);
    setError(null);
    setItems(null);
    try {
      const data = await postJson<HeritageResponse>("/api/heritage", { destination });
      setItems(data.items);
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
        kicker="Feature 05 — Hidden Heritage Explorer"
        title="What disappears when nobody comes to look?"
        lede="Endangered crafts, fading songs, oral histories with a handful of keepers left. Find them — and learn how your visit can help them survive."
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <DestinationField />
          <Button onClick={explore} disabled={!canExplore} loading={loading}>
            {loading ? "Listening for echoes…" : "Explore hidden heritage"}
          </Button>
        </div>
      </Card>

      <section aria-label="Endangered heritage" className="mt-8 space-y-4">
        {error && <ErrorBanner message={error} onRetry={explore} />}

        {loading && (
          <LoadingRegion label="Finding endangered heritage">
            <div className="space-y-4">
              <SkeletonCard lines={6} />
              <SkeletonCard lines={6} />
            </div>
          </LoadingRegion>
        )}

        {!loading && !items && !error && (
          <EmptyState
            emoji="🏺"
            title="Heritage hides in plain sight"
            hint="Name a destination and we'll surface the traditions most tourists walk past — who keeps them alive, why they're at risk, and how to help."
          />
        )}

        {items?.map((item) => {
          const urgency = URGENCY_META[item.urgency];
          return (
            <Card key={item.name} className="animate-fade-up">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-xl text-parchment-50">
                  <span aria-hidden="true" className="mr-2">
                    {CATEGORY_EMOJI[item.category]}
                  </span>
                  {item.name}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgency.className}`}
                >
                  {urgency.label}
                </span>
              </div>

              <p className="mt-3 leading-relaxed text-parchment-100/90">{item.story}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-ink-800/60 p-4">
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ember-400">
                    Why it matters
                  </h3>
                  <p className="text-sm leading-relaxed text-parchment-100/90">
                    {item.whyItMatters}
                  </p>
                </div>
                <div className="rounded-lg bg-ink-800/60 p-4">
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
                    Why it&rsquo;s disappearing
                  </h3>
                  <p className="text-sm leading-relaxed text-parchment-100/90">
                    {item.whyItIsDisappearing}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-sage-500/30 bg-sage-500/10 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sage-300">
                  How you can help
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-parchment-100/90">
                  {item.howVisitorsCanHelp.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 text-sm text-parchment-400">
                <span className="font-semibold text-parchment-300">Where to experience it: </span>
                {item.whereToExperience}
              </p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
