export interface EmptyStateProps {
  emoji: string;
  title: string;
  hint: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-700 px-6 py-14 text-center">
      <span aria-hidden="true" className="text-4xl">
        {emoji}
      </span>
      <h3 className="font-display text-xl text-parchment-100">{title}</h3>
      <p className="max-w-md text-sm text-parchment-400">{hint}</p>
      {action}
    </div>
  );
}
