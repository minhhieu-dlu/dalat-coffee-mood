# ⚠️ MIGRATION REQUIRED - Yêu Cầu Áp Dụng Migration

## 🚨 Vấn Đề Phát Hiện
Test cho thấy lỗi: **"Database error saving new user"**

Nguyên nhân: Migration chưa được apply → Trigger cũ vẫn bị RLS chặn

## ✅ Cách Áp Dụng Migration

### Bước 1: Mở Supabase Dashboard
https://supabase.com/dashboard

### Bước 2: Chọn Project
Chọn project "fqinphysrwzuopimqfia"

### Bước 3: Vào SQL Editor
- Left sidebar → SQL Editor

### Bước 4: Copy SQL Migration
Nội dung file: `supabase/migrations/20260531_fix_profile_sync_trigger.sql`

### Bước 5: Paste & Run
1. Paste vào SQL editor
2. Nhấn ▶️ Run
3. Chờ "Success" message

## 📝 SQL Migration Content
```sql
-- Fix: Đảm bảo trigger có quyền tạo profiles cho tất cả users
begin;
drop trigger if exists trg_sync_auth_profile_role on auth.users;
drop function if exists public.sync_auth_profile_role();

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

  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', assigned_role);

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

create trigger trg_sync_auth_profile_role
before insert or update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_auth_profile_role();

insert into public.profiles (id, name, role)
select 
  u.id,
  coalesce((u.raw_user_meta_data->>'name')::text, split_part(u.email, '@', 1), 'Người dùng'),
  case when lower(u.email) in ('admin@gmail.com', 'quantri@gmail.com') then 'admin' else 'user' end
from auth.users u
where u.id not in (select id from public.profiles)
on conflict (id) do update
set name = excluded.name, role = excluded.role, updated_at = now();

drop policy if exists "Authenticated can view profiles" on public.profiles;
create policy "Authenticated can view profiles" on public.profiles for select to authenticated using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile" on public.profiles for delete to authenticated using (auth.uid() = id);

commit;
```

## 🔄 Sau Khi Apply Migration

Chạy lại test tự động:
```bash
cd c:\Users\Maxsys\Downloads\2212368_Trần\ Minh\ Hiếu\dalat-coffee-mood
$env:BASE_URL="http://localhost:3001"
node scripts/auto-test-auth.js
```

## ✅ Kết Quả Kỳ Vọng Sau Migration
```
✅ FIX SUCCESSFUL - BUG ĐÃ ĐƯỢC KHẮC PHỤC!
✅ Có thể tạo nhiều tài khoản
✅ Tất cả users đều có thể đăng nhập
```
