-- Security Fix: apply_completed_booking_to_loyalty Authorization
-- File: supabase/migrations/[timestamp]_fix_loyalty_rpc_auth.sql
-- Issue: Function had no auth.uid() check, allowing any user to manipulate any user's loyalty
-- Fix: Add authentication and ownership validation

DROP FUNCTION IF EXISTS public.apply_completed_booking_to_loyalty(uuid);

CREATE OR REPLACE FUNCTION public.apply_completed_booking_to_loyalty(
  p_booking_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid;
  v_actor_role text;
  v_booking record;
  v_profile record;
  v_state record;
  v_prev_individual public.loyalty_tier;
  v_prev_corporate public.loyalty_tier;
  v_new_individual public.loyalty_tier;
  v_new_corporate public.loyalty_tier;
  v_delta_spend numeric(12,2);
  v_corporate_delta numeric(12,2);
BEGIN
  -- CRITICAL FIX #1: Validate caller is authenticated
  v_actor_user_id := auth.uid();
  IF v_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. This operation requires authentication.';
  END IF;

  -- CRITICAL FIX #2: Get caller role
  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id = v_actor_user_id
  LIMIT 1;

  -- Fetch the booking
  SELECT id, user_id, type, net_amount, status
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  -- CRITICAL FIX #3: Verify ownership or admin role
  -- Only allow if caller owns the booking OR is admin
  IF v_booking.user_id <> v_actor_user_id THEN
    IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
      RAISE EXCEPTION 'You can only apply completed bookings for your own bookings, or you must be an admin.';
    END IF;
  END IF;

  IF lower(coalesce(v_booking.status, '')) <> 'completed' THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'booking_not_completed');
  END IF;

  INSERT INTO public.loyalty_processed_bookings (booking_id)
  VALUES (p_booking_id)
  ON CONFLICT DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'already_processed');
  END IF;

  SELECT id, coalesce(is_business_account, false) AS is_business_account
  INTO v_profile
  FROM public.profiles
  WHERE id = v_booking.user_id
  LIMIT 1;

  v_delta_spend := coalesce(v_booking.net_amount, 0);
  v_corporate_delta := 0;

  IF v_profile.is_business_account = true
     AND lower(coalesce(v_booking.type, '')) IN ('webdev', 'marketing', 'web/app development', 'digital marketing') THEN
    v_corporate_delta := v_delta_spend;
  END IF;

  INSERT INTO public.loyalty_state (user_id)
  VALUES (v_booking.user_id)
  ON CONFLICT DO NOTHING;

  SELECT *
  INTO v_state
  FROM public.loyalty_state
  WHERE user_id = v_booking.user_id
  FOR UPDATE;

  v_prev_individual := v_state.individual_tier;
  v_prev_corporate := v_state.corporate_tier;

  UPDATE public.loyalty_state
  SET individual_completed_bookings = individual_completed_bookings + 1,
      individual_total_spend = individual_total_spend + v_delta_spend,
      individual_last_activity_at = now(),
      corporate_eligible_spend = corporate_eligible_spend + v_corporate_delta,
      corporate_last_activity_at = CASE
        WHEN v_corporate_delta > 0 THEN now()
        ELSE corporate_last_activity_at
      END,
      updated_at = now()
  WHERE user_id = v_booking.user_id;

  SELECT *
  INTO v_state
  FROM public.loyalty_state
  WHERE user_id = v_booking.user_id;

  v_new_individual := public.compute_individual_tier(v_state.individual_completed_bookings, v_state.individual_total_spend);
  v_new_corporate := public.compute_corporate_tier(v_state.corporate_eligible_spend);

  UPDATE public.loyalty_state
  SET individual_tier = v_new_individual,
      corporate_tier = v_new_corporate,
      updated_at = now()
  WHERE user_id = v_booking.user_id;

  UPDATE public.profiles
  SET membership_tier = CASE v_new_individual
      WHEN 'none' THEN 'free'
      ELSE v_new_individual::TEXT
    END
  WHERE id = v_booking.user_id;

  INSERT INTO public.loyalty_events (
    user_id, track, event_type, delta_bookings, delta_spend, prev_tier, new_tier, context
  ) VALUES (
    v_booking.user_id,
    'individual',
    'BOOKING_COMPLETED',
    1,
    v_delta_spend,
    v_prev_individual,
    v_new_individual,
    jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type, 'applied_by', v_actor_user_id)
  );

  IF v_new_individual <> v_prev_individual THEN
    INSERT INTO public.loyalty_events (
      user_id, track, event_type, prev_tier, new_tier, context
    ) VALUES (
      v_booking.user_id,
      'individual',
      'TIER_UP',
      v_prev_individual,
      v_new_individual,
      jsonb_build_object('booking_id', p_booking_id, 'applied_by', v_actor_user_id)
    );
  END IF;

  IF v_corporate_delta > 0 THEN
    INSERT INTO public.loyalty_events (
      user_id, track, event_type, delta_bookings, delta_spend, prev_tier, new_tier, context
    ) VALUES (
      v_booking.user_id,
      'corporate',
      'BOOKING_COMPLETED',
      null,
      v_corporate_delta,
      v_prev_corporate,
      v_new_corporate,
      jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type, 'applied_by', v_actor_user_id)
    );

    IF v_new_corporate <> v_prev_corporate THEN
      INSERT INTO public.loyalty_events (
        user_id, track, event_type, prev_tier, new_tier, context
      ) VALUES (
        v_booking.user_id,
        'corporate',
        'TIER_UP',
        v_prev_corporate,
        v_new_corporate,
        jsonb_build_object('booking_id', p_booking_id, 'applied_by', v_actor_user_id)
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'applied', true,
    'individual_tier', v_new_individual,
    'corporate_tier', v_new_corporate
  );
END;
$$;

-- Restrict access to authenticated users and admins only
REVOKE EXECUTE ON FUNCTION public.apply_completed_booking_to_loyalty(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.apply_completed_booking_to_loyalty(uuid) TO authenticated;
