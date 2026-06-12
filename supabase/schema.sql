-- DailyCheck — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
--
-- Stores each user's entire dashboard (subscriptions, expenses, tasks,
-- goals, notes) as a single JSON blob, protected by Row Level Security
-- so a user can only ever read/write their own row.

create table if not exists public.app_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Drop-and-recreate so the script is safe to re-run.
drop policy if exists "Users can read their own state" on public.app_state;
drop policy if exists "Users can insert their own state" on public.app_state;
drop policy if exists "Users can update their own state" on public.app_state;

create policy "Users can read their own state"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
