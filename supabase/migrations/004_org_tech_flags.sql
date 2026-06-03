-- 机构表 · 算力路由与跨境迁移许可
alter table organizations
  add column if not exists ai_model_route text not null default 'domestic'
    check (ai_model_route in ('domestic', 'global_hybrid')),
  add column if not exists cross_border_migration_enabled boolean not null default false;
