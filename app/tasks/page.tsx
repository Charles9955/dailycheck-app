"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, CheckSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import {
  Card,
  Button,
  IconButton,
  Badge,
  Modal,
  Label,
  Input,
  Select,
  Textarea,
  EmptyState,
} from "@/components/ui";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { formatDate, relativeDay, daysUntil, cn } from "@/lib/utils";

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "High", color: "#f2557d" },
  medium: { label: "Medium", color: "#f5a623" },
  low: { label: "Low", color: "#6b6d85" },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To do", color: "#6b6d85" },
  "in-progress": { label: "In progress", color: "#5b6cff" },
  done: { label: "Done", color: "#3ecf8e" },
};

const FILTERS = ["All", "Today", "Upcoming", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

const empty: Omit<Task, "id" | "createdAt"> = {
  title: "",
  notes: "",
  dueDate: "",
  priority: "medium",
  status: "todo",
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, removeTask, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(
    () => ({
      open: tasks.filter((t) => t.status !== "done").length,
      done: tasks.filter((t) => t.status === "done").length,
      today: tasks.filter((t) => daysUntil(t.dueDate) <= 0 && t.status !== "done").length,
    }),
    [tasks],
  );

  const visible = useMemo(() => {
    let list = tasks;
    if (filter === "Today") list = tasks.filter((t) => daysUntil(t.dueDate) <= 0 && t.status !== "done");
    else if (filter === "Upcoming") list = tasks.filter((t) => daysUntil(t.dueDate) > 0 && t.status !== "done");
    else if (filter === "Completed") list = tasks.filter((t) => t.status === "done");
    else list = tasks.filter((t) => t.status !== "done");

    const rank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...list].sort((a, b) => {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return rank[a.priority] - rank[b.priority];
    });
  }, [tasks, filter]);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(t: Task) {
    setEditing(t);
    const { id, createdAt, ...rest } = t;
    setForm({ ...empty, ...rest });
    setOpen(true);
  }
  function save() {
    const payload = { ...form, title: form.title.trim() || "Untitled" };
    if (editing) updateTask(editing.id, payload);
    else addTask(payload);
    setOpen(false);
  }
  function toggle(t: Task) {
    updateTask(t.id, { status: t.status === "done" ? "todo" : "done" });
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-ink-850" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        description={`${counts.open} open · ${counts.today} due today · ${counts.done} completed`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> New task
          </Button>
        }
      />

      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "bg-brand text-white"
                : "bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="Nothing here"
          description="No tasks match this filter."
          action={
            <Button onClick={openAdd}>
              <Plus size={16} /> New task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {visible.map((t) => {
            const overdue = daysUntil(t.dueDate) < 0 && t.status !== "done";
            const pm = PRIORITY_META[t.priority];
            return (
              <Card key={t.id} className="group flex items-start gap-3 p-4">
                <button
                  onClick={() => toggle(t)}
                  aria-label="Toggle complete"
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    t.status === "done"
                      ? "border-accent-green bg-accent-green text-ink-950"
                      : "border-ink-500 hover:border-accent-green",
                  )}
                >
                  {t.status === "done" && <span className="text-xs">✓</span>}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      t.status === "done" ? "text-ink-400 line-through" : "text-white",
                    )}
                  >
                    {t.title}
                  </p>
                  {t.notes && <p className="mt-0.5 truncate text-xs text-ink-400">{t.notes}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={pm.color}>{pm.label}</Badge>
                    <Badge color={STATUS_META[t.status].color}>{STATUS_META[t.status].label}</Badge>
                    {t.dueDate && (
                      <span className={cn("text-xs", overdue ? "text-accent-rose" : "text-ink-400")}>
                        {formatDate(t.dueDate)} · {relativeDay(t.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconButton onClick={() => openEdit(t)} aria-label="Edit">
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton
                    onClick={() => removeTask(t.id)}
                    aria-label="Delete"
                    className="hover:bg-accent-rose/20 hover:text-accent-rose"
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit task" : "New task"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add task"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add details…"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Due date (optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
