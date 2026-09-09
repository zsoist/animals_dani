begin;
create or replace function public.save_coach_atomic(p_request uuid,p_user uuid,p_messages jsonb,p_memory text,p_model text,p_tokens int,p_latency int) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if jsonb_array_length(p_messages)<>2 then raise exception 'Two messages required';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,1));
 if not exists(select 1 from public.ai_requests where id=p_request and user_id=p_user and status='pending') then raise exception 'Request unavailable';end if;
 insert into public.coach_messages(user_id,request_id,role,content,skill_id,exercise_seed,created_at)
 select p_user,p_request,v->>'role',v->>'content',(v->>'skill_id')::uuid,v->>'exercise_seed',(v->>'created_at')::timestamptz from jsonb_array_elements(p_messages) v;
 insert into public.learner_memory(user_id,notes,updated_at) values(p_user,p_memory,now()) on conflict(user_id) do update set notes=excluded.notes,updated_at=excluded.updated_at where public.learner_memory.notes=coalesce(p_messages->0->>'memory_before',public.learner_memory.notes);
 update public.ai_requests set status='completed',model=p_model,tokens=p_tokens,latency_ms=p_latency where id=p_request;
end $$;
create or replace function public.reserve_ai_request(p_id uuid,p_user_id uuid,p_kind text) returns text
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.ai_requests where id=p_id) then return 'duplicate'; end if;
 if exists(select 1 from public.ai_requests where user_id=p_user_id and status='pending' and created_at>now()-interval '180 seconds') then return 'busy'; end if;
 if (select count(*) from public.ai_requests where user_id=p_user_id and created_at>now()-interval '1 minute')>=6 then return 'minute_limit'; end if;
 if (select count(*) from public.ai_requests where user_id=p_user_id and created_at>now()-interval '24 hours')>=100 then return 'day_limit'; end if;
 insert into public.ai_requests(id,user_id,kind) values(p_id,p_user_id,p_kind);
 return 'reserved';
end $$;
revoke all on function public.reserve_ai_request(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,uuid,text) to service_role;

commit;
