"use client";

import { useId } from "react";
import { useDestination } from "@/lib/destinationContext";

/**
 * Shared destination input, bound to the cross-feature destination context.
 * Whatever place the traveler is exploring follows them between features.
 */
export function DestinationField({ label = "Destination" }: { label?: string }) {
  const id = useId();
  const { destination, setDestination } = useDestination();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-parchment-300">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="e.g. Varanasi, Kyoto, Oaxaca, Fez…"
        maxLength={80}
        autoComplete="off"
        className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-parchment-50 placeholder:text-parchment-400/50 focus:border-ember-500"
      />
    </div>
  );
}
