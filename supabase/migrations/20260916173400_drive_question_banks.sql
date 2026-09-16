begin;
create table public.drive_connections (
 user_id uuid primary key references public.profiles(id),
 refresh_token text,
 folder_id text,
 folder_name text,
 updated_at timestamptz not null default now()
);
alter table public.drive_connections enable row level security;
revoke all on public.drive_connections from public,anon,authenticated;
grant select,insert,update,delete on public.drive_connections to service_role;
alter table public.skills add column drive_file_id text unique;
alter table public.skills add column drive_modified_time timestamptz;
alter table public.skills add column drive_folder_id text;
create function public.publish_drive_bank(p_file text,p_folder text,p_modified timestamptz,p_name text,p_subject text,p_questions jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare sid uuid; lv int; counts int[]:=array[3,3,2,2]; levels jsonb;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='tutor') then raise exception 'Tutor required'; end if;
 if p_file !~ '^[A-Za-z0-9_-]{5,200}$' or p_folder !~ '^[A-Za-z0-9_-]{5,200}$' or length(p_name) not between 1 and 100 or p_subject not in ('fisica','quimica','matematicas') then raise exception 'Invalid bank'; end if;
 if jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 10 and 60 then raise exception '10 to 60 questions required'; end if;
 for lv in 1..4 loop
  if (select count(*) from jsonb_array_elements(p_questions) q where (q->>'level')::int=lv)<counts[lv] then raise exception 'Not enough questions for level %',lv; end if;
 end loop;
 perform pg_advisory_xact_lock(hashtextextended(p_file,0));
 select id into sid from public.skills where drive_file_id=p_file;
 if sid is not null and exists(select 1 from public.sessions s where not s.completed and s.date=(now() at time zone 'America/Bogota')::date and s.planned_queue @> jsonb_build_array(jsonb_build_object('skillId',sid::text))) then raise exception 'SESSION_IN_PROGRESS';end if;
 sid:=coalesce(sid,gen_random_uuid());
 select jsonb_agg(jsonb_build_object('level',n,'description',jsonb_build_object('kind','custom','questions',(select jsonb_agg(q) from jsonb_array_elements(p_questions) q where (q->>'level')::int=n))::text)) into levels from generate_series(1,4) n;
 perform public.save_skill_atomic(sid,jsonb_build_object('name',p_name,'description','Banco de preguntas del profesor en Google Drive','subject',p_subject,'active',true,'priority',1,'base_difficulty',1),levels);
 update public.skills set drive_file_id=p_file,drive_folder_id=p_folder,drive_modified_time=p_modified where id=sid;
 return sid;
end $$;
revoke all on function public.publish_drive_bank(text,text,timestamptz,text,text,jsonb) from public,anon;
grant execute on function public.publish_drive_bank(text,text,timestamptz,text,text,jsonb) to authenticated;
commit;
