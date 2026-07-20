alter table public.decisions
  add column if not exists brief jsonb;

alter table public.build_missions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.decision_options enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;

drop policy if exists "decision options are private to the decision owner" on public.decision_options;
create policy "decision options are private to the decision owner" on public.decision_options
  for all
  using (
    exists (
      select 1 from public.decisions
      where public.decisions.id = public.decision_options.decision_id
        and public.decisions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.decisions
      where public.decisions.id = public.decision_options.decision_id
        and public.decisions.user_id = auth.uid()
    )
  );

drop policy if exists "claims are private to the decision owner" on public.claims;
create policy "claims are private to the decision owner" on public.claims
  for all
  using (
    exists (
      select 1 from public.decisions
      where public.decisions.id = public.claims.decision_id
        and public.decisions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.decisions
      where public.decisions.id = public.claims.decision_id
        and public.decisions.user_id = auth.uid()
    )
  );

drop policy if exists "claim evidence is private to the decision owner" on public.claim_evidence;
create policy "claim evidence is private to the decision owner" on public.claim_evidence
  for all
  using (
    exists (
      select 1
      from public.claims
      join public.decisions on public.decisions.id = public.claims.decision_id
      where public.claims.id = public.claim_evidence.claim_id
        and public.decisions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.claims
      join public.decisions on public.decisions.id = public.claims.decision_id
      where public.claims.id = public.claim_evidence.claim_id
        and public.decisions.user_id = auth.uid()
    )
  );
