-- 1. Enable the vector extension in Supabase
create extension if not exists vector;

-- 2. Add embedding column to public.knowledge_base if it does not already exist
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'knowledge_base' 
      and column_name = 'embedding'
  ) then
    alter table public.knowledge_base add column embedding vector(1536);
  end if;
end $$;

-- 3. Create or replace the match_knowledge procedure for vector similarity search
create or replace function match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  type text,
  source text,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_base.id,
    knowledge_base.type,
    knowledge_base.source,
    knowledge_base.title,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where knowledge_base.user_id = p_user_id
    and 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;
