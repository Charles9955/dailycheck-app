"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { navItems } from "./nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-800 bg-ink-900 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-glow">
              <CheckCircle2 size={20} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              DailyCheck
            </span>
          </Link>
          <button
            className="text-ink-400 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Workspace
        </p>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink-800 text-white"
                    : "text-ink-300 hover:bg-ink-850 hover:text-white",
                )}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  style={{
                    backgroundColor: active ? `${item.accent}26` : "transparent",
                    color: active ? item.accent : undefined,
                  }}
                >
                  <Icon size={17} />
                </span>
                {item.label}
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.accent }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer card */}
        <div className="m-3 rounded-xl border border-ink-800 bg-ink-850 p-3">
          <p className="text-xs font-medium text-white">Local-first</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
            All your data is stored privately in this browser.
          </p>
        </div>
      </aside>
    </>
  );
}
