begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
set local role authenticated;
do $$
declare uid uuid:=auth.uid();today date:=(now() at time zone 'America/Bogota')::date;sk uuid;q jsonb;s jsonb;again jsonb;result jsonb;sid uuid;n int;chance int;before_state jsonb;cat_count int;expected int;seed text;denied boolean;
begin
 select id into sk from public.skills limit 1;
 update public.sessions set date=today-60 where user_id=uid and date=today;
 select to_jsonb(st) into before_state from public.shelter_state st where user_id=uid;
 for chance in 1..3 loop
  select jsonb_agg(jsonb_build_object('skillId',sk,'family','equations','level',1,'seed','chance-'||chance||'-'||series.value)) into q from generate_series(1,10) as series(value);
  s:=public.start_practice_atomic('daily',q);sid:=(s->>'id')::uuid;
  again:=public.start_practice_atomic('daily',q);
  if s->>'id'<>again->>'id' or (s->>'daily_try')::int<>chance then raise exception 'Resume consumed chance';end if;
  for n in 1..10 loop
   seed:=q->(n-1)->>'seed';
   insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id,created_at) values(uid,sk,1,seed,'Test','1','0',n<=6,1000,0,sid,now()-interval '1 second');
   -- Correcting an earlier error does not turn it into a first-try success.
   insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,1,seed,'Test','1','1',true,1000,1,sid);
   perform public.complete_question_atomic(sid,seed);
   perform public.complete_question_atomic(sid,seed);
  end loop;
  result:=public.finish_mission_atomic(sid,10000,true);
  if (result->>'passed')::boolean or (result->>'correct')::int<>6 or result->>'reward' is not null then raise exception 'Below-threshold reward';end if;
 end loop;
 denied:=false;
 begin perform public.start_practice_atomic('daily',q);exception when others then if sqlerrm='DAILY_LIMIT' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'Fourth chance allowed';end if;
 if (select to_jsonb(st) from public.shelter_state st where user_id=uid)<>before_state then raise exception 'Failed challenge changed shelter';end if;
 -- Free practice remains possible, has recorded results and cannot give care or streak.
 s:=public.start_practice_atomic('free',q);sid:=(s->>'id')::uuid;
 for n in 1..10 loop
  seed:=q->(n-1)->>'seed';insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,1,seed,'Test','1','1',true,1000,0,sid);perform public.complete_question_atomic(sid,seed);
 end loop;
 result:=public.finish_mission_atomic(sid,10000,true);
 if result->>'reward' is not null or result->>'mode'<>'free' then raise exception 'Free practice gave reward';end if;
 if (select to_jsonb(st) from public.shelter_state st where user_id=uid)<>before_state then raise exception 'Free practice changed shelter';end if;
 -- Seven first answers pass; on day five exactly one cat is rescued.
 update public.sessions set date=today-60 where user_id=uid and date=today;
 update public.streaks set current=4,last_session_date=today-1,total_days=4 where user_id=uid;
 select count(*) into cat_count from public.cat_unlocks where user_id=uid;
 s:=public.start_practice_atomic('daily',q);sid:=(s->>'id')::uuid;
 for n in 1..10 loop
  seed:=q->(n-1)->>'seed';insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,1,seed,'Test','1','1',n<=7,1000,1,sid);perform public.complete_question_atomic(sid,seed);
 end loop;
 result:=public.finish_mission_atomic(sid,10000,true);again:=public.finish_mission_atomic(sid,10000,true);
 if result<>again or not(result->>'passed')::boolean or result->>'reward'<>'bed' or (result->'streak'->>'current')::int<>5 then raise exception 'Reward or idempotence incorrect';end if;
 if (select count(*) from public.cat_unlocks where user_id=uid)<>cat_count+1 then raise exception 'Five-day rescue incorrect';end if;
 denied:=false;
 begin perform public.start_practice_atomic('daily',q);exception when others then if sqlerrm='DAILY_PASSED' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'Passed day can earn twice';end if;
end $$;
rollback;
select 'PASS: three chances, first-answer threshold, resumable/idempotent steps, free practice without rewards, seven passes, day-five rescue' as result;
