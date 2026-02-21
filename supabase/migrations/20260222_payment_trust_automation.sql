-- =========================================================================
-- PAYMENT TRUST AUTOMATION — Token award integrated into admin_mark_booking_paid
-- =========================================================================

-- Enhance admin_mark_booking_paid to automatically award tokens after payment
CREATE OR REPLACE FUNCTION public.admin_mark_booking_paid(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID;
  v_actor_role TEXT;
  v_booking RECORD;
  v_existing_invoice RECORD;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_invoice_url TEXT;
  v_recipient_email TEXT;
  v_tokens_awarded INTEGER;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id = v_actor
  LIMIT 1;

  IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can mark bookings as paid';
  END IF;

  SELECT id, user_id, total_amount, payment_status
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  -- Mark booking as paid
  UPDATE public.bookings
  SET payment_status = 'paid'
  WHERE id = p_booking_id;

  -- Invoice handling (create or update)
  SELECT id, invoice_number, status, paid_at, invoice_url
  INTO v_existing_invoice
  FROM public.invoices
  WHERE booking_id = p_booking_id
  LIMIT 1;

  IF v_existing_invoice.id IS NOT NULL THEN
    v_invoice_url := COALESCE(v_existing_invoice.invoice_url, '/dashboard/invoices/' || v_existing_invoice.id::TEXT);

    UPDATE public.invoices
    SET status = 'paid',
        paid_at = COALESCE(v_existing_invoice.paid_at, now()),
        invoice_url = v_invoice_url
    WHERE id = v_existing_invoice.id;

    v_invoice_id := v_existing_invoice.id;
    v_invoice_number := v_existing_invoice.invoice_number;
  ELSE
    v_invoice_number := public.generate_invoice_number(now());

    INSERT INTO public.invoices (
      booking_id, user_id, invoice_number, amount, currency,
      status, issued_at, paid_at, invoice_url
    ) VALUES (
      p_booking_id, v_booking.user_id, v_invoice_number,
      COALESCE(v_booking.total_amount, 0), 'ZAR',
      'paid', NOW(), NOW(), NULL
    )
    RETURNING id INTO v_invoice_id;

    v_invoice_url := '/dashboard/invoices/' || v_invoice_id::TEXT;
    UPDATE public.invoices SET invoice_url = v_invoice_url WHERE id = v_invoice_id;
  END IF;

  -- ENGINE 3: Award tokens automatically
  BEGIN
    v_tokens_awarded := public.award_tokens_on_payment(
      v_booking.user_id,
      p_booking_id,
      COALESCE(v_booking.total_amount, 0)
    );
  EXCEPTION WHEN OTHERS THEN
    -- Token award failure must not block payment confirmation
    v_tokens_awarded := 0;
    RAISE WARNING 'Token award failed: %', SQLERRM;
  END;

  -- Referral conversion
  UPDATE public.user_referrals
  SET status = 'converted',
      reward_tokens = GREATEST(COALESCE(reward_tokens, 0), 50)
  WHERE id = (
    SELECT id
    FROM public.user_referrals
    WHERE referred_user_id = v_booking.user_id
      AND status IN ('pending', 'registered')
    ORDER BY created_at ASC
    LIMIT 1
  );

  -- Queue email notification
  SELECT email INTO v_recipient_email
  FROM public.profiles
  WHERE id = v_booking.user_id
  LIMIT 1;

  IF COALESCE(v_recipient_email, '') <> '' THEN
    INSERT INTO public.invoice_email_queue (invoice_id, user_id, recipient_email, status)
    VALUES (v_invoice_id, v_booking.user_id, v_recipient_email, 'queued');
  END IF;

  -- Update last activity (lifecycle touch)
  UPDATE public.profiles
  SET last_activity_at = NOW()
  WHERE id = v_booking.user_id;

  RETURN jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'invoice_url', v_invoice_url,
    'status', 'paid',
    'tokens_awarded', COALESCE(v_tokens_awarded, 0)
  );
END;
$$;
