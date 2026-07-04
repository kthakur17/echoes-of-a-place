"use client";

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
    >
      <p className="m-0">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-red-800 px-3 py-1 text-red-200 transition-colors hover:bg-red-900/40"
        >
          Try again
        </button>
      )}
    </div>
  );
}
