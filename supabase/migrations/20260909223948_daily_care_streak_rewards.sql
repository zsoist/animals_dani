begin;
alter table public.shelter_state add column boxes integer not null default 0 check(boxes>=0), add column last_care_date date;
alter table public.sessions add column daily_reward text check(daily_reward in ('food','box'));
create or replace function public.finish_mission_atomic(p_session uuid,p_duration int,p_is_test boolean default false) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); s public.sessions; r public.streaks; cid uuid; cat jsonb; today date:=(now() at time zone 'America/Bogota')::date; steps int; corrects int; next_streak int; reward text; already_today boolean;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into s from public.sessions where id=p_session and user_id=uid;
 if not found then raise exception 'Mission unavailable';end if;
 if not s.completed then
  select count(distinct exercise_seed),count(distinct exercise_seed) filter(where correct) into steps,corrects from public.attempts where session_id=p_session and user_id=uid;
  if steps<10 then raise exception 'Complete ten steps';end if;
  select exists(select 1 from public.sessions where user_id=uid and date=today and completed) into already_today;
  select * into r from public.streaks where user_id=uid;
  next_streak:=coalesce(r.current,0);
  if not already_today then
   next_streak:=case when r.last_session_date=today-1 then r.current+1 else 1 end;
   insert into public.streaks(user_id,current,best,total_days,last_session_date) values(uid,next_streak,greatest(coalesce(r.best,0),next_streak),coalesce(r.total_days,0)+1,today)
   on conflict(user_id) do update set current=excluded.current,best=excluded.best,total_days=excluded.total_days,last_session_date=excluded.last_session_date;
   reward:=case when next_streak%2=0 then 'box' else 'food' end;
   update public.shelter_state set food=food+case when reward='food' then 1 else 0 end,boxes=boxes+case when reward='box' then 1 else 0 end,affection=affection+1,last_care_date=today,updated_at=now() where user_id=uid;
   if next_streak%5=0 then
    select id into cid from public.cats where id not in(select cat_id from public.cat_unlocks where user_id=uid) order by name limit 1;
    if cid is not null then insert into public.cat_unlocks(user_id,cat_id) values(uid,cid) on conflict do nothing;end if;
   end if;
  end if;
  update public.sessions set completed=true,date=today,correct_count=least(10,corrects),total_count=10,duration_ms=greatest(0,least(7200000,p_duration)),cat_id=cid,daily_reward=reward where id=p_session and user_id=uid;
  insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,is_test,properties) values(gen_random_uuid(),uid,'shared_refuge','mission_completed','refuge',p_session,p_is_test,jsonb_build_object('correct',corrects,'duration_ms',p_duration,'reward',reward,'streak',next_streak));
 else cid:=s.cat_id;reward:=s.daily_reward;
 end if;
 select * into r from public.streaks where user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at) into cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=cid and u.user_id=uid;
 return jsonb_build_object('streak',to_jsonb(r),'cat',cat,'reward',reward,'state',(select to_jsonb(st) from public.shelter_state st where user_id=uid));
end $$;
revoke all on function public.finish_mission_atomic(uuid,int,boolean) from public,anon;
grant execute on function public.finish_mission_atomic(uuid,int,boolean) to authenticated;
create or replace function public.record_attempt_atomic(p_row jsonb,p_mastery jsonb,p_expected_total int) returns jsonb
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

 select to_jsonb(s) into result from public.shelter_state s where user_id=uid;
 if result is null then raise exception 'Missing shelter';end if;
 insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,skill_id,is_test,properties)
 values((p_row->>'id')::uuid,uid,'shared_refuge','attempt_saved','refuge',sid,skill,coalesce((p_row->>'is_test')::boolean,false),jsonb_build_object('correct',(p_row->>'correct')::boolean,'hint_level',(p_row->>'hint_level')::int,'duration_ms',(p_row->>'response_ms')::int,'error_type',p_row->>'error_type'));
 return jsonb_build_object('state',result,'duplicate',false);
end $$;
revoke all on function public.record_attempt_atomic(jsonb,jsonb,int) from public,anon;
grant execute on function public.record_attempt_atomic(jsonb,jsonb,int) to authenticated;


commit;
