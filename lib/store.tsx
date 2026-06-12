"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  AppData,
  Subscription,
  Expense,
  Task,
  Goal,
  Note,
} from "./types";
import { seedData } from "./sample-data";
import { uid, todayISO } from "./utils";

const STORAGE_KEY = "dailycheck.data.v1";

type Entity = keyof AppData;

interface StoreContextValue extends AppData {
  ready: boolean;
  // Subscriptions
  addSubscription: (s: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  // Expenses
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  // Tasks
  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  // Goals
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  // Notes
  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;
  // Global
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyData: AppData = {
  subscriptions: [],
  expenses: [],
  tasks: [],
  goals: [],
  notes: [],
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);

  // Load once on mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData({ ...emptyData, ...(JSON.parse(raw) as AppData) });
      } else {
        const seeded = seedData();
        setData(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {
      setData(seedData());
    } finally {
      setReady(true);
    }
  }, []);

  // Persist on every change after initial load.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [data, ready]);

  const mutate = useCallback(
    <K extends Entity>(key: K, fn: (items: AppData[K]) => AppData[K]) => {
      setData((prev) => ({ ...prev, [key]: fn(prev[key]) }));
    },
    [],
  );

  const value: StoreContextValue = {
    ...data,
    ready,

    addSubscription: (s) =>
      mutate("subscriptions", (xs) => [{ ...s, id: uid() }, ...xs]),
    updateSubscription: (id, patch) =>
      mutate("subscriptions", (xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeSubscription: (id) =>
      mutate("subscriptions", (xs) => xs.filter((x) => x.id !== id)),

    addExpense: (e) => mutate("expenses", (xs) => [{ ...e, id: uid() }, ...xs]),
    updateExpense: (id, patch) =>
      mutate("expenses", (xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeExpense: (id) => mutate("expenses", (xs) => xs.filter((x) => x.id !== id)),

    addTask: (t) =>
      mutate("tasks", (xs) => [{ ...t, id: uid(), createdAt: todayISO() }, ...xs]),
    updateTask: (id, patch) =>
      mutate("tasks", (xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeTask: (id) => mutate("tasks", (xs) => xs.filter((x) => x.id !== id)),

    addGoal: (g) => mutate("goals", (xs) => [{ ...g, id: uid() }, ...xs]),
    updateGoal: (id, patch) =>
      mutate("goals", (xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeGoal: (id) => mutate("goals", (xs) => xs.filter((x) => x.id !== id)),

    addNote: (n) => {
      const id = uid();
      const now = todayISO();
      mutate("notes", (xs) => [{ ...n, id, createdAt: now, updatedAt: now }, ...xs]);
      return id;
    },
    updateNote: (id, patch) =>
      mutate("notes", (xs) =>
        xs.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: todayISO() } : x)),
      ),
    removeNote: (id) => mutate("notes", (xs) => xs.filter((x) => x.id !== id)),

    resetData: () => {
      const seeded = seedData();
      setData(seeded);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
