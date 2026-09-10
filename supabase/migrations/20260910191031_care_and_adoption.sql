begin;
alter table public.cat_unlocks add column admitted boolean not null default false, add column adopted_at timestamptz, add column care_count int not null default 0 check(care_count>=0);
update public.cat_unlocks u set admitted=true from public.cats c,public.streaks s where c.id=u.cat_id and s.user_id=u.user_id and c.unlock_day<=s.total_days;
alter table public.sessions add column care_cat_id uuid references public.cats, add column adopted_cat_id uuid references public.cats;
alter table public.shelter_state add column toys int not null default 0 check(toys>=0), add column yarn int not null default 0 check(yarn>=0), add column vet_visits int not null default 0 check(vet_visits>=0);
alter table public.sessions drop constraint sessions_daily_reward_check;
alter table public.sessions add constraint sessions_daily_reward_check check(daily_reward in ('food','box','bed','treat','toy','yarn','vet'));
alter table public.shelter_state drop constraint shelter_state_last_reward_check;
alter table public.shelter_state add constraint shelter_state_last_reward_check check(last_reward in ('food','box','bed','treat','toy','yarn','vet'));
create or replace function public.finish_mission_atomic(p_session uuid,p_duration int,p_is_test boolean default false) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid();s public.sessions;r public.streaks;cid uuid;cat jsonb;today date:=(now() at time zone 'America/Bogota')::date;corrects int;next_streak int;reward text;already_today boolean;passed_now boolean;care_id uuid;adopt_id uuid;hard_corrects int;care_cat jsonb;adopted_cat jsonb;
begin
 if uid is null then raise exception 'Student required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into s from public.sessions where id=p_session and user_id=uid;
 if not found then raise exception 'Practice unavailable';end if;
 if not s.completed then
  if cardinality(s.completed_seeds)<>10 then raise exception 'Complete ten steps';end if;
  select count(*) filter(where correct),count(*) filter(where correct and level>=3 and hint_level=0) into corrects,hard_corrects from (
    select distinct on(exercise_seed) correct,level,hint_level from public.attempts where session_id=p_session and user_id=uid and exercise_seed=any(s.completed_seeds) order by exercise_seed,created_at,id
  ) first_answers;
  passed_now:=corrects>=7;
  select exists(select 1 from public.sessions where user_id=uid and date=today and mode='daily' and passed) into already_today;
  select * into r from public.streaks where user_id=uid;
  next_streak:=coalesce(r.current,0);
  if s.mode='daily' and passed_now and s.date=today and not already_today then
   next_streak:=case when r.last_session_date=today-1 then r.current+1 else 1 end;
   reward:=(array['bed','food','box','treat','toy','yarn','vet'])[coalesce(r.total_days,0)%7+1];
   insert into public.streaks(user_id,current,best,total_days,last_session_date) values(uid,next_streak,greatest(coalesce(r.best,0),next_streak),coalesce(r.total_days,0)+1,today)
   on conflict(user_id) do update set current=excluded.current,best=excluded.best,total_days=excluded.total_days,last_session_date=excluded.last_session_date;
   update public.shelter_state set food=food+(reward='food')::int,boxes=boxes+(reward='box')::int,beds=beds+(reward='bed')::int,treats=treats+(reward='treat')::int,toys=toys+(reward='toy')::int,yarn=yarn+(reward='yarn')::int,vet_visits=vet_visits+(reward='vet')::int,affection=affection+1,last_care_date=today,last_reward=reward,updated_at=now() where user_id=uid;
   select c.id into cid from public.cats c left join public.cat_unlocks u on u.cat_id=c.id and u.user_id=uid
     where c.unlock_day<=next_streak and not coalesce(u.admitted,false) order by c.unlock_day limit 1;
   if cid is not null then insert into public.cat_unlocks(user_id,cat_id,admitted) values(uid,cid,true)
     on conflict(user_id,cat_id) do update set admitted=true,unlocked_at=now();end if;
   select u.cat_id into care_id from public.cat_unlocks u join public.cats c on c.id=u.cat_id
     where u.user_id=uid and u.admitted and u.adopted_at is null
     order by u.care_count,case when
       (reward='box' and c.personality='curioso') or (reward='bed' and c.personality in ('dormilón','tímido')) or
       (reward='treat' and c.personality in ('cariñoso','gruñón')) or (reward='toy' and c.personality='juguetón') or
       (reward='yarn' and c.personality in ('juguetón','curioso')) then 0 else 1 end,c.id limit 1;
   update public.cat_unlocks set care_count=care_count+1 where user_id=uid and cat_id=care_id;
   if corrects>=8 and hard_corrects>=3 and (select count(*) from public.cat_unlocks where user_id=uid and admitted and adopted_at is null)>1 then
     select cat_id into adopt_id from public.cat_unlocks where user_id=uid and admitted and adopted_at is null and care_count>=3 and cat_id is distinct from cid order by unlocked_at,cat_id limit 1;
     update public.cat_unlocks set adopted_at=now() where user_id=uid and cat_id=adopt_id;
   end if;
  end if;
  update public.sessions set completed=true,passed=passed_now,correct_count=corrects,total_count=10,duration_ms=greatest(0,least(7200000,p_duration)),cat_id=cid,care_cat_id=care_id,adopted_cat_id=adopt_id,daily_reward=reward where id=p_session and user_id=uid returning * into s;
  insert into public.app_events(id,actor_id,actor_kind,event_name,surface,session_id,is_test,properties) values(gen_random_uuid(),uid,'shared_refuge','mission_completed','refuge',p_session,p_is_test,jsonb_build_object('correct',corrects,'duration_ms',p_duration,'reward',reward,'care_cat_id',care_id,'adopted_cat_id',adopt_id,'streak',next_streak,'mode',s.mode,'daily_try',s.daily_try,'passed',passed_now));
 else cid:=s.cat_id;care_id:=s.care_cat_id;adopt_id:=s.adopted_cat_id;reward:=s.daily_reward;
 end if;
 select * into r from public.streaks where user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at,'adoptedAt',u.adopted_at,'careCount',u.care_count) into cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=cid and u.user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at,'adoptedAt',u.adopted_at,'careCount',u.care_count) into care_cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=care_id and u.user_id=uid;
 select to_jsonb(c)||jsonb_build_object('unlockedAt',u.unlocked_at,'adoptedAt',u.adopted_at,'careCount',u.care_count) into adopted_cat from public.cats c join public.cat_unlocks u on c.id=u.cat_id where c.id=adopt_id and u.user_id=uid;
 return jsonb_build_object('streak',to_jsonb(r),'cat',cat,'careCat',care_cat,'adopted',adopted_cat,'reward',reward,'state',(select to_jsonb(st) from public.shelter_state st where user_id=uid),'passed',s.passed,'correct',s.correct_count,'mode',s.mode,'dailyTry',s.daily_try);
end $$;
revoke all on function public.finish_mission_atomic(uuid,int,boolean) from public,anon;
grant execute on function public.finish_mission_atomic(uuid,int,boolean) to authenticated;

commit;
