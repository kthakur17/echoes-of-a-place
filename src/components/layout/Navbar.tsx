"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/stories", label: "Stories" },
  { href: "/time-portal", label: "Time Portal" },
  { href: "/companions", label: "Companions" },
  { href: "/heritage", label: "Heritage" },
  { href: "/events", label: "Events" },
  { href: "/storybook", label: "Storybook" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg text-parchment-50"
        >
          <span aria-hidden="true">🏛️</span>
          <span>
            Echoes <span className="text-ember-400">of a Place</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-ink-800 text-ember-300"
                  : "text-parchment-300 hover:text-parchment-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="max-w-40 truncate text-sm text-parchment-400">
                {user.isAnonymous ? "Guest traveler" : (user.displayName ?? user.email)}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-parchment-300 transition-colors hover:border-ember-500/40"
              >
                Sign out
              </button>
            </>
          ) : (
            <span className="text-sm text-parchment-400">Not signed in</span>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-ink-700 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="text-parchment-100">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-ink-700 px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm ${
                  pathname === link.href
                    ? "bg-ink-800 text-ember-300"
                    : "text-parchment-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="mt-2 rounded-md border border-ink-700 px-3 py-2 text-left text-sm text-parchment-300"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
