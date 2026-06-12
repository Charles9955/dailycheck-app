"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { navItems } from "./nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current =
    navItems.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
    ) ?? navItems[0];

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-800 bg-ink-950/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink-200 hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-white">{current.label}</span>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Shared page header used across all routes.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
