export interface PageHeaderProps {
  kicker: string;
  title: string;
  lede: string;
}

export function PageHeader({ kicker, title, lede }: PageHeaderProps) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ember-400">
        {kicker}
      </p>
      <h1 className="font-display text-3xl text-parchment-50 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-parchment-400">{lede}</p>
    </header>
  );
}
