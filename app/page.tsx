"use client";

import Link from "next/link";
import {
  CreditCard,
  Wallet,
  Target,
  CheckSquare,
  ArrowRight,
  CalendarClock,
  StickyNote,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { Card, StatCard, ProgressBar, Badge, EmptyState } from "@/components/ui";
import {
  formatCurrency,
  monthlyCost,
  sum,
  daysUntil,
  relativeDay,
  formatDate,
  goalPercent,
} from "@/lib/utils";

export default function DashboardPage() {
  const { subscriptions, expenses, tasks, goals, notes, ready, updateTask } = useStore();

  if (!ready) return <LoadingState />;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlySubs = sum(subscriptions.map(monthlyCost));
  const paygCount = subscriptions.filter((s) => s.billingCycle === "as-you-go").length;
  const recurringCount = subscriptions.length - paygCount;
  const monthSpend = sum(
    expenses.filter((e) => e.date.startsWith(monthKey)).map((e) => e.amount),
  );

  const upcoming = [...subscriptions]
    .filter((s) => s.renewalDate && daysUntil(s.renewalDate) >= 0)
    .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate))
    .slice(0, 5);

  const todayTasks = tasks.filter(
    (t) => daysUntil(t.dueDate) <= 0 && t.status !== "done",
  );

  const activeGoals = [...goals]
    .sort((a, b) => goalPercent(b.current, b.target) - goalPercent(a.current, a.target))
    .slice(0, 4);

  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Good to see you 👋"
        description="Here's everything that needs your attention today."
      />

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly subscriptions"
          value={formatCurrency(monthlySubs)}
          sub={
            paygCount > 0
              ? `${recurringCount} recurring · ${paygCount} pay-as-you-go`
              : `${recurringCount} active · ${formatCurrency(monthlySubs * 12)}/yr`
          }
          icon={<CreditCard size={18} />}
          accent="#a855f7"
        />
        <StatCard
          label="Spent this month"
          value={formatCurrency(monthSpend)}
          sub={`${expenses.filter((e) => e.date.startsWith(monthKey)).length} transactions`}
          icon={<Wallet size={18} />}
          accent="#3ecf8e"
        />
        <StatCard
          label="Tasks due"
          value={todayTasks.length}
          sub="Due today or overdue"
          icon={<CheckSquare size={18} />}
          accent="#f5a623"
        />
        <StatCard
          label="Active goals"
          value={goals.length}
          sub={`${goals.filter((g) => g.current >= g.target).length} completed`}
          icon={<Target size={18} />}
          accent="#22d3ee"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Upcoming payments */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            icon={<CalendarClock size={16} />}
            title="Upcoming payments"
            href="/subscriptions"
          />
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No upcoming renewals.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-800">
              {upcoming.map((s) => {
                const d = daysUntil(s.renewalDate);
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: `${s.color}22`, color: s.color }}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-ink-400">{formatDate(s.renewalDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(s.price)}
                      </p>
                      <Badge color={d <= 3 ? "#f2557d" : "#6b6d85"}>
                        {relativeDay(s.renewalDate)}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Tasks due today */}
        <Card className="p-5">
          <SectionTitle
            icon={<CheckSquare size={16} />}
            title="Tasks due today"
            href="/tasks"
          />
          {todayTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">
              You&apos;re all caught up. 🎉
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {todayTasks.slice(0, 6).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-800 bg-ink-900/50 px-3 py-2.5"
                >
                  <button
                    onClick={() => updateTask(t.id, { status: "done" })}
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-ink-500 transition-colors hover:border-accent-green"
                    aria-label="Complete task"
                  />
                  <span className="flex-1 truncate text-sm text-white">{t.title}</span>
                  <PriorityDot priority={t.priority} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Goal progress */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle icon={<Target size={16} />} title="Goal progress" href="/goals" />
          {activeGoals.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No goals yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {activeGoals.map((g) => {
                const pct = goalPercent(g.current, g.target);
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{g.title}</span>
                      <span className="text-ink-400">
                        {g.unit === "kr"
                          ? `${formatCurrency(g.current)} / ${formatCurrency(g.target)}`
                          : `${g.current} / ${g.target} ${g.unit}`}
                      </span>
                    </div>
                    <ProgressBar value={pct} color={pct >= 100 ? "#3ecf8e" : "#5b6cff"} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent notes */}
        <Card className="p-5">
          <SectionTitle icon={<StickyNote size={16} />} title="Recent notes" href="/notes" />
          {recentNotes.length === 0 ? (
            <EmptyState title="No notes yet" />
          ) : (
            <ul className="mt-3 space-y-2">
              {recentNotes.map((n) => (
                <Link
                  key={n.id}
                  href="/notes"
                  className="block rounded-xl border border-ink-800 bg-ink-900/50 px-3 py-2.5 transition-colors hover:border-ink-600"
                >
                  <p className="truncate text-sm font-medium text-white">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">
                    {n.content.replace(/[#*-]/g, "").trim()}
                  </p>
                </Link>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-ink-400">{icon}</span>
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-medium text-ink-400 transition-colors hover:text-white"
      >
        View all <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function PriorityDot({ priority }: { priority: "low" | "medium" | "high" }) {
  const color = { low: "#6b6d85", medium: "#f5a623", high: "#f2557d" }[priority];
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      title={priority}
    />
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-ink-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-850" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-ink-850" />
    </div>
  );
}
