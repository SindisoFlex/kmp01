-- User-scope production convergence:
-- 1) Gallery source of truth
-- 2) Referral persistence
-- 3) Invoice automation extensions

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NULL REFERENCES public.bookings(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public'))
);

CREATE INDEX IF NOT EXISTS idx_user_gallery_user_created
ON public.user_gallery (user_id, created_at DESC);

ALTER TABLE public.user_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own gallery media" ON public.user_gallery;
CREATE POLICY "Users can read own gallery media"
ON public.user_gallery
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gallery media" ON public.user_gallery;
CREATE POLICY "Users can insert own gallery media"
ON public.user_gallery
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gallery media" ON public.user_gallery;
CREATE POLICY "Users can update own gallery media"
ON public.user_gallery
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Referrals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NULL,
  referred_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'converted')),
  reward_tokens INTEGER NOT NULL DEFAULT 0 CHECK (reward_tokens >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer
ON public.user_referrals (referrer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_user
ON public.user_referrals (referred_user_id);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own referrals" ON public.user_referrals;
CREATE POLICY "Users can read own referrals"
ON public.user_referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Admins can manage referrals" ON public.user_referrals;
CREATE POLICY "Admins can manage referrals"
ON public.user_referrals
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);

CREATE OR REPLACE FUNCTION public.track_referral_open(p_referrer_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Missing referrer id';
  END IF;

  INSERT INTO public.user_referrals (referrer_id, status)
  VALUES (p_referrer_id, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_referral_registered(
  p_referrer_id UUID,
  p_referred_email TEXT,
  p_referred_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_referrer_id IS NULL OR p_referred_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing referral registration data';
  END IF;

  UPDATE public.user_referrals
  SET referred_email = COALESCE(p_referred_email, referred_email),
      referred_user_id = p_referred_user_id,
      status = 'registered'
  WHERE id = (
    SELECT id
    FROM public.user_referrals
    WHERE referrer_id = p_referrer_id
      AND referred_user_id IS NULL
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  )
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    INSERT INTO public.user_referrals (referrer_id, referred_email, referred_user_id, status)
    VALUES (p_referrer_id, p_referred_email, p_referred_user_id, 'registered')
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_referral_open(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_referral_registered(UUID, TEXT, UUID) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Invoice automation extensions
-- ---------------------------------------------------------------------------
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_url TEXT NULL;

CREATE TABLE IF NOT EXISTS public.invoice_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_email_queue_status
ON public.invoice_email_queue (status, created_at);

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

  UPDATE public.bookings
  SET payment_status = 'paid'
  WHERE id = p_booking_id;

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
      booking_id,
      user_id,
      invoice_number,
      amount,
      currency,
      status,
      issued_at,
      paid_at,
      invoice_url
    ) VALUES (
      p_booking_id,
      v_booking.user_id,
      v_invoice_number,
      COALESCE(v_booking.total_amount, 0),
      'ZAR',
      'paid',
      NOW(),
      NOW(),
      NULL
    )
    RETURNING id INTO v_invoice_id;

    v_invoice_url := '/dashboard/invoices/' || v_invoice_id::TEXT;
    UPDATE public.invoices SET invoice_url = v_invoice_url WHERE id = v_invoice_id;
  END IF;

  -- Convert referral once referred user has their first paid booking.
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

  SELECT email INTO v_recipient_email
  FROM public.profiles
  WHERE id = v_booking.user_id
  LIMIT 1;

  IF COALESCE(v_recipient_email, '') <> '' THEN
    INSERT INTO public.invoice_email_queue (invoice_id, user_id, recipient_email, status)
    VALUES (v_invoice_id, v_booking.user_id, v_recipient_email, 'queued');
  END IF;

  RETURN jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'invoice_url', v_invoice_url,
    'status', 'paid'
  );
END;
$$;
