begin;
set local role service_role;
do $$
declare uid uuid; rid uuid:=gen_random_uuid(); bad uuid:=gen_random_uuid();
begin
 select id into uid from public.profiles where role='student' limit 1;
 insert into public.learner_memory(user_id,notes) values(uid,'Cambio manual más reciente') on conflict(user_id) do update set notes=excluded.notes;
 insert into public.ai_requests(id,user_id,kind) values(rid,uid,'coach'),(bad,uid,'coach');
 perform public.save_coach_atomic(rid,uid,jsonb_build_array(jsonb_build_object('role','user','content','Prueba transaccional','memory_before','Memoria anterior','created_at',now()),jsonb_build_object('role','assistant','content','Vamos paso a paso.','created_at',now())),'Resumen anterior','verification',1,123);
 if (select notes from public.learner_memory where user_id=uid)<>'Cambio manual más reciente' then raise exception 'Manual memory overwritten';end if;
 if (select count(*) from public.coach_messages where request_id=rid)<>2 or (select status from public.ai_requests where id=rid)<>'completed' then raise exception 'Incomplete conversation';end if;
 begin
  perform public.save_coach_atomic(bad,uid,jsonb_build_array(jsonb_build_object('role','user','content','Prueba','created_at',now()),jsonb_build_object('role','assistant','content','','created_at',now())),'No guardar','verification',1,123);
  raise exception 'Expected constraint failure';
 exception when check_violation then null;
 end;
 if exists(select 1 from public.coach_messages where request_id=bad) or (select status from public.ai_requests where id=bad)<>'pending' then raise exception 'Partial write';end if;
 if has_function_privilege('authenticated','public.save_coach_atomic(uuid,uuid,jsonb,text,text,integer,integer)','EXECUTE') then raise exception 'Client can finalize AI';end if;
end $$;
rollback;
select 'PASS: conversation atomicity, memory edit preserved, server-only finalization' as result;
