"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Search, StickyNote, Tag } from "lucide-react";
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
  Textarea,
  EmptyState,
} from "@/components/ui";
import type { Note } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

interface Draft {
  title: string;
  content: string;
  tags: string;
}
const emptyDraft: Draft = { title: "", content: "", tags: "" };

export default function NotesPage() {
  const { notes, addNote, updateNote, removeNote, ready } = useStore();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notes]
      .filter((n) => {
        const matchesQuery =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q));
        const matchesTag = !activeTag || n.tags.includes(activeTag);
        return matchesQuery && matchesTag;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query, activeTag]);

  function openNew() {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  }
  function openEdit(n: Note) {
    setEditing(n);
    setDraft({ title: n.title, content: n.content, tags: n.tags.join(", ") });
    setOpen(true);
  }
  function save() {
    if (!draft.title.trim()) return;
    const tags = draft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editing) updateNote(editing.id, { title: draft.title, content: draft.content, tags });
    else addNote({ title: draft.title, content: draft.content, tags });
    setOpen(false);
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-ink-850" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notes"
        description="Capture ideas, lists, and thoughts."
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> New note
          </Button>
        }
      />

      {/* Search + tag filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-ink-400" />
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !activeTag ? "bg-brand text-white" : "bg-ink-800 text-ink-300 hover:text-white",
              )}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeTag === t ? "bg-brand text-white" : "bg-ink-800 text-ink-300 hover:text-white",
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<StickyNote size={28} />}
          title="No notes found"
          description={query || activeTag ? "Try a different search or tag." : "Create your first note."}
          action={
            !query && !activeTag ? (
              <Button onClick={openNew}>
                <Plus size={16} /> New note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {visible.map((n) => (
            <Card
              key={n.id}
              className="group cursor-pointer p-5 transition-colors hover:border-ink-600"
              onClick={() => openEdit(n)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{n.title}</h3>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNote(n.id);
                  }}
                  aria-label="Delete"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent-rose/20 hover:text-accent-rose"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-300 line-clamp-[12]">
                {n.content}
              </p>
              {n.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <Badge key={t} color="#f2557d">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] text-ink-400">Updated {formatDate(n.updatedAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit note" : "New note"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create note"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Untitled"
              autoFocus
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              rows={10}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Start writing… (Markdown-style text supported)"
            />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="ideas, travel, work"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
