"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import {
  Card,
  Button,
  IconButton,
  Badge,
  StatCard,
  Modal,
  Label,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import type { Subscription, BillingCycle } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  monthlyCost,
  yearlyCost,
  cycleLabel,
  relativeDay,
  daysUntil,
  sum,
  todayISO,
} from "@/lib/utils";

const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "AI Tools",
  "Storage",
  "Developer",
  "Creative",
  "Health",
  "Other",
];
const COLORS = ["#5b6cff", "#a855f7", "#3ecf8e", "#f5a623", "#f2557d", "#22d3ee", "#e50914", "#1db954"];

const empty: Omit<Subscription, "id"> = {
  name: "",
  price: 0,
  billingCycle: "monthly",
  renewalDate: todayISO(),
  category: "Entertainment",
  color: "#5b6cff",
};

export default function SubscriptionsPage() {
  const { subscriptions, addSubscription, updateSubscription, removeSubscription, ready } =
    useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState(empty);

  const monthlyTotal = useMemo(() => sum(subscriptions.map(monthlyCost)), [subscriptions]);
  const yearlyTotal = useMemo(() => sum(subscriptions.map(yearlyCost)), [subscriptions]);

  const sorted = useMemo(
    () => [...subscriptions].sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate)),
    [subscriptions],
  );

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(s: Subscription) {
    setEditing(s);
    const { id, ...rest } = s;
    setForm(rest);
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;
    if (editing) updateSubscription(editing.id, form);
    else addSubscription(form);
    setOpen(false);
  }

  if (!ready) return <Skeleton />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Subscriptions"
        description="Track recurring costs and never miss a renewal."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add subscription
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Monthly total" value={formatCurrency(monthlyTotal)} accent="#a855f7" icon={<CreditCard size={18} />} />
        <StatCard label="Yearly total" value={formatCurrency(yearlyTotal)} accent="#5b6cff" />
        <StatCard label="Active subscriptions" value={subscriptions.length} accent="#3ecf8e" />
      </div>

      {sorted.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<CreditCard size={28} />}
            title="No subscriptions yet"
            description="Add your first subscription to start tracking renewals."
            action={
              <Button onClick={openAdd}>
                <Plus size={16} /> Add subscription
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => {
            const d = daysUntil(s.renewalDate);
            return (
              <Card key={s.id} className="group relative overflow-hidden p-5">
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `${s.color}22`, color: s.color }}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <Badge>{s.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton onClick={() => openEdit(s)} aria-label="Edit">
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      onClick={() => removeSubscription(s.id)}
                      aria-label="Delete"
                      className="hover:bg-accent-rose/20 hover:text-accent-rose"
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-white">{formatCurrency(s.price)}</p>
                    <p className="text-xs text-ink-400">
                      {cycleLabel(s.billingCycle)} · {formatCurrency(monthlyCost(s))}/mo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400">Renews</p>
                    <Badge color={d <= 3 ? "#f2557d" : d <= 7 ? "#f5a623" : "#6b6d85"}>
                      {relativeDay(s.renewalDate)}
                    </Badge>
                    <p className="mt-1 text-[11px] text-ink-400">{formatDate(s.renewalDate)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit subscription" : "Add subscription"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add subscription"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Netflix"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Billing cycle</Label>
              <Select
                value={form.billingCycle}
                onChange={(e) =>
                  setForm({ ...form, billingCycle: e.target.value as BillingCycle })
                }
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Renewal date</Label>
              <Input
                type="date"
                value={form.renewalDate}
                onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Accent color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Select color ${c}`}
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all " +
                    (form.color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-ink-850"
                      : "opacity-70 hover:opacity-100")
                  }
                  style={{ backgroundColor: c }}
                >
                  {form.color === c && "✓"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 animate-pulse rounded bg-ink-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-850" />
        ))}
      </div>
    </div>
  );
}
