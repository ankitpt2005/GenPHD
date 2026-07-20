insert into public.competencies (id, label, description)
values
  ('prompt-design', 'Prompt design', 'Writes constrained, testable prompts for a target task.'),
  ('retrieval', 'Retrieval', 'Builds and inspects a reliable retrieval path.'),
  ('rag-evaluation', 'RAG evaluation', 'Defines and interprets evidence-grounded RAG evaluations.'),
  ('ai-evaluation', 'AI evaluation', 'Designs a compact, representative evaluation loop for an AI feature.'),
  ('agentic-workflows', 'Agentic workflows', 'Chooses workflow orchestration only when the problem needs it.'),
  ('ai-system-design', 'AI system design', 'Uses constraints and measurable outcomes to make architecture choices.')
on conflict (id) do update
set label = excluded.label,
    description = excluded.description;

insert into public.sources (canonical_url, title, tier)
values
  ('https://langchain-ai.github.io/langgraph/', 'LangGraph overview', 'official'),
  ('https://developers.openai.com/api/docs/guides/evaluation-best-practices', 'OpenAI evaluation guidance', 'official')
on conflict (canonical_url) do update
set title = excluded.title,
    tier = excluded.tier;
