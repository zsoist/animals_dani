begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
set local role authenticated;
create function pg_temp.care_test_session(test_mode text,score int,hard int,hints int) returns jsonb language plpgsql as $$
declare uid uuid:=auth.uid();today date:=(now() at time zone 'America/Bogota')::date;sk uuid;q jsonb;s jsonb;sid uuid;seed text;n int;r jsonb;again jsonb;
begin
 update public.sessions set date=today-60 where user_id=uid and date=today;
 select id into sk from public.skills limit 1;
 select jsonb_agg(jsonb_build_object('skillId',sk,'family','equations','level',case when value<=hard then 3 else 1 end,'seed',gen_random_uuid()::text)) into q from generate_series(1,10) series(value);
 s:=public.start_practice_atomic(test_mode,q);sid:=(s->>'id')::uuid;
 for n in 1..10 loop
  seed:=q->(n-1)->>'seed';insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,(q->(n-1)->>'level')::int,seed,'Isolated reward verification','1','1',n<=score,1000,hints,sid);perform public.complete_question_atomic(sid,seed);
 end loop;
 r:=public.finish_mission_atomic(sid,10000,true);again:=public.finish_mission_atomic(sid,10000,true);
 if r<>again then raise exception 'Completion must be idempotent';end if;
 return r;
end $$;
do $$
declare uid uuid:=auth.uid();today date:=(now() at time zone 'America/Bogota')::date;day int;r jsonb;expected uuid;before_care int;keep uuid;
begin
 update public.cat_unlocks set admitted=false,adopted_at=null,care_count=0 where user_id=uid;
 for day in 1..10 loop
  update public.streaks set current=day-1,total_days=day-1,last_session_date=today-1 where user_id=uid;
  r:=pg_temp.care_test_session('daily',10,0,0);
  select id into expected from public.cats where unlock_day=day;
  if (r->'cat'->>'id')::uuid is distinct from expected then raise exception 'Wrong rescue at day %',day;end if;
  if (r->>'reward') is distinct from (array['bed','food','box','treat','toy','yarn','vet'])[(day-1)%7+1] then raise exception 'Wrong care cycle';end if;
  if r->'adopted'<>'null'::jsonb then raise exception 'Easy challenge adopted cat';end if;
 end loop;
 update public.cat_unlocks set care_count=3 where user_id=uid and admitted;
 select sum(care_count) into before_care from public.cat_unlocks where user_id=uid;
 r:=pg_temp.care_test_session('free',10,10,0);
 if r->'adopted'<>'null'::jsonb or r->'reward'<>'null'::jsonb then raise exception 'Free practice must not grant daily rewards';end if;
 if (select sum(care_count) from public.cat_unlocks where user_id=uid)<>before_care then raise exception 'Free practice increased care';end if;
 r:=pg_temp.care_test_session('daily',7,3,0);
 if r->'adopted'<>'null'::jsonb then raise exception 'Adoption needs eight correct';end if;
 r:=pg_temp.care_test_session('daily',10,10,1);
 if r->'adopted'<>'null'::jsonb then raise exception 'Hints do not qualify as unassisted';end if;
 r:=pg_temp.care_test_session('daily',8,3,0);
 if r->'adopted'='null'::jsonb then raise exception 'Eligible hard challenge did not adopt';end if;
 if not exists(select 1 from public.cat_unlocks where user_id=uid and cat_id=(r->'adopted'->>'id')::uuid and adopted_at is not null) then raise exception 'Adoption not persistent';end if;
 select cat_id into keep from public.cat_unlocks where user_id=uid and admitted and adopted_at is null limit 1;
 update public.cat_unlocks set adopted_at=now() where user_id=uid and admitted and cat_id<>keep;
 r:=pg_temp.care_test_session('daily',10,10,0);
 if r->'adopted'<>'null'::jsonb then raise exception 'Last resident must stay';end if;
 -- Breaking a streak does not rescue a later cat through cumulative days alone.
 update public.cat_unlocks set admitted=false where user_id=uid and cat_id in(select id from public.cats where unlock_day=10);
 update public.streaks set current=0,total_days=40,last_session_date=today-4 where user_id=uid;
 r:=pg_temp.care_test_session('daily',10,0,0);
 if r->'cat'<>'null'::jsonb then raise exception 'Rescue must follow the streak';end if;
end $$;
rollback;
select 'PASS: care cycle, streak rescues, adoption conditions, persistence and idempotence' as result;
