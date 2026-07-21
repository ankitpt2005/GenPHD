-- Store the multi-model consensus report alongside each decision so it is remembered
-- across sessions and can be surfaced when the user returns to a project.
alter table public.decisions
  add column if not exists consensus jsonb;
