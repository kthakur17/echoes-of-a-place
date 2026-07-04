/** Shimmer placeholders shown while Gemini writes. */

export function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <div className="skeleton h-4" style={{ width }} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  const widths = ["92%", "100%", "84%", "96%", "70%", "88%"];
  return (
    <div
      className="space-y-3 rounded-xl border border-ink-700 bg-ink-900/80 p-5"
      aria-hidden="true"
    >
      <div className="skeleton h-6 w-2/5" />
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

/** Announces loading to screen readers while skeletons shimmer for sighted users. */
export function LoadingRegion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
