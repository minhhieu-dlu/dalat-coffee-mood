-- Fix missing profiles.role column for auth signup/profile sync.

begin;

alter table public.profiles
add column if not exists role text not null default 'user';

update public.profiles
set role = coalesce(role, 'user')
where role is null;

create index if not exists idx_profiles_role
on public.profiles(role);

commit;
