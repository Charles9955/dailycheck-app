"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
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
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate, sum, todayISO } from "@/lib/utils";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Health",
  "Entertainment",
  "Travel",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#3ecf8e",
  Transport: "#22d3ee",
  Shopping: "#a855f7",
  Utilities: "#f5a623",
  Health: "#f2557d",
  Entertainment: "#5b6cff",
  Travel: "#7c89ff",
  Other: "#6b6d85",
};

const empty: Omit<Expense, "id"> = {
  description: "",
  amount: 0,
  category: "Food",
  date: todayISO(),
};

export default function ExpensesPage() {
  const { expenses, addExpense, removeExpense, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("All");

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthKey)),
    [expenses, monthKey],
  );
  const monthTotal = sum(monthExpenses.map((e) => e.amount));

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthExpenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  const topCategory = byCategory[0]?.[0] ?? "—";

  const visible = useMemo(() => {
    const list = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter]);

  function save() {
    if (!form.description.trim() || form.amount <= 0) return;
    addExpense(form);
    setForm(empty);
    setOpen(false);
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-ink-850" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Expenses"
        description="Log spending and see where your money goes."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Spent this month" value={formatCurrency(monthTotal)} accent="#3ecf8e" icon={<Wallet size={18} />} />
        <StatCard label="Transactions" value={monthExpenses.length} accent="#5b6cff" />
        <StatCard label="Top category" value={topCategory} sub={byCategory[0] ? formatCurrency(byCategory[0][1]) : undefined} accent="#a855f7" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-white">This month by category</h2>
          {byCategory.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No spending yet this month.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {byCategory.map(([cat, amt]) => {
                const pct = monthTotal ? (amt / monthTotal) * 100 : 0;
                const color = CATEGORY_COLORS[cat] ?? "#6b6d85";
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink-200">{cat}</span>
                      <span className="font-medium text-white">{formatCurrency(amt)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Transaction list */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Transactions</h2>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-auto py-1.5 text-xs"
            >
              <option>All</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No expenses" description="Add an expense to get started." />
          ) : (
            <ul className="mt-3 divide-y divide-ink-800">
              {visible.map((e) => {
                const color = CATEGORY_COLORS[e.category] ?? "#6b6d85";
                return (
                  <li key={e.id} className="group flex items-center gap-3 py-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{e.description}</p>
                      <p className="text-xs text-ink-400">{formatDate(e.date)}</p>
                    </div>
                    <Badge color={color}>{e.category}</Badge>
                    <span className="w-20 text-right text-sm font-semibold text-white">
                      {formatCurrency(e.amount)}
                    </span>
                    <IconButton
                      onClick={() => removeExpense(e.id)}
                      aria-label="Delete"
                      className="opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent-rose/20 hover:text-accent-rose"
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add expense"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Add expense</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Groceries"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
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
      </Modal>
    </div>
  );
}
