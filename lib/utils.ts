import type { BillingCycle, Subscription } from "./types";

// Generate a reasonably unique id without extra deps.
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number): string {
  // Swedish kronor — e.g. "199 kr" / "199,00 kr"
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "No date";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoFromDate(d: Date): string {
  // Local-date safe ISO (YYYY-MM-DD)
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

// True for usage-based subscriptions that have no fixed billing schedule.
export function isPayAsYouGo(sub: Subscription): boolean {
  return sub.billingCycle === "as-you-go";
}

// Normalise any billing cycle price into a per-month figure. Pay-as-you-go
// has no predictable monthly cost, so it contributes 0 to recurring totals.
export function monthlyCost(sub: Subscription): number {
  switch (sub.billingCycle) {
    case "weekly":
      return (sub.price * 52) / 12;
    case "monthly":
      return sub.price;
    case "quarterly":
      return sub.price / 3;
    case "yearly":
      return sub.price / 12;
    case "as-you-go":
      return 0;
    default:
      return sub.price;
  }
}

export function yearlyCost(sub: Subscription): number {
  return monthlyCost(sub) * 12;
}

export function cycleLabel(cycle: BillingCycle): string {
  return {
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    "as-you-go": "Pay as you go",
  }[cycle];
}

// Empty/undefined dates sort to the far future (Infinity) so they never
// count as "due" or "upcoming".
export function daysUntil(iso?: string): number {
  if (!iso) return Infinity;
  const target = new Date(iso + "T00:00:00").getTime();
  if (Number.isNaN(target)) return Infinity;
  const now = new Date(todayISO() + "T00:00:00").getTime();
  return Math.round((target - now) / 86400000);
}

export function relativeDay(iso?: string): string {
  if (!iso) return "";
  const d = daysUntil(iso);
  if (!Number.isFinite(d)) return "";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d < 0) return `${Math.abs(d)}d ago`;
  return `in ${d}d`;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

// Safe goal completion percentage (0–100); returns 0 when target is unset.
export function goalPercent(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return clamp((current / target) * 100);
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Returns a date this month offset by `dayOfMonth`, formatted as ISO.
export function dateThisMonth(dayOfMonth: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  return isoFromDate(d);
}

export function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoFromDate(d);
}
