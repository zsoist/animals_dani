begin;
alter table public.cats add column unlock_day int check(unlock_day between 1 and 10);
update public.cats set unlock_day=case name when 'Milo' then 1 when 'Bruno' then 3 when 'Luna' then 4 when 'Pipa' then 5 when 'Nube' then 6 when 'Miel' then 7 end;
insert into public.cats(name,personality,story,trait_tags,palette,unlock_day) values
('Coco','curioso','Se asomaba cada mañana al patio. Ya tiene un lugar junto a la ventana.',array['ventana'],'{"body":"#ae7f54","belly":"#f4e4d0"}',8),
('Oliva','tímido','Encontró refugio bajo un árbol durante la lluvia. Poco a poco se acerca a sus amigos.',array['calma'],'{"body":"#77716a","belly":"#eee8df"}',9),
('Simón','juguetón','Llegó siguiendo una pelota. Le gusta compartir sus juguetes con todos.',array['pelota'],'{"body":"#d8c8ad","belly":"#fff4e4"}',10);
create or replace function public.finish_mission_atomic(p_session uuid,p_duration int,p_is_test boolean default false) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid();s public.sessions;r public.streaks;cid uuid;cat jsonb;today date:=(now() at time zone 'America/Bogota')::date;corrects int;next_streak int;reward text;already_today boolean;passed_now boolean;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into s from public.sessions where id=p_session and user_id=uid;
 if not found then raise exception 'Practice unavailable';end if;
 if not s.completed then
  if cardinality(s.completed_seeds)<>10 then raise exception 'Complete ten steps';end if;
  select count(*) filter(where correct) into corrects from (
    select distinct on(exercise_seed) correct from public.attempts where session_id=p_session and user_id=uid and exercise_seed=any(s.completed_seeds) order by exercise_seed,created_at,id
  ) first_answers;
  passed_now:=corrects>=7;
  select exists(select 1 from public.sessions where user_id=uid and date=today and mode='daily' and passed) into already_today;
  select * into r from public.streaks where user_id=uid;
  next_streak:=coalesce(r.current,0);
  if s.mode='daily' and passed_now and s.date=today and not already_today then
   next_streak:=case when r.last_session_date=today-1 then r.current+1 else 1 end;
   reward:=(array['bed','food','box','treat'])[coalesce(r.total_days,0)%4+1];
   insert into public.streaks(user_id,current,best,total_days,last_session_date) values(uid,next_streak,greatest(coalesce(r.best,0),next_streak),coalesce(r.total_days,0)+1,today)
   on conflict(user_id) do update set current=excluded.current,best=excluded.best,total_days=excluded.total_days,last_session_date=excluded.last_session_date;
   update public.shelter_state set food=food+(reward='food')::int,boxes=boxes+(reward='box')::int,beds=beds+(reward='bed')::int,treats=treats+(reward='treat')::int,affection=affection+1,last_care_date=today,last_reward=reward,updated_at=now() where user_id=uid;
   if true then
    select id into cid from public.cats where unlock_day=coalesce(r.total_days,0)+1 order by unlock_day limit 1;
    if cid is not null then insert into public.cat_unlocks(user_id,cat_id) values(uid,cid) on conflict do nothing;end if;
   end if;
  end if;
  update public.sessions set completed=true,passed=passed_now,correct_count=corrects,total_count=10,duration_ms=greatest(0,least(7200000,p_duration)),cat_id=cid,daily_reward=reward where id=p_session and user_id=uid returning * into s;
  insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,is_test,properties) values(gen_random_uuid(),uid,'shared_refuge','mission_completed','refuge',p_session,p_is_test,jsonb_build_object('correct',corrects,'duration_ms',p_duration,'reward',reward,'streak',next_streak,'mode',s.mode,'daily_try',s.daily_try,'passed',passed_now));
 else cid:=s.cat_id;reward:=s.daily_reward;
 end if;
 select * into r from public.streaks where user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at) into cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=cid and u.user_id=uid;
 return jsonb_build_object('streak',to_jsonb(r),'cat',cat,'reward',reward,'state',(select to_jsonb(st) from public.shelter_state st where user_id=uid),'passed',s.passed,'correct',s.correct_count,'mode',s.mode,'dailyTry',s.daily_try);
end $$;
revoke all on function public.finish_mission_atomic(uuid,int,boolean) from public,anon;
grant execute on function public.finish_mission_atomic(uuid,int,boolean) to authenticated;
create or replace function public.record_attempt_atomic(p_row jsonb,p_mastery jsonb,p_expected_total int) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); existing public.attempts; total int; result jsonb; sid uuid:=(p_row->>'session_id')::uuid; skill uuid:=(p_row->>'skill_id')::uuid; session_row public.sessions; question jsonb; position int; next_queue jsonb;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into existing from public.attempts where id=(p_row->>'id')::uuid;
 if found then
   if existing.user_id<>uid or existing.session_id<>sid then raise exception 'Invalid retry';end if;
   select to_jsonb(s) into result from public.shelter_state s where user_id=uid;return jsonb_build_object('state',result,'duplicate',true);
 end if;
 select * into session_row from public.sessions where id=sid and user_id=uid and not completed;
 if not found then raise exception 'Mission unavailable';end if;
 if jsonb_array_length(session_row.planned_queue)>0 then
  position:=cardinality(session_row.completed_seeds);
  question:=session_row.planned_queue->position;
  if question->>'seed' is distinct from p_row->>'exercise_seed' or question->>'skillId' is distinct from skill::text or (question->>'level')::int<>(p_row->>'level')::int then raise exception 'Not current question';end if;
  if not (p_row->>'correct')::boolean and not coalesce((question->>'reinforced')::boolean,false) and not exists(select 1 from public.attempts where session_id=sid and exercise_seed=p_row->>'exercise_seed') then
   select jsonb_agg(entry order by ordering) into next_queue from (
    select value as entry,ordinality::numeric as ordering from jsonb_array_elements(session_row.planned_queue) with ordinality
    union all select question||jsonb_build_object('seed',(question->>'seed')||':repaso','reinforced',true),least(position+3,10)+0.5
   ) items;
   select jsonb_agg(value order by ordinality) into next_queue from jsonb_array_elements(next_queue) with ordinality where ordinality<=10;
   update public.sessions set planned_queue=next_queue where id=sid and user_id=uid;
  end if;
 end if;
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
