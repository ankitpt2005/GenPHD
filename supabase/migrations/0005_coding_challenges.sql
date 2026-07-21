-- Live coding challenges: store submissions + their AI grades, and allow skill_evidence
-- to be sourced from a graded challenge.

alter table public.skill_evidence drop constraint if exists skill_evidence_source_type_check;
alter table public.skill_evidence
  add constraint skill_evidence_source_type_check
  check (source_type in ('diagnostic', 'mission', 'review', 'user-confirmed', 'challenge'));

create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  challenge_id text not null,
  competency_id text references public.competencies(id) on delete set null,
  code text not null,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  grade jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists challenge_submissions_user_idx
  on public.challenge_submissions (user_id, created_at desc);

alter table public.challenge_submissions enable row level security;

drop policy if exists "challenge submissions are private to the owner" on public.challenge_submissions;
create policy "challenge submissions are private to the owner" on public.challenge_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
