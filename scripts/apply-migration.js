#!/usr/bin/env node

/**
 * Apply migration using Supabase Admin client
 * Requires SUPABASE_SERVICE_ROLE_KEY env variable
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Need to add this to .env.local:')
  console.error('SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>')
  console.error('')
  console.error('Get it from: https://supabase.com/dashboard > Settings > API Keys')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const migrationSQL = `
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
`

async function applyMigration() {
  try {
    console.log('🔧 Attempting to apply migration...')
    console.log(`URL: ${SUPABASE_URL}`)
    console.log('')

    // Try to execute SQL using the admin API
    // Note: supabase-js doesn't have direct SQL execution, so we'll try via RPC
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).catch(e => ({ error: e }))

    if (error) {
      console.log('⚠️  RPC method not available, need manual apply')
      console.log('')
      console.log('📋 Manual Steps:')
      console.log('1. Open: https://supabase.com/dashboard')
      console.log('2. SQL Editor')
      console.log('3. Copy: supabase/migrations/20260531_fix_profile_sync_trigger.sql')
      console.log('4. Paste & Run')
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

applyMigration()
