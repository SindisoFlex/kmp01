-- Phase 1 Block B Verification Checklist
-- Run in Supabase SQL Editor after applying all migrations.
-- Expected outcome: no FAIL rows in check_results output.

create temp table check_results (
  check_name text primary key,
  status text not null,
  detail text
) on commit drop;

-- 1) RPC deployment checks
insert into check_results (check_name, status, detail)
select
  'rpc_create_secure_booking_new_signature',
  case when exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_secure_booking'
      and pg_get_function_identity_arguments(p.oid) =
          'p_service_type text, p_category text, p_extras text[], p_date_time timestamp with time zone, p_location text, p_notes text'
  ) then 'PASS' else 'FAIL' end,
  'Expected create_secure_booking to accept extras array and no client base price';

insert into check_results (check_name, status, detail)
select
  'rpc_create_secure_booking_old_signature_removed',
  case when not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_secure_booking'
      and pg_get_function_identity_arguments(p.oid) =
          'p_service_type text, p_category text, p_base_price numeric, p_date_time timestamp with time zone, p_location text, p_notes text'
  ) then 'PASS' else 'FAIL' end,
  'Old p_base_price signature must be removed';

insert into check_results (check_name, status, detail)
select
  'rpc_apply_completed_booking_to_loyalty_exists',
  case when exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'apply_completed_booking_to_loyalty'
      and pg_get_function_identity_arguments(p.oid) = 'p_booking_id uuid'
  ) then 'PASS' else 'FAIL' end,
  'Loyalty completion RPC must exist';

insert into check_results (check_name, status, detail)
select
  'rpc_create_secure_booking_contains_server_catalog',
  case when exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_secure_booking'
      and pg_get_functiondef(p.oid) ilike '%v_base_price%'
      and pg_get_functiondef(p.oid) ilike '%p_extras%'
      and pg_get_functiondef(p.oid) not ilike '%p_base_price%'
  ) then 'PASS' else 'FAIL' end,
  'Function body should calculate base/extras server-side';

insert into check_results (check_name, status, detail)
select
  'rpc_apply_completed_booking_syncs_profile_membership_tier',
  case when exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'apply_completed_booking_to_loyalty'
      and pg_get_functiondef(p.oid) ilike '%update public.profiles%'
      and pg_get_functiondef(p.oid) ilike '%membership_tier%'
  ) then 'PASS' else 'FAIL' end,
  'Loyalty completion should keep profiles.membership_tier in sync';

-- 2) RLS enabled checks
insert into check_results (check_name, status, detail)
select
  format('rls_enabled_%s', c.relname),
  case when c.relrowsecurity then 'PASS' else 'FAIL' end,
  'RLS must be enabled'
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('profiles', 'bookings', 'loyalty_state', 'loyalty_events', 'loyalty_tier_config', 'loyalty_processed_bookings');

-- 3) Policy presence checks (minimum expected names)
insert into check_results (check_name, status, detail)
select
  'policy_profiles_view_own',
  case when exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then 'PASS' else 'FAIL' end,
  'Profiles should have own-row read policy';

insert into check_results (check_name, status, detail)
select
  'policy_loyalty_state_view_own',
  case when exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'loyalty_state'
      and policyname = 'Users can view own loyalty state'
  ) then 'PASS' else 'FAIL' end,
  'Loyalty state should have own-row read policy';

insert into check_results (check_name, status, detail)
select
  'policy_loyalty_events_view_own',
  case when exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'loyalty_events'
      and policyname = 'Users can view own loyalty events'
  ) then 'PASS' else 'FAIL' end,
  'Loyalty events should have own-row read policy';

-- 4) Data integrity checks
insert into check_results (check_name, status, detail)
select
  'data_profiles_membership_tier_domain',
  case when count(*) = 0 then 'PASS' else 'FAIL' end,
  format('Rows with invalid membership_tier: %s', count(*))
from public.profiles
where lower(coalesce(membership_tier, '')) not in ('free', 'bronze', 'silver', 'gold', 'vip');

insert into check_results (check_name, status, detail)
select
  'data_completed_bookings_unprocessed',
  case when count(*) = 0 then 'PASS' else 'FAIL' end,
  format('Completed bookings missing in loyalty_processed_bookings: %s', count(*))
from public.bookings b
where lower(coalesce(b.status, '')) = 'completed'
  and not exists (
    select 1
    from public.loyalty_processed_bookings lp
    where lp.booking_id = b.id
  );

insert into check_results (check_name, status, detail)
select
  'data_profile_loyalty_tier_sync_drift',
  case when count(*) = 0 then 'PASS' else 'FAIL' end,
  format('Profiles out of sync with loyalty_state.individual_tier: %s', count(*))
from public.loyalty_state ls
join public.profiles p on p.id = ls.user_id
where lower(coalesce(p.membership_tier, 'free')) <>
      case ls.individual_tier
        when 'none' then 'free'
        else ls.individual_tier::text
      end;

-- 5) Result set
select
  check_name,
  status,
  detail
from check_results
order by
  case when status = 'FAIL' then 0 else 1 end,
  check_name;

-- Optional focused failure view
select * from check_results where status = 'FAIL' order by check_name;
