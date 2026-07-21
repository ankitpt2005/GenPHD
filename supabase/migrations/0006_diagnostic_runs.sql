create table if not exists public.diagnostic_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  gap_vector jsonb not null,
  question_bank_version text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists diagnostic_runs_user_created_idx
  on public.diagnostic_runs (user_id, created_at desc);

alter table public.diagnostic_runs enable row level security;

create policy "diagnostic runs are private to the owner"
  on public.diagnostic_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
