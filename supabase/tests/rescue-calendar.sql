begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
set local role authenticated;
do $$ declare uid uuid:=auth.uid();today date:=(now() at time zone 'America/Bogota')::date;sk uuid;q jsonb;s jsonb;result jsonb;again jsonb;sid uuid;day int;n int;seed text;expected uuid;begin
select id into sk from public.skills limit 1;
for day in 1..10 loop
update public.sessions set date=today-60 where user_id=uid and date=today;
update public.streaks set current=0,total_days=day-1,last_session_date=today-3 where user_id=uid;
select jsonb_agg(jsonb_build_object('skillId',sk,'family','equations','level',1,'seed','calendar-'||day||'-'||series.value)) into q from generate_series(1,10) as series(value);
s:=public.start_practice_atomic('daily',q);sid:=(s->>'id')::uuid;
for n in 1..10 loop
seed:=q->(n-1)->>'seed';insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,1,seed,'Calendar test','1','1',true,1000,0,sid);perform public.complete_question_atomic(sid,seed);
end loop;
result:=public.finish_mission_atomic(sid,10000,true);again:=public.finish_mission_atomic(sid,10000,true);
select id into expected from public.cats where unlock_day=day;
if (result->'cat'->>'id')::uuid is distinct from expected then raise exception 'Wrong rescue day %',day;end if;
if result<>again then raise exception 'Not idempotent';end if;
if (result->'streak'->>'total_days')::int<>day then raise exception 'Wrong total';end if;
end loop;
end $$;
rollback;
select 'PASS: rescue calendar and idempotence' as result;
