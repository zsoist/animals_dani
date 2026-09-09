begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
select set_config('test.tutor_id',(select id::text from public.profiles where role='tutor' limit 1),true);
set local role authenticated;
do $$
declare uid uuid:=auth.uid(); sid uuid:=gen_random_uuid(); sk uuid; aid uuid:=gen_random_uuid(); total int; row jsonb; mastery jsonb; first jsonb; second jsonb; before_count int; n int;
begin
 select id into sk from public.skills limit 1;
 select coalesce(attempts_total,0) into total from public.skill_mastery where user_id=uid and skill_id=sk;total:=coalesce(total,0);
 insert into public.sessions(id,user_id,date,total_count) values(sid,uid,current_date,10);
 row:=jsonb_build_object('id',aid,'session_id',sid,'skill_id',sk,'level',1,'exercise_seed','verification-one','prompt_text','Atomic verification','expected_answer','1','given_answer','1','correct',true,'response_ms',1000,'hint_level',0,'created_at',now(),'timing_version',2,'ai_help',false,'is_test',true);
 mastery:=jsonb_build_object('mastery_score',50,'current_level',1,'recent_accuracy',1);
 first:=public.record_attempt_atomic(row,mastery,total);
 second:=public.record_attempt_atomic(row,mastery,total);
 if second->>'duplicate'<>'true' then raise exception 'Retry not deduplicated';end if;
 if (select count(*) from public.attempts where id=aid)<>1 then raise exception 'Duplicate attempt';end if;
 if (first->'state')<>(second->'state') then raise exception 'Duplicate reward';end if;
 begin
  perform public.record_attempt_atomic(row||jsonb_build_object('id',gen_random_uuid()),mastery||jsonb_build_object('mastery_score',1000),total+1);
  raise exception 'Expected constraint failure';
 exception when check_violation then null;
 end;
 if (select count(*) from public.attempts where session_id=sid)<>1 then raise exception 'Partial commit';end if;
 for n in 2..10 loop
  insert into public.attempts(user_id,skill_id,level,exercise_seed,prompt_text,expected_answer,given_answer,correct,response_ms,hint_level,session_id)
  values(uid,sk,1,'verification-'||n,'Atomic verification','1','1',true,1000,0,sid);
 end loop;
 first:=public.finish_mission_atomic(sid,10000);second:=public.finish_mission_atomic(sid,10000);
 if first<>second then raise exception 'Completion not idempotent';end if;
 if (select count(*) from public.app_events)<>0 then raise exception 'Student can read behavioral records';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.tutor_id'),true);
do $$ declare sid uuid:=gen_random_uuid();levels jsonb;begin
 select jsonb_agg(jsonb_build_object('level',n,'description','verification')) into levels from generate_series(1,4) n;
 perform public.save_skill_atomic(sid,'{"name":"Atomic check","description":"Rolled back","subject":"fisica","active":false,"priority":1,"base_difficulty":1}',levels);
 if (select count(*) from public.skill_levels where skill_id=sid)<>4 then raise exception 'Incomplete skill';end if;
end $$;
rollback;
select 'PASS: atomic retry, rollback, rescue, teacher save and student RLS' as verification;
