-- =============================================================================
-- 文综备考平台 · 统一账户 + ToB 多租户 + RLS + 席位熔断
-- 在 Supabase SQL Editor 中整段执行（PostgreSQL 13+，gen_random_uuid）
--
-- RLS 说明：
--   策略读取 JWT 的 app_metadata / user_metadata 中的 org_id、role。
--   请确保 Supabase Auth 签发 Token 时写入：
--     { "app_metadata": { "org_id": "<uuid>", "role": "teacher|org_admin|..." } }
--   FastAPI 自建 JWT 若走 PostgREST 直连，需配置相同 claims 结构。
--   service_role 密钥绕过 RLS，仅用于受信后端。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 枚举
-- -----------------------------------------------------------------------------

do $$ begin
  create type app_region as enum ('CN', 'JP');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_role as enum (
    'student',
    'org_student',
    'teacher',
    'org_admin',
    'super_admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('active', 'suspended', 'deleted');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type org_status as enum ('active', 'expired', 'frozen');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type migration_status as enum (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type identity_provider as enum (
    'phone',
    'email',
    'wechat',
    'google',
    'apple'
  );
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- JWT 上下文助手（供 RLS 策略复用）
-- -----------------------------------------------------------------------------

create or replace function auth_jwt_org_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'org_id', '')::uuid,
    nullif(auth.jwt() -> 'user_metadata' ->> 'org_id', '')::uuid
  );
$$;

create or replace function auth_jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'user_metadata' ->> 'role', '')
  );
$$;

create or replace function auth_is_super_admin()
returns boolean
language sql
stable
as $$
  select auth_jwt_role() = 'super_admin';
$$;

create or replace function auth_is_org_staff()
returns boolean
language sql
stable
as $$
  select auth_jwt_role() in ('teacher', 'org_admin');
$$;

create or replace function auth_tenant_org_id()
returns uuid
language sql
stable
as $$
  select case
    when auth_is_super_admin() then null
    else auth_jwt_org_id()
  end;
$$;

-- 租户行是否对当前 JWT 可见（教师/机构管理员仅能访问本 org）
create or replace function auth_can_access_org_row(row_org_id uuid)
returns boolean
language sql
stable
as $$
  select
    auth_is_super_admin()
    or (
      auth_is_org_staff()
      and auth_jwt_org_id() is not null
      and row_org_id = auth_jwt_org_id()
    );
$$;

-- -----------------------------------------------------------------------------
-- 机构（租户根）· 运营状态机 status + 席位上限
-- -----------------------------------------------------------------------------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region app_region not null default 'CN',
  status org_status not null default 'active',
  expire_at timestamptz,
  student_slots_limit int not null default 50 check (student_slots_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_organizations_region on organizations (region);
create index if not exists idx_organizations_status on organizations (status);

-- -----------------------------------------------------------------------------
-- 用户主表：纯粹身份与资产载体（凭证全部在 user_identities）
-- -----------------------------------------------------------------------------

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  role user_role not null default 'student',
  region app_region not null default 'CN',
  org_id uuid references organizations (id) on delete set null,
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_org_role_check check (
    role in ('student', 'super_admin')
    or org_id is not null
  )
);

create index if not exists idx_users_org_id on users (org_id);
create index if not exists idx_users_role on users (role);
create index if not exists idx_users_region on users (region);
create index if not exists idx_users_status on users (status);

-- -----------------------------------------------------------------------------
-- 登录凭证表：provider + provider_id 路由，password_hash 仅邮箱密码登录使用
-- -----------------------------------------------------------------------------

create table if not exists user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  provider identity_provider not null,
  provider_id text not null,
  password_hash text,
  metadata jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id),
  constraint user_identities_password_scope check (
    password_hash is null
    or provider in ('email', 'phone')
  )
);

create index if not exists idx_user_identities_user_id on user_identities (user_id);
create index if not exists idx_user_identities_lookup on user_identities (provider, provider_id);

-- -----------------------------------------------------------------------------
-- 班级
-- -----------------------------------------------------------------------------

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  teacher_id uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_classes_org_id on classes (org_id);
create index if not exists idx_classes_teacher_id on classes (teacher_id);

-- -----------------------------------------------------------------------------
-- 班级花名册
-- -----------------------------------------------------------------------------

create table if not exists class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  org_id uuid not null references organizations (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create index if not exists idx_class_enrollments_org_id on class_enrollments (org_id);
create index if not exists idx_class_enrollments_user_id on class_enrollments (user_id);

-- -----------------------------------------------------------------------------
-- 机构激活码
-- -----------------------------------------------------------------------------

create table if not exists activation_codes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  code text not null,
  class_id uuid references classes (id) on delete set null,
  max_uses int not null default 1 check (max_uses > 0),
  used_count int not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, code)
);

create index if not exists idx_activation_codes_code on activation_codes (code);

-- -----------------------------------------------------------------------------
-- 学生学情
-- -----------------------------------------------------------------------------

create table if not exists student_profiles (
  user_id uuid primary key references users (id) on delete cascade,
  org_id uuid references organizations (id) on delete set null,
  current_chapter_id text,
  total_quiz_count int not null default 0 check (total_quiz_count >= 0),
  correct_rate numeric(5, 4) not null default 0 check (correct_rate >= 0 and correct_rate <= 1),
  error_matrix jsonb not null default '{}'::jsonb,
  ability_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_student_profiles_org_id on student_profiles (org_id);

-- -----------------------------------------------------------------------------
-- 大纲包上传审计
-- -----------------------------------------------------------------------------

create table if not exists db_upload_logs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  uploaded_by uuid references users (id) on delete set null,
  target_version text not null,
  file_size_bytes bigint,
  storage_path text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_db_upload_logs_created_at on db_upload_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- 跨国迁移日志
-- -----------------------------------------------------------------------------

create table if not exists data_migration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  source_org_id uuid not null references organizations (id),
  target_org_id uuid not null references organizations (id),
  source_class_id uuid references classes (id) on delete set null,
  target_class_id uuid references classes (id) on delete set null,
  status migration_status not null default 'pending',
  payload_snapshot jsonb not null default '{}'::jsonb,
  error_message text,
  initiated_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint migration_distinct_orgs check (source_org_id <> target_org_id)
);

create index if not exists idx_data_migration_logs_user on data_migration_logs (user_id);
create index if not exists idx_data_migration_logs_status on data_migration_logs (status);

-- -----------------------------------------------------------------------------
-- updated_at 触发器
-- -----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users for each row execute function set_updated_at();

drop trigger if exists trg_organizations_updated_at on organizations;
create trigger trg_organizations_updated_at
  before update on organizations for each row execute function set_updated_at();

drop trigger if exists trg_classes_updated_at on classes;
create trigger trg_classes_updated_at
  before update on classes for each row execute function set_updated_at();

drop trigger if exists trg_user_identities_updated_at on user_identities;
create trigger trg_user_identities_updated_at
  before update on user_identities for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- 席位统计（仅 active 的 org_student）
-- -----------------------------------------------------------------------------

create or replace function count_org_students(p_org_id uuid)
returns int
language sql
stable
as $$
  select count(*)::int
  from users u
  where u.org_id = p_org_id
    and u.role = 'org_student'
    and u.status = 'active';
$$;

-- 机构是否允许新学生入驻（状态 + 到期时间）
create or replace function organization_is_operational(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from organizations o
    where o.id = p_org_id
      and o.status = 'active'
      and (o.expire_at is null or o.expire_at > now())
  );
$$;

-- -----------------------------------------------------------------------------
-- 激活码兑换：单行锁机构 + 席位熔断（并发安全）
-- -----------------------------------------------------------------------------

create or replace function redeem_activation_code(
  p_code text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_code));
  v_act activation_codes%rowtype;
  v_org organizations%rowtype;
  v_used int;
  v_user users%rowtype;
begin
  if v_code is null or v_code = '' then
    raise exception 'INVALID_ACTIVATION_CODE';
  end if;

  select * into v_user from users where id = p_user_id for update;
  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;
  if v_user.status <> 'active' then
    raise exception 'USER_INACTIVE';
  end if;

  select * into v_act
  from activation_codes
  where code = v_code and is_active = true
  for update;

  if not found then
    raise exception 'INVALID_ACTIVATION_CODE';
  end if;

  if v_act.expires_at is not null and v_act.expires_at <= now() then
    raise exception 'ACTIVATION_EXPIRED';
  end if;

  if v_act.used_count >= v_act.max_uses then
    raise exception 'ACTIVATION_EXHAUSTED';
  end if;

  -- 锁定机构行：并发兑换时串行化席位判断
  select * into v_org
  from organizations
  where id = v_act.org_id
  for update;

  if v_org.status = 'frozen' then
    raise exception 'ORGANIZATION_FROZEN';
  end if;

  if v_org.status = 'expired' then
    raise exception 'ORGANIZATION_EXPIRED';
  end if;

  if v_org.status <> 'active' then
    raise exception 'ORGANIZATION_NOT_ACTIVE';
  end if;

  if v_org.expire_at is not null and v_org.expire_at <= now() then
    raise exception 'ORGANIZATION_EXPIRED';
  end if;

  v_used := count_org_students(v_org.id);
  if v_used >= v_org.student_slots_limit then
    raise exception 'ORG_SLOTS_FULL';
  end if;

  update users
  set
    org_id = v_org.id,
    role = 'org_student',
    updated_at = now()
  where id = p_user_id;

  if v_act.class_id is not null then
    insert into class_enrollments (class_id, user_id, org_id)
    values (v_act.class_id, p_user_id, v_org.id)
    on conflict (class_id, user_id) do nothing;
  end if;

  insert into student_profiles (user_id, org_id, error_matrix, ability_snapshot)
  values (p_user_id, v_org.id, '{}'::jsonb, '{}'::jsonb)
  on conflict (user_id) do update
  set org_id = excluded.org_id, updated_at = now();

  update activation_codes
  set used_count = used_count + 1
  where id = v_act.id;

  return jsonb_build_object(
    'user_id', p_user_id,
    'org_id', v_org.id,
    'class_id', v_act.class_id,
    'slots_used_after', v_used + 1,
    'slots_limit', v_org.student_slots_limit
  );
end;
$$;

revoke all on function redeem_activation_code(text, uuid) from public;
grant execute on function redeem_activation_code(text, uuid) to service_role;

-- -----------------------------------------------------------------------------
-- RLS：classes / class_enrollments / student_profiles
-- -----------------------------------------------------------------------------

alter table classes enable row level security;
alter table class_enrollments enable row level security;
alter table student_profiles enable row level security;

-- classes · SELECT
drop policy if exists classes_select_tenant on classes;
create policy classes_select_tenant on classes
  for select
  to authenticated
  using (auth_can_access_org_row(org_id));

-- classes · UPDATE（教师/机构管理员仅能改本机构班级）
drop policy if exists classes_update_tenant on classes;
create policy classes_update_tenant on classes
  for update
  to authenticated
  using (auth_can_access_org_row(org_id))
  with check (auth_can_access_org_row(org_id));

-- classes · INSERT
drop policy if exists classes_insert_tenant on classes;
create policy classes_insert_tenant on classes
  for insert
  to authenticated
  with check (auth_can_access_org_row(org_id));

-- class_enrollments · SELECT
drop policy if exists class_enrollments_select_tenant on class_enrollments;
create policy class_enrollments_select_tenant on class_enrollments
  for select
  to authenticated
  using (auth_can_access_org_row(org_id));

-- class_enrollments · UPDATE
drop policy if exists class_enrollments_update_tenant on class_enrollments;
create policy class_enrollments_update_tenant on class_enrollments
  for update
  to authenticated
  using (auth_can_access_org_row(org_id))
  with check (auth_can_access_org_row(org_id));

-- class_enrollments · INSERT
drop policy if exists class_enrollments_insert_tenant on class_enrollments;
create policy class_enrollments_insert_tenant on class_enrollments
  for insert
  to authenticated
  with check (auth_can_access_org_row(org_id));

-- student_profiles · SELECT（机构员工看本机构 + 学生看本人）
drop policy if exists student_profiles_select_tenant on student_profiles;
create policy student_profiles_select_tenant on student_profiles
  for select
  to authenticated
  using (
    auth_can_access_org_row(org_id)
    or user_id = auth.uid()
  );

-- student_profiles · UPDATE（机构员工改本机构；学生仅改本人且 org 一致时可扩展）
drop policy if exists student_profiles_update_tenant on student_profiles;
create policy student_profiles_update_tenant on student_profiles
  for update
  to authenticated
  using (
    auth_can_access_org_row(org_id)
    or user_id = auth.uid()
  )
  with check (
    auth_can_access_org_row(org_id)
    or user_id = auth.uid()
  );

-- 后端 service_role 绕过 RLS；禁止 anon 直接扫表
revoke all on table classes from anon;
revoke all on table class_enrollments from anon;
revoke all on table student_profiles from anon;

grant select, insert, update on table classes to authenticated;
grant select, insert, update on table class_enrollments to authenticated;
grant select, update on table student_profiles to authenticated;
