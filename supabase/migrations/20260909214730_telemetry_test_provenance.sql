begin;
create or replace function public.save_skill_atomic(p_id uuid,p_values jsonb,p_levels jsonb) returns uuid
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
 insert into public.app_events(id,actor_id,actor_kind,event_name,surface,skill_id,is_test,properties) values(gen_random_uuid(),auth.uid(),'tutor','skill_saved','tutor',p_id,coalesce((p_values->>'is_test')::boolean,false),jsonb_build_object('active',(p_values->>'active')::boolean));
 return p_id;
end $$;
revoke all on function public.save_skill_atomic(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_skill_atomic(uuid,jsonb,jsonb) to authenticated;

drop function if exists public.finish_mission_atomic(uuid,int);
create or replace function public.finish_mission_atomic(p_session uuid,p_duration int,p_is_test boolean default false) returns jsonb
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
  insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,is_test,properties) values(gen_random_uuid(),uid,'shared_refuge','mission_completed','refuge',p_session,p_is_test,jsonb_build_object('correct',corrects,'duration_ms',p_duration));
 else cid:=s.cat_id;
 end if;
 select * into r from public.streaks where user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at) into cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=cid and u.user_id=uid;
 return jsonb_build_object('streak',to_jsonb(r),'cat',cat);
end $$;
revoke all on function public.finish_mission_atomic(uuid,int,boolean) from public,anon;
grant execute on function public.finish_mission_atomic(uuid,int,boolean) to authenticated;


commit;
