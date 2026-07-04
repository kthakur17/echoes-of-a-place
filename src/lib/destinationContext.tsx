"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Shares the "current destination" across features so the journey chains
 * naturally: discover a place → hear its story → open its time portal →
 * meet its people, without retyping the destination on every page.
 */

const STORAGE_KEY = "echoes.currentDestination";

interface DestinationContextValue {
  destination: string;
  setDestination: (d: string) => void;
}

const DestinationContext = createContext<DestinationContextValue | null>(null);

export function DestinationProvider({ children }: { children: React.ReactNode }) {
  const [destination, setDestinationState] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setDestinationState(saved);
    } catch {
      // sessionStorage unavailable (private mode) — feature still works, just no persistence
    }
  }, []);

  const value = useMemo<DestinationContextValue>(
    () => ({
      destination,
      setDestination: (d: string) => {
        setDestinationState(d);
        try {
          sessionStorage.setItem(STORAGE_KEY, d);
        } catch {
          // ignore
        }
      },
    }),
    [destination],
  );

  return <DestinationContext.Provider value={value}>{children}</DestinationContext.Provider>;
}

export function useDestination(): DestinationContextValue {
  const ctx = useContext(DestinationContext);
  if (!ctx) throw new Error("useDestination must be used inside <DestinationProvider>");
  return ctx;
}
