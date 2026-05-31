-- 文综知识库：在 Supabase Dashboard → SQL Editor 中整段执行

-- 1. 启用向量扩展
create extension if not exists vector;

-- 2. 知识切片表（embedding 维度需与模型一致，text-embedding-3-small = 1536）
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536) not null,
  tag text,
  source text,
  created_at timestamptz default now()
);

-- 3. 相似度检索函数（学生提问时调用）
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  tag text,
  source text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kc.id,
    kc.content,
    kc.tag,
    kc.source,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 4. （可选）数据量较大后再建向量索引，小库可不建
-- create index knowledge_chunks_embedding_idx
--   on knowledge_chunks using hnsw (embedding vector_cosine_ops);
