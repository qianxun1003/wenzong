-- 热门问题排行（在 Supabase SQL Editor 中执行，需先完成 001）

create table if not exists popular_questions (
  id uuid primary key default gen_random_uuid(),
  question_normalized text not null unique,
  question_display text not null,
  ask_count int not null default 1 check (ask_count > 0),
  last_answer_mode text not null default 'basic',
  last_reply text not null default '',
  last_sections jsonb not null default '[]'::jsonb,
  last_citations jsonb not null default '[]'::jsonb,
  last_asked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists popular_questions_ask_count_idx
  on popular_questions (ask_count desc, last_asked_at desc);
