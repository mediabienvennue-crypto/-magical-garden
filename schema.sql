-- ============================================================================
-- MAGICAL GARDEN — Gamified EdTech Platform
-- Supabase / PostgreSQL Schema
-- Scalable across: Primary 1-5, Primary 6 (MVP), Middle School, High School
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
create type user_role as enum ('parent', 'student', 'admin');
create type tree_health as enum ('healthy', 'withering', 'withered');
create type session_mode as enum ('study', 'reward', 'locked');
create type subscription_state as enum ('active', 'reminder', 'restricted');
create type payment_status as enum ('pending_review', 'approved', 'rejected');

-- ============================================================================
-- 1. DYNAMIC CURRICULUM STRUCTURE
-- (educational_stages -> levels -> subjects, all data-driven, never hardcoded)
-- ============================================================================

create table educational_stages (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,               -- e.g. 'primary', 'middle', 'high'
  name_en       text not null,
  name_fr       text not null,
  name_ar       text not null,
  order_index   int not null default 0,
  created_at    timestamptz not null default now()
);

create table levels (
  id                  uuid primary key default gen_random_uuid(),
  stage_id            uuid not null references educational_stages(id) on delete cascade,
  slug                text unique not null,          -- e.g. 'primary-6', 'primary-1'
  name_en             text not null,
  name_fr             text not null,
  name_ar             text not null,
  order_index         int not null default 0,
  is_active           boolean not null default true, -- lets you "publish" a level when content is ready
  created_at          timestamptz not null default now()
);

-- Subjects are defined ONCE globally (Math, French, Arabic, Science...)
create table subjects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,                -- e.g. 'math', 'french', 'arabic'
  name_en       text not null,
  name_fr       text not null,
  name_ar       text not null,
  icon          text,                                 -- lucide icon name or asset key
  base_color    text not null default '#22c55e',       -- tree foliage tint
  is_core       boolean not null default false,        -- true = locked first when subscription lapses (Math, French)
  created_at    timestamptz not null default now()
);

-- Junction table: which subjects exist at which level, with level-specific ordering/weight
create table level_subjects (
  id            uuid primary key default gen_random_uuid(),
  level_id      uuid not null references levels(id) on delete cascade,
  subject_id    uuid not null references subjects(id) on delete cascade,
  order_index   int not null default 0,
  unique (level_id, subject_id)
);

-- Chapters/units within a subject at a given level
create table chapters (
  id                uuid primary key default gen_random_uuid(),
  level_subject_id  uuid not null references level_subjects(id) on delete cascade,
  title             text not null,
  order_index       int not null default 0,
  summary_content   text,           -- markdown/rich text summary
  podcast_audio_url text,           -- NotebookLM-generated audio overview, stored in Supabase Storage
  created_at        timestamptz not null default now()
);

-- ============================================================================
-- 2. USERS: PARENTS, STUDENTS, PROFILES
-- ============================================================================

-- Extends Supabase auth.users
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'parent',
  full_name     text,
  phone         text,
  preferred_language text not null default 'fr',       -- fr / ar / en
  created_at    timestamptz not null default now()
);

create table students (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references profiles(id) on delete cascade,
  auth_id       uuid references auth.users(id) on delete set null, -- optional: student may have own login
  level_id      uuid not null references levels(id),
  first_name    text not null,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- 3. PSYCHOLOGICAL ONBOARDING PROFILE (Khan Academy Kids inspired)
-- ============================================================================

create table onboarding_responses (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid unique not null references students(id) on delete cascade,
  age               int,
  hobbies           text[],                  -- multi-select
  favorite_fruit    text not null default 'strawberry',  -- drives the tree's fruit asset
  favorite_food     text,
  dream_job         text,                    -- drives AI motivational tips
  favorite_video_game text,
  preferred_language text not null default 'fr',
  completed_at      timestamptz default now()
);

-- ============================================================================
-- 4. SUBJECT TREES (Forest App inspired) + STREAK / HEALTH LOGIC (Duolingo inspired)
-- ============================================================================

create table student_trees (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references students(id) on delete cascade,
  subject_id        uuid not null references subjects(id) on delete cascade,
  xp                int not null default 0,
  branches_count     int not null default 1,
  leaves_count       int not null default 0,
  fruit_count        int not null default 0,
  last_interaction_at timestamptz not null default now(),
  current_streak_days int not null default 0,
  created_at         timestamptz not null default now(),
  unique (student_id, subject_id)
);

-- Health is DERIVED, not stored — always accurate, no cron drift.
-- healthy: interacted within 3 days | withering: 3-6 days | withered: 7+ days
create or replace function get_tree_health(p_last_interaction timestamptz)
returns tree_health
language sql
immutable
as $$
  select case
    when p_last_interaction >= now() - interval '3 days' then 'healthy'::tree_health
    when p_last_interaction >= now() - interval '7 days' then 'withering'::tree_health
    else 'withered'::tree_health
  end;
$$;

-- Convenience view the frontend queries directly for the Garden dashboard
create view student_trees_view as
select
  st.*,
  s.slug as subject_slug,
  s.name_fr as subject_name_fr,
  s.name_ar as subject_name_ar,
  s.base_color,
  get_tree_health(st.last_interaction_at) as health
from student_trees st
join subjects s on s.id = st.subject_id;

-- Logs every XP-earning / watering event (quiz pass, forum post, etc.)
create table tree_events (
  id            uuid primary key default gen_random_uuid(),
  tree_id       uuid not null references student_trees(id) on delete cascade,
  event_type    text not null,          -- 'quiz_passed' | 'forum_post' | 'daily_login'
  xp_awarded    int not null default 0,
  created_at    timestamptz not null default now()
);

-- Trigger: any tree_event bumps xp/leaves/last_interaction on the parent tree automatically
create or replace function apply_tree_event()
returns trigger language plpgsql as $$
begin
  update student_trees
  set xp = xp + new.xp_awarded,
      leaves_count = leaves_count + greatest(new.xp_awarded / 10, 0),
      last_interaction_at = now(),
      current_streak_days = case
        when last_interaction_at >= now() - interval '1 day' then current_streak_days + 1
        else 1
      end
  where id = new.tree_id;
  return new;
end;
$$;

create trigger trg_apply_tree_event
after insert on tree_events
for each row execute function apply_tree_event();

-- ============================================================================
-- 5. QUIZZES / CONTENT INTERACTION
-- ============================================================================

create table quizzes (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    uuid not null references chapters(id) on delete cascade,
  title         text not null,
  created_at    timestamptz not null default now()
);

create table quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references quizzes(id) on delete cascade,
  question      text not null,
  choices       jsonb not null,     -- [{ "id": "a", "text": "..." }, ...]
  correct_choice text not null,
  order_index   int not null default 0
);

create table quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  quiz_id       uuid not null references quizzes(id) on delete cascade,
  score_percent numeric(5,2) not null,
  passed        boolean not null,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- 6. THE 30-MINUTE BALANCED STUDY LOOP (Prodigy Math inspired)
-- ============================================================================

create table mini_games (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text,               -- matches onboarding "favorite_video_game" tags for personalization
  config        jsonb default '{}'::jsonb
);

create table study_sessions (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references students(id) on delete cascade,
  subject_id        uuid references subjects(id),
  mode              session_mode not null default 'study',
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  planned_duration_seconds int not null default 1200  -- 20 min default for study mode
);

-- ============================================================================
-- 7. SUBSCRIPTIONS, GRACE PERIOD & RETALIATORY ACTIONS
-- ============================================================================

create table subscriptions (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid not null references profiles(id) on delete cascade,
  period_start      date not null,           -- e.g. 2026-07-01
  period_due_date   date not null,           -- period_start + 8 days
  amount_mad        numeric(6,2) not null default 99.00,
  paid_at           timestamptz,
  receipt_url       text,                    -- uploaded screenshot (Cash Plus / Wafacash / bank)
  payment_status    payment_status not null default 'pending_review',
  created_at        timestamptz not null default now()
);

create table payment_reminders (
  id                uuid primary key default gen_random_uuid(),
  subscription_id   uuid not null references subscriptions(id) on delete cascade,
  sent_at           timestamptz not null default now(),
  channel           text not null default 'webhook'  -- 'webhook' | 'sms' | 'email'
);

-- Grace-period state machine, derived on the fly — single source of truth.
-- Day 1-8: active | Day 9-30: reminder (site fully open) | Day 31+: restricted (core subjects locked, ads on)
create or replace function get_subscription_state(p_subscription_id uuid)
returns subscription_state
language plpgsql
stable
as $$
declare
  v_due_date date;
  v_paid_at timestamptz;
  v_days_overdue int;
begin
  select period_due_date, paid_at into v_due_date, v_paid_at
  from subscriptions where id = p_subscription_id;

  if v_paid_at is not null then
    return 'active';
  end if;

  v_days_overdue := (current_date - v_due_date);

  if v_days_overdue <= 0 then
    return 'active';
  elsif v_days_overdue <= 22 then           -- day 9 through day 30 relative to due date
    return 'reminder';
  else
    return 'restricted';
  end if;
end;
$$;

-- Convenience view for the frontend / middleware to check access in one query
create view parent_subscription_status as
select
  s.parent_id,
  s.id as subscription_id,
  s.period_start,
  s.period_due_date,
  s.payment_status,
  get_subscription_state(s.id) as state
from subscriptions s
where s.id in (
  select id from subscriptions s2
  where s2.parent_id = s.parent_id
  order by s2.period_start desc
  limit 1
);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (starter policies — expand per your auth flow)
-- ============================================================================

alter table profiles enable row level security;
alter table students enable row level security;
alter table onboarding_responses enable row level security;
alter table student_trees enable row level security;
alter table tree_events enable row level security;
alter table quiz_attempts enable row level security;
alter table study_sessions enable row level security;
alter table subscriptions enable row level security;

create policy "Parents manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "Parents manage own children" on students
  for all using (auth.uid() = parent_id);

create policy "Parents/students view own onboarding" on onboarding_responses
  for select using (
    student_id in (select id from students where parent_id = auth.uid())
  );

create policy "Parents/students view own trees" on student_trees
  for select using (
    student_id in (select id from students where parent_id = auth.uid())
  );

create policy "Parents view own subscriptions" on subscriptions
  for select using (auth.uid() = parent_id);

-- Curriculum tables (stages/levels/subjects/chapters) are public read, admin write —
-- no RLS needed beyond default-deny + a service-role admin panel.

-- ============================================================================
-- 9. SEED DATA (MVP: Primary 6 only, ready to expand)
-- ============================================================================

insert into educational_stages (slug, name_en, name_fr, name_ar, order_index) values
  ('primary', 'Primary School', 'Primaire', 'التعليم الابتدائي', 1),
  ('middle', 'Middle School', 'Collège', 'التعليم الإعدادي', 2),
  ('high', 'High School', 'Lycée', 'التعليم الثانوي', 3);

insert into levels (stage_id, slug, name_en, name_fr, name_ar, order_index, is_active)
select id, 'primary-6', '6th Grade', '6ème Année Primaire', 'السادسة ابتدائي', 6, true
from educational_stages where slug = 'primary';

insert into subjects (slug, name_en, name_fr, name_ar, base_color, is_core) values
  ('math', 'Mathematics', 'Mathématiques', 'الرياضيات', '#22c55e', true),
  ('french', 'French', 'Français', 'الفرنسية', '#3b82f6', true),
  ('arabic', 'Arabic', 'العربية', 'اللغة العربية', '#f59e0b', true),
  ('science', 'Science', 'Sciences', 'النشاط العلمي', '#a855f7', false),
  ('islamic-education', 'Islamic Education', 'Éducation Islamique', 'التربية الإسلامية', '#14b8a6', false);

insert into level_subjects (level_id, subject_id, order_index)
select l.id, s.id, row_number() over (order by s.slug)
from levels l, subjects s
where l.slug = 'primary-6';
