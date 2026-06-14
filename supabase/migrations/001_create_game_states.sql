-- CoinRip: game_states table
-- Run this once in your Supabase Dashboard > SQL Editor

create table if not exists public.game_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null default 'Flipper',
  coin_balance integer not null default 500,
  total_flips integer not null default 0,
  last_free_daily_timestamp bigint,
  collection jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_states_user_id_key unique (user_id)
);

-- Enable Row Level Security
alter table public.game_states enable row level security;

-- Anyone (including anonymous) can read for leaderboard
create policy "Leaderboard is public" on public.game_states
  for select using (true);

-- Authenticated users can insert/update their own row
create policy "Users can upsert own state" on public.game_states
  for insert with check (auth.uid() = user_id);

create policy "Users can update own state" on public.game_states
  for update using (auth.uid() = user_id);

-- Grant access to anon and authenticated roles
grant select on public.game_states to anon;
grant select, insert, update on public.game_states to authenticated;
