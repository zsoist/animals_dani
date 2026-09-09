begin;
create table public.app_events (
 id uuid primary key,
 actor_id uuid references public.profiles(id),
 actor_kind text not null check(actor_kind in ('shared_refuge','tutor','visitor')),
 visit_id uuid,
 session_id uuid references public.sessions(id) on delete set null,
 skill_id uuid references public.skills(id) on delete set null,
 event_name text not null check(length(event_name) between 1 and 60),
 surface text not null check(surface in ('refuge','tutor','auth')),
 properties jsonb not null default '{}' check(octet_length(properties::text)<=3000),
 is_test boolean not null default false,
 occurred_at timestamptz not null default now(),
 received_at timestamptz not null default now()
);
create index app_events_actor_time on public.app_events(actor_kind,occurred_at desc);
create index app_events_visit on public.app_events(visit_id,occurred_at);
alter table public.app_events enable row level security;
revoke all on public.app_events from anon,authenticated;
grant select,insert on public.app_events to authenticated;
grant all on public.app_events to service_role;
create policy tutor_reads_events on public.app_events for select to authenticated using(exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'));
create policy write_own_events on public.app_events for insert to authenticated with check(actor_id=(select auth.uid()) and ((actor_kind='shared_refuge' and exists(select 1 from public.profiles where id=(select auth.uid()) and role='student')) or (actor_kind='tutor' and exists(select 1 from public.profiles where id=(select auth.uid()) and role='tutor'))));

create function public.save_skill_atomic(p_id uuid,p_values jsonb,p_levels jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='tutor') then raise exception 'Tutor required'; end if;
 if jsonb_array_length(p_levels)<>4 then raise exception 'Four levels required';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 insert into public.skills(id,name,description,subject,active,priority,base_difficulty)
 values(p_id,p_values->>'name',p_values->>'description',p_values->>'subject',(p_values->>'active')::boolean,(p_values->>'priority')::int,(p_values->>'base_difficulty')::int)
 on conflict(id) do update set name=excluded.name,description=excluded.description,subject=excluded.subject,active=excluded.active,priority=excluded.priority,base_difficulty=excluded.base_difficulty;
 insert into public.skill_levels(skill_id,level,description) select p_id,(v->>'level')::int,v->>'description' from jsonb_array_elements(p_levels) v
 on conflict(skill_id,level) do update set description=excluded.description;
 insert into public.app_events(id,actor_id,actor_kind,event_name,surface,skill_id,properties) values(gen_random_uuid(),auth.uid(),'tutor','skill_saved','tutor',p_id,jsonb_build_object('active',(p_values->>'active')::boolean));
 return p_id;
end $$;
revoke all on function public.save_skill_atomic(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_skill_atomic(uuid,jsonb,jsonb) to authenticated;

create function public.record_attempt_atomic(p_row jsonb,p_mastery jsonb,p_expected_total int) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); existing public.attempts; total int; result jsonb; sid uuid:=(p_row->>'session_id')::uuid; skill uuid:=(p_row->>'skill_id')::uuid;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into existing from public.attempts where id=(p_row->>'id')::uuid;
 if found then
   if existing.user_id<>uid or existing.session_id<>sid then raise exception 'Invalid retry';end if;
   select to_jsonb(s) into result from public.shelter_state s where user_id=uid;return jsonb_build_object('state',result,'duplicate',true);
 end if;
 if not exists(select 1 from public.sessions where id=sid and user_id=uid and not completed) then raise exception 'Mission unavailable';end if;
 select attempts_total into total from public.skill_mastery where user_id=uid and skill_id=skill;
 if coalesce(total,0)<>p_expected_total then raise exception 'STALE_MASTERY';end if;
 insert into public.attempts(id,user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,error_type,session_id,created_at,timing_version,ai_help)
 values((p_row->>'id')::uuid,uid,skill,(p_row->>'level')::int,p_row->>'exercise_seed',p_row->>'prompt_text',p_row->>'expected_answer',p_row->>'given_answer',(p_row->>'correct')::boolean,(p_row->>'response_ms')::int,(p_row->>'hint_level')::int,p_row->>'error_type',sid,(p_row->>'created_at')::timestamptz,(p_row->>'timing_version')::int,(p_row->>'ai_help')::boolean);
 insert into public.skill_mastery(user_id,skill_id,mastery_score,current_level,recent_accuracy,attempts_total,last_practiced_at)
 values(uid,skill,(p_mastery->>'mastery_score')::numeric,(p_mastery->>'current_level')::int,(p_mastery->>'recent_accuracy')::numeric,coalesce(total,0)+1,(p_row->>'created_at')::timestamptz)
 on conflict(user_id,skill_id) do update set mastery_score=excluded.mastery_score,current_level=excluded.current_level,recent_accuracy=excluded.recent_accuracy,attempts_total=excluded.attempts_total,last_practiced_at=excluded.last_practiced_at;
 if (p_row->>'correct')::boolean then update public.shelter_state set blankets=blankets+1,lamps=lamps+case when (blankets+1)%5=0 then 1 else 0 end,affection=affection+1,updated_at=now() where user_id=uid;end if;
 select to_jsonb(s) into result from public.shelter_state s where user_id=uid;
 if result is null then raise exception 'Missing shelter';end if;
 insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,skill_id,is_test,properties)
 values((p_row->>'id')::uuid,uid,'shared_refuge','attempt_saved','refuge',sid,skill,coalesce((p_row->>'is_test')::boolean,false),jsonb_build_object('correct',(p_row->>'correct')::boolean,'hint_level',(p_row->>'hint_level')::int,'duration_ms',(p_row->>'response_ms')::int,'error_type',p_row->>'error_type'));
 return jsonb_build_object('state',result,'duplicate',false);
end $$;
revoke all on function public.record_attempt_atomic(jsonb,jsonb,int) from public,anon;
grant execute on function public.record_attempt_atomic(jsonb,jsonb,int) to authenticated;

create function public.finish_mission_atomic(p_session uuid,p_duration int) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); s public.sessions; r public.streaks; cid uuid; cat jsonb; today date:=(now() at time zone 'America/Bogota')::date; steps int; corrects int; next_streak int;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into s from public.sessions where id=p_session and user_id=uid;
 if not found then raise exception 'Mission unavailable';end if;
 if not s.completed then
  select count(distinct exercise_seed),count(distinct exercise_seed) filter(where correct) into steps,corrects from public.attempts where session_id=p_session and user_id=uid;
  if steps<10 then raise exception 'Complete ten steps';end if;
  select id into cid from public.cats where id not in(select cat_id from public.cat_unlocks where user_id=uid) order by name limit 1;
  update public.sessions set completed=true,date=today,correct_count=corrects,total_count=10,duration_ms=greatest(0,least(7200000,p_duration)),cat_id=cid where id=p_session and user_id=uid;
  if cid is not null then insert into public.cat_unlocks(user_id,cat_id) values(uid,cid) on conflict do nothing;end if;
  select * into r from public.streaks where user_id=uid;
  if r.last_session_date is distinct from today then
   next_streak:=case when r.last_session_date=today-1 then r.current+1 else 1 end;
   insert into public.streaks(user_id,current,best,total_days,last_session_date) values(uid,next_streak,greatest(coalesce(r.best,0),next_streak),coalesce(r.total_days,0)+1,today)
   on conflict(user_id) do update set current=excluded.current,best=excluded.best,total_days=excluded.total_days,last_session_date=excluded.last_session_date;
  end if;
  insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,properties) values(gen_random_uuid(),uid,'shared_refuge','mission_completed','refuge',p_session,jsonb_build_object('correct',corrects,'duration_ms',p_duration));
 else cid:=s.cat_id;
 end if;
 select * into r from public.streaks where user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at) into cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=cid and u.user_id=uid;
 return jsonb_build_object('streak',to_jsonb(r),'cat',cat);
end $$;
revoke all on function public.finish_mission_atomic(uuid,int) from public,anon;
grant execute on function public.finish_mission_atomic(uuid,int) to authenticated;

alter table public.ai_requests add column latency_ms int, add column error_code text;
create function public.save_coach_atomic(p_request uuid,p_user uuid,p_messages jsonb,p_memory text,p_model text,p_tokens int,p_latency int) returns void
language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,1));
 if not exists(select 1 from public.ai_requests where id=p_request and user_id=p_user and status='pending') then raise exception 'Request unavailable';end if;
 insert into public.coach_messages(user_id,request_id,role,content,skill_id,exercise_seed,created_at)
 select p_user,p_request,v->>'role',v->>'content',(v->>'skill_id')::uuid,v->>'exercise_seed',(v->>'created_at')::timestamptz from jsonb_array_elements(p_messages) v;
 insert into public.learner_memory(user_id,notes,updated_at) values(p_user,p_memory,now()) on conflict(user_id) do update set notes=excluded.notes,updated_at=excluded.updated_at;
 update public.ai_requests set status='completed',model=p_model,tokens=p_tokens,latency_ms=p_latency where id=p_request;
end $$;
revoke all on function public.save_coach_atomic(uuid,uuid,jsonb,text,text,int,int) from public,anon,authenticated;
grant execute on function public.save_coach_atomic(uuid,uuid,jsonb,text,text,int,int) to service_role;
commit;
