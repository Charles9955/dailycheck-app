"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Target, Minus } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import {
  Card,
  Button,
  IconButton,
  Badge,
  StatCard,
  ProgressBar,
  Modal,
  Label,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import type { Goal } from "@/lib/types";
import { formatCurrency, formatDate, relativeDay, clamp, goalPercent } from "@/lib/utils";

const CATEGORIES = ["Personal", "Finance", "Fitness", "Career", "Learning", "Other"];
const CATEGORY_COLORS: Record<string, string> = {
  Personal: "#a855f7",
  Finance: "#3ecf8e",
  Fitness: "#22d3ee",
  Career: "#5b6cff",
  Learning: "#f5a623",
  Other: "#6b6d85",
};

const empty: Omit<Goal, "id"> = {
  title: "",
  category: "Personal",
  target: 100,
  current: 0,
  unit: "%",
  deadline: "",
};

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(empty);

  const completed = useMemo(
    () => goals.filter((g) => g.target > 0 && g.current >= g.target).length,
    [goals],
  );
  const avgProgress = useMemo(
    () =>
      goals.length
        ? Math.round(
            goals.reduce((acc, g) => acc + goalPercent(g.current, g.target), 0) / goals.length,
          )
        : 0,
    [goals],
  );

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(g: Goal) {
    setEditing(g);
    const { id, ...rest } = g;
    setForm(rest);
    setOpen(true);
  }
  function save() {
    const payload = { ...form, title: form.title.trim() || "Untitled" };
    if (editing) updateGoal(editing.id, payload);
    else addGoal(payload);
    setOpen(false);
  }
  function step(g: Goal, delta: number) {
    const upper = g.target > 0 ? g.target : Infinity;
    const next = clamp(g.current + delta, 0, upper);
    updateGoal(g.id, { current: next });
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-ink-850" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Goals"
        description="Track progress toward what matters most."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> New goal
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active goals" value={goals.length} accent="#22d3ee" icon={<Target size={18} />} />
        <StatCard label="Completed" value={completed} accent="#3ecf8e" />
        <StatCard label="Average progress" value={`${avgProgress}%`} accent="#5b6cff" />
      </div>

      {goals.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Target size={28} />}
            title="No goals yet"
            description="Set a goal and watch your progress grow."
            action={
              <Button onClick={openAdd}>
                <Plus size={16} /> New goal
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = goalPercent(g.current, g.target);
            const done = g.target > 0 && g.current >= g.target;
            const color = CATEGORY_COLORS[g.category] ?? "#5b6cff";
            const fmt = (n: number) => (g.unit === "kr" ? formatCurrency(n) : `${n} ${g.unit}`);
            const stepSize = g.target >= 1000 ? 100 : g.target >= 100 ? 5 : 1;
            return (
              <Card key={g.id} className="group p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{g.title}</p>
                      {done && <Badge color="#3ecf8e">Completed</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge color={color}>{g.category}</Badge>
                      {g.deadline && (
                        <span className="text-xs text-ink-400">
                          Due {formatDate(g.deadline)} · {relativeDay(g.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton onClick={() => openEdit(g)} aria-label="Edit">
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      onClick={() => removeGoal(g.id)}
                      aria-label="Delete"
                      className="hover:bg-accent-rose/20 hover:text-accent-rose"
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{Math.round(pct)}%</span>
                    <span className="text-ink-400">
                      {fmt(g.current)} / {fmt(g.target)}
                    </span>
                  </div>
                  <ProgressBar value={pct} color={done ? "#3ecf8e" : color} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <IconButton
                    onClick={() => step(g, -stepSize)}
                    aria-label="Decrease"
                    className="bg-ink-800"
                  >
                    <Minus size={15} />
                  </IconButton>
                  <IconButton
                    onClick={() => step(g, stepSize)}
                    aria-label="Increase"
                    className="bg-ink-800"
                  >
                    <Plus size={15} />
                  </IconButton>
                  <span className="text-xs text-ink-400">±{stepSize} {g.unit}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit goal" : "New goal"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add goal"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Read 24 books"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <Label>Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="%, km, books, kr…"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Current</Label>
              <Input
                type="number"
                value={form.current || ""}
                onChange={(e) => setForm({ ...form, current: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Target</Label>
              <Input
                type="number"
                value={form.target || ""}
                onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Label>Deadline (optional)</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
