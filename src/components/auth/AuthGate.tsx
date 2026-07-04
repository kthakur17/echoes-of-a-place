"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";

/**
 * Wraps every feature page. Renders children only for signed-in users
 * (Google or anonymous guest); otherwise shows the sign-in card.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle, signInAsGuest } = useAuth();
  const [busy, setBusy] = useState<"google" | "guest" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <SkeletonCard lines={3} />;
  if (user) return <>{children}</>;

  const handle = async (method: "google" | "guest") => {
    setBusy(method);
    setError(null);
    try {
      await (method === "google" ? signInWithGoogle() : signInAsGuest());
    } catch (err) {
      console.error("[auth] sign-in failed:", err);
      setError("Sign-in didn't complete. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="mx-auto max-w-md text-center">
      <p aria-hidden="true" className="mb-3 text-4xl">
        🗝️
      </p>
      <h2 className="font-display text-2xl text-parchment-50">
        Every journey needs a traveler
      </h2>
      <p className="mt-2 text-sm text-parchment-400">
        Sign in so your discoveries, conversations, and stories can be woven into
        your personal Journey Storybook.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={() => handle("google")} loading={busy === "google"}>
          Continue with Google
        </Button>
        <Button
          variant="secondary"
          onClick={() => handle("guest")}
          loading={busy === "guest"}
        >
          Explore as a guest
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </Card>
  );
}
