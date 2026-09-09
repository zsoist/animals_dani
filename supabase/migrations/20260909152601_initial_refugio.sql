create table public.profiles(id uuid primary key references auth.users on delete cascade, display_name text not null, role text not null check(role in ('student','tutor')));
create table public.skills(id uuid primary key default gen_random_uuid(), name text not null, subject text not null check(subject in ('matematicas','fisica','quimica')), description text not null, active boolean not null default true, priority integer not null default 1, base_difficulty integer not null default 1 check(base_difficulty between 1 and 4), created_at timestamptz not null default now());
create table public.skill_levels(skill_id uuid references public.skills on delete cascade, level integer check(level between 1 and 4), description text not null, primary key(skill_id,level));
create table public.cats(id uuid primary key default gen_random_uuid(), name text not null, personality text not null, story text not null, trait_tags text[] not null, palette jsonb not null);
create table public.sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles, date date not null default current_date, completed boolean not null default false, correct_count integer not null default 0, total_count integer not null default 0, duration_ms integer not null default 0, cat_id uuid references public.cats, created_at timestamptz not null default now(), unique(id,user_id));
create table public.attempts(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles, skill_id uuid not null references public.skills, level integer not null check(level between 1 and 4), exercise_seed text not null, prompt_text text not null, expected_answer text not null, given_answer text not null, correct boolean not null, response_ms integer not null check(response_ms>=0), hint_level integer not null check(hint_level between 0 and 3), error_type text, session_id uuid not null, created_at timestamptz not null default now(),foreign key(session_id,user_id) references public.sessions(id,user_id));
create table public.skill_mastery(user_id uuid references public.profiles, skill_id uuid references public.skills, mastery_score numeric not null default 0 check(mastery_score between 0 and 100),current_level integer not null default 1 check(current_level between 1 and 4),recent_accuracy numeric not null default 0 check(recent_accuracy between 0 and 1),attempts_total integer not null default 0,last_practiced_at timestamptz,primary key(user_id,skill_id));
create table public.cat_unlocks(user_id uuid references public.profiles,cat_id uuid references public.cats,unlocked_at timestamptz not null default now(),primary key(user_id,cat_id));
create table public.streaks(user_id uuid primary key references public.profiles,current integer not null default 0,best integer not null default 0,total_days integer not null default 0,last_session_date date);
create table public.shelter_state(user_id uuid primary key references public.profiles,food integer not null default 0,blankets integer not null default 0,lamps integer not null default 0,clean_zones integer not null default 0,affection integer not null default 0,updated_at timestamptz not null default now());
create table public.tutor_notes(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles,skill_id uuid not null references public.skills on delete cascade,body text not null,created_at timestamptz not null default now());
-- profiles is read-only to authenticated users, making the role immutable from the client.
alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='tutor');
create policy tutor_profiles on public.profiles for select to authenticated using((select auth.jwt()->'app_metadata'->>'role')='tutor');
grant select on public.profiles to authenticated;
-- Tutor claims are assigned only by the administrative seed, never user metadata.
do $$ declare t text; begin
foreach t in array array['sessions','attempts','skill_mastery','cat_unlocks','streaks','shelter_state'] loop
execute format('alter table public.%I enable row level security',t);
execute format('grant select, insert, update on public.%I to authenticated',t);
execute format('create policy read_rows on public.%I for select to authenticated using (user_id=(select auth.uid()) or (select auth.jwt()->''app_metadata''->>''role'')=''tutor'')',t);
execute format('create policy insert_own on public.%I for insert to authenticated with check (user_id=(select auth.uid()) and exists (select 1 from public.profiles where id=(select auth.uid()) and role=''student''))',t);
execute format('create policy update_own on public.%I for update to authenticated using (user_id=(select auth.uid()) and exists (select 1 from public.profiles where id=(select auth.uid()) and role=''student'')) with check (user_id=(select auth.uid()) and exists (select 1 from public.profiles where id=(select auth.uid()) and role=''student''))',t);
end loop;
foreach t in array array['skills','skill_levels','cats'] loop
execute format('alter table public.%I enable row level security',t);
execute format('grant select on public.%I to authenticated',t);
execute format('create policy read_catalog on public.%I for select to authenticated using (exists (select 1 from public.profiles where id=(select auth.uid())))',t);
end loop;
foreach t in array array['skills','skill_levels','tutor_notes'] loop
execute format('alter table public.%I enable row level security',t);
execute format('grant select,insert,update,delete on public.%I to authenticated',t);
execute format('create policy tutor_manage on public.%I for all to authenticated using (exists (select 1 from public.profiles where id=(select auth.uid()) and role=''tutor'')) with check (exists (select 1 from public.profiles where id=(select auth.uid()) and role=''tutor''))',t);
end loop;end $$;
create index attempts_user_skill_date on public.attempts(user_id,skill_id,created_at desc);
create index attempts_session on public.attempts(session_id,user_id);
create index sessions_user_date on public.sessions(user_id,date);
create index notes_skill on public.tutor_notes(skill_id);
