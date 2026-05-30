-- Fix: Đảm bảo trigger có quyền tạo profiles cho tất cả users
-- Vấn đề: RLS policy trên profiles ngăn trigger INSERT
-- Giải pháp: Thêm bypass RLS cho trigger hoặc tạo policy cho auth.users role

begin;

-- Drop trigger cũ
drop trigger if exists trg_sync_auth_profile_role on auth.users;

-- Drop function cũ
drop function if exists public.sync_auth_profile_role();

-- Tạo function mới với RLS bypass
create or replace function public.sync_auth_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  existing_role text := 'user';
  assigned_role text := case
    when tg_op = 'INSERT' and normalized_email in ('admin@gmail.com', 'quantri@gmail.com') then 'admin'
    else coalesce(new.raw_user_meta_data->>'role', existing_role, 'user')
  end;
  profile_name text := nullif(btrim(coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1))), '');
begin
  if profile_name is null then
    profile_name := 'Người dùng';
  end if;

  if tg_op = 'UPDATE' then
    existing_role := coalesce(old.raw_user_meta_data->>'role', old.raw_app_meta_data->>'role', 'user');
    assigned_role := coalesce(new.raw_user_meta_data->>'role', existing_role, 'user');
  end if;

  -- Đặt role vào metadata
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', assigned_role);

  -- Upsert profile - bypass RLS vì function có security definer
  insert into public.profiles (id, name, role)
  values (new.id, profile_name, assigned_role)
  on conflict (id) do update
  set
    name = excluded.name,
    role = excluded.role,
    updated_at = now();

  return new;
exception when others then
  raise warning 'sync_auth_profile_role error for %: %', new.email, sqlerrm;
  return new;
end;
$$;

-- Tạo trigger mới
create trigger trg_sync_auth_profile_role
before insert or update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_auth_profile_role();

-- Kiểm tra và tạo profiles cho bất kỳ users nào không có profile
insert into public.profiles (id, name, role)
select 
  u.id,
  coalesce((u.raw_user_meta_data->>'name')::text, split_part(u.email, '@', 1), 'Người dùng'),
  case when lower(u.email) in ('admin@gmail.com', 'quantri@gmail.com') then 'admin' else 'user' end
from auth.users u
where u.id not in (select id from public.profiles)
on conflict (id) do update
set
  name = excluded.name,
  role = excluded.role,
  updated_at = now();

-- Xác nhận RLS policy cho profiles vẫn sane
drop policy if exists "Authenticated can view profiles" on public.profiles;
create policy "Authenticated can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

commit;
