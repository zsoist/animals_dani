begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
set local role authenticated;
do $$
declare uid uuid:=auth.uid(); sid uuid; sk uuid; result jsonb; again jsonb; baseline int; food_before int; boxes_before int; scenario int; n int; today date:=(now() at time zone 'America/Bogota')::date;
begin
 select id into sk from public.skills limit 1;
 for scenario in 1..3 loop
  update public.sessions set date=today-30 where user_id=uid and completed and date=today;
  update public.streaks set current=case when scenario=1 then 0 else 4 end,last_session_date=case when scenario=2 then today-1 else today-2 end where user_id=uid;
  select count(*) into baseline from public.cat_unlocks where user_id=uid;
  select food,boxes into food_before,boxes_before from public.shelter_state where user_id=uid;
  sid:=gen_random_uuid();insert into public.sessions(id,user_id,date,total_count) values(sid,uid,today,10);
  for n in 1..10 loop
   insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id) values(uid,sk,1,sid::text||n,'Daily reward check','1','1',true,1000,0,sid);
  end loop;
  result:=public.finish_mission_atomic(sid,10000,true);
  again:=public.finish_mission_atomic(sid,10000,true);
  if result<>again then raise exception 'Retry changed reward';end if;
  if scenario=2 then
   if (result->'streak'->>'current')::int<>5 or (select count(*) from public.cat_unlocks where user_id=uid)<>baseline+1 then raise exception 'Missing five-day rescue';end if;
  else
   if result->>'cat' is not null or (result->'streak'->>'current')::int<>1 then raise exception 'Rescue before five consecutive days';end if;
  end if;
  if (select food+boxes from public.shelter_state where user_id=uid)<>food_before+boxes_before+1 then raise exception 'Care duplicated';end if;
 end loop;
end $$;
rollback;
select 'PASS: daily care once, five-day rescue only, missed day resets eligibility, retry stable' as result;
