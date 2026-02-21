-- Phase 1 hardening: server-authoritative booking pricing + loyalty synchronization

DROP FUNCTION IF EXISTS public.create_secure_booking(TEXT, TEXT, DECIMAL, TIMESTAMP WITH TIME ZONE, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_secure_booking(
    p_service_type TEXT,
    p_category TEXT,
    p_extras TEXT[],
    p_date_time TIMESTAMP WITH TIME ZONE,
    p_location TEXT,
    p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_membership_tier TEXT;
    v_is_staff BOOLEAN;
    v_tier_discount_percent NUMERIC := 0;
    v_staff_discount_amount NUMERIC := 0;
    v_base_price NUMERIC := 0;
    v_extras_total NUMERIC := 0;
    v_subtotal NUMERIC := 0;
    v_amount_before_vat NUMERIC;
    v_vat_amount NUMERIC;
    v_total_amount NUMERIC;
    v_booking_id UUID;
    v_extra TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT COALESCE(membership_tier, 'free'), (role IN ('staff', 'admin'))
    INTO v_membership_tier, v_is_staff
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_membership_tier IS NULL THEN
        v_membership_tier := 'free';
    END IF;

    -- Server-owned service/category pricing catalog.
    CASE LOWER(COALESCE(p_service_type, ''))
        WHEN 'photography' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'wedding' THEN v_base_price := 4500;
                WHEN 'funeral' THEN v_base_price := 2400;
                WHEN 'portrait' THEN v_base_price := 1200;
                WHEN 'commercial' THEN v_base_price := 1800;
                WHEN 'event' THEN v_base_price := 2000;
                ELSE v_base_price := 1200;
            END CASE;
        WHEN 'videography' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'wedding' THEN v_base_price := 6500;
                WHEN 'funeral' THEN v_base_price := 3500;
                WHEN 'shortfilm' THEN v_base_price := 4200;
                WHEN 'livestream' THEN v_base_price := 3000;
                WHEN 'commercial' THEN v_base_price := 4000;
                ELSE v_base_price := 2500;
            END CASE;
        WHEN 'webdev' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'website' THEN v_base_price := 8000;
                WHEN 'app' THEN v_base_price := 15000;
                WHEN 'ecommerce' THEN v_base_price := 12000;
                WHEN 'cms' THEN v_base_price := 9000;
                ELSE v_base_price := 8000;
            END CASE;
        WHEN 'aitraining' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'bootcamp' THEN v_base_price := 3000;
                WHEN 'business' THEN v_base_price := 4500;
                WHEN 'agent' THEN v_base_price := 6000;
                WHEN 'consulting' THEN v_base_price := 5500;
                ELSE v_base_price := 3000;
            END CASE;
        WHEN 'marketing' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'social' THEN v_base_price := 2200;
                WHEN 'content' THEN v_base_price := 2000;
                WHEN 'seo' THEN v_base_price := 2500;
                WHEN 'campaign' THEN v_base_price := 3500;
                ELSE v_base_price := 1500;
            END CASE;
        WHEN 'printing' THEN
            CASE LOWER(COALESCE(p_category, ''))
                WHEN 'business' THEN v_base_price := 500;
                WHEN 'event' THEN v_base_price := 750;
                WHEN 'custom' THEN v_base_price := 1000;
                WHEN 'large' THEN v_base_price := 1400;
                ELSE v_base_price := 500;
            END CASE;
        ELSE
            RAISE EXCEPTION 'Unsupported service type: %', p_service_type;
    END CASE;

    IF p_extras IS NOT NULL THEN
        FOREACH v_extra IN ARRAY p_extras
        LOOP
            CASE LOWER(COALESCE(v_extra, ''))
                WHEN 'prints' THEN v_extras_total := v_extras_total + 200;
                WHEN 'drone' THEN v_extras_total := v_extras_total + 1500;
                WHEN 'sameday' THEN v_extras_total := v_extras_total + 500;
                WHEN 'framed' THEN v_extras_total := v_extras_total + 800;
                WHEN 'transportation' THEN v_extras_total := v_extras_total + 300;
                WHEN 'seo' THEN v_extras_total := v_extras_total + 1200;
                WHEN 'hosting' THEN v_extras_total := v_extras_total + 500;
                WHEN '' THEN null;
                ELSE
                    RAISE EXCEPTION 'Unsupported extra: %', v_extra;
            END CASE;
        END LOOP;
    END IF;

    v_subtotal := v_base_price + v_extras_total;

    CASE LOWER(v_membership_tier)
        WHEN 'bronze' THEN v_tier_discount_percent := 5;
        WHEN 'silver' THEN v_tier_discount_percent := 10;
        WHEN 'gold' THEN v_tier_discount_percent := 15;
        WHEN 'vip' THEN v_tier_discount_percent := 20;
        ELSE v_tier_discount_percent := 0;
    END CASE;

    IF v_is_staff AND LOWER(COALESCE(p_service_type, '')) IN ('photography', 'videography', 'printing') THEN
        v_staff_discount_amount := v_subtotal * 0.15;
    END IF;

    v_amount_before_vat := v_subtotal - (v_subtotal * v_tier_discount_percent / 100) - v_staff_discount_amount;
    v_amount_before_vat := GREATEST(0, v_amount_before_vat);

    v_vat_amount := v_amount_before_vat * 0.15;
    v_total_amount := v_amount_before_vat + v_vat_amount;

    INSERT INTO public.bookings (
        user_id,
        type,
        category,
        date_time,
        location,
        notes,
        total_amount,
        net_amount,
        status,
        created_at
    ) VALUES (
        v_user_id,
        p_service_type,
        p_category,
        p_date_time,
        p_location,
        p_notes,
        v_total_amount,
        v_total_amount,
        'Pending',
        NOW()
    ) RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'id', v_booking_id,
        'base_price', v_base_price,
        'extras_total', v_extras_total,
        'subtotal', v_subtotal,
        'tier_discount_percent', v_tier_discount_percent,
        'staff_discount_amount', v_staff_discount_amount,
        'amount_before_vat', v_amount_before_vat,
        'vat_amount', v_vat_amount,
        'total_amount', v_total_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.apply_completed_booking_to_loyalty(
  p_booking_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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
  SELECT id, user_id, type, net_amount, status
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
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

  -- Keep server-side pricing tier source in sync with loyalty progression.
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
    jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type)
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
      jsonb_build_object('booking_id', p_booking_id)
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
      jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type)
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
        jsonb_build_object('booking_id', p_booking_id)
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
