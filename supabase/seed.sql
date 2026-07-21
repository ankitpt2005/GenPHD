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

insert into public.sources (canonical_url, title, tier)
values
  ('https://langchain-ai.github.io/langgraph/', 'LangGraph overview', 'official'),
  ('https://developers.openai.com/api/docs/guides/evaluation-best-practices', 'OpenAI evaluation guidance', 'official')
on conflict (canonical_url) do update
set title = excluded.title,
    tier = excluded.tier;
