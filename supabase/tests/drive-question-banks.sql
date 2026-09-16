begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='tutor' limit 1),true);
set local role authenticated;
do $$ declare qs jsonb; sid uuid; second_id uuid; begin
 select jsonb_agg(jsonb_build_object('prompt','Isolated Drive bank check '||n,'answer','1','answerFormat','number','level',case when n<=3 then 1 when n<=6 then 2 when n<=8 then 3 else 4 end,'hints',jsonb_build_array('Lee','Piensa','Resuelve'))) into qs from generate_series(1,10) n;
 sid:=public.publish_drive_bank('qa-file-rollback','qa-folder',now(),'Drive verification','fisica',qs);
 second_id:=public.publish_drive_bank('qa-file-rollback','qa-folder',now(),'Drive verification','fisica',qs);
 if sid<>second_id then raise exception 'Duplicated import';end if;
 if (select count(*) from public.skill_levels where skill_id=sid)<>4 then raise exception 'Levels missing';end if;
 if has_table_privilege('authenticated','public.drive_connections','SELECT') then raise exception 'Tokens exposed';end if;
 if has_table_privilege('anon','public.drive_connections','SELECT') then raise exception 'Tokens exposed to anon';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='student' limit 1),true);
set local role authenticated;
do $$ begin
 begin perform public.publish_drive_bank('qa-file-student','qa-folder',now(),'Blocked','fisica','[]'::jsonb);raise exception 'Student was allowed';exception when raise_exception then if sqlerrm<>'Tutor required' then raise;end if;end;
end $$;
rollback;
