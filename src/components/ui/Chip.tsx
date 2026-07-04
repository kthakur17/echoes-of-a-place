"use client";

export interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/** Toggleable selection chip (interest picker, era selector, etc.). */
export function Chip({ label, selected, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        selected
          ? "border-ember-500 bg-ember-500/15 text-ember-300"
          : "border-ink-700 bg-ink-800 text-parchment-300 hover:border-ember-500/40"
      }`}
    >
      {label}
    </button>
  );
}
