"use client";

import React from "react";
import { cn, clamp } from "@/lib/utils";

// ---------- Card ----------
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-700/60 bg-ink-850/80 shadow-card backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Button ----------
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand text-white hover:bg-brand-600 shadow-sm",
    secondary: "bg-ink-700 text-ink-100 hover:bg-ink-600 text-white",
    ghost: "bg-transparent text-ink-300 hover:bg-ink-800 hover:text-white",
    danger: "bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- IconButton ----------
export function IconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-ink-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- Badge ----------
export function Badge({
  className,
  color,
  children,
}: {
  className?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        !color && "bg-ink-700 text-ink-200",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}22`, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}

// ---------- ProgressBar ----------
export function ProgressBar({
  value,
  color = "#5b6cff",
  className,
}: {
  value: number; // 0–100
  color?: string;
  className?: string;
}) {
  const pct = clamp(value);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-700", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ---------- StatCard ----------
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "#5b6cff",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-300">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------- EmptyState ----------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-850/40 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-400">{icon}</div>}
      <p className="text-sm font-medium text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------- Form fields ----------
const fieldBase =
  "w-full rounded-xl border border-ink-700 bg-ink-900/80 px-3 py-2 text-sm text-white placeholder:text-ink-400 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-ink-300">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldBase, "resize-none", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(fieldBase, "appearance-none bg-ink-900/80", props.className)}
    />
  );
}

// ---------- Modal ----------
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg animate-fade-in rounded-t-2xl border border-ink-700 bg-ink-850 shadow-card sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <IconButton onClick={onClose} aria-label="Close">
            ✕
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-ink-700 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
