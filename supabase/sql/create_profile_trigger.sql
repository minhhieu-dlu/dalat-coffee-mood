-- Run this in Supabase SQL Editor.
-- It auto-creates/updates a public.profiles row whenever a new auth.users row is inserted.

begin;

alter table if exists public.profiles
add column if not exists role text not null default 'user';

create or replace function public.handle_new_user()
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

  -- attempt to insert/update profile, but do not let failures here abort user creation
  begin
    insert into public.profiles (id, name, role)
    values (new.id, profile_name, assigned_role)
    on conflict (id) do update
    set
      name = excluded.name,
      role = excluded.role,
      updated_at = now();
  exception when others then
    -- swallow errors to avoid blocking auth signups; inspect DB logs for root cause
    null;
  end;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;

create trigger trg_handle_new_user
after insert on auth.users
for each row
execute function public.handle_new_user();

commit;
