"use client";

import { useState } from "react";
import { Cloud, CloudOff, Check, Loader2, LogOut, Mail, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

const SYNC_LABEL = {
  local: "Local only",
  syncing: "Syncing…",
  synced: "Synced",
  error: "Sync error",
} as const;

export function AccountPanel() {
  const { cloudEnabled, user, syncState, signInWithEmail, signOut } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No cloud configured — show the original local-first message.
  if (!cloudEnabled) {
    return (
      <div className="m-3 rounded-xl border border-ink-800 bg-ink-850 p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-white">
          <CloudOff size={13} /> Local-first
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
          Data is stored privately in this browser.
        </p>
      </div>
    );
  }

  // Signed in — show account + sync status.
  if (user) {
    const Icon =
      syncState === "synced" ? Check : syncState === "error" ? AlertCircle : Loader2;
    const color =
      syncState === "synced"
        ? "#3ecf8e"
        : syncState === "error"
          ? "#f2557d"
          : "#5b6cff";
    return (
      <div className="m-3 rounded-xl border border-ink-800 bg-ink-850 p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand-400">
            {(user.email ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user.email}</p>
            <p className="flex items-center gap-1 text-[11px]" style={{ color }}>
              <Icon size={11} className={syncState === "syncing" ? "animate-spin" : ""} />
              {SYNC_LABEL[syncState]}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink-800 px-2 py-1.5 text-[11px] font-medium text-ink-300 transition-colors hover:bg-ink-700 hover:text-white"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    );
  }

  // Signed out, cloud available — magic-link sign-in.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await signInWithEmail(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="m-3 rounded-xl border border-ink-800 bg-ink-850 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-white">
        <Cloud size={13} /> Sync across devices
      </p>
      {sent ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-accent-green">
          Check your email for a magic link to sign in. ✉️
        </p>
      ) : (
        <>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
            Sign in to back up and sync your data.
          </p>
          <form onSubmit={handleSubmit} className="mt-2 space-y-1.5">
            <div className="relative">
              <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 py-1.5 pl-7 pr-2 text-[11px] text-white placeholder:text-ink-400 focus:border-brand focus:outline-none"
              />
            </div>
            {error && <p className="text-[11px] text-accent-rose">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              Send magic link
            </button>
          </form>
        </>
      )}
    </div>
  );
}
