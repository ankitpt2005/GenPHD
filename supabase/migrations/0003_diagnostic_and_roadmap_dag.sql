-- Realign the competency catalog to the six canonical GenAI dimensions, add roadmap-DAG
-- columns to build_missions, and introduce diagnostic_runs for the skill-gap vector.

-- 1. Add the six canonical competencies.
insert into public.competencies (id, label, description)
values
  ('prompting', 'Prompting', 'Writes constrained, testable prompts for a target task.'),
  ('embeddings', 'Embeddings', 'Understands how text becomes vectors and how to choose an embedding model.'),
  ('vector-dbs', 'Vector databases', 'Stores, indexes, and queries embeddings with the right index and metadata.'),
  ('retrieval', 'Retrieval strategies', 'Designs and inspects a reliable retrieval path (chunking, reranking, hybrid).'),
  ('agent-frameworks', 'Agent frameworks', 'Wires up agents and tool use with a current framework only when the problem needs it.'),
  ('evals', 'Evaluations', 'Defines a compact, representative evaluation loop for an AI feature.')
on conflict (id) do update
set label = excluded.label,
    description = excluded.description;

-- 2. Remap any existing evidence/missions from legacy competency ids to the new catalog.
update public.skill_evidence
set competency_id = case competency_id
  when 'prompt-design' then 'prompting'
  when 'rag-evaluation' then 'evals'
  when 'ai-evaluation' then 'evals'
  when 'agentic-workflows' then 'agent-frameworks'
  when 'ai-system-design' then 'agent-frameworks'
  else competency_id
end
where competency_id in ('prompt-design', 'rag-evaluation', 'ai-evaluation', 'agentic-workflows', 'ai-system-design');

update public.build_missions
set competency_id = case competency_id
  when 'prompt-design' then 'prompting'
  when 'rag-evaluation' then 'evals'
  when 'ai-evaluation' then 'evals'
  when 'agentic-workflows' then 'agent-frameworks'
  when 'ai-system-design' then 'agent-frameworks'
  else competency_id
end
where competency_id in ('prompt-design', 'rag-evaluation', 'ai-evaluation', 'agentic-workflows', 'ai-system-design');

-- 3. Drop legacy competency rows now that nothing references them.
delete from public.competencies
where id in ('prompt-design', 'rag-evaluation', 'ai-evaluation', 'agentic-workflows', 'ai-system-design');

-- 4. Roadmap-DAG columns on build_missions.
alter table public.build_missions
  add column if not exists depends_on uuid[] not null default '{}',
  add column if not exists sort_order integer,
  add column if not exists kind text not null default 'milestone';

alter table public.build_missions drop constraint if exists build_missions_kind_check;
alter table public.build_missions
  add constraint build_missions_kind_check check (kind in ('milestone', 'capstone'));

create index if not exists build_missions_roadmap_idx
  on public.build_missions (user_id, project_id, sort_order);

-- 5. Diagnostic runs — one per completed placement test, storing the skill-gap vector.
create table if not exists public.diagnostic_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  gap_vector jsonb not null,
  question_bank_version text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists diagnostic_runs_user_created_idx
  on public.diagnostic_runs (user_id, created_at desc);

alter table public.diagnostic_runs enable row level security;

drop policy if exists "diagnostic runs are private to the owner" on public.diagnostic_runs;
create policy "diagnostic runs are private to the owner" on public.diagnostic_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
