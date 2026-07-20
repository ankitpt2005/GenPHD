create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  career_goal text,
  weekly_hours integer check (weekly_hours between 1 and 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  outcome text not null check (char_length(outcome) between 1 and 500),
  stack text[] not null default '{}',
  constraints text[] not null default '{}',
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists projects_one_active_per_user
  on public.projects (user_id)
  where is_active;

create table if not exists public.competencies (
  id text primary key,
  label text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.skill_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  competency_id text not null references public.competencies(id),
  state text not null check (state in ('emerging', 'practicing', 'validated')),
  source_type text not null check (source_type in ('diagnostic', 'mission', 'review', 'user-confirmed')),
  source_id text,
  note text,
  observed_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz
);

create index if not exists skill_evidence_user_competency_idx
  on public.skill_evidence (user_id, competency_id, observed_at desc);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null unique,
  title text not null,
  tier text not null check (tier in ('official', 'maintainer', 'practice-guide')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  content_hash text not null,
  published_at timestamptz,
  retrieved_at timestamptz not null default timezone('utc', now()),
  content text,
  unique (source_id, content_hash)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  question text not null check (char_length(question) between 12 and 800),
  status text not null check (status in ('queued', 'researching', 'ready', 'failed', 'superseded')) default 'queued',
  recommendation text,
  summary text,
  confidence text check (confidence in ('high', 'medium-high', 'medium', 'low', 'insufficient-evidence')),
  confidence_reason text,
  tradeoff text,
  counterfactual text,
  prompt_version text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists decisions_user_project_created_idx
  on public.decisions (user_id, project_id, created_at desc);

create table if not exists public.decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  label text not null,
  rank integer not null check (rank > 0),
  rationale text not null,
  unique (decision_id, rank)
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  statement text not null,
  claim_type text not null check (claim_type in ('fact', 'recommendation', 'uncertainty')),
  support_status text not null check (support_status in ('supported', 'mixed', 'unsupported'))
);

create table if not exists public.claim_evidence (
  claim_id uuid not null references public.claims(id) on delete cascade,
  source_version_id uuid not null references public.source_versions(id) on delete cascade,
  relationship text not null check (relationship in ('supports', 'contradicts', 'context')),
  primary key (claim_id, source_version_id)
);

create table if not exists public.build_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  decision_id uuid references public.decisions(id) on delete set null,
  competency_id text references public.competencies(id) on delete set null,
  title text not null,
  objective text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  estimate_minutes integer not null check (estimate_minutes between 5 and 480),
  status text not null check (status in ('not_started', 'in_progress', 'completed', 'skipped')) default 'not_started',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mission_reviews (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.build_missions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  outcome_note text,
  evidence_url text,
  evaluator_summary text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  category text not null check (category in ('profile', 'project', 'learning', 'decision')),
  label text not null,
  value text not null,
  provenance text not null check (provenance in ('user', 'mission', 'decision', 'diagnostic', 'inference')),
  confidence text check (confidence in ('high', 'medium', 'low')),
  expires_at timestamptz,
  is_user_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists memory_items_user_project_idx
  on public.memory_items (user_id, project_id, category);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger decisions_set_updated_at before update on public.decisions
  for each row execute procedure public.set_updated_at();
create trigger build_missions_set_updated_at before update on public.build_missions
  for each row execute procedure public.set_updated_at();
create trigger memory_items_set_updated_at before update on public.memory_items
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.skill_evidence enable row level security;
alter table public.decisions enable row level security;
alter table public.build_missions enable row level security;
alter table public.mission_reviews enable row level security;
alter table public.memory_items enable row level security;

create policy "profiles are private to the owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "projects are private to the owner" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skill evidence is private to the owner" on public.skill_evidence
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decisions are private to the owner" on public.decisions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "missions are private to the owner" on public.build_missions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mission reviews are private to the owner" on public.mission_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory is private to the owner" on public.memory_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.competencies, public.sources, public.source_versions to authenticated;
