create table public.ai_requests (
 id uuid primary key,
 user_id uuid not null references public.profiles(id),
 kind text not null check(kind in ('coach','questions','report')),
 status text not null default 'pending' check(status in ('pending','completed','failed')),
 model text,
 tokens integer not null default 0,
 created_at timestamptz not null default now()
);
create index ai_requests_user_time on public.ai_requests(user_id,created_at desc);
create table public.coach_messages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id),
 request_id uuid not null references public.ai_requests(id),
 role text not null check(role in ('user','assistant')),
 content text not null check(length(content) between 1 and 7000),
 skill_id uuid references public.skills(id),
 exercise_seed text,
 created_at timestamptz not null default now(),
 unique(request_id,role)
);
create index coach_messages_user_time on public.coach_messages(user_id,created_at desc);
create table public.learner_memory (
 user_id uuid primary key references public.profiles(id),
 notes text not null default '' check(length(notes)<=1800),
 updated_at timestamptz not null default now()
);
create table public.ai_reports (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id),
 body text not null,
 evidence_count integer not null,
 created_at timestamptz not null default now()
);
alter table public.attempts add column timing_version integer not null default 1;
alter table public.attempts add column ai_help boolean not null default false;
alter table public.ai_requests enable row level security;
revoke all on public.ai_requests from anon, authenticated;
grant select on public.ai_requests to authenticated;
grant all on public.ai_requests to service_role;
create policy read_learning_ai on public.ai_requests for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
alter table public.coach_messages enable row level security;
revoke all on public.coach_messages from anon, authenticated;
grant select on public.coach_messages to authenticated;
grant all on public.coach_messages to service_role;
create policy read_learning_ai on public.coach_messages for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
alter table public.learner_memory enable row level security;
revoke all on public.learner_memory from anon, authenticated;
grant select on public.learner_memory to authenticated;
grant all on public.learner_memory to service_role;
create policy read_learning_ai on public.learner_memory for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
alter table public.ai_reports enable row level security;
revoke all on public.ai_reports from anon, authenticated;
grant select on public.ai_reports to authenticated;
grant all on public.ai_reports to service_role;
create policy read_learning_ai on public.ai_reports for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
grant insert,update on public.learner_memory to authenticated;
create policy edit_learning_memory on public.learner_memory for all to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor')) with check(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
-- Quotas are writable only by the server. The function does not elevate privileges.
create function public.reserve_ai_request(p_id uuid,p_user_id uuid,p_kind text) returns text
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.ai_requests where id=p_id) then return 'duplicate'; end if;
 if exists(select 1 from public.ai_requests where user_id=p_user_id and status='pending' and created_at>now()-interval '90 seconds') then return 'busy'; end if;
 if (select count(*) from public.ai_requests where user_id=p_user_id and created_at>now()-interval '1 minute')>=6 then return 'minute_limit'; end if;
 if (select count(*) from public.ai_requests where user_id=p_user_id and created_at>now()-interval '24 hours')>=100 then return 'day_limit'; end if;
 insert into public.ai_requests(id,user_id,kind) values(p_id,p_user_id,p_kind);
 return 'reserved';
end $$;
revoke all on function public.reserve_ai_request(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,uuid,text) to service_role;
