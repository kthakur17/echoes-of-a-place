"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChatMessage, CompanionChatResponse, PersonaId } from "@/types";
import { PERSONA_LIST, PERSONAS } from "@/lib/personas";
import { postJson, ClientApiError } from "@/lib/api";
import { useDestination } from "@/lib/destinationContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DestinationField } from "@/components/ui/DestinationField";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CompanionsPage() {
  return (
    <AuthGate>
      <CompanionsContent />
    </AuthGate>
  );
}

function CompanionsContent() {
  const inputId = useId();
  const { destination } = useDestination();
  const [personaId, setPersonaId] = useState<PersonaId | null>(null);
  const [chatFor, setChatFor] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const persona = personaId ? PERSONAS[personaId] : null;
  const canChat = destination.trim().length >= 2 && persona !== null;

  // Changing persona or destination starts a fresh conversation.
  const selectPersona = (id: PersonaId) => {
    setPersonaId(id);
    setChatFor(destination);
    setHistory([]);
    setError(null);
  };

  useEffect(() => {
    if (destination !== chatFor && history.length > 0) {
      setHistory([]);
    }
  }, [destination, chatFor, history.length]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [history, sending]);

  const send = async () => {
    const message = draft.trim();
    if (!message || !persona || sending) return;

    setSending(true);
    setError(null);
    setDraft("");
    const priorHistory = history;
    setHistory((prev) => [...prev, { role: "user", text: message }]);

    try {
      const data = await postJson<CompanionChatResponse>("/api/companions/chat", {
        destination,
        personaId: persona.id,
        history: priorHistory,
        message,
      });
      setHistory((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setError(
        err instanceof ClientApiError
          ? err.message
          : `${persona.name} didn't catch that. Please try again.`,
      );
      setDraft(message);
      setHistory(priorHistory);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="Feature 04 — Cultural Companions"
        title="Don't read about the place. Talk to it."
        lede="Five locals are waiting — an artisan, a historian, a storyteller, a musician, and a street-food auntie. Each knows your destination intimately."
      />

      <Card>
        <DestinationField label="Which place shall we talk about?" />
      </Card>

      <div
        role="radiogroup"
        aria-label="Choose a companion"
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {PERSONA_LIST.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={personaId === p.id}
            onClick={() => selectPersona(p.id)}
            className={`rounded-xl border p-4 text-center transition-colors ${
              personaId === p.id
                ? "border-ember-500 bg-ember-500/10"
                : "border-ink-700 bg-ink-900/80 hover:border-ember-500/40"
            }`}
          >
            <span aria-hidden="true" className="text-3xl">
              {p.emoji}
            </span>
            <p className="mt-2 font-display text-parchment-50">{p.name}</p>
            <p className="text-xs text-parchment-400">{p.title}</p>
          </button>
        ))}
      </div>

      <section aria-label="Conversation" className="mt-6">
        {!persona && (
          <EmptyState
            emoji="🫖"
            title="Choose someone to sit with"
            hint="Each companion answers in their own voice, drawing on the real culture of your destination — and they remember your conversation."
          />
        )}

        {persona && (
          <Card className="flex h-[32rem] flex-col p-0">
            <header className="flex items-center gap-3 border-b border-ink-700 px-5 py-3">
              <span aria-hidden="true" className="text-2xl">
                {persona.emoji}
              </span>
              <div>
                <p className="font-display text-parchment-50">{persona.name}</p>
                <p className="text-xs text-parchment-400">
                  {persona.title}
                  {destination ? ` · ${destination}` : ""}
                </p>
              </div>
            </header>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-label={`Conversation with ${persona.name}`}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
            >
              <Bubble role="model" text={persona.greeting} />
              {history.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.text} />
              ))}
              {sending && (
                <p className="text-sm italic text-parchment-400">
                  {persona.name} is thinking…
                </p>
              )}
            </div>

            {error && (
              <div className="px-5 pb-2">
                <ErrorBanner message={error} />
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 border-t border-ink-700 p-4"
            >
              <label htmlFor={inputId} className="sr-only">
                Your message to {persona.name}
              </label>
              <input
                id={inputId}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={1000}
                placeholder={
                  canChat
                    ? `Ask ${persona.name} anything about ${destination}…`
                    : "Enter a destination above first"
                }
                disabled={!canChat || sending}
                className="flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-parchment-50 placeholder:text-parchment-400/50 disabled:opacity-50"
              />
              <Button type="submit" disabled={!canChat || !draft.trim()} loading={sending}>
                Send
              </Button>
            </form>
          </Card>
        )}
      </section>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "model"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-ember-500/20 text-parchment-50"
            : "rounded-bl-sm bg-ink-800 text-parchment-100/90"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
