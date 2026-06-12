"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
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
import { supabase, isSupabaseEnabled, APP_STATE_TABLE } from "./supabase";

const STORAGE_KEY = "dailycheck.data.v1";

type Entity = keyof AppData;
export type SyncState = "local" | "syncing" | "synced" | "error";

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
  loadSampleData: () => void;
  // Cloud sync / auth
  cloudEnabled: boolean;
  user: User | null;
  syncState: SyncState;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyData: AppData = {
  subscriptions: [],
  expenses: [],
  tasks: [],
  goals: [],
  notes: [],
};

function readLocal(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyData, ...(JSON.parse(raw) as AppData) } : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("local");

  // Prevents the cloud-load from immediately writing back to the cloud.
  const skipCloudWrite = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull a signed-in user's data down from the cloud (or push local up
  // on first sign-in when the cloud row is still empty).
  const handleSignedIn = useCallback(async (u: User) => {
    if (!supabase) return;
    setUser(u);
    setSyncState("syncing");
    const { data: row, error } = await supabase
      .from(APP_STATE_TABLE)
      .select("data")
      .eq("user_id", u.id)
      .maybeSingle();

    if (error) {
      setSyncState("error");
      return;
    }

    const cloud = (row?.data as AppData | undefined) ?? null;
    const hasCloudData =
      cloud &&
      (Object.keys(cloud) as Entity[]).some((k) => (cloud[k]?.length ?? 0) > 0);

    if (hasCloudData) {
      // Cloud wins — it's the shared source of truth across devices.
      skipCloudWrite.current = true;
      setData({ ...emptyData, ...cloud });
      setSyncState("synced");
    } else {
      // First sign-in on this account: migrate whatever is local up.
      const local = readLocal() ?? emptyData;
      const { error: upErr } = await supabase
        .from(APP_STATE_TABLE)
        .upsert({ user_id: u.id, data: local, updated_at: new Date().toISOString() });
      setSyncState(upErr ? "error" : "synced");
    }
  }, []);

  // Initial load: read local cache instantly, then wire up auth.
  useEffect(() => {
    const local = readLocal();
    if (local) setData(local);
    setReady(true);

    if (!isSupabaseEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleSignedIn(session.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleSignedIn(session.user);
      else setUser(null);
    });

    return () => sub.subscription.unsubscribe();
  }, [handleSignedIn]);

  // Persist on every change: always to localStorage, and (debounced) to
  // the cloud when signed in.
  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — ignore */
    }

    if (!user || !supabase) return;

    if (skipCloudWrite.current) {
      skipCloudWrite.current = false;
      return;
    }

    setSyncState("syncing");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase!
        .from(APP_STATE_TABLE)
        .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
      setSyncState(error ? "error" : "synced");
    }, 800);
  }, [data, ready, user]);

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
      setData(emptyData);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
    loadSampleData: () => setData(seedData()),

    cloudEnabled: isSupabaseEnabled,
    user,
    syncState,
    signInWithEmail: async (email: string) => {
      if (!supabase) return { error: "Cloud sync is not configured." };
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      return error ? { error: error.message } : {};
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      setUser(null);
      setSyncState("local");
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
