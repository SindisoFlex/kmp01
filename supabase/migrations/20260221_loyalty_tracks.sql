-- Loyalty Tracks: Individual + Corporate (token-compatible)
-- This migration is idempotent and safe to rerun.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'loyalty_track') then
    create type public.loyalty_track as enum ('individual', 'corporate');
  end if;

  if not exists (select 1 from pg_type where typname = 'loyalty_tier') then
    create type public.loyalty_tier as enum ('none', 'bronze', 'silver', 'gold');
  end if;
end $$;

create table if not exists public.loyalty_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  individual_tier public.loyalty_tier not null default 'none',
  individual_completed_bookings int not null default 0,
  individual_total_spend numeric(12,2) not null default 0,
  individual_last_activity_at timestamptz null,
  corporate_tier public.loyalty_tier not null default 'none',
  corporate_eligible_spend numeric(12,2) not null default 0,
  corporate_last_activity_at timestamptz null,
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track public.loyalty_track not null,
  event_type text not null check (event_type in ('BOOKING_COMPLETED', 'TIER_UP', 'RESET_INACTIVITY', 'ADMIN_ADJUST')),
  delta_bookings int null,
  delta_spend numeric(12,2) null,
  prev_tier public.loyalty_tier null,
  new_tier public.loyalty_tier null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_tier_config (
  track public.loyalty_track not null,
  tier public.loyalty_tier not null,
  minimum_bookings int null,
  minimum_spend numeric(12,2) null,
  benefits jsonb not null default '[]'::jsonb,
  primary key (track, tier)
);

create table if not exists public.loyalty_processed_bookings (
  booking_id uuid primary key,
  processed_at timestamptz not null default now()
);

insert into public.loyalty_tier_config (track, tier, minimum_bookings, minimum_spend, benefits) values
  ('individual', 'none', 0, 0, '["Access to online booking","Progress tracking toward Bronze"]'::jsonb),
  ('individual', 'bronze', 1, 0, '["5% service discount","Member-only offers","Priority support queue"]'::jsonb),
  ('individual', 'silver', 3, 0, '["10% service discount","Priority booking slots","Exclusive package offers"]'::jsonb),
  ('individual', 'gold', 5, 0, '["15% service discount","Top-priority booking","VIP exclusive services"]'::jsonb),
  ('corporate', 'none', null, 0, '["Spend toward Bronze on Web Development and Marketing"]'::jsonb),
  ('corporate', 'bronze', null, 50000, '["Priority project queue","Quarterly optimization review"]'::jsonb),
  ('corporate', 'silver', null, 100000, '["Faster turnaround windows","Bespoke growth planning"]'::jsonb),
  ('corporate', 'gold', null, 200000, '["Dedicated account manager","Highest-priority delivery lane"]'::jsonb)
on conflict (track, tier) do update
set minimum_bookings = excluded.minimum_bookings,
    minimum_spend = excluded.minimum_spend,
    benefits = excluded.benefits;

create or replace function public.compute_individual_tier(
  p_completed_bookings int,
  p_total_spend numeric
) returns public.loyalty_tier
language plpgsql
immutable
as $$
begin
  if coalesce(p_completed_bookings, 0) >= 5 then
    return 'gold';
  elsif coalesce(p_completed_bookings, 0) >= 3 then
    return 'silver';
  elsif coalesce(p_completed_bookings, 0) >= 1 then
    return 'bronze';
  end if;

  return 'none';
end;
$$;

create or replace function public.compute_corporate_tier(
  p_spend numeric
) returns public.loyalty_tier
language plpgsql
immutable
as $$
begin
  if coalesce(p_spend, 0) >= 200000 then
    return 'gold';
  elsif coalesce(p_spend, 0) >= 100000 then
    return 'silver';
  elsif coalesce(p_spend, 0) >= 50000 then
    return 'bronze';
  end if;

  return 'none';
end;
$$;

create or replace function public.apply_completed_booking_to_loyalty(
  p_booking_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_profile record;
  v_state record;
  v_prev_individual public.loyalty_tier;
  v_prev_corporate public.loyalty_tier;
  v_new_individual public.loyalty_tier;
  v_new_corporate public.loyalty_tier;
  v_delta_spend numeric(12,2);
  v_corporate_delta numeric(12,2);
begin
  select id, user_id, type, net_amount, status
  into v_booking
  from public.bookings
  where id = p_booking_id
  limit 1;

  if v_booking.id is null then
    raise exception 'Booking % not found', p_booking_id;
  end if;

  if lower(coalesce(v_booking.status, '')) <> 'completed' then
    return jsonb_build_object('applied', false, 'reason', 'booking_not_completed');
  end if;

  insert into public.loyalty_processed_bookings (booking_id)
  values (p_booking_id)
  on conflict do nothing;

  if not found then
    return jsonb_build_object('applied', false, 'reason', 'already_processed');
  end if;

  select id, coalesce(is_business_account, false) as is_business_account
  into v_profile
  from public.profiles
  where id = v_booking.user_id
  limit 1;

  v_delta_spend := coalesce(v_booking.net_amount, 0);
  v_corporate_delta := 0;

  if v_profile.is_business_account = true and lower(coalesce(v_booking.type, '')) in ('webdev', 'marketing', 'web/app development', 'digital marketing') then
    v_corporate_delta := v_delta_spend;
  end if;

  insert into public.loyalty_state (user_id)
  values (v_booking.user_id)
  on conflict do nothing;

  select *
  into v_state
  from public.loyalty_state
  where user_id = v_booking.user_id
  for update;

  v_prev_individual := v_state.individual_tier;
  v_prev_corporate := v_state.corporate_tier;

  update public.loyalty_state
  set individual_completed_bookings = individual_completed_bookings + 1,
      individual_total_spend = individual_total_spend + v_delta_spend,
      individual_last_activity_at = now(),
      corporate_eligible_spend = corporate_eligible_spend + v_corporate_delta,
      corporate_last_activity_at = case
        when v_corporate_delta > 0 then now()
        else corporate_last_activity_at
      end,
      updated_at = now()
  where user_id = v_booking.user_id;

  select *
  into v_state
  from public.loyalty_state
  where user_id = v_booking.user_id;

  v_new_individual := public.compute_individual_tier(v_state.individual_completed_bookings, v_state.individual_total_spend);
  v_new_corporate := public.compute_corporate_tier(v_state.corporate_eligible_spend);

  update public.loyalty_state
  set individual_tier = v_new_individual,
      corporate_tier = v_new_corporate,
      updated_at = now()
  where user_id = v_booking.user_id;

  insert into public.loyalty_events (
    user_id,
    track,
    event_type,
    delta_bookings,
    delta_spend,
    prev_tier,
    new_tier,
    context
  ) values (
    v_booking.user_id,
    'individual',
    'BOOKING_COMPLETED',
    1,
    v_delta_spend,
    v_prev_individual,
    v_new_individual,
    jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type)
  );

  if v_new_individual <> v_prev_individual then
    insert into public.loyalty_events (
      user_id, track, event_type, prev_tier, new_tier, context
    ) values (
      v_booking.user_id,
      'individual',
      'TIER_UP',
      v_prev_individual,
      v_new_individual,
      jsonb_build_object('booking_id', p_booking_id)
    );
  end if;

  if v_corporate_delta > 0 then
    insert into public.loyalty_events (
      user_id,
      track,
      event_type,
      delta_bookings,
      delta_spend,
      prev_tier,
      new_tier,
      context
    ) values (
      v_booking.user_id,
      'corporate',
      'BOOKING_COMPLETED',
      null,
      v_corporate_delta,
      v_prev_corporate,
      v_new_corporate,
      jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type)
    );

    if v_new_corporate <> v_prev_corporate then
      insert into public.loyalty_events (
        user_id, track, event_type, prev_tier, new_tier, context
      ) values (
        v_booking.user_id,
        'corporate',
        'TIER_UP',
        v_prev_corporate,
        v_new_corporate,
        jsonb_build_object('booking_id', p_booking_id)
      );
    end if;
  end if;

  return jsonb_build_object(
    'applied', true,
    'individual_tier', v_new_individual,
    'corporate_tier', v_new_corporate
  );
end;
$$;

create or replace function public.reset_inactive_loyalty_users()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
begin
  with reset_candidates as (
    select user_id, individual_tier, individual_completed_bookings, individual_total_spend
    from public.loyalty_state
    where individual_last_activity_at is not null
      and individual_last_activity_at <= now() - interval '2 years'
      and (individual_tier <> 'none' or individual_completed_bookings > 0 or individual_total_spend > 0)
  ), reset_rows as (
    update public.loyalty_state ls
    set individual_tier = 'none',
        individual_completed_bookings = 0,
        individual_total_spend = 0,
        individual_last_activity_at = null,
        updated_at = now()
    from reset_candidates rc
    where ls.user_id = rc.user_id
    returning rc.user_id, rc.individual_tier, rc.individual_completed_bookings, rc.individual_total_spend
  )
  insert into public.loyalty_events (user_id, track, event_type, delta_bookings, delta_spend, prev_tier, new_tier, context)
  select
    rr.user_id,
    'individual',
    'RESET_INACTIVITY',
    -rr.individual_completed_bookings,
    -rr.individual_total_spend,
    rr.individual_tier,
    'none',
    jsonb_build_object('reason', '2_year_inactivity')
  from reset_rows rr;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.get_loyalty_state()
returns public.loyalty_state
language sql
security definer
set search_path = public
as $$
  select *
  from public.loyalty_state
  where user_id = auth.uid();
$$;

-- Backfill from completed bookings.
insert into public.loyalty_state (user_id)
select distinct b.user_id
from public.bookings b
where b.user_id is not null
on conflict do nothing;

do $$
declare
  r record;
begin
  for r in
    select b.id
    from public.bookings b
    where lower(coalesce(b.status, '')) = 'completed'
    order by b.created_at asc nulls last
  loop
    perform public.apply_completed_booking_to_loyalty(r.id);
  end loop;
end $$;

alter table public.loyalty_state enable row level security;
alter table public.loyalty_events enable row level security;
alter table public.loyalty_tier_config enable row level security;
alter table public.loyalty_processed_bookings enable row level security;

drop policy if exists "Users can view own loyalty state" on public.loyalty_state;
create policy "Users can view own loyalty state"
on public.loyalty_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own loyalty events" on public.loyalty_events;
create policy "Users can view own loyalty events"
on public.loyalty_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view tier config" on public.loyalty_tier_config;
create policy "Users can view tier config"
on public.loyalty_tier_config
for select
to authenticated
using (true);

revoke insert, update, delete on public.loyalty_state from authenticated, anon;
revoke insert, update, delete on public.loyalty_events from authenticated, anon;
revoke insert, update, delete on public.loyalty_tier_config from authenticated, anon;
revoke all on public.loyalty_processed_bookings from authenticated, anon;

create index if not exists idx_loyalty_events_user_track_created
on public.loyalty_events(user_id, track, created_at desc);

create index if not exists idx_loyalty_state_individual_last_activity
on public.loyalty_state(individual_last_activity_at);

create index if not exists idx_loyalty_state_corporate_spend
on public.loyalty_state(corporate_eligible_spend);

-- Daily inactivity reset at 03:15 UTC.
select cron.unschedule('loyalty-inactivity-reset')
where exists (select 1 from cron.job where jobname = 'loyalty-inactivity-reset');

select cron.schedule(
  'loyalty-inactivity-reset',
  '15 3 * * *',
  $$select public.reset_inactive_loyalty_users();$$
);
