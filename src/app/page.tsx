import Link from "next/link";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    href: "/discover",
    emoji: "🧭",
    title: "Destination Discovery",
    text: "Tell us what you're longing for — not where. We find places that answer the feeling.",
  },
  {
    href: "/stories",
    emoji: "📖",
    title: "Cultural Story Engine",
    text: "History, legend, and folklore narrated like a documentary — written live, just for you.",
  },
  {
    href: "/time-portal",
    emoji: "⏳",
    title: "Time Portal",
    text: "Stand in the same square today, fifty years ago, a century ago, and in the ancient era.",
  },
  {
    href: "/companions",
    emoji: "🫖",
    title: "Cultural Companions",
    text: "Talk with an artisan, a historian, a storyteller, a musician, a street-food auntie.",
  },
  {
    href: "/heritage",
    emoji: "🏺",
    title: "Hidden Heritage",
    text: "Endangered crafts, fading songs, disappearing quarters — and how your visit helps them survive.",
  },
  {
    href: "/events",
    emoji: "🎎",
    title: "Cultural Events",
    text: "Festivals and gatherings during your dates, with the customs and etiquette to belong.",
  },
  {
    href: "/storybook",
    emoji: "📜",
    title: "Journey Storybook",
    text: "Everything you explored, compiled into a personal travel memoir worth keeping.",
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-up">
      <section className="py-14 text-center sm:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-ember-400">
          A different kind of travel platform
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl leading-tight text-parchment-50 sm:text-6xl">
          Tourists visit places.
          <br />
          <span className="italic text-ember-300">
            We help them have conversations with history.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment-400">
          Most platforms answer &ldquo;where should I go?&rdquo;. Echoes of a Place answers
          &ldquo;why does this place matter?&rdquo; — through stories, living traditions,
          local voices, and heritage on the edge of being forgotten.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/discover"
            className="rounded-lg bg-ember-500 px-6 py-3 font-semibold text-ink-950 transition-colors hover:bg-ember-400"
          >
            Begin your journey
          </Link>
          <Link
            href="/stories"
            className="rounded-lg border border-ink-700 px-6 py-3 text-parchment-100 transition-colors hover:border-ember-500/50"
          >
            Hear a story first
          </Link>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="py-10">
        <h2 id="features-heading" className="sr-only">
          Platform features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="group">
              <Card className="h-full transition-colors group-hover:border-ember-500/50">
                <p aria-hidden="true" className="text-3xl">
                  {f.emoji}
                </p>
                <h3 className="mt-3 font-display text-xl text-parchment-50 group-hover:text-ember-300">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-parchment-400">{f.text}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
