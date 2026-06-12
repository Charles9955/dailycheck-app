"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CreditCard, CheckSquare, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { Card, Button, Badge } from "@/components/ui";
import type { CalendarEvent } from "@/lib/types";
import { isoFromDate, formatDate, formatCurrency, todayISO, cn } from "@/lib/utils";

const TYPE_META = {
  subscription: { color: "#a855f7", icon: CreditCard, label: "Renewal" },
  task: { color: "#f5a623", icon: CheckSquare, label: "Task" },
  goal: { color: "#22d3ee", icon: Target, label: "Goal deadline" },
} as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { subscriptions, tasks, goals, ready } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const events = useMemo<CalendarEvent[]>(() => {
    const out: CalendarEvent[] = [];
    subscriptions.forEach((s) =>
      out.push({
        id: `sub-${s.id}`,
        date: s.renewalDate,
        title: s.name,
        type: "subscription",
        color: TYPE_META.subscription.color,
        meta: formatCurrency(s.price),
      }),
    );
    tasks.forEach((t) =>
      out.push({
        id: `task-${t.id}`,
        date: t.dueDate,
        title: t.title,
        type: "task",
        color: TYPE_META.task.color,
        meta: t.status === "done" ? "Done" : t.priority,
      }),
    );
    goals.forEach((g) =>
      out.push({
        id: `goal-${g.id}`,
        date: g.deadline,
        title: g.title,
        type: "goal",
        color: TYPE_META.goal.color,
      }),
    );
    return out;
  }, [subscriptions, tasks, goals]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return map;
  }, [events]);

  const { year, month } = cursor;
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = todayISO();

  // Build a 6-row grid of date cells (null = padding).
  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoFromDate(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = useMemo(
    () =>
      [...events]
        .filter((e) => {
          const d = new Date(e.date + "T00:00:00");
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, year, month],
  );

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function goToday() {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-ink-850" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calendar"
        description="Renewals, task due dates, and goal deadlines in one view."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={goToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={() => shift(-1)} aria-label="Previous month">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" onClick={() => shift(1)} aria-label="Next month">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        }
      />

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(TYPE_META).map(([key, m]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-ink-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-4 lg:col-span-2">
          <h2 className="mb-3 px-1 text-base font-semibold text-white">{monthLabel}</h2>

          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-[11px] font-semibold uppercase text-ink-400">
                {d}
              </div>
            ))}

            {cells.map((iso, i) => {
              if (!iso) return <div key={i} className="min-h-[84px] rounded-lg" />;
              const dayEvents = eventsByDate.get(iso) ?? [];
              const isToday = iso === today;
              const dayNum = parseInt(iso.slice(8), 10);
              return (
                <div
                  key={iso}
                  className={cn(
                    "min-h-[84px] rounded-lg border border-ink-800 bg-ink-900/40 p-1.5",
                    isToday && "border-brand/60 bg-brand/10",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                      isToday ? "bg-brand text-white" : "text-ink-300",
                    )}
                  >
                    {dayNum}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        title={e.title}
                        className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: `${e.color}26`, color: e.color }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="px-1 text-[10px] text-ink-400">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Agenda */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-white">This month</h2>
          {monthEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">Nothing scheduled this month.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {monthEvents.map((e) => {
                const Icon = TYPE_META[e.type].icon;
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/50 px-3 py-2.5"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${e.color}26`, color: e.color }}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{e.title}</p>
                      <p className="text-xs text-ink-400">{formatDate(e.date)}</p>
                    </div>
                    {e.meta && <Badge color={e.color}>{e.meta}</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
