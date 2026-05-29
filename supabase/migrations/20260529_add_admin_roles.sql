-- Sync admin roles into auth metadata and profiles.

begin;

alter table public.profiles
add column if not exists role text not null default 'user';

update public.profiles as profiles
set role = 'admin'
from auth.users as users
where users.id = profiles.id
  and lower(users.email) in ('admin@gmail.com', 'quantri@gmail.com');

create or replace function public.sync_auth_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  assigned_role text := case
    when normalized_email in ('admin@gmail.com', 'quantri@gmail.com') then 'admin'
    else coalesce(new.raw_user_meta_data->>'role', 'user')
  end;
  profile_name text := nullif(btrim(coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1))), '');
begin
  if profile_name is null then
    profile_name := 'Người dùng';
  end if;

  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', assigned_role);

  insert into public.profiles (id, name, role)
  values (new.id, profile_name, assigned_role)
  on conflict (id) do update
  set
    name = excluded.name,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_auth_profile_role on auth.users;

create trigger trg_sync_auth_profile_role
before insert or update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_auth_profile_role();

commit;