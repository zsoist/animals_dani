begin;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profile_read'
  ) then
    create policy profile_read
      on public.profiles
      for select
      to authenticated
      using (
        id = (select auth.uid())
        or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'tutor'
      );
  end if;
end
$$;

commit;
