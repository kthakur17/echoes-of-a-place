import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-ink-700 bg-ink-900/80 p-5 shadow-lg shadow-black/20 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
