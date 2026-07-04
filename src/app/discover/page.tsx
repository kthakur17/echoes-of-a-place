"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { DiscoveryResponse, DestinationRecommendation } from "@/types";
import { postJson, ClientApiError } from "@/lib/api";
import { useDestination } from "@/lib/destinationContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingRegion, SkeletonCard } from "@/components/ui/Skeleton";

const INTEREST_OPTIONS = [
  "History",
  "Spirituality",
  "Food & cuisine",
  "Crafts & artisans",
  "Music & dance",
  "Architecture",
  "Nature & landscapes",
  "Festivals",
  "Literature & poetry",
  "Markets & street life",
];

const BUDGETS = [
  { value: "shoestring", label: "Shoestring" },
  { value: "moderate", label: "Moderate" },
  { value: "comfortable", label: "Comfortable" },
  { value: "luxury", label: "Luxury" },
] as const;

const STYLES = [
  { value: "slow-immersive", label: "Slow & immersive" },
  { value: "solo-reflective", label: "Solo & reflective" },
  { value: "adventurous", label: "Adventurous" },
  { value: "family", label: "With family" },
  { value: "social", label: "Social & lively" },
] as const;

export default function DiscoverPage() {
  return (
    <AuthGate>
      <DiscoverContent />
    </AuthGate>
  );
}

function DiscoverContent() {
  const goalId = useId();
  const budgetId = useId();
  const styleId = useId();
  const daysId = useId();

  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]["value"]>("moderate");
  const [travelStyle, setTravelStyle] =
    useState<(typeof STYLES)[number]["value"]>("slow-immersive");
  const [durationDays, setDurationDays] = useState(7);
  const [emotionalGoal, setEmotionalGoal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DestinationRecommendation[] | null>(null);

  const toggleInterest = (label: string) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );

  const canSubmit = interests.length > 0 && emotionalGoal.trim().length >= 3;

  const search = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await postJson<DiscoveryResponse>("/api/discover", {
        interests,
        budget,
        durationDays,
        travelStyle,
        emotionalGoal,
      });
      setResults(data.destinations);
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
        kicker="Feature 01 — Destination Discovery"
        title="Where does your feeling want to go?"
        lede="Don't name a city. Name a longing — peace, wonder, roots, quiet — and we'll find the places whose history answers it."
      />

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !loading) search();
          }}
          className="space-y-6"
        >
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-parchment-300">
              What draws you? <span className="text-parchment-400/60">(pick at least one)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  selected={interests.includes(label)}
                  onToggle={() => toggleInterest(label)}
                />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={budgetId} className="text-sm font-medium text-parchment-300">
                Budget
              </label>
              <select
                id={budgetId}
                value={budget}
                onChange={(e) => setBudget(e.target.value as typeof budget)}
                className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-parchment-50"
              >
                {BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={styleId} className="text-sm font-medium text-parchment-300">
                Travel style
              </label>
              <select
                id={styleId}
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as typeof travelStyle)}
                className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-parchment-50"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={daysId} className="text-sm font-medium text-parchment-300">
                Days: {durationDays}
              </label>
              <input
                id={daysId}
                type="range"
                min={1}
                max={30}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="accent-ember-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={goalId} className="text-sm font-medium text-parchment-300">
              What are you hoping to feel?
            </label>
            <textarea
              id={goalId}
              value={emotionalGoal}
              onChange={(e) => setEmotionalGoal(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder='e.g. "a peaceful spiritual weekend" or "hidden gems instead of crowds"'
              className="rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-parchment-50 placeholder:text-parchment-400/50"
            />
          </div>

          <Button type="submit" disabled={!canSubmit} loading={loading}>
            {loading ? "Listening to the map…" : "Find places that answer"}
          </Button>
        </form>
      </Card>

      <section aria-label="Recommended destinations" className="mt-8 space-y-4">
        {error && <ErrorBanner message={error} onRetry={search} />}

        {loading && (
          <LoadingRegion label="Finding destinations that match your goal">
            <div className="space-y-4">
              <SkeletonCard lines={5} />
              <SkeletonCard lines={5} />
              <SkeletonCard lines={5} />
            </div>
          </LoadingRegion>
        )}

        {results?.map((d) => <DestinationCard key={`${d.name}-${d.country}`} destination={d} />)}
      </section>
    </div>
  );
}

function DestinationCard({ destination: d }: { destination: DestinationRecommendation }) {
  const { setDestination } = useDestination();
  const place = `${d.name}, ${d.country}`;

  return (
    <Card className="animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-parchment-50">{d.name}</h2>
          <p className="text-sm text-parchment-400">
            {d.region}, {d.country} · Best in {d.bestTimeToVisit} · {d.dailyBudgetEstimate}
          </p>
        </div>
        <p className="rounded-full border border-ember-500/40 bg-ember-500/10 px-3 py-1 text-sm italic text-ember-300">
          {d.tagline}
        </p>
      </div>

      <p className="mt-4 leading-relaxed text-parchment-100/90">{d.whyItMatters}</p>

      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Why this matches you">
        {d.matchedDesires.map((m) => (
          <li
            key={m}
            className="rounded-full bg-sage-500/15 px-3 py-1 text-xs text-sage-300"
          >
            {m}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <NoteList title="Essential places" items={d.attractions} />
        <NoteList title="Hidden gems" items={d.hiddenGems} />
        <NoteList title="With local people" items={d.localExperiences} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-ink-700 pt-4">
        <Link
          href="/stories"
          onClick={() => setDestination(place)}
          className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-ember-400"
        >
          Hear its story →
        </Link>
        <Link
          href="/time-portal"
          onClick={() => setDestination(place)}
          className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-parchment-100 hover:border-ember-500/50"
        >
          Open the time portal
        </Link>
        <Link
          href="/companions"
          onClick={() => setDestination(place)}
          className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-parchment-100 hover:border-ember-500/50"
        >
          Meet its people
        </Link>
      </div>
    </Card>
  );
}

function NoteList({
  title,
  items,
}: {
  title: string;
  items: { name: string; note: string }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ember-400">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.name} className="text-sm">
            <span className="font-medium text-parchment-100">{item.name}</span>
            <span className="text-parchment-400"> — {item.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
